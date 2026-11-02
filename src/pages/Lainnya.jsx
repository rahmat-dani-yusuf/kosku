import { Link } from 'react-router-dom'

export default function Lainnya() {
  const links = [
    { to: '/penghuni', label: 'Penghuni', desc: 'Kelola data penghuni kos' },
    { to: '/sewa', label: 'Sewa', desc: 'Kelola kontrak sewa' },
    { to: '/laporan', label: 'Laporan', desc: 'Lihat ringkasan keuangan' },
    { to: '/profil', label: 'Profil', desc: 'Data pemilik dan pengaturan' },
  ]
  return (
    <div className="bg-white/80 backdrop-blur rounded-3xl shadow-xl border border-emerald-100 p-8 md:p-10">
      <h1 className="text-2xl font-extrabold text-emerald-800 mb-6">Lainnya</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {links.map((l) => (
          <Link key={l.to} to={l.to} className="p-5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 transition">
            <div className="font-extrabold text-emerald-800 text-lg">{l.label}</div>
            <div className="text-sm text-emerald-500">{l.desc}</div>
          </Link>
        ))}
      </div>
    </div>
  )
}
