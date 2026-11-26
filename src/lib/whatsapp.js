export function normalisasiNomor(nomor) {
  const cleaned = String(nomor ?? '').replace(/\D/g, '')
  if (!cleaned) return ''
  if (cleaned.startsWith('62')) return cleaned
  if (cleaned.startsWith('0')) return '62' + cleaned.slice(1)
  return '62' + cleaned
}

import { formatRupiah, formatTanggal } from './format.js'

export function buatPesanTagihan({ nama, nama_kos, nomor_kamar, periode, jumlah, jatuh_tempo, terlambat, denda, hariTelat, info_pembayaran, link_bayar, terbayar }) {
  const kos = nama_kos || 'kos kami'
  const tb = Number(terbayar || 0)
  const sisa = tb > 0 ? Number(jumlah || 0) + Number(denda || 0) - tb : Number(jumlah || 0)
  const jumlahTampil = tb > 0 ? sisa : Number(jumlah || 0)
  let msg
  if (terlambat) {
    msg = `Halo ${nama}, tagihan kos ${kos} kamar ${nomor_kamar} periode ${periode} sebesar ${formatRupiah(jumlahTampil)} sudah melewati jatuh tempo (${formatTanggal(jatuh_tempo)}). Mohon segera dilunasi ya. Terima kasih.`
    if (denda > 0) msg += ` Denda keterlambatan saat ini ${formatRupiah(denda)} (${hariTelat} hari).`
  } else {
    msg = `Halo ${nama}, mengingatkan tagihan kos ${kos} kamar ${nomor_kamar} periode ${periode} sebesar ${formatRupiah(jumlahTampil)}, jatuh tempo ${formatTanggal(jatuh_tempo)}. Terima kasih.`
  }
  if (tb > 0) {
    msg += `\nSudah dibayar: ${formatRupiah(tb)}`
    msg += `\nSisa tagihan: ${formatRupiah(sisa)}`
  }
  const info = String(info_pembayaran || '').trim()
  if (info) msg += `\nPembayaran: ${info}`
  if (link_bayar) msg += `\nUnggah bukti transfer: ${link_bayar}`
  return msg
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