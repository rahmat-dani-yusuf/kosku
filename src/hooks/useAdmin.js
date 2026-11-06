import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabaseClient.js'
import { useAuth } from './useAuth.jsx'

function tampilSebagaiPemilik(k, user) {
  if (String(k?.role || '').toLowerCase() === 'admin') return false
  if (user?.id && k?.user_id === user.id) return false
  if (user?.email && String(k?.email || '').toLowerCase() === String(user.email).toLowerCase()) return false
  return true
}

export function useAdmin() {
  const { user } = useAuth()
  const [statistik, setStatistik] = useState({ jumlah_pemilik: 0, pemilik_aktif: 0, total_kamar: 0, kamar_terisi: 0, sewa_aktif: 0 })
  const [daftarKos, setDaftarKos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const sudahDimuat = useRef(false)

  const reload = useCallback(async () => {
    setError(null)
    if (!sudahDimuat.current) setLoading(true)
    try {
      const [sres, kres] = await Promise.all([
        supabase.rpc('admin_statistik'),
        supabase.rpc('admin_daftar_kos'),
      ])
      if (sres.error) throw sres.error
      if (kres.error) throw kres.error
      if (sres.data) setStatistik(sres.data)
      setDaftarKos((kres.data || []).filter(k => tampilSebagaiPemilik(k, user)))
    } catch (e) {
      setError(e.message || 'Gagal memuat data admin')
    } finally {
      sudahDimuat.current = true
      setLoading(false)
    }
  }, [user])

  useEffect(() => { reload() }, [reload])

  const setAktif = useCallback(async (userId, aktif) => {
    const { error: err } = await supabase.rpc('admin_set_aktif', { p_user: userId, p_aktif: aktif })
    if (err) throw err
    await reload()
    return true
  }, [reload])

  return { statistik, daftarKos, loading, error, reload, setAktif }
}
