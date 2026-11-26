import { useState, useEffect, useMemo } from 'react'
import { supabase } from '../lib/supabaseClient.js'
import { useAuth } from './useAuth.jsx'

function pad(n) { return String(n).padStart(2, '0') }
function hariIni() {
  const d = new Date()
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function useDashboard() {
  const { user } = useAuth()
  const [kamar, setKamar] = useState([])
  const [tagihan, setTagihan] = useState([])
  const [sewaAktif, setSewaAktif] = useState([])
  const [pembayaran, setPembayaran] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!user) return
    setLoading(true)
    setError(null)
    const now = new Date()
    const start = new Date(now.getFullYear(), now.getMonth() - 5, 1)
    const startStr = `${start.getFullYear()}-${pad(start.getMonth() + 1)}-01`
    const todayStr = hariIni()

    Promise.all([
      supabase.from('kamar').select('id,status').eq('user_id', user.id),
      supabase.from('tagihan').select('*, sewa:sewa_id(kamar_id, penghuni_id)').eq('user_id', user.id),
      supabase.from('sewa').select('id, kamar_id, penghuni_id, tanggal_masuk').eq('user_id', user.id).eq('status', 'aktif'),
      supabase.from('pembayaran').select('jumlah,tanggal').eq('user_id', user.id).gte('tanggal', startStr).lte('tanggal', todayStr)
    ]).then(([kres, tres, sres, pres]) => {
      if (kres.error) throw kres.error
      if (tres.error) throw tres.error
      if (sres.error) throw sres.error
      if (pres.error) throw pres.error
      setKamar(kres.data || [])
      setTagihan(tres.data || [])
      setSewaAktif(sres.data || [])
      setPembayaran(pres.data || [])
    }).catch(e => setError(e.message || 'Gagal memuat dashboard')).finally(() => setLoading(false))
  }, [user])

  const okupansi = useMemo(() => {
    const total = kamar.length
    const terisi = kamar.filter(k => k.status === 'terisi').length
    return { total, terisi, pct: total ? Math.round((terisi / total) * 100) : 0 }
  }, [kamar])

  const ringkasanPendapatan = useMemo(() => {
    const bulanIni = hariIni().slice(0, 7)
    return pembayaran
      .filter(p => (p.tanggal || '').startsWith(bulanIni))
      .reduce((s, p) => s + Number(p.jumlah || 0), 0)
  }, [pembayaran])

  const tunggakan = useMemo(() => {
    return tagihan.filter(t => t.status === 'belum')
  }, [tagihan])

  const tunggakanNominal = useMemo(() => {
    return tunggakan.reduce((s, t) => s + (Number(t.jumlah || 0) - Number(t.terbayar || 0)), 0)
  }, [tunggakan])

  const jatuhTempo7 = useMemo(() => {
    const today = new Date()
    const end = new Date(today); end.setDate(today.getDate() + 7)
    const endStr = `${end.getFullYear()}-${pad(end.getMonth() + 1)}-${pad(end.getDate())}`
    const todayStr = hariIni()
    return tagihan.filter(t => t.status === 'belum' && (t.jatuh_tempo || '') >= todayStr && (t.jatuh_tempo || '') <= endStr)
  }, [tagihan])

  const menunggak = useMemo(() => {
    const todayStr = hariIni()
    return [...tagihan.filter(t => t.status === 'belum' && (t.jatuh_tempo || '') < todayStr)].sort((a, b) => (a.jatuh_tempo || '').localeCompare(b.jatuh_tempo || ''))
  }, [tagihan])

  const grafikPendapatan = useMemo(() => {
    const months = []
    const now = new Date()
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      months.push({ label: d.toLocaleString('id-ID', { month: 'short' }), periode: `${d.getFullYear()}-${pad(d.getMonth() + 1)}` })
    }
    const data = months.map(m => {
      const sum = pembayaran.filter(p => (p.tanggal || '').startsWith(m.periode)).reduce((s, p) => s + Number(p.jumlah || 0), 0)
      return { label: m.label, value: sum }
    })
    return data
  }, [pembayaran])

  return { kamar, tagihan, sewaAktif, loading, error, okupansi, ringkasanPendapatan, tunggakan, tunggakanNominal, jatuhTempo7, menunggak, grafikPendapatan }
}
