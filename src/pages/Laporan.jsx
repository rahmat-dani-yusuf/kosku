import { useState, useMemo, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth.jsx'
import { useProfil } from '../hooks/useProfil.jsx'
import { useLaporan } from '../hooks/useLaporan.jsx'
import { formatRupiah, formatTanggal, formatPeriode } from '../lib/format.js'
import { unduhLaporanPdf, unduhLaporanExcel } from '../lib/ekspor.js'
import { useToast } from '../components/Toast.jsx'
import EmptyState from '../components/EmptyState.jsx'
import Pagination from '../components/Pagination.jsx'
import { DEFAULT_PER_HALAMAN, hitungRange, hitungTotalHalaman } from '../lib/paginasi.js'

export default function Laporan() {
  const { user } = useAuth()
  const profil = useProfil()
  const { tagihan, kamar, penghuni, pembayaran, loading, error, periode, setPeriode, reload, ringkasan } = useLaporan()
  const { show } = useToast()
  const [fileNameBase] = useState('laporan-kosku')
  const [halamanBayar, setHalamanBayar] = useState(1)
  const [perHalamanBayar, setPerHalamanBayar] = useState(DEFAULT_PER_HALAMAN)
  const [halamanTagihan, setHalamanTagihan] = useState(1)
  const [perHalamanTagihan, setPerHalamanTagihan] = useState(DEFAULT_PER_HALAMAN)
  const [halamanTerlambat, setHalamanTerlambat] = useState(1)
  const [perHalamanTerlambat, setPerHalamanTerlambat] = useState(DEFAULT_PER_HALAMAN)

  useEffect(() => {
    setHalamanBayar(1)
    setHalamanTagihan(1)
    setHalamanTerlambat(1)
  }, [periode])
  useEffect(() => { setHalamanTagihan(1) }, [perHalamanTagihan])
  useEffect(() => { setHalamanTerlambat(1) }, [perHalamanTerlambat])

  const yearOptions = useMemo(() => { const y = new Date().getFullYear(); return [y - 1, y, y + 1] }, [])
  const monthOptions = [
    { val: 0, label: 'Jan' }, { val: 1, label: 'Feb' }, { val: 2, label: 'Mar' },
    { val: 3, label: 'Apr' }, { val: 4, label: 'Mei' }, { val: 5, label: 'Jun' },
    { val: 6, label: 'Jul' }, { val: 7, label: 'Agu' }, { val: 8, label: 'Sep' },
    { val: 9, label: 'Okt' }, { val: 10, label: 'Nov' }, { val: 11, label: 'Des' },
  ]

  const canDownload = tagihan.length > 0 || kamar.length > 0 || penghuni.length > 0

  const handlePdf = async () => {
    try {
      await unduhLaporanPdf({ periode, tagihan, kamar, profil, ringkasan, pembayaran })
      show('PDF berhasil diunduh', 'success')
    } catch (e) {
      show(e.message || 'Gagal membuat PDF', 'error')
    }
  }

  const handleXlsx = async () => {
    try {
      await unduhLaporanExcel({ periode, tagihan, kamar, penghuni, profil, pembayaran, ringkasan })
      show('Excel berhasil diunduh', 'success')
    } catch (e) {
      show(e.message || 'Gagal membuat Excel', 'error')
    }
  }

  const terlambat = tagihan.filter(t => t.status === 'belum' && (t.jatuh_tempo || '') < new Date().toISOString().split('T')[0]).sort((a, b) => (a.jatuh_tempo || '').localeCompare(b.jatuh_tempo || ''))

  const { from: fromTagihan, to: toTagihan } = hitungRange(halamanTagihan, perHalamanTagihan)
  const tagihanHalaman = tagihan.slice(fromTagihan, toTagihan + 1)
  const totalHalamanTagihan = hitungTotalHalaman(tagihan.length, perHalamanTagihan)

  const { from: fromTerlambat, to: toTerlambat } = hitungRange(halamanTerlambat, perHalamanTerlambat)
  const terlambatHalaman = terlambat.slice(fromTerlambat, toTerlambat + 1)
  const totalHalamanTerlambat = hitungTotalHalaman(terlambat.length, perHalamanTerlambat)
  const totalHalamanBayar = hitungTotalHalaman(pembayaran.length, perHalamanBayar)
  const pembayaranHalaman = pembayaran.slice((halamanBayar - 1) * perHalamanBayar, halamanBayar * perHalamanBayar)

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-extrabold text-emerald-800 dark:text-emerald-300">Laporan</h1>
        <div className="flex gap-2">
          <button onClick={handlePdf} disabled={!canDownload} className="px-3 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold disabled:opacity-50 hover:bg-emerald-700 transition">Unduh PDF</button>
          <button onClick={handleXlsx} disabled={!canDownload} className="px-3 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold disabled:opacity-50 hover:bg-blue-700 transition">Unduh Excel</button>
        </div>
      </div>

      <div className="flex gap-3 mb-4 items-end">
        <div>
          <label className="block text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider mb-1">Bulan</label>
          <select value={periode.getMonth()} onChange={e => setPeriode(new Date(periode.getFullYear(), Number(e.target.value), 1))} className="px-3 py-2 rounded-xl bg-white dark:bg-gray-800 border border-emerald-100 dark:border-gray-700 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-400">
            {monthOptions.map(m => <option key={m.val} value={m.val}>{m.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider mb-1">Tahun</label>
          <select value={periode.getFullYear()} onChange={e => setPeriode(new Date(Number(e.target.value), periode.getMonth(), 1))} className="px-3 py-2 rounded-xl bg-white dark:bg-gray-800 border border-emerald-100 dark:border-gray-700 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-400">
            {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        <div className="rounded-2xl p-4 bg-emerald-600 text-white shadow-lg"><div className="text-xs font-semibold opacity-80">Tagihan Diterbitkan</div><div className="text-2xl font-extrabold">{formatRupiah(ringkasan.tagihanDiterbitkan)}</div></div>
        <div className="rounded-2xl p-4 bg-emerald-50 dark:bg-gray-800/50 border border-emerald-100 dark:border-gray-700"><div className="text-xs font-semibold text-emerald-400 dark:text-emerald-300">Uang Masuk</div><div className="text-2xl font-extrabold text-emerald-800 dark:text-emerald-300">{formatRupiah(ringkasan.uangMasuk)}</div></div>
        <div className="rounded-2xl p-4 bg-amber-50 dark:bg-amber-900/30 border border-amber-100 dark:border-amber-800"><div className="text-xs font-semibold text-amber-400">Sisa Belum Bayar</div><div className="text-2xl font-extrabold text-amber-800 dark:text-amber-200">{formatRupiah(ringkasan.sisaBelumBayar)}</div></div>
        <div className="rounded-2xl p-4 bg-emerald-50 dark:bg-gray-800/50 border border-emerald-100 dark:border-gray-700"><div className="text-xs font-semibold text-emerald-400 dark:text-emerald-300">Denda Diterima</div><div className="text-2xl font-extrabold text-emerald-800 dark:text-emerald-300">{formatRupiah(ringkasan.dendaDiterima)}</div></div>
        <div className="rounded-2xl p-4 bg-emerald-50 dark:bg-gray-800/50 border border-emerald-100 dark:border-gray-700"><div className="text-xs font-semibold text-emerald-400 dark:text-emerald-300">Tingkat Penagihan</div><div className="text-2xl font-extrabold text-emerald-800 dark:text-emerald-300">{ringkasan.persenBayar}%</div>{ringkasan.uangMasukLebih && <div className="text-xs text-emerald-500 dark:text-emerald-400 dark:text-emerald-300">Uang masuk melebihi tagihan diterbitkan</div>}</div>
        <div className="rounded-2xl p-4 bg-emerald-50 dark:bg-gray-800/50 border border-emerald-100 dark:border-gray-700"><div className="text-xs font-semibold text-emerald-400 dark:text-emerald-300">Lunas / Belum / Terlambat</div><div className="text-lg font-extrabold text-emerald-800 dark:text-emerald-300">{ringkasan.lunas} / {ringkasan.belum} / {ringkasan.terlambat}</div></div>
      </div>

      {loading && <div className="text-center py-8 text-emerald-500 dark:text-emerald-400 dark:text-emerald-300">Memuat...</div>}
      {error && <div className="rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-100 dark:border-red-800 text-red-700 dark:text-red-200 px-4 py-3 mb-4">{error}</div>}
      {!loading && tagihan.length === 0 && <EmptyState title="Belum ada tagihan pada periode ini" desc="Coba periode lain atau buat tagihan baru." />}

      <div className="overflow-x-auto rounded-3xl shadow-xl border border-emerald-100 dark:border-gray-700 bg-white dark:bg-gray-800/80 backdrop-blur mb-6">
        <table className="w-full text-sm text-left">
          <thead className="bg-emerald-600 text-white">
            <tr>
              <th className="px-4 py-3 font-bold">Kamar</th>
              <th className="px-4 py-3 font-bold">Penghuni</th>
              <th className="px-4 py-3 font-bold">Jumlah</th>
              <th className="px-4 py-3 font-bold">Terbayar</th>
              <th className="px-4 py-3 font-bold">Sisa</th>
              <th className="px-4 py-3 font-bold">Jatuh Tempo</th>
              <th className="px-4 py-3 font-bold">Status</th>
              <th className="px-4 py-3 font-bold">Tanggal Bayar</th>
              <th className="px-4 py-3 font-bold">Metode</th>
              <th className="px-4 py-3 font-bold">Denda</th>
            </tr>
          </thead>
          <tbody>
            {tagihanHalaman.map(i => (
              <tr key={i.id} className="border-b border-emerald-50 hover:bg-emerald-50 dark:hover:bg-gray-800/50/40">
                <td className="px-4 py-3 font-semibold text-emerald-800 dark:text-emerald-300">{i.sewa?.kamar?.nomor || '-'}</td>
                <td className="px-4 py-3 text-emerald-700 dark:text-emerald-300">{i.sewa?.penghuni?.nama || '-'}</td>
                <td className="px-4 py-3 font-bold text-emerald-800 dark:text-emerald-300">{formatRupiah(i.jumlah || 0)}</td>
                <td className="px-4 py-3 text-emerald-600 dark:text-emerald-300">{formatRupiah(i.terbayar || 0)}</td>
                <td className="px-4 py-3 text-emerald-600 dark:text-emerald-300">{formatRupiah(Number(i.jumlah || 0) - Number(i.terbayar || 0))}</td>
                <td className="px-4 py-3 text-emerald-600 dark:text-emerald-300">{formatTanggal(i.jatuh_tempo) || '-'}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${i.status === 'lunas' ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-gray-700' : Number(i.terbayar || 0) > 0 ? 'bg-blue-100 text-blue-700 dark:text-blue-200 border-blue-200 dark:border-blue-800' : i.status === 'belum' && (i.jatuh_tempo || '') < new Date().toISOString().split('T')[0] ? 'bg-red-100 text-red-700 dark:text-red-200 border-red-200 dark:border-red-800' : 'bg-amber-100 text-amber-700 dark:text-amber-200 border-amber-200 dark:border-amber-800'}`}>
                    {i.status === 'lunas' ? 'Lunas' : Number(i.terbayar || 0) > 0 ? 'Dicicil' : i.status === 'belum' && (i.jatuh_tempo || '') < new Date().toISOString().split('T')[0] ? 'Terlambat' : 'Belum bayar'}
                  </span>
                </td>
                <td className="px-4 py-3 text-emerald-600 dark:text-emerald-300">{i.tanggal_bayar ? formatTanggal(i.tanggal_bayar) : '-'}</td>
                <td className="px-4 py-3 text-emerald-600 dark:text-emerald-300">{i.metode ? i.metode.charAt(0).toUpperCase() + i.metode.slice(1) : '-'}</td>
                <td className="px-4 py-3 font-bold text-amber-700 dark:text-amber-200">{formatRupiah(i.denda || 0)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mb-6">
        <Pagination
          halaman={halamanTagihan}
          perHalaman={perHalamanTagihan}
          total={tagihan.length}
          onUbahHalaman={setHalamanTagihan}
          onUbahPerHalaman={setPerHalamanTagihan}
          loading={loading}
        />
      </div>

      {terlambat.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/30 rounded-3xl border border-red-100 dark:border-red-800 p-6 mb-6">
          <h3 className="text-lg font-extrabold text-red-800 dark:text-red-200 mb-3">Penghuni Menunggak</h3>
          <div className="space-y-2">
            {terlambatHalaman.map(i => {
              const days = Math.floor((new Date().getTime() - new Date(i.jatuh_tempo || '').getTime()) / (1000 * 60 * 60 * 24))
              return (
                <div key={i.id} className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-gray-800 border border-red-100 dark:border-red-800">
                  <div>
                    <div className="font-bold text-emerald-800 dark:text-emerald-300 text-sm">Kamar {i.sewa?.kamar?.nomor || '-'}</div>
                    <div className="text-xs text-emerald-500 dark:text-emerald-400 dark:text-emerald-300">{i.sewa?.penghuni?.nama || '-'}</div>
                    <div className="text-xs text-red-600 dark:text-red-300 font-medium">Terlambat {days} hari &bull; {formatRupiah(i.jumlah || 0)}</div>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="mt-4">
            <Pagination
              halaman={halamanTerlambat}
              perHalaman={perHalamanTerlambat}
              total={terlambat.length}
              onUbahHalaman={setHalamanTerlambat}
              onUbahPerHalaman={setPerHalamanTerlambat}
              loading={loading}
            />
          </div>
        </div>
      )}
      <div className="mt-6">
        <h2 className="text-xl font-extrabold text-emerald-800 dark:text-emerald-300 mb-4">Riwayat Pembayaran</h2>
        {pembayaran.length === 0 ? (
          <p className="text-emerald-500 dark:text-emerald-400 dark:text-emerald-300 text-sm">Belum ada pembayaran pada periode ini.</p>
        ) : (
          <>
            <div className="overflow-x-auto rounded-3xl shadow-xl border border-emerald-100 dark:border-gray-700 bg-white dark:bg-gray-800/80 backdrop-blur mb-4">
              <table className="w-full text-sm text-left">
                <thead className="bg-emerald-600 text-white">
                  <tr>
                    <th className="px-4 py-3 font-bold">No</th>
                    <th className="px-4 py-3 font-bold">Tanggal</th>
                    <th className="px-4 py-3 font-bold">Kamar</th>
                    <th className="px-4 py-3 font-bold">Penghuni</th>
                    <th className="px-4 py-3 font-bold">Metode</th>
                    <th className="px-4 py-3 font-bold">Jumlah</th>
                  </tr>
                </thead>
                <tbody>
                  {pembayaranHalaman.map((p, idx) => (
                    <tr key={p.id} className="border-b border-emerald-50 hover:bg-emerald-50 dark:hover:bg-gray-800/50/40">
                      <td className="px-4 py-3">{(halamanBayar - 1) * perHalamanBayar + idx + 1}</td>
                      <td className="px-4 py-3 text-emerald-600 dark:text-emerald-300">{formatTanggal(p.tanggal)}</td>
                      <td className="px-4 py-3 font-semibold text-emerald-800 dark:text-emerald-300">{p.tagihan?.sewa?.kamar?.nomor || '-'}</td>
                      <td className="px-4 py-3 text-emerald-700 dark:text-emerald-300">{p.tagihan?.sewa?.penghuni?.nama || '-'}</td>
                      <td className="px-4 py-3 text-emerald-600 dark:text-emerald-300">{p.metode ? p.metode.charAt(0).toUpperCase() + p.metode.slice(1) : '-'}</td>
                      <td className="px-4 py-3 font-bold text-emerald-800 dark:text-emerald-300">{formatRupiah(p.jumlah)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              halaman={halamanBayar}
              perHalaman={perHalamanBayar}
              total={pembayaran.length}
              onUbahHalaman={setHalamanBayar}
              onUbahPerHalaman={setPerHalamanBayar}
              loading={loading}
            />
          </>
        )}
      </div>
    </div>
  )
}
