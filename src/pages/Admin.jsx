import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../hooks/useAuth.jsx'
import { useProfil } from '../hooks/useProfil.jsx'
import { useAdmin } from '../hooks/useAdmin.js'
import { formatTanggal } from '../lib/format.js'
import EmptyState from '../components/EmptyState.jsx'

export default function Admin() {
  useEffect(() => { document.title = 'Super Admin - KosKu' }, [])
  const { signOut } = useAuth()
  const { profil, loading: profilLoading } = useProfil()
  const { statistik, daftarKos, loading, error, reload } = useAdmin()

  const [cari, setCari] = useState('')
  const [filterStatus, setFilterStatus] = useState('semua')
  const [urut, setUrut] = useState('terbaru')

  const okupansiTotal = statistik.total_kamar ? Math.round((statistik.kamar_terisi / statistik.total_kamar) * 100) : 0

  const hasil = useMemo(() => {
    const kw = cari.trim().toLowerCase()
    let rows = daftarKos.filter(k => {
      if (filterStatus === 'aktif' && !k.aktif) return false
      if (filterStatus === 'nonaktif' && k.aktif) return false
      if (!kw) return true
      return (k.nama_kos || '').toLowerCase().includes(kw)
        || (k.nama_pemilik || '').toLowerCase().includes(kw)
        || (k.email || '').toLowerCase().includes(kw)
    })
    rows = [...rows].sort((a, b) => {
      if (urut === 'nama') return (a.nama_kos || '').localeCompare(b.nama_kos || '')
      if (urut === 'kamar') return (b.jumlah_kamar || 0) - (a.jumlah_kamar || 0)
      return (b.terdaftar || '').localeCompare(a.terdaftar || '')
    })
    return rows
  }, [daftarKos, cari, filterStatus, urut])

  const kosongSemua = !loading && daftarKos.length === 0
  const kosongFilter = !loading && daftarKos.length > 0 && hasil.length === 0

  const Badge = ({ aktif }) => (
    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border whitespace-nowrap ${aktif ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-red-100 text-red-700 border-red-200'}`}>
      {aktif ? 'Aktif' : 'Nonaktif'}
    </span>
  )

  const okupansiPct = (k) => k.jumlah_kamar ? Math.round((k.kamar_terisi / k.jumlah_kamar) * 100) : 0

  return (
    <div className="min-h-screen bg-emerald-50 flex flex-col">
      <header className="bg-emerald-800 text-white px-4 sm:px-6 py-4 flex items-center justify-between shadow-lg">
        <h1 className="text-lg sm:text-xl font-extrabold tracking-tight">KosKu Super Admin</h1>
        <button onClick={() => signOut()} className="px-4 py-2 rounded-xl bg-white text-emerald-800 font-bold text-sm hover:bg-emerald-50 transition">Keluar</button>
      </header>

      <main className="flex-1 px-3 sm:px-6 py-6 max-w-6xl w-full mx-auto">
        <h2 className="text-xl sm:text-2xl font-extrabold text-emerald-800 mb-1">
          {profilLoading ? 'Memuat...' : `Halo, ${profil?.nama_pemilik || 'Super Admin'}`}
        </h2>
        <p className="text-emerald-600 text-sm mb-5">Dashboard Super Admin</p>

        {error && <div className="rounded-xl bg-red-50 border border-red-100 text-red-700 px-4 py-3 mb-4 text-sm">{error}</div>}

        {/* Statistik */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-2xl p-4 bg-white shadow-sm border border-emerald-100 animate-pulse">
                <div className="h-3 w-20 bg-emerald-100 rounded mb-2" />
                <div className="h-7 w-16 bg-emerald-100 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            <div className="rounded-2xl p-4 bg-emerald-600 text-white shadow-lg">
              <div className="text-xs font-semibold opacity-80">Total Pemilik</div>
              <div className="text-2xl font-extrabold">{statistik.jumlah_pemilik}</div>
              <div className="text-xs font-bold opacity-90">{statistik.pemilik_aktif} aktif</div>
            </div>
            <div className="rounded-2xl p-4 bg-white shadow-sm border border-emerald-100">
              <div className="text-xs font-semibold text-emerald-400">Total Kamar</div>
              <div className="text-2xl font-extrabold text-emerald-800">{statistik.total_kamar}</div>
            </div>
            <div className="rounded-2xl p-4 bg-white shadow-sm border border-emerald-100">
              <div className="text-xs font-semibold text-emerald-400">Kamar Terisi</div>
              <div className="text-2xl font-extrabold text-emerald-800">{statistik.kamar_terisi} <span className="text-base font-bold text-emerald-500">({okupansiTotal}%)</span></div>
            </div>
            <div className="rounded-2xl p-4 bg-white shadow-sm border border-emerald-100">
              <div className="text-xs font-semibold text-emerald-400">Sewa Aktif</div>
              <div className="text-2xl font-extrabold text-emerald-800">{statistik.sewa_aktif}</div>
            </div>
          </div>
        )}

        {/* Kontrol */}
        <div className="flex flex-col sm:flex-row gap-2 mb-4">
          <input value={cari} onChange={e => setCari(e.target.value)} placeholder="Cari nama kos, pemilik, atau email..." className="flex-1 min-w-0 px-4 py-2.5 rounded-xl bg-white border border-emerald-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />
          <div className="flex gap-2">
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-3 py-2.5 rounded-xl bg-white border border-emerald-100 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-400">
              <option value="semua">Semua</option>
              <option value="aktif">Aktif</option>
              <option value="nonaktif">Nonaktif</option>
            </select>
            <select value={urut} onChange={e => setUrut(e.target.value)} className="px-3 py-2.5 rounded-xl bg-white border border-emerald-100 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-400">
              <option value="terbaru">Terbaru</option>
              <option value="nama">Nama kos</option>
              <option value="kamar">Kamar terbanyak</option>
            </select>
          </div>
        </div>

        {/* Daftar kos */}
        {loading && (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="rounded-2xl bg-white border border-emerald-100 p-4 animate-pulse">
                <div className="h-4 w-40 bg-emerald-100 rounded mb-2" />
                <div className="h-3 w-64 bg-emerald-100 rounded" />
              </div>
            ))}
          </div>
        )}

        {!loading && kosongSemua && <EmptyState title="Belum ada pemilik kos terdaftar" desc="Pemilik akan muncul setelah mendaftar di KosKu." />}
        {!loading && kosongFilter && <EmptyState title="Tidak ada hasil untuk pencarian ini" desc="Coba kata kunci atau filter lain." />}

        {!loading && hasil.length > 0 && (
          <>
            {/* Desktop: tabel */}
            <div className="hidden md:block overflow-x-auto rounded-3xl shadow-xl border border-emerald-100 bg-white/80 backdrop-blur mb-4">
              <table className="w-full text-sm text-left">
                <thead className="bg-emerald-600 text-white">
                  <tr>
                    <th className="px-4 py-3 font-bold">Nama Kos</th>
                    <th className="px-4 py-3 font-bold">Pemilik</th>
                    <th className="px-4 py-3 font-bold">Email</th>
                    <th className="px-4 py-3 font-bold">Alamat</th>
                    <th className="px-4 py-3 font-bold">Kamar</th>
                    <th className="px-4 py-3 font-bold">Terisi</th>
                    <th className="px-4 py-3 font-bold">Sewa Aktif</th>
                    <th className="px-4 py-3 font-bold">Terdaftar</th>
                    <th className="px-4 py-3 font-bold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {hasil.map(k => (
                    <tr key={k.user_id} className="border-b border-emerald-50 hover:bg-emerald-50/40">
                      <td className="px-4 py-3 font-bold text-emerald-800">{k.nama_kos || '-'}</td>
                      <td className="px-4 py-3 text-emerald-700">{k.nama_pemilik || '-'}</td>
                      <td className="px-4 py-3 text-emerald-600 break-all">{k.email || '-'}</td>
                      <td className="px-4 py-3 text-emerald-600">{k.alamat || '-'}</td>
                      <td className="px-4 py-3 font-bold text-emerald-800">{k.jumlah_kamar || 0}</td>
                      <td className="px-4 py-3 text-emerald-700">{k.kamar_terisi || 0} ({okupansiPct(k)}%)</td>
                      <td className="px-4 py-3 text-emerald-700">{k.sewa_aktif || 0}</td>
                      <td className="px-4 py-3 text-emerald-600 whitespace-nowrap">{formatTanggal(k.terdaftar)}</td>
                      <td className="px-4 py-3"><Badge aktif={k.aktif} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile: kartu */}
            <div className="md:hidden space-y-3 mb-4">
              {hasil.map(k => (
                <div key={k.user_id} className="rounded-2xl bg-white border border-emerald-100 shadow-sm p-4">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="font-extrabold text-emerald-800 break-words min-w-0">{k.nama_kos || '-'}</div>
                    <Badge aktif={k.aktif} />
                  </div>
                  <div className="text-sm text-emerald-600 break-words">{k.nama_pemilik || '-'}</div>
                  <div className="text-xs text-emerald-500 break-all">{k.email || '-'}</div>
                  {k.alamat && <div className="text-xs text-emerald-400 break-words mt-0.5">{k.alamat}</div>}
                  <div className="grid grid-cols-3 gap-2 mt-3 text-center">
                    <div className="bg-emerald-50 rounded-xl py-2 px-1">
                      <div className="text-[10px] font-bold text-emerald-400 uppercase">Kamar</div>
                      <div className="text-sm font-extrabold text-emerald-800">{k.jumlah_kamar || 0}</div>
                    </div>
                    <div className="bg-emerald-50 rounded-xl py-2 px-1">
                      <div className="text-[10px] font-bold text-emerald-400 uppercase">Terisi</div>
                      <div className="text-sm font-extrabold text-emerald-800">{k.kamar_terisi || 0} ({okupansiPct(k)}%)</div>
                    </div>
                    <div className="bg-emerald-50 rounded-xl py-2 px-1">
                      <div className="text-[10px] font-bold text-emerald-400 uppercase">Sewa</div>
                      <div className="text-sm font-extrabold text-emerald-800">{k.sewa_aktif || 0}</div>
                    </div>
                  </div>
                  <div className="text-xs text-emerald-500 mt-2">Terdaftar: {formatTanggal(k.terdaftar)}</div>
                </div>
              ))}
            </div>
          </>
        )}

        <p className="text-xs text-emerald-500 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2">
          Admin hanya melihat data ringkasan. Data penghuni tidak ditampilkan demi privasi.
        </p>
      </main>
    </div>
  )
}
