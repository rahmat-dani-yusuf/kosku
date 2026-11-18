import { OPSI_PER_HALAMAN, hitungTotalHalaman } from '../lib/paginasi.js'

function daftarNomorHalaman(halaman, totalHalaman) {
  if (totalHalaman <= 5) return Array.from({ length: totalHalaman }, (_, i) => i + 1)
  if (halaman <= 3) return [1, 2, 3, 4, '...', totalHalaman]
  if (halaman >= totalHalaman - 2) return [1, '...', totalHalaman - 3, totalHalaman - 2, totalHalaman - 1, totalHalaman]
  return [1, '...', halaman - 1, halaman, halaman + 1, '...', totalHalaman]
}

const tombolDasar = 'px-3 py-1.5 rounded-xl text-sm font-bold transition disabled:opacity-50 disabled:cursor-not-allowed'
const tombolPolos = `${tombolDasar} bg-white text-emerald-700 border border-emerald-100 hover:bg-emerald-50`
const tombolAktif = `${tombolDasar} bg-emerald-600 text-white shadow-md shadow-emerald-200`
const gayaSelect = 'px-2.5 py-1.5 rounded-xl bg-emerald-50/60 border border-emerald-100 text-sm font-semibold text-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed'

export default function Pagination({ halaman, perHalaman, total, onUbahHalaman, onUbahPerHalaman, loading }) {
  if (!total || total <= 0) return null

  const totalHalaman = hitungTotalHalaman(total, perHalaman)
  const aman = Math.min(Math.max(1, Number(halaman) || 1), totalHalaman)
  const n = Math.max(1, Number(perHalaman) || 10)
  const dari = (aman - 1) * n + 1
  const sampai = Math.min(aman * n, total)
  const nomor = daftarNomorHalaman(aman, totalHalaman)
  const diAwal = aman <= 1
  const diAkhir = aman >= totalHalaman

  const pindah = (p) => { if (!loading) onUbahHalaman?.(p) }

  return (
    <nav className="mt-6" aria-label="Navigasi halaman">
      {/* Desktop */}
      <div className="hidden sm:flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-emerald-600">
          Menampilkan {dari}-{sampai} dari {total} data
        </p>
        <div className="flex items-center gap-1.5 flex-wrap">
          <button onClick={() => onUbahHalaman?.(aman - 1)} disabled={loading || diAwal} className={tombolPolos}>Sebelumnya</button>
          {nomor.map((no, i) => no === '...' ? (
            <span key={`titik-${i}`} className="px-1.5 text-emerald-400 font-bold select-none">...</span>
          ) : (
            <button key={no} onClick={() => onUbahHalaman?.(no)} disabled={loading} className={no === aman ? tombolAktif : tombolPolos} aria-current={no === aman ? 'page' : undefined}>{no}</button>
          ))}
          <button onClick={() => onUbahHalaman?.(aman + 1)} disabled={loading || diAkhir} className={tombolPolos}>Berikutnya</button>
        </div>
        <label className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
          Per halaman
          <select value={n} onChange={e => onUbahPerHalaman?.(Number(e.target.value))} disabled={loading} className={gayaSelect}>
            {OPSI_PER_HALAMAN.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </label>
      </div>

      {/* Mobile */}
      <div className="sm:hidden flex flex-col items-center gap-2">
        <div className="flex items-center justify-center gap-2 flex-wrap w-full">
          <button onClick={() => pindah(aman - 1)} disabled={loading || diAwal} className={`${tombolPolos} text-xs px-2.5 py-1.5`}>Sebelumnya</button>
          <span className="text-xs font-bold text-emerald-700 whitespace-nowrap">Hal {aman} dari {totalHalaman}</span>
          <button onClick={() => pindah(aman + 1)} disabled={loading || diAkhir} className={`${tombolPolos} text-xs px-2.5 py-1.5`}>Berikutnya</button>
        </div>
        <label className="flex items-center gap-2 text-xs font-semibold text-emerald-700">
          Per halaman
          <select value={n} onChange={e => onUbahPerHalaman?.(Number(e.target.value))} disabled={loading} className={`${gayaSelect} text-xs py-1`}>
            {OPSI_PER_HALAMAN.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </label>
      </div>
    </nav>
  )
}
