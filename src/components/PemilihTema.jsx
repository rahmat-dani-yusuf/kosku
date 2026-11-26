import { useState, useEffect } from 'react'
import { bacaTema, simpanTema, terapkanTema, temaEfektif } from '../lib/tema.js'

export default function PemilihTema({ compact = false }) {
  const [pilihan, setPilihan] = useState(() => bacaTema())
  const [efektif, setEfektif] = useState(() => temaEfektif(bacaTema()))

  useEffect(() => {
    const mq = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null
    if (!mq) return
    const handler = () => {
      const p = bacaTema()
      setPilihan(p)
      setEfektif(temaEfektif(p))
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const pilih = (p) => {
    simpanTema(p)
    terapkanTema(p)
    setPilihan(p)
    setEfektif(temaEfektif(p))
  }

  if (compact) {
    const gelap = efektif === 'gelap'
    return (
      <button
        type="button"
        onClick={() => pilih(gelap ? 'terang' : 'gelap')}
        aria-label={gelap ? 'Ganti ke terang' : 'Ganti ke gelap'}
        className="w-9 h-9 rounded-xl flex items-center justify-center bg-emerald-50 dark:bg-gray-800/50 text-emerald-700 dark:text-emerald-300 border border-emerald-100 dark:border-gray-700 hover:bg-emerald-100 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 dark:hover:bg-gray-700 transition"
      >
        {gelap ? '☀' : '☾'}
      </button>
    )
  }

  const ops = [
    { val: 'terang', label: 'Terang' },
    { val: 'gelap', label: 'Gelap' },
    { val: 'otomatis', label: 'Otomatis' },
  ]

  return (
    <div className="inline-flex rounded-xl border border-emerald-100 dark:border-gray-700 overflow-hidden">
      {ops.map(o => (
        <button
          key={o.val}
          type="button"
          onClick={() => pilih(o.val)}
          className={`px-3 py-2 text-sm font-bold transition ${
            pilihan === o.val
              ? 'bg-emerald-600 text-white'
              : 'bg-white dark:bg-gray-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
