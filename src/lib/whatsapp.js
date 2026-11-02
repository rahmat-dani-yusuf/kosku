export function normalisasiNomor(nomor) {
  const cleaned = String(nomor ?? '').replace(/\D/g, '')
  if (!cleaned) return ''
  if (cleaned.startsWith('62')) return cleaned
  if (cleaned.startsWith('0')) return '62' + cleaned.slice(1)
  return '62' + cleaned
}

export function buatLinkWA(nomor, pesan) {
  const normalized = normalisasiNomor(nomor)
  if (!normalized) return ''
  return `https://wa.me/${normalized}?text=${encodeURIComponent(pesan || '')}`
}