import { useState, useEffect, useMemo } from 'react'
import { supabase } from '../lib/supabaseClient.js'
import { useAuth } from './useAuth.jsx'

export function useDashboard() {
  const { user } = useAuth()
  const [kamar, setKamar] = useState([])
  const [tagihan, setTagihan] = useState([])
  const [sewaAktif, setSewaAktif] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!user) return
    setLoading(true)
    setError(null)
    const now = new Date()
    const todayStr = now.toISOString().split('T')[0]
    const y = now.getFullYear()
    const m = String(now.getMonth() + 1).padStart(2, '0')
    const periodeStr = `${y}-${m}-01`

    Promise.all([
      supabase.from('kamar').select('id,status').eq('user_id', user.id),
      supabase.from('tagihan').select('*, sewa:sewa_id(kamar_id, penghuni_id)').eq('user_id', user.id),
      supabase.from('sewa').select('id, kamar_id, penghuni_id, tanggal_masuk').eq('user_id', user.id).eq('status', 'aktif')
    ]).then(([kres, tres, sres]) => {
      if (kres.error) throw kres.error
      if (tres.error) throw tres.error
      if (sres.error) throw sres.error
      setKamar(kres.data || [])
      setTagihan(tres.data || [])
      setSewaAktif(sres.data || [])
    }).catch(e => setError(e.message || 'Gagal memuat dashboard')).finally(() => setLoading(false))
  }, [user])

  const okupansi = useMemo(() => {
    const total = kamar.length
    const terisi = kamar.filter(k => k.status === 'terisi').length
    return { total, terisi, pct: total ? Math.round((terisi / total) * 100) : 0 }
  }, [kamar])

  const ringkasanPendapatan = useMemo(() => {
    const bulanIni = new Date().toISOString().slice(0, 7)
    const lunasBulan = tagihan.filter(t => t.status === 'lunas' && (t.tanggal_bayar || '').startsWith(bulanIni))
    return lunasBulan.reduce((s, t) => s + (t.jumlah || 0), 0)
  }, [tagihan])

  const tunggakan = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0]
    return tagihan.filter(t => t.status === 'belum' && (t.jatuh_tempo || '') < todayStr)
  }, [tagihan])

  const jatuhTempo7 = useMemo(() => {
    const today = new Date()
    const end = new Date(today); end.setDate(today.getDate() + 7)
    const endStr = end.toISOString().split('T')[0]
    return tagihan.filter(t => t.status === 'belum' && (t.jatuh_tempo || '') >= today.toISOString().split('T')[0] && (t.jatuh_tempo || '') <= endStr)
  }, [tagihan])

  const menunggak = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0]
    return [...tagihan.filter(t => t.status === 'belum' && (t.jatuh_tempo || '') < todayStr)].sort((a, b) => (a.jatuh_tempo || '').localeCompare(b.jatuh_tempo || ''))
  }, [tagihan])

  const grafikPendapatan = useMemo(() => {
    const months = []
    const now = new Date()
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      months.push({ label: d.toLocaleString('id-ID', { month: 'short' }), periode: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` })
    }
    const data = months.map(m => {
      const sum = tagihan.filter(t => t.status === 'lunas' && (t.tanggal_bayar || '').startsWith(m.periode)).reduce((s, t) => s + (t.jumlah || 0), 0)
      return { label: m.label, value: sum }
    })
    return data
  }, [tagihan])

  return { kamar, tagihan, sewaAktif, loading, error, okupansi, ringkasanPendapatan, tunggakan, jatuhTempo7, menunggak, grafikPendapatan }
}
