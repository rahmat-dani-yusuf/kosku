import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient.js'
import { useAuth } from './useAuth.jsx'
import { useToast } from '../components/Toast.jsx'
import { dengarDataBerubah } from '../lib/events.js'

export function useSewa() {
  const { user } = useAuth()
  const { show } = useToast()
  const [aktif, setAktif] = useState([])
  const [riwayat, setRiwayat] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const reload = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError(null)
    try {
      const [{ data: a, error: e1 }, { data: r, error: e2 }] = await Promise.all([
        supabase.from('sewa').select('*, kamar:kamar_id(nomor,tipe), penghuni:penghuni_id(nama,no_hp)').eq('user_id', user.id).eq('status', 'aktif').order('tanggal_masuk'),
        supabase.from('sewa').select('*, kamar:kamar_id(nomor,tipe), penghuni:penghuni_id(nama,no_hp)').eq('user_id', user.id).eq('status', 'selesai').order('tanggal_keluar', { ascending: false })
      ])
      if (e1) throw e1
      if (e2) throw e2
      setAktif(a || [])
      setRiwayat(r || [])
    } catch (e) {
      setError(e.message || 'Gagal memuat data sewa')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => { reload() }, [reload])
  useEffect(() => dengarDataBerubah(reload), [reload])

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
      await reload()
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
      await reload()
      show('Sewa berhasil diakhiri', 'success')
      return true
    } catch (e) {
      show(e.message || 'Gagal mengakhiri sewa', 'error')
      return false
    }
  }

  return { aktif, riwayat, loading, error, reload, mulaiSewa, akhiriSewa }
}
