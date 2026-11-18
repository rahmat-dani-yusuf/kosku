import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient.js'
import { useAuth } from './useAuth.jsx'
import { useToast } from '../components/Toast.jsx'
import { umumkanDataBerubah, dengarDataBerubah } from '../lib/events.js'
import { hitungRange } from '../lib/paginasi.js'

// tab: 'menunggu' (status menunggu) atau 'diproses' (disetujui atau ditolak)
export function usePemesananHalaman({ halaman = 1, perHalaman = 10, tab = 'menunggu' } = {}) {
  const { user } = useAuth()
  const { show } = useToast()
  const [data, setData] = useState([])
  const [total, setTotal] = useState(0)
  const [jumlah, setJumlah] = useState({ menunggu: 0, diproses: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [tik, setTik] = useState(0)

  const muatUlang = useCallback(() => setTik(t => t + 1), [])

  useEffect(() => {
    if (!user) return
    let batal = false

    const hitung = async (menunggu) => {
      let q = supabase.from('pemesanan').select('id', { count: 'exact', head: true }).eq('user_id', user.id)
      q = menunggu ? q.eq('status', 'menunggu') : q.neq('status', 'menunggu')
      const { count } = await q
      return count || 0
    }

    const jalankan = async () => {
      setLoading(true)
      setError(null)
      try {
        const { from, to } = hitungRange(halaman, perHalaman)
        const jumlahPromise = Promise.all([hitung(true), hitung(false)])
        jumlahPromise.catch(() => {})

        const bangun = () => {
          let q = supabase
            .from('pemesanan')
            .select('*, kamar:kamar_id(nomor,harga_bulanan)', { count: 'exact' })
            .eq('user_id', user.id)
          q = tab === 'menunggu' ? q.eq('status', 'menunggu') : q.neq('status', 'menunggu')
          return q.order('created_at', { ascending: false }).order('id')
        }

        let hasil = await bangun().range(from, to)
        // Halaman melewati jumlah data: ambil total yang benar, halaman dimundurkan oleh komponen halaman
        if (hasil.error?.code === 'PGRST103') {
          const awal = await bangun().range(0, 0)
          hasil = { data: [], error: awal.error, count: awal.count }
        }
        const [jm, jd] = await jumlahPromise
        if (batal) return
        if (hasil.error) throw hasil.error
        setData(hasil.data || [])
        setTotal(hasil.count || 0)
        setJumlah({ menunggu: jm, diproses: jd })
      } catch (e) {
        if (batal) return
        setError(e.message || 'Gagal memuat data pemesanan')
        setData([])
        setTotal(0)
      } finally {
        if (!batal) setLoading(false)
      }
    }

    jalankan()
    return () => { batal = true }
  }, [user, halaman, perHalaman, tab, tik])

  useEffect(() => dengarDataBerubah(muatUlang), [muatUlang])

  const setujui = async (id, { hariTagih, harga, deposit } = {}) => {
    if (!user) return null
    try {
      const { data: sewaId, error: err } = await supabase.rpc('setujui_pemesanan', {
        p_pesan: id,
        p_hari_tagih: hariTagih,
        p_harga: harga,
        p_deposit: deposit ?? 0
      })
      if (err) throw err
      umumkanDataBerubah()
      show('Pemesanan disetujui, sewa dimulai', 'success')
      return sewaId ?? true
    } catch (e) {
      show(e.message || 'Gagal menyetujui pemesanan', 'error')
      return null
    }
  }

  const tolak = async (id, alasan) => {
    if (!user) return false
    try {
      const { error: err } = await supabase.rpc('tolak_pemesanan', {
        p_pesan: id,
        p_alasan: alasan
      })
      if (err) throw err
      umumkanDataBerubah()
      show('Pemesanan ditolak', 'success')
      return true
    } catch (e) {
      show(e.message || 'Gagal menolak pemesanan', 'error')
      return false
    }
  }

  return { data, total, jumlah, loading, error, muatUlang, setujui, tolak }
}