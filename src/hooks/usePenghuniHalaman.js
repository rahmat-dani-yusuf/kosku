import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient.js'
import { useAuth } from './useAuth.jsx'
import { dengarDataBerubah } from '../lib/events.js'
import { hitungRange } from '../lib/paginasi.js'

export function usePenghuniHalaman({ halaman = 1, perHalaman = 10, cari = '' } = {}) {
  const { user } = useAuth()
  const [data, setData] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [tik, setTik] = useState(0)

  const muatUlang = useCallback(() => setTik(t => t + 1), [])

  useEffect(() => {
    if (!user) return
    let batal = false
    const jalankan = async () => {
      setLoading(true)
      setError(null)
      try {
        const { from, to } = hitungRange(halaman, perHalaman)
        let q = supabase
          .from('penghuni')
          .select('*', { count: 'exact' })
          .eq('user_id', user.id)
          .order('nama', { ascending: true })
          .range(from, to)
        const c = (cari || '').trim().replace(/[,()]/g, ' ')
        if (c) q = q.or(`nama.ilike.%${c}%,no_hp.ilike.%${c}%,pekerjaan.ilike.%${c}%`)
        const { data: rows, error: err, count } = await q
        if (batal) return
        if (err) throw err
        setData(rows || [])
        setTotal(count || 0)
      } catch (e) {
        if (batal) return
        setError(e.message || 'Gagal memuat data penghuni')
        setData([])
        setTotal(0)
      } finally {
        if (!batal) setLoading(false)
      }
    }
    jalankan()
    return () => { batal = true }
  }, [user, halaman, perHalaman, cari, tik])

  useEffect(() => dengarDataBerubah(muatUlang), [muatUlang])

  return { data, total, loading, error, muatUlang }
}
