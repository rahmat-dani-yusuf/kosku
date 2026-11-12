export function normalisasiNomor(nomor) {
  const cleaned = String(nomor ?? '').replace(/\D/g, '')
  if (!cleaned) return ''
  if (cleaned.startsWith('62')) return cleaned
  if (cleaned.startsWith('0')) return '62' + cleaned.slice(1)
  return '62' + cleaned
}

import { formatRupiah, formatTanggal } from './format.js'

export function buatPesanTagihan({ nama, nama_kos, nomor_kamar, periode, jumlah, jatuh_tempo, terlambat, denda, hariTelat }) {
  const kos = nama_kos || 'kos kami'
  if (terlambat) {
    let msg = `Halo ${nama}, tagihan kos ${kos} kamar ${nomor_kamar} periode ${periode} sebesar ${formatRupiah(jumlah)} sudah melewati jatuh tempo (${formatTanggal(jatuh_tempo)}). Mohon segera dilunasi ya. Terima kasih.`
    if (denda > 0) msg += ` Denda keterlambatan saat ini ${formatRupiah(denda)} (${hariTelat} hari).`
    return msg
  }
  return `Halo ${nama}, mengingatkan tagihan kos ${kos} kamar ${nomor_kamar} periode ${periode} sebesar ${formatRupiah(jumlah)}, jatuh tempo ${formatTanggal(jatuh_tempo)}. Terima kasih.`
}

export function buatLinkWA(nomor, pesan) {
  const normalized = normalisasiNomor(nomor)
  if (!normalized) return ''
  return `https://wa.me/${normalized}?text=${encodeURIComponent(pesan || '')}`
}

export function buatLinkWAShare(pesan) {
  return `https://wa.me/?text=${encodeURIComponent(pesan || '')}`
}

export function buatPesanPemesanan({ status, nama, nomor_kamar, nama_kos, tanggal, alasan }) {
  const kos = nama_kos || 'kos kami'
  const kamar = nomor_kamar || '-'
  const tgl = formatTanggal(tanggal)
  if (status === 'disetujui') {
    return `Halo ${nama}, pemesanan kamar ${kamar} di ${kos} sudah kami setujui. Silakan masuk tanggal ${tgl}. Terima kasih.`
  }
  if (status === 'ditolak') {
    return `Halo ${nama}, mohon maaf pemesanan kamar ${kamar} di ${kos} belum bisa kami terima.${alasan ? ' ' + alasan : ''}`
  }
  return `Halo ${nama}, terima kasih sudah mengajukan kamar ${kamar} di ${kos}. Kami ingin mengonfirmasi rencana masuk tanggal ${tgl}.`
}