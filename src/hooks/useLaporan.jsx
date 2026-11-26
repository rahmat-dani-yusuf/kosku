import { useState, useEffect, useCallback, useMemo } from 'react'
import { supabase } from '../lib/supabaseClient.js'
import { useAuth } from './useAuth.jsx'

function pad(n) { return String(n).padStart(2, '0') }
function akhirBulan(y, m) {
  const d = new Date(y, m, 0)
  return `${y}-${pad(m)}-${pad(d.getDate())}`
}

export function useLaporan() {
  const { user } = useAuth()
  const [periode, setPeriode] = useState(() => {
    const d = new Date()
    return new Date(d.getFullYear(), d.getMonth(), 1)
  })
  const [tagihan, setTagihan] = useState([])
  const [kamar, setKamar] = useState([])
  const [penghuni, setPenghuni] = useState([])
  const [pembayaran, setPembayaran] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const y = periode.getFullYear()
  const m = periode.getMonth() + 1
  const p = `${y}-${pad(m)}-01`
  const akhir = akhirBulan(y, m)

  const reload = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError(null)
    try {
      const [tres, kres, pres, payres] = await Promise.all([
        supabase.from('tagihan').select('*, sewa:sewa_id(kamar_id, penghuni_id, kamar:kamar_id(nomor,tipe,harga_bulanan,status), penghuni:penghuni_id(nama,no_hp))').eq('user_id', user.id).eq('periode', p).order('jatuh_tempo'),
        supabase.from('kamar').select('id,nomor,tipe,harga_bulanan,fasilitas,status').eq('user_id', user.id).order('nomor'),
        supabase.from('penghuni').select('id,nama,no_hp,pekerjaan,kontak_darurat,catatan').eq('user_id', user.id).order('nama'),
        supabase.from('pembayaran').select('id,jumlah,tanggal,metode,catatan,bukti_id,created_at,tagihan:tagihan_id(sewa:sewa_id(kamar:kamar_id(nomor),penghuni:penghuni_id(nama)))').eq('user_id', user.id).gte('tanggal', p).lte('tanggal', akhir).order('tanggal').order('created_at')
      ])
      if (tres.error) throw tres.error
      if (kres.error) throw kres.error
      if (payres.error) throw payres.error

      setTagihan(tres.data || [])
      setKamar(kres.data || [])
      setPembayaran(payres.data || [])

      const ids = (pres.data || []).map(x => x.id)
      const { data: s } = ids.length ? await supabase.from('sewa').select('penghuni_id').eq('user_id', user.id).eq('status', 'aktif').in('penghuni_id', ids) : { data: [] }
      const active = new Set((s || []).map(x => x.penghuni_id))
      setPenghuni((pres.data || []).map(x => ({ ...x, aktif: active.has(x.id) })))
    } catch (e) {
      setError(e.message || 'Gagal memuat laporan')
    } finally {
      setLoading(false)
    }
  }, [user, p, akhir])

  useEffect(() => { reload() }, [reload])

  const ringkasan = useMemo(() => {
    const total = tagihan.length
    const lunas = tagihan.filter(t => t.status === 'lunas')
    const belum = tagihan.filter(t => t.status === 'belum')
    const todayStr = new Date().toISOString().split('T')[0]
    const terlambat = belum.filter(t => (t.jatuh_tempo || '') < todayStr)
    const tagihanDiterbitkan = tagihan.reduce((s, t) => s + Number(t.jumlah || 0), 0)
    const uangMasuk = pembayaran.reduce((s, p) => s + Number(p.jumlah || 0), 0)
    const sisaBelumBayar = belum.reduce((s, t) => s + (Number(t.jumlah || 0) - Number(t.terbayar || 0)), 0)
    const dendaDiterima = lunas.reduce((s, t) => s + Number(t.denda || 0), 0)
    const persenBayar = tagihanDiterbitkan ? Math.min(100, Math.round((uangMasuk / tagihanDiterbitkan) * 100)) : 0
    return {
      total, lunas: lunas.length, totalLunas: lunas.reduce((s, t) => s + (Number(t.jumlah || 0) + Number(t.denda || 0)), 0),
      belum: belum.length, totalBelum: sisaBelumBayar,
      terlambat: terlambat.length, totalTerlambat: terlambat.reduce((s, t) => s + (Number(t.jumlah || 0) - Number(t.terbayar || 0)), 0),
      persenBayar,
      uangMasukLebih: uangMasuk > tagihanDiterbitkan,
      tagihanDiterbitkan, uangMasuk, sisaBelumBayar, dendaDiterima,
      kamarTerisi: kamar.filter(k => k.status === 'terisi').length,
      kamarTotal: kamar.length
    }
  }, [tagihan, kamar, pembayaran])

  return { tagihan, kamar, penghuni, pembayaran, loading, error, periode, setPeriode, reload, ringkasan }
}
