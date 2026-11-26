const KUNCI = 'kosku-tema'

export function bacaTema() {
  try {
    return localStorage.getItem(KUNCI) || 'otomatis'
  } catch {
    return 'otomatis'
  }
}

export function simpanTema(pilihan) {
  try {
    localStorage.setItem(KUNCI, pilihan)
  } catch {
    // abaikan
  }
}

export function sistemGelap() {
  try {
    return !!(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)
  } catch {
    return false
  }
}

export function temaEfektif(pilihan) {
  const p = pilihan || bacaTema()
  if (p === 'gelap') return 'gelap'
  if (p === 'terang') return 'terang'
  return sistemGelap() ? 'gelap' : 'terang'
}

let listenerTerpasang = false

function tanganiPerubahanSistem() {
  if (bacaTema() === 'otomatis') {
    terapkanTema('otomatis')
  }
}

export function terapkanTema(pilihan) {
  const p = pilihan || bacaTema()
  const efektif = temaEfektif(p)
  const html = document.documentElement
  if (efektif === 'gelap') html.classList.add('dark')
  else html.classList.remove('dark')

  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) {
    meta.setAttribute('content', efektif === 'gelap' ? '#1f2937' : '#065f46')
  }

  if (!listenerTerpasang && typeof window !== 'undefined' && window.matchMedia) {
    try {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', tanganiPerubahanSistem)
      listenerTerpasang = true
    } catch {
      // abaikan
    }
  }
}
