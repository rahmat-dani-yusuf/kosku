import { useState, useEffect, useCallback, useMemo } from 'react'
import { supabase } from '../lib/supabaseClient.js'
import { useAuth } from './useAuth.jsx'

export function useLaporan() {
  const { user } = useAuth()
  const [periode, setPeriode] = useState(() => {
    const d = new Date()
    return new Date(d.getFullYear(), d.getMonth(), 1)
  })
  const [tagihan, setTagihan] = useState([])
  const [kamar, setKamar] = useState([])
  const [penghuni, setPenghuni] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const reload = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError(null)
    try {
      const y = periode.getFullYear()
      const m = String(periode.getMonth() + 1).padStart(2, '0')
      const p = `${y}-${m}-01`
      const [tres, kres, pres] = await Promise.all([
        supabase.from('tagihan').select('*, sewa:sewa_id(kamar_id, penghuni_id, kamar:kamar_id(nomor,tipe,harga_bulanan,status), penghuni:penghuni_id(nama,no_hp))').eq('user_id', user.id).eq('periode', p).order('jatuh_tempo'),
        supabase.from('kamar').select('id,nomor,tipe,harga_bulanan,fasilitas,status').eq('user_id', user.id).order('nomor'),
        supabase.from('penghuni').select('id,nama,no_hp,pekerjaan,kontak_darurat,catatan').eq('user_id', user.id).order('nama').then(async ({ data }) => {
          const ids = (data || []).map(p => p.id)
          const { data: s } = ids.length ? await supabase.from('sewa').select('penghuni_id').eq('user_id', user.id).eq('status', 'aktif').in('penghuni_id', ids) : { data: [] }
          const active = new Set((s || []).map(x => x.penghuni_id))
          return { data: (data || []).map(p => ({ ...p, aktif: active.has(p.id) })) }
        })
      ])
      if (tres.error) throw tres.error
      if (kres.error) throw kres.error
      // pres is result of then chain; handle directly below
      setTagihan(tres.data || [])
      setKamar(kres.data || [])
      // penghinis loaded via second promise; need to resolve correctly
    } catch (e) {
      setError(e.message || 'Gagal memuat laporan')
    } finally {
      setLoading(false)
    }
  }, [user, periode])

  useEffect(() => { reload() }, [reload])

  // Re-fetch penghuni correctly
  useEffect(() => {
    if (!user || !periode) return
    const y = periode.getFullYear(); const m = String(periode.getMonth()+1).padStart(2,'0'); const p = `${y}-${m}-01`
    const fetchPenghuni = async () => {
      const { data } = await supabase.from('penghuni').select('id,nama,no_hp,pekerjaan,kontak_darurat,catatan').eq('user_id', user.id).order('nama')
      const ids = (data || []).map(p => p.id)
      const { data: s } = ids.length ? await supabase.from('sewa').select('penghuni_id').eq('user_id', user.id).eq('status', 'aktif').in('penghuni_id', ids) : { data: [] }
      const active = new Set((s || []).map(x => x.penghuni_id))
      setPenghuni((data || []).map(p => ({ ...p, aktif: active.has(p.id) })))
    }
    fetchPenghuni()
  }, [user, periode])

  const ringkasan = useMemo(() => {
    const total = tagihan.length
    const lunas = tagihan.filter(t => t.status === 'lunas')
    const belum = tagihan.filter(t => t.status === 'belum')
    const terlambat = belum.filter(t => (t.jatuh_tempo || '') < new Date().toISOString().split('T')[0])
    return {
      total, lunas: lunas.length,       totalLunas: lunas.reduce((s,t)=>s+((t.jumlah||0)+(t.denda||0)),0),
      belum: belum.length, totalBelum: belum.reduce((s,t)=>s+(t.jumlah||0),0),
      terlambat: terlambat.length, totalTerlambat: terlambat.reduce((s,t)=>s+(t.jumlah||0),0),
      persenBayar: total ? Math.round((lunas.length / total) * 100) : 0,
      kamarTerisi: kamar.filter(k => k.status === 'terisi').length,
      kamarTotal: kamar.length
    }
  }, [tagihan, kamar])

  return { tagihan, kamar, penghuni, loading, error, periode, setPeriode, reload, ringkasan }
}
