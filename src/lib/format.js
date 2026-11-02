function keTanggal(input) {
  if (input instanceof Date) return input
  // Kolom date Supabase berbentuk "YYYY-MM-DD": baca sebagai tanggal lokal
  if (typeof input === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(input)) {
    const [y, m, d] = input.split('-').map(Number)
    return new Date(y, m - 1, d)
  }
  return new Date(input)
}

export function formatRupiah(angka) {
  const num = Number(angka) || 0
  return 'Rp ' + num.toLocaleString('id-ID', { maximumFractionDigits: 0 })
}

export function formatTanggal(dateInput) {
  const date = keTanggal(dateInput)
  if (isNaN(date.getTime())) return '-'
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function formatPeriode(dateInput) {
  const date = keTanggal(dateInput)
  if (isNaN(date.getTime())) return '-'
  return date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
}