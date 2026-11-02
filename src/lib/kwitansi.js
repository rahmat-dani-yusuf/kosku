import { jsPDF } from 'jspdf'
import { formatRupiah, terbilang, formatPeriode, formatTanggal } from './format.js'

export function unduhKwitansi(tagihan, profil) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a5' })
  const w = doc.internal.pageSize.getWidth()
  const h = doc.internal.pageSize.getHeight()

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.text('KWITANSI', w / 2, 12, { align: 'center' })

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.text(`Kos: ${profil?.nama_kos || 'Kos kami'}`, 10, 20)
  if (profil?.alamat) doc.text(`Alamat: ${profil.alamat}`, 10, 24)
  if (profil?.no_wa) doc.text(`No. WA: ${profil.no_wa}`, 10, profil?.alamat ? 28 : 24)

  const idCode = (tagihan.id || '').toString().toUpperCase().slice(0, 6).padEnd(6, '0')
  const periodeStr = tagihan.periode || ''
  const yyyymm = periodeStr.slice(0, 7) || new Date().toISOString().slice(0, 7)
  doc.setFontSize(8)
  doc.text(`No. Kwitansi: KW-${yyyymm}-${idCode}`, w - 60, 20)

  doc.setDrawColor(30, 120, 70)
  doc.setLineWidth(0.5)
  doc.line(10, 32, w - 10, 32)

  const rows = [
    ['Nama Penghuni', tagihan.sewa?.penghuni?.nama || '-'],
    ['Nomor Kamar', tagihan.sewa?.kamar?.nomor || '-'],
    ['Periode Sewa', formatPeriode(tagihan.periode || '') || '-'],
    ['Jumlah', formatRupiah(tagihan.jumlah || 0)],
    ['Jumlah Terbilang', terbilang(tagihan.jumlah || 0)],
    ['Tanggal Bayar', tagihan.tanggal_bayar ? formatTanggal(tagihan.tanggal_bayar) : '-'],
    ['Metode Bayar', tagihan.metode ? tagihan.metode.charAt(0).toUpperCase() + tagihan.metode.slice(1) : '-'],
  ]

  let y = 36
  rows.forEach(([label, val]) => {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.text(label + ':', 12, y)
    doc.setFont('helvetica', 'normal')
    doc.text(String(val), 70, y)
    y += 7
  })

  doc.line(10, y + 2, w - 10, y + 2)
  y += 8
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.text('Terima kasih atas pembayaran Anda.', 12, y)

  doc.line(10, h - 30, 80, h - 30)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.text(`Pemilik`, 12, h - 22)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.text(profil?.nama_pemilik || '-', 12, h - 16)

  doc.save(`kwitansi-kamar-${tagihan.sewa?.kamar?.nomor || '0'}-${yyyymm}.pdf`)
}
