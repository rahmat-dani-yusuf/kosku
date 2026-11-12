import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient.js'
import { useAuth } from './useAuth.jsx'
import { useToast } from '../components/Toast.jsx'
import { umumkanDataBerubah, dengarDataBerubah } from '../lib/events.js'

export function usePemesanan() {
  const { user } = useAuth()
  const { show } = useToast()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const reload = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError(null)
    try {
      const { data: rows, error: err } = await supabase
        .from('pemesanan')
        .select('*, kamar:kamar_id(nomor,harga_bulanan)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      if (err) throw err
      setData(rows || [])
    } catch (e) {
      setError(e.message || 'Gagal memuat data pemesanan')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => { reload() }, [reload])
  useEffect(() => dengarDataBerubah(reload), [reload])

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

  const jumlahMenunggu = data.filter(p => p.status === 'menunggu').length

  return { data, loading, error, reload, setujui, tolak, jumlahMenunggu }
}
