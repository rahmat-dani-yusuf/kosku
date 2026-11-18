export const OPSI_PER_HALAMAN = [10, 25, 50]
export const DEFAULT_PER_HALAMAN = 10

export function hitungRange(halaman, perHalaman) {
  const h = Math.max(1, Number(halaman) || 1)
  const n = Math.max(1, Number(perHalaman) || DEFAULT_PER_HALAMAN)
  const from = (h - 1) * n
  return { from, to: from + n - 1 }
}

export function hitungTotalHalaman(total, perHalaman) {
  const n = Math.max(1, Number(perHalaman) || DEFAULT_PER_HALAMAN)
  return Math.max(1, Math.ceil((Number(total) || 0) / n))
}
