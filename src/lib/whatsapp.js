export function normalisasiNomor(nomor) {
  const cleaned = String(nomor).replace(/[^0-9]/g, '')
  if (cleaned.startsWith('08')) {
    return '62' + cleaned.slice(1)
  }
  if (!cleaned.startsWith('62')) {
    return '62' + cleaned
  }
  return cleaned
}

export function buatLinkWA(nomor, pesan) {
  const normalized = normalisasiNomor(nomor)
  const encoded = encodeURIComponent(pesan || '')
  return `https://wa.me/${normalized}?text=${encoded}`
}
