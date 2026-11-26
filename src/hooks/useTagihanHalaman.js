import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient.js'
import { useAuth } from './useAuth.jsx'
import { useToast } from '../components/Toast.jsx'
import { dengarDataBerubah, umumkanDataBerubah } from '../lib/events.js'
import { hitungRange } from '../lib/paginasi.js'
import { formatRupiah } from '../lib/format.js'

const SELECT_TAGIHAN = '*, sewa:sewa_id(kamar_id, penghuni_id, kamar:kamar_id(nomor), penghuni:penghuni_id(nama,no_hp))'

// Tanggal lokal (bukan UTC) format YYYY-MM-DD
export function hariIni() {
  const d = new Date()
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

// Ringkasan SELURUH tagihan pada periode (tidak terpengaruh halaman, filter, atau pencarian)
async function ambilRingkasan(userId, periode, hari) {
  let semua = []
  for (let dari = 0; dari < 20000; dari += 1000) {
    const { data, error } = await supabase
      .from('tagihan')
      .select('status,jumlah,denda,jatuh_tempo,terbayar')
      .eq('user_id', userId)
      .eq('periode', periode)
      .order('id')
      .range(dari, dari + 999)
    if (error) {
      if (error.code === 'PGRST103') break
      throw error
    }
    semua = semua.concat(data || [])
    if (!data || data.length < 1000) break
  }
  const hasil = { total: 0, lunas: 0, nominalLunas: 0, belum: 0, nominalBelum: 0, terlambat: 0 }
  for (const t of semua) {
    hasil.total += 1
    hasil.nominalLunas += Number(t.terbayar || 0)
    if (t.status === 'lunas') {
      hasil.lunas += 1
    } else if (t.status === 'belum') {
      hasil.belum += 1
      hasil.nominalBelum += Number(t.jumlah || 0) - Number(t.terbayar || 0)
      if ((t.jatuh_tempo || '') < hari) hasil.terlambat += 1
    }
  }
  return hasil
}

const RINGKASAN_AWAL = { total: 0, lunas: 0, nominalLunas: 0, belum: 0, nominalBelum: 0, terlambat: 0 }

// periode: 'YYYY-MM-01'; status: 'semua' | 'belum' | 'lunas' | 'terlambat'
export function useTagihanHalaman({ halaman = 1, perHalaman = 10, periode, status = 'semua', cari = '' } = {}) {
  const { user } = useAuth()
  const { show } = useToast()
  const [data, setData] = useState([])
  const [total, setTotal] = useState(0)
  const [ringkasan, setRingkasan] = useState(RINGKASAN_AWAL)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [tik, setTik] = useState(0)

  const muatUlang = useCallback(() => setTik(t => t + 1), [])

  useEffect(() => {
    if (!user || !periode) return
    let batal = false

    const jalankan = async () => {
      setLoading(true)
      setError(null)
      try {
        const { from, to } = hitungRange(halaman, perHalaman)
        const hari = hariIni()
        const ringkasanPromise = ambilRingkasan(user.id, periode, hari)
        ringkasanPromise.catch(() => {})

        // Pencarian: cari sewa yang cocok (nama, no HP, atau nomor kamar), lalu saring tagihannya
        let idSewa = null
        const c = (cari || '').trim().replace(/[,()%*]/g, ' ').trim()
        if (c) {
          const [rk, rp] = await Promise.all([
            supabase.from('kamar').select('id').eq('user_id', user.id).ilike('nomor', `%${c}%`).limit(100),
            supabase.from('penghuni').select('id').eq('user_id', user.id)
              .or(`nama.ilike.%${c}%,no_hp.ilike.%${c}%`).limit(100)
          ])
          if (rk.error) throw rk.error
          if (rp.error) throw rp.error
          const bagian = []
          if (rk.data?.length) bagian.push(`kamar_id.in.(${rk.data.map(x => x.id).join(',')})`)
          if (rp.data?.length) bagian.push(`penghuni_id.in.(${rp.data.map(x => x.id).join(',')})`)
          if (bagian.length) {
            const rs = await supabase.from('sewa').select('id').eq('user_id', user.id).or(bagian.join(',')).limit(100)
            if (rs.error) throw rs.error
            idSewa = (rs.data || []).map(x => x.id)
          } else {
            idSewa = []
          }
          if (!idSewa.length) {
            const r = await ringkasanPromise
            if (batal) return
            setRingkasan(r)
            setData([])
            setTotal(0)
            return
          }
        }

        const bangun = () => {
          let q = supabase
            .from('tagihan')
            .select(SELECT_TAGIHAN, { count: 'exact' })
            .eq('user_id', user.id)
            .eq('periode', periode)
          if (status === 'lunas') q = q.eq('status', 'lunas')
          else if (status === 'belum') q = q.eq('status', 'belum')
          else if (status === 'terlambat') q = q.eq('status', 'belum').lt('jatuh_tempo', hari)
          if (idSewa) q = q.in('sewa_id', idSewa)
          return q.order('jatuh_tempo', { ascending: true }).order('id')
        }

        let hasil = await bangun().range(from, to)
        // Halaman melewati jumlah data: ambil total yang benar, halaman dimundurkan oleh komponen halaman
        if (hasil.error?.code === 'PGRST103') {
          const awal = await bangun().range(0, 0)
          hasil = { data: [], error: awal.error, count: awal.count }
        }
        const r = await ringkasanPromise
        if (batal) return
        if (hasil.error) throw hasil.error
        setData(hasil.data || [])
        setTotal(hasil.count || 0)
        setRingkasan(r)
      } catch (e) {
        if (batal) return
        setError(e.message || 'Gagal memuat tagihan')
        setData([])
        setTotal(0)
      } finally {
        if (!batal) setLoading(false)
      }
    }

    jalankan()
    return () => { batal = true }
  }, [user, halaman, perHalaman, periode, status, cari, tik])

  useEffect(() => dengarDataBerubah(muatUlang), [muatUlang])

  const buatTagihan = useCallback(async () => {
    try {
      const { data: hasil, error: err } = await supabase.rpc('buat_tagihan_bulanan', { p_periode: periode })
      if (err) {
        if (err.message?.includes('duplicate') || err.code === '23505') show('Semua tagihan bulan ini sudah dibuat', 'success')
        else throw err
      } else {
        const jumlah = hasil || 0
        if (jumlah === 0) show('Semua tagihan bulan ini sudah dibuat', 'success')
        else show(`${jumlah} tagihan baru berhasil dibuat`, 'success')
      }
      umumkanDataBerubah()
      return true
    } catch (e) {
      show(e.message || 'Gagal membuat tagihan', 'error')
      return false
    }
  }, [periode, show])

  const tandaiLunas = useCallback(async (id, tanggalBayar, metode, denda = 0) => {
    try {
      const { data: t, error: e } = await supabase
        .from('tagihan')
        .select('jumlah,terbayar')
        .eq('id', id).eq('user_id', user.id)
        .single()
      if (e) throw e
      const sisa = Number(t?.jumlah || 0) + Number(denda || 0) - Number(t?.terbayar || 0)
      const { data: res, error: err } = await supabase.rpc('catat_pembayaran', {
        p_tagihan: id,
        p_jumlah: sisa,
        p_tanggal: tanggalBayar,
        p_metode: metode,
        p_denda: Number(denda) || 0,
      })
      if (err) throw err
      umumkanDataBerubah()
      show('Tagihan ditandai lunas', 'success')
      return res || true
    } catch (e) {
      show(e?.message || 'Gagal menandai lunas', 'error')
      return false
    }
  }, [user, show])

  const catatPembayaran = useCallback(async (tagihanId, { jumlah, tanggal, metode, denda = 0, catatan = null } = {}) => {
    try {
      const { data: res, error: err } = await supabase.rpc('catat_pembayaran', {
        p_tagihan: tagihanId,
        p_jumlah: Number(jumlah) || 0,
        p_tanggal: tanggal,
        p_metode: metode,
        p_denda: Number(denda) || 0,
        p_catatan: catatan && String(catatan).trim() ? String(catatan).trim() : null,
      })
      if (err) throw err
      umumkanDataBerubah()
      const obj = (Array.isArray(res) ? res[0] : res) || {}
      if (obj.lunas) show('Tagihan lunas', 'success')
      else show(`Pembayaran ${formatRupiah(Number(jumlah) || 0)} dicatat, sisa ${formatRupiah(obj.sisa)}`, 'success')
      return obj
    } catch (e) {
      show(e?.message || 'Gagal mencatat pembayaran', 'error')
      return null
    }
  }, [show])

  const batalkanPembayaran = useCallback(async (pembayaranId) => {
    try {
      const { error: err } = await supabase.rpc('batalkan_pembayaran', { p_pembayaran: pembayaranId })
      if (err) throw err
      umumkanDataBerubah()
      show('Pembayaran dihapus', 'success')
      return true
    } catch (e) {
      show(e?.message || 'Gagal menghapus pembayaran', 'error')
      return false
    }
  }, [show])

  const batalkanLunas = useCallback(async (id) => {
    try {
      const { error: err } = await supabase.rpc('reset_pembayaran', { p_tagihan: id })
      if (err) throw err
      umumkanDataBerubah()
      show('Tagihan dibatalkan', 'success')
      return true
    } catch (e) {
      show(e?.message || 'Gagal membatalkan', 'error')
      return false
    }
  }, [show])

  return { data, total, ringkasan, loading, error, muatUlang, buatTagihan, tandaiLunas, catatPembayaran, batalkanPembayaran, batalkanLunas }
}