import { formatRupiah, formatTanggal, formatPeriode } from './format.js'

export async function unduhLaporanPdf({ periode, tagihan, kamar, profil, ringkasan, pembayaran }) {
  const [{ jsPDF }, { default: autoTable }] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ])
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const w = doc.internal.pageSize.getWidth()

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.text('Laporan Bulanan', w / 2, 14, { align: 'center' })
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Kos: ${profil?.nama_kos || 'Kos kami'}`, 14, 20)
  doc.text(`Periode: ${formatPeriode(periode) || '-'}`, 14, 24)

  doc.setDrawColor(30, 120, 70)
  doc.setLineWidth(0.5)
  doc.line(14, 28, w - 14, 28)

  // Ringkasan
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.text('Ringkasan', 14, 34)
  autoTable(doc, {
    startY: 36,
    head: [['Item', 'Jumlah', 'Nominal']],
    body: [
      ['Tagihan Diterbitkan', '', formatRupiah(ringkasan.tagihanDiterbitkan || 0)],
      ['Uang Masuk', '', formatRupiah(ringkasan.uangMasuk || 0)],
      ['Sisa Belum Bayar', '', formatRupiah(ringkasan.sisaBelumBayar || 0)],
      ['Denda Diterima', '', formatRupiah(ringkasan.dendaDiterima || 0)],
      ['Tingkat Penagihan', `${ringkasan.persenBayar || 0}%`, ''],
      ['Lunas / Belum / Terlambat', `${ringkasan.lunas || 0} / ${ringkasan.belum || 0} / ${ringkasan.terlambat || 0}`, ''],
      ['Kamar Terisi / Total', `${ringkasan.kamarTerisi || 0} / ${ringkasan.kamarTotal || 0}`, ''],
    ],
    theme: 'striped',
    headStyles: { fillColor: [16, 185, 129], textColor: 255, fontStyle: 'bold' },
    styles: { fontSize: 9, cellPadding: 2 }
  })

  // Rincian tagihan
  doc.text('Rincian Tagihan', 14, (doc.lastAutoTable?.finalY || 70) + 6)
  autoTable(doc, {
    startY: (doc.lastAutoTable?.finalY || 70) + 8,
    head: [['Kamar', 'Penghuni', 'Jumlah', 'Terbayar', 'Sisa', 'Denda', 'Jatuh Tempo', 'Status']],
    body: (tagihan || []).map(t => [
      t.sewa?.kamar?.nomor || '-',
      t.sewa?.penghuni?.nama || '-',
      formatRupiah(t.jumlah || 0),
      formatRupiah(t.terbayar || 0),
      formatRupiah(Number(t.jumlah || 0) - Number(t.terbayar || 0)),
      formatRupiah(t.denda || 0),
      formatTanggal(t.jatuh_tempo) || '-',
      t.status === 'lunas' ? 'Lunas' : Number(t.terbayar || 0) > 0 ? 'Dicicil' : t.status === 'belum' && (t.jatuh_tempo || '') < new Date().toISOString().split('T')[0] ? 'Terlambat' : 'Belum bayar',
    ]),
    theme: 'grid',
    headStyles: { fillColor: [16, 185, 129], textColor: 255, fontStyle: 'bold' },
    styles: { fontSize: 8, cellPadding: 2 }
  })

  // Penunggak
  const terlambat = (tagihan || []).filter(t => t.status === 'belum' && (t.jatuh_tempo || '') < new Date().toISOString().split('T')[0]).sort((a, b) => (a.jatuh_tempo || '').localeCompare(b.jatuh_tempo || ''))
  if (terlambat.length) {
    doc.text('Penghuni Menunggak', 14, (doc.lastAutoTable?.finalY || 120) + 6)
    autoTable(doc, {
      startY: (doc.lastAutoTable?.finalY || 120) + 8,
      head: [['Kamar', 'Penghuni', 'Jumlah', 'Terlewat', 'Terlambat (hari)']],
      body: terlambat.map(t => [
        t.sewa?.kamar?.nomor || '-',
        t.sewa?.penghuni?.nama || '-',
        formatRupiah(t.jumlah || 0),
        formatTanggal(t.jatuh_tempo) || '-',
        String(Math.floor((new Date().getTime() - new Date(t.jatuh_tempo || '').getTime()) / (1000 * 60 * 60 * 24)) || 0),
      ]),
      theme: 'grid',
      headStyles: { fillColor: [239, 68, 68], textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 8, cellPadding: 2 }
    })
  }

  if ((pembayaran || []).length) {
    doc.text('Riwayat Pembayaran', 14, (doc.lastAutoTable?.finalY || 120) + 6)
    autoTable(doc, {
      startY: (doc.lastAutoTable?.finalY || 120) + 8,
      head: [['No', 'Tanggal', 'Kamar', 'Penghuni', 'Metode', 'Jumlah']],
      body: (pembayaran || []).map((p, idx) => [
        String(idx + 1),
        formatTanggal(p.tanggal) || '-',
        p.tagihan?.sewa?.kamar?.nomor || '-',
        p.tagihan?.sewa?.penghuni?.nama || '-',
        p.metode ? (p.metode.charAt(0).toUpperCase() + p.metode.slice(1)) : '-',
        formatRupiah(p.jumlah || 0),
      ]),
      theme: 'grid',
      headStyles: { fillColor: [16, 185, 129], textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 8, cellPadding: 2 }
    })
  }

  doc.save(`laporan-kosku-${new Date(periode).getFullYear()}-${String(new Date(periode).getMonth() + 1).padStart(2, '0')}.pdf`)
}

export async function unduhLaporanExcel({ periode, tagihan, kamar, penghuni, profil, pembayaran, ringkasan }) {
  const XLSX = await import('xlsx')
  const wb = XLSX.utils.book_new()

  // Ringkasan
  const lunas = tagihan.filter(t => t.status === 'lunas')
  const belum = tagihan.filter(t => t.status === 'belum')
  const todayStr = new Date().toISOString().split('T')[0]
  const terlambat = belum.filter(t => (t.jatuh_tempo || '') < todayStr)
  const tagihanDiterbitkan = (ringkasan && ringkasan.tagihanDiterbitkan != null) ? ringkasan.tagihanDiterbitkan : tagihan.reduce((s, t) => s + Number(t.jumlah || 0), 0)
  const uangMasuk = (ringkasan && ringkasan.uangMasuk != null) ? ringkasan.uangMasuk : (pembayaran || []).reduce((s, p) => s + Number(p.jumlah || 0), 0)
  const sisaBelumBayar = (ringkasan && ringkasan.sisaBelumBayar != null) ? ringkasan.sisaBelumBayar : belum.reduce((s, t) => s + (Number(t.jumlah || 0) - Number(t.terbayar || 0)), 0)
  const dendaDiterima = (ringkasan && ringkasan.dendaDiterima != null) ? ringkasan.dendaDiterima : lunas.reduce((s, t) => s + Number(t.denda || 0), 0)
  const persenBayar = tagihanDiterbitkan ? Math.min(100, Math.round((uangMasuk / tagihanDiterbitkan) * 100)) : 0
  const ringkasanData = [
    ['Item', 'Jumlah', 'Nominal'],
    ['Tagihan Diterbitkan', tagihan.length, tagihanDiterbitkan],
    ['Uang Masuk', (pembayaran || []).length, uangMasuk],
    ['Sisa Belum Bayar', belum.length, sisaBelumBayar],
    ['Denda Diterima', lunas.length, dendaDiterima],
    ['Tingkat Penagihan', persenBayar + '%', ''],
    ['Lunas / Belum / Terlambat', `${lunas.length} / ${belum.length} / ${terlambat.length}`, ''],
    ['Kamar Terisi / Total', `${kamar.filter(k => k.status === 'terisi').length} / ${kamar.length}`, ''],
  ]
  const wsRingkasan = XLSX.utils.aoa_to_sheet(ringkasanData)
  wsRingkasan['!cols'] = [{ wch: 20 }, { wch: 15 }, { wch: 20 }]
  XLSX.utils.book_append_sheet(wb, wsRingkasan, 'Ringkasan')

  // Tagihan
  const tagihanData = [[
    'Kamar', 'Penghuni', 'Jumlah', 'Terbayar', 'Sisa', 'Denda', 'Jatuh Tempo', 'Status', 'Tanggal Bayar', 'Metode'
  ], ...tagihan.map(t => [
    t.sewa?.kamar?.nomor || '-',
    t.sewa?.penghuni?.nama || '-',
    t.jumlah || 0,
    t.terbayar || 0,
    Number(t.jumlah || 0) - Number(t.terbayar || 0),
    t.denda || 0,
    t.jatuh_tempo || '-',
    t.status === 'lunas' ? 'Lunas' : Number(t.terbayar || 0) > 0 ? 'Dicicil' : t.status === 'belum' && (t.jatuh_tempo || '') < new Date().toISOString().split('T')[0] ? 'Terlambat' : 'Belum bayar',
    t.tanggal_bayar || '-',
    t.metode ? t.metode.charAt(0).toUpperCase() + t.metode.slice(1) : '-',
  ])]
  const wsTagihan = XLSX.utils.aoa_to_sheet(tagihanData)
  wsTagihan['!cols'] = [{ wch: 10 }, { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 12 }, { wch: 15 }, { wch: 12 }]
  for (let i = 2; i < tagihanData.length; i++) {
    for (const col of ['C', 'D', 'E', 'F']) {
      const cell = wsTagihan[`${col}${i}`]
      if (cell) cell.z = '#,##0'
    }
  }
  XLSX.utils.book_append_sheet(wb, wsTagihan, 'Tagihan')

  // Pembayaran
  const pembayaranData = [[
    'No', 'Tanggal', 'Kamar', 'Penghuni', 'Metode', 'Jumlah'
  ], ...(pembayaran || []).map((p, idx) => [
    idx + 1,
    p.tanggal || '-',
    p.tagihan?.sewa?.kamar?.nomor || '-',
    p.tagihan?.sewa?.penghuni?.nama || '-',
    p.metode ? p.metode.charAt(0).toUpperCase() + p.metode.slice(1) : '-',
    p.jumlah || 0,
  ])]
  const wsPembayaran = XLSX.utils.aoa_to_sheet(pembayaranData)
  wsPembayaran['!cols'] = [{ wch: 6 }, { wch: 14 }, { wch: 10 }, { wch: 20 }, { wch: 12 }, { wch: 15 }]
  for (let i = 2; i < pembayaranData.length; i++) {
    const cell = wsPembayaran[`F${i}`]
    if (cell) cell.z = '#,##0'
  }
  XLSX.utils.book_append_sheet(wb, wsPembayaran, 'Riwayat Pembayaran')

  // Kamar
  const kamarData = [[
    'Nomor', 'Tipe', 'Harga Bulanan', 'Fasilitas', 'Status'
  ], ...kamar.map(k => [
    k.nomor || '-',
    k.tipe || '-',
    k.harga_bulanan || 0,
    k.fasilitas || '-',
    k.status === 'kosong' ? 'Kosong' : k.status === 'terisi' ? 'Terisi' : 'Perbaikan'
  ])]
  const wsKamar = XLSX.utils.aoa_to_sheet(kamarData)
  wsKamar['!cols'] = [{ wch: 10 }, { wch: 15 }, { wch: 18 }, { wch: 25 }, { wch: 12 }]
  for (let i = 2; i < kamarData.length; i++) {
    const cell = wsKamar[`C${i}`]
    if (cell) cell.z = '#,##0'
  }
  XLSX.utils.book_append_sheet(wb, wsKamar, 'Kamar')

  // Penghuni
  const pengData = [[
    'Nama', 'Nomor HP', 'Pekerjaan', 'Kontak Darurat', 'Catatan', 'Status'
  ], ...penghuni.map(p => [
    p.nama || '-',
    p.no_hp || '-',
    p.pekerjaan || '-',
    p.kontak_darurat || '-',
    p.catatan || '-',
    p.aktif ? 'Aktif' : 'Tidak aktif'
  ])]
  const wsPeng = XLSX.utils.aoa_to_sheet(pengData)
  wsPeng['!cols'] = [{ wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 20 }, { wch: 20 }, { wch: 15 }]
  XLSX.utils.book_append_sheet(wb, wsPeng, 'Penghuni')

  XLSX.writeFile(wb, `laporan-kosku-${new Date(periode).getFullYear()}-${String(new Date(periode).getMonth() + 1).padStart(2, '0')}.xlsx`)
}

function tanggalLokal(input) {
  if (!input) return '-'
  const teks = String(input)
  if (/^\d{4}-\d{2}-\d{2}$/.test(teks)) return teks
  const d = new Date(teks)
  if (isNaN(d.getTime())) return teks
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export async function unduhDaftarKos(daftar) {
  const XLSX = await import('xlsx')
  const baris = [[
    'Nama Kos', 'Nama Pemilik', 'Email', 'Alamat', 'Jumlah Kamar', 'Kamar Terisi', 'Sewa Aktif', 'Status', 'Tanggal Daftar'
  ], ...(daftar || []).map(k => [
    k.nama_kos || '-',
    k.nama_pemilik || '-',
    k.email || '-',
    k.alamat || '-',
    Number(k.jumlah_kamar) || 0,
    Number(k.kamar_terisi) || 0,
    Number(k.sewa_aktif) || 0,
    k.aktif ? 'Aktif' : 'Nonaktif',
    tanggalLokal(k.terdaftar),
  ])]

  const ws = XLSX.utils.aoa_to_sheet(baris)
  ws['!cols'] = [
    { wch: 24 }, { wch: 22 }, { wch: 30 }, { wch: 36 },
    { wch: 14 }, { wch: 14 }, { wch: 12 }, { wch: 12 }, { wch: 16 },
  ]
  for (let i = 1; i < baris.length; i++) {
    for (const col of ['E', 'F', 'G']) {
      const cell = ws[`${col}${i + 1}`]
      if (cell && cell.t === 'n') cell.z = '#,##0'
    }
  }

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Daftar Kos')

  const now = new Date()
  const tanggal = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  XLSX.writeFile(wb, `daftar-kos-${tanggal}.xlsx`)
}
