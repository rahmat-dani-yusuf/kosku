import { useState, useEffect, useCallback, useMemo } from 'react'
import { supabase } from '../lib/supabaseClient.js'
import { useAuth } from './useAuth.jsx'
import { useToast } from '../components/Toast.jsx'

export function useTagihan() {
  const { user } = useAuth()
  const { show } = useToast()
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [periode, setPeriode] = useState(() => {
    const d = new Date()
    return new Date(d.getFullYear(), d.getMonth(), 1)
  })
  const [statusFilter, setStatusFilter] = useState('semua')

  const reload = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError(null)
    try {
      const y = periode.getFullYear()
      const m = String(periode.getMonth() + 1).padStart(2, '0')
      const p = `${y}-${m}-01`
      const { data, error: err } = await supabase
        .from('tagihan')
        .select('*, sewa:sewa_id(kamar_id, penghuni_id, kamar:kamar_id(nomor), penghuni:penghuni_id(nama,no_hp)), periode')
        .eq('user_id', user.id)
        .eq('periode', p)
        .order('jatuh_tempo', { ascending: true })
      if (err) throw err
      setList(data || [])
    } catch (e) {
      setError(e.message || 'Gagal memuat tagihan')
    } finally {
      setLoading(false)
    }
  }, [user, periode])

  useEffect(() => { reload() }, [reload])

  const buatTagihan = useCallback(async () => {
    try {
      const y = periode.getFullYear()
      const m = String(periode.getMonth() + 1).padStart(2, '0')
      const p = `${y}-${m}-01`
      const { data, error: err } = await supabase.rpc('buat_tagihan_bulanan', { p_periode: p })
      if (err) {
        if (err.message?.includes('duplicate') || err.code === '23505') show('Semua tagihan bulan ini sudah dibuat', 'success')
        else throw err
      } else {
        const count = data || 0
        if (count === 0) show('Semua tagihan bulan ini sudah dibuat', 'success')
        else show(`${count} tagihan baru berhasil dibuat`, 'success')
      }
      await reload()
      return true
    } catch (e) {
      show(e.message || 'Gagal membuat tagihan', 'error')
      return false
    }
  }, [periode, reload, show])

  const tandaiLunas = useCallback(async (id, tanggalBayar, metode, denda = 0) => {
    try {
      const { error: err } = await supabase.from('tagihan').update({ status: 'lunas', tanggal_bayar: tanggalBayar, metode, denda: Number(denda) || 0 }).eq('id', id).eq('user_id', user.id)
      if (err) throw err
      await reload()
      show('Tagihan ditandai lunas', 'success')
      return true
    } catch (e) {
      show(e.message || 'Gagal menandai lunas', 'error')
      return false
    }
  }, [user, reload, show])

  const batalkanLunas = useCallback(async (id) => {
    try {
      const { error: err } = await supabase.from('tagihan').update({ status: 'belum', tanggal_bayar: null, metode: null, denda: 0 }).eq('id', id).eq('user_id', user.id)
      if (err) throw err
      await reload()
      show('Tagihan dibatalkan', 'success')
      return true
    } catch (e) {
      show(e.message || 'Gagal membatalkan', 'error')
      return false
    }
  }, [user, reload, show])

  const ringkasan = useMemo(() => {
    const total = list.length
    const lunas = list.filter(i => i.status === 'lunas')
    const belum = list.filter(i => i.status === 'belum')
    const todayStr = new Date().toISOString().split('T')[0]
    const terlambat = list.filter(i => i.status === 'belum' && (i.jatuh_tempo || '') < todayStr)
    const nominalLunas = lunas.reduce((s, i) => s + ((i.jumlah || 0) + (i.denda || 0)), 0)
    const nominalBelum = belum.reduce((s, i) => s + (i.jumlah || 0), 0)
    return { total, lunas: lunas.length, nominalLunas, belum: belum.length, nominalBelum, terlambat: terlambat.length }
  }, [list])

  const filteredList = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0]
    if (statusFilter === 'lunas') return list.filter(i => i.status === 'lunas')
    if (statusFilter === 'belum') return list.filter(i => i.status === 'belum')
    if (statusFilter === 'terlambat') return list.filter(i => i.status === 'belum' && (i.jatuh_tempo || '') < todayStr)
    return list
  }, [list, statusFilter])

  return { list, filteredList, loading, error, periode, setPeriode, statusFilter, setStatusFilter, reload, buatTagihan, tandaiLunas, batalkanLunas, ringkasan }
}
