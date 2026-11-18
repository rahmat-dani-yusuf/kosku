import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient.js'
import { useAuth } from './useAuth.jsx'
import { useToast } from '../components/Toast.jsx'
import { dengarDataBerubah, umumkanDataBerubah } from '../lib/events.js'
import { hitungRange } from '../lib/paginasi.js'

const SELECT_SEWA = '*, kamar:kamar_id(nomor,tipe), penghuni:penghuni_id(nama,no_hp)'

// status: 'aktif' atau 'selesai'
export function useSewaHalaman({ halaman = 1, perHalaman = 10, cari = '', status = 'aktif' } = {}) {
  const { user } = useAuth()
  const { show } = useToast()
  const [data, setData] = useState([])
  const [total, setTotal] = useState(0)
  const [jumlah, setJumlah] = useState({ aktif: 0, selesai: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [tik, setTik] = useState(0)

  const muatUlang = useCallback(() => setTik(t => t + 1), [])

  useEffect(() => {
    if (!user) return
    let batal = false

    const hitung = async (st) => {
      const { count } = await supabase
        .from('sewa')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', st)
      return count || 0
    }

    const jalankan = async () => {
      setLoading(true)
      setError(null)
      try {
        const { from, to } = hitungRange(halaman, perHalaman)
        const jumlahPromise = Promise.all([hitung('aktif'), hitung('selesai')])

        // Pencarian: cari id kamar dan id penghuni yang cocok, lalu saring sewa-nya
        const c = (cari || '').trim().replace(/[,()%*]/g, ' ').trim()
        let bagianOr = null
        if (c) {
          const [rk, rp] = await Promise.all([
            supabase.from('kamar').select('id').eq('user_id', user.id).ilike('nomor', `%${c}%`).limit(200),
            supabase.from('penghuni').select('id').eq('user_id', user.id)
              .or(`nama.ilike.%${c}%,no_hp.ilike.%${c}%`).limit(200)
          ])
          if (rk.error) throw rk.error
          if (rp.error) throw rp.error
          const bagian = []
          if (rk.data?.length) bagian.push(`kamar_id.in.(${rk.data.map(x => x.id).join(',')})`)
          if (rp.data?.length) bagian.push(`penghuni_id.in.(${rp.data.map(x => x.id).join(',')})`)
          if (!bagian.length) {
            const [ja, js] = await jumlahPromise
            if (batal) return
            setJumlah({ aktif: ja, selesai: js })
            setData([])
            setTotal(0)
            return
          }
          bagianOr = bagian.join(',')
        }

        const bangun = () => {
          let q = supabase
            .from('sewa')
            .select(SELECT_SEWA, { count: 'exact' })
            .eq('user_id', user.id)
            .eq('status', status)
          if (bagianOr) q = q.or(bagianOr)
          q = status === 'selesai'
            ? q.order('tanggal_keluar', { ascending: false }).order('id')
            : q.order('tanggal_masuk', { ascending: true }).order('id')
          return q
        }

        let hasil = await bangun().range(from, to)
        // Halaman melewati jumlah data (mis. setelah akhiri sewa di halaman terakhir):
        // ambil total yang benar saja, halaman akan dimundurkan oleh komponen halaman.
        if (hasil.error?.code === 'PGRST103') {
          const awal = await bangun().range(0, 0)
          hasil = { data: [], error: awal.error, count: awal.count }
        }
        const [ja, js] = await jumlahPromise
        if (batal) return
        if (hasil.error) throw hasil.error
        setData(hasil.data || [])
        setTotal(hasil.count || 0)
        setJumlah({ aktif: ja, selesai: js })
      } catch (e) {
        if (batal) return
        setError(e.message || 'Gagal memuat data sewa')
        setData([])
        setTotal(0)
      } finally {
        if (!batal) setLoading(false)
      }
    }

    jalankan()
    return () => { batal = true }
  }, [user, halaman, perHalaman, cari, status, tik])

  useEffect(() => dengarDataBerubah(muatUlang), [muatUlang])

  const mulaiSewa = async (params) => {
    try {
      const { error: err } = await supabase.rpc('mulai_sewa', {
        p_kamar: params.p_kamar,
        p_penghuni: params.p_penghuni,
        p_tanggal_masuk: params.p_tanggal_masuk,
        p_hari_tagih: params.p_hari_tagih,
        p_harga: params.p_harga,
        p_deposit: params.p_deposit ?? 0
      })
      if (err) {
        if (err.message?.includes('unique') || err.code === '23505' || err.message?.toLowerCase().includes('kamar')) throw new Error('Kamar ini sudah terisi')
        throw err
      }
      umumkanDataBerubah()
      show('Sewa berhasil dimulai', 'success')
      return true
    } catch (e) {
      show(e.message || 'Gagal memulai sewa', 'error')
      return false
    }
  }

  const akhiriSewa = async (id, tanggalKeluar) => {
    try {
      const { error: err } = await supabase.rpc('akhiri_sewa', {
        p_sewa: id,
        p_tanggal_keluar: tanggalKeluar
      })
      if (err) throw err
      umumkanDataBerubah()
      show('Sewa berhasil diakhiri', 'success')
      return true
    } catch (e) {
      show(e.message || 'Gagal mengakhiri sewa', 'error')
      return false
    }
  }

  return { data, total, jumlah, loading, error, muatUlang, mulaiSewa, akhiriSewa }
}