function keTanggalLocal(str) {
  if (typeof str === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(str)) {
    const [y, m, d] = str.split('-').map(Number)
    return new Date(y, m - 1, d)
  }
  return new Date(str)
}

export function hitungDenda(tagihan, pengaturan, hariIniStr) {
  const dendaPerHari = Number(pengaturan?.denda_per_hari || 0)
  const tenggang = Number(pengaturan?.masa_tenggang_hari || 0)
  if (tagihan?.status !== 'belum') return { denda: 0, hariTelat: 0 }
  const jatuh = keTanggalLocal(tagihan.jatuh_tempo || '')
  const batas = new Date(jatuh.getTime() + tenggang * 86400000)
  const hariIni = hariIniStr ? keTanggalLocal(hariIniStr) : new Date()
  // Set to midnight local for comparison
  const hoy = new Date(hariIni.getFullYear(), hariIni.getMonth(), hariIni.getDate())
  const b = new Date(batas.getFullYear(), batas.getMonth(), batas.getDate())
  if (hoy <= b) return { denda: 0, hariTelat: 0 }
  const selisihMs = hoy - b
  const hariTelat = Math.floor(selisihMs / 86400000)
  const denda = dendaPerHari * hariTelat
  return { denda: Math.max(0, denda), hariTelat: Math.max(0, hariTelat) }
}
