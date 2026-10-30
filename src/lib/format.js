export function formatRupiah(angka) {
  const num = Number(angka) || 0
  return 'Rp ' + num.toLocaleString('id-ID')
}

export function formatTanggal(dateInput) {
  const date = new Date(dateInput)
  if (isNaN(date.getTime())) return '-'
  const options = { day: 'numeric', month: 'long', year: 'numeric' }
  return date.toLocaleDateString('id-ID', options)
}

export function formatPeriode(dateInput) {
  const date = new Date(dateInput)
  if (isNaN(date.getTime())) return '-'
  const options = { month: 'long', year: 'numeric' }
  return date.toLocaleDateString('id-ID', options)
}
