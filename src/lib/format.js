function keTanggal(input) {
  if (input instanceof Date) return input
  // Kolom date Supabase berbentuk "YYYY-MM-DD": baca sebagai tanggal lokal
  if (typeof input === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(input)) {
    const [y, m, d] = input.split('-').map(Number)
    return new Date(y, m - 1, d)
  }
  return new Date(input)
}

export function parseRupiah(str) {
  const cleaned = String(str || '').replace(/[^0-9]/g, '')
  return Number(cleaned) || 0
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

export function terbilang(angka) {
  const satuan = ['', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan', 'sembilan']
  const belas = ['sepuluh', 'sebelas', 'dua belas', 'tiga belas', 'empat belas', 'lima belas', 'enam belas', 'tujuh belas', 'delapan belas', 'sembilan belas']
  const puluhan = ['', '', 'dua puluh', 'tiga puluh', 'empat puluh', 'lima puluh', 'enam puluh', 'tujuh puluh', 'delapan puluh', 'sembilan puluh']
  const ribuan = ['', 'ribu', 'juta', 'miliar', 'triliun']

  function konversi(n) {
    if (n === 0) return ''
    if (n < 10) return satuan[n]
    if (n < 20) return belas[n - 10]
    if (n < 100) {
      const p = Math.floor(n / 10)
      const s = n % 10
      return puluhan[p] + (s ? ' ' + satuan[s] : '')
    }
    const r = Math.floor(n / 100)
    const s = n % 100
    return (r === 1 ? 'seratus' : satuan[r] + ' ratus') + (s ? ' ' + konversi(s) : '')
  }

  let num = Number(angka) || 0
  if (num === 0) return 'nol rupiah'
  const str = String(Math.floor(num))
  let result = ''
  const groups = []
  for (let i = str.length; i > 0; i -= 3) groups.push(str.substring(Math.max(0, i - 3), i))
  groups.reverse()
  for (let i = 0; i < groups.length; i++) {
    const val = parseInt(groups[i], 10)
    if (val === 0) continue
    const idx = groups.length - 1 - i
    const k = ribuan[idx] || ''
    result += (result ? ' ' : '') + konversi(val) + (k ? ' ' + k : '')
  }
  result = result.trim()
  // Capitalize first letter
  result = result.charAt(0).toUpperCase() + result.slice(1)
  return result + ' rupiah'
}

export function formatPeriode(dateInput) {
  const date = keTanggal(dateInput)
  if (isNaN(date.getTime())) return '-'
  return date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
}