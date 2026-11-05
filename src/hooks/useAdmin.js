import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient.js'

export function useAdmin() {
  const [statistik, setStatistik] = useState({ jumlah_pemilik: 0, pemilik_aktif: 0, total_kamar: 0, kamar_terisi: 0, sewa_aktif: 0 })
  const [daftarKos, setDaftarKos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const reload = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [sres, kres] = await Promise.all([
        supabase.rpc('admin_statistik'),
        supabase.rpc('admin_daftar_kos'),
      ])
      if (sres.error) throw sres.error
      if (kres.error) throw kres.error
      if (sres.data) setStatistik(sres.data)
      setDaftarKos(kres.data || [])
    } catch (e) {
      setError(e.message || 'Gagal memuat data admin')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { reload() }, [reload])

  return { statistik, daftarKos, loading, error, reload }
}
