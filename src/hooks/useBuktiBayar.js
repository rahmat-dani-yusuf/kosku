import { useCallback } from 'react'
import { supabase } from '../lib/supabaseClient.js'
import { useAuth } from './useAuth.jsx'
import { useToast } from '../components/Toast.jsx'
import { umumkanDataBerubah } from '../lib/events.js'
import { formatRupiah } from '../lib/format.js'

export function useBuktiBayar() {
  const { user } = useAuth()
  const { show } = useToast()

  const ambilBukti = useCallback(async (tagihanId) => {
    if (!user || !tagihanId) return []
    try {
      const { data, error } = await supabase
        .from('bukti_bayar')
        .select('*')
        .eq('tagihan_id', tagihanId)
        .order('created_at', { ascending: false })
      if (error) throw error
      const hasil = await Promise.all((data || []).map(async (b) => {
        const { data: signed, error: sErr } = await supabase.storage
          .from('bukti-bayar')
          .createSignedUrl(b.path, 300)
        return { ...b, signedUrl: sErr ? null : (signed?.signedUrl || null) }
      }))
      return hasil
    } catch (e) {
      show(e?.message || 'Gagal memuat bukti', 'error')
      return []
    }
  }, [user, show])

  const terima = useCallback(async (buktiId, { tanggal, metode, denda, jumlah } = {}) => {
    try {
      const { data: res, error } = await supabase.rpc('terima_bukti_bayar', {
        p_bukti: buktiId,
        p_tanggal: tanggal,
        p_metode: metode,
        p_denda: Number(denda) || 0,
        p_jumlah: jumlah != null ? Number(jumlah) : null,
      })
      if (error) throw error
      umumkanDataBerubah()
      const obj = (Array.isArray(res) ? res[0] : res) || {}
      if (obj.lunas) show('Tagihan lunas', 'success')
      else show(`Pembayaran ${formatRupiah(Number(jumlah != null ? jumlah : (obj.terbayar || 0)))} dicatat, sisa ${formatRupiah(obj.sisa)}`, 'success')
      return obj
    } catch (e) {
      show(e?.message || 'Gagal menerima bukti', 'error')
      return null
    }
  }, [show])

  const tolak = useCallback(async (buktiId, alasan) => {
    try {
      const { error } = await supabase.rpc('tolak_bukti_bayar', {
        p_bukti: buktiId,
        p_alasan: alasan && alasan.trim() ? alasan.trim() : null,
      })
      if (error) throw error
      umumkanDataBerubah()
      show('Bukti ditolak')
      return true
    } catch (e) {
      show(e?.message || 'Gagal menolak bukti', 'error')
      return false
    }
  }, [show])

  return { ambilBukti, terima, tolak }
}
