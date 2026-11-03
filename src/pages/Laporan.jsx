import { useState, useMemo } from 'react'
import { useAuth } from '../hooks/useAuth.jsx'
import { useProfil } from '../hooks/useProfil.jsx'
import { useLaporan } from '../hooks/useLaporan.jsx'
import { formatRupiah, formatTanggal, formatPeriode } from '../lib/format.js'
import { unduhLaporanPdf, unduhLaporanExcel } from '../lib/ekspor.js'
import { useToast } from '../components/Toast.jsx'
import EmptyState from '../components/EmptyState.jsx'

export default function Laporan() {
  const { user } = useAuth()
  const profil = useProfil()
  const { tagihan, kamar, penghuni, loading, error, periode, setPeriode, reload, ringkasan } = useLaporan()
  const { show } = useToast()
  const [fileNameBase] = useState('laporan-kosku')

  const yearOptions = useMemo(() => { const y = new Date().getFullYear(); return [y - 1, y, y + 1] }, [])
  const monthOptions = [
    { val: 0, label: 'Jan' }, { val: 1, label: 'Feb' }, { val: 2, label: 'Mar' },
    { val: 3, label: 'Apr' }, { val: 4, label: 'Mei' }, { val: 5, label: 'Jun' },
    { val: 6, label: 'Jul' }, { val: 7, label: 'Agu' }, { val: 8, label: 'Sep' },
    { val: 9, label: 'Okt' }, { val: 10, label: 'Nov' }, { val: 11, label: 'Des' },
  ]

  const canDownload = tagihan.length > 0 || kamar.length > 0 || penghuni.length > 0

  const handlePdf = () => {
    try {
      unduhLaporanPdf({ periode, tagihan, kamar, profil, ringkasan })
      show('PDF berhasil diunduh', 'success')
    } catch (e) {
      show(e.message || 'Gagal membuat PDF', 'error')
    }
  }

  const handleXlsx = () => {
    try {
      unduhLaporanExcel({ periode, tagihan, kamar, penghuni, profil })
      show('Excel berhasil diunduh', 'success')
    } catch (e) {
      show(e.message || 'Gagal membuat Excel', 'error')
    }
  }

  const terlambat = tagihan.filter(t => t.status === 'belum' && (t.jatuh_tempo || '') < new Date().toISOString().split('T')[0]).sort((a, b) => (a.jatuh_tempo || '').localeCompare(b.jatuh_tempo || ''))

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-extrabold text-emerald-800">Laporan</h1>
        <div className="flex gap-2">
          <button onClick={handlePdf} disabled={!canDownload} className="px-3 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold disabled:opacity-50 hover:bg-emerald-700 transition">Unduh PDF</button>
          <button onClick={handleXlsx} disabled={!canDownload} className="px-3 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold disabled:opacity-50 hover:bg-blue-700 transition">Unduh Excel</button>
        </div>
      </div>

      <div className="flex gap-3 mb-4 items-end">
        <div>
          <label className="block text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">Bulan</label>
          <select value={periode.getMonth()} onChange={e => setPeriode(new Date(periode.getFullYear(), Number(e.target.value), 1))} className="px-3 py-2 rounded-xl bg-white border border-emerald-100 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-400">
            {monthOptions.map(m => <option key={m.val} value={m.val}>{m.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">Tahun</label>
          <select value={periode.getFullYear()} onChange={e => setPeriode(new Date(Number(e.target.value), periode.getMonth(), 1))} className="px-3 py-2 rounded-xl bg-white border border-emerald-100 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-400">
            {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        <div className="rounded-2xl p-4 bg-emerald-600 text-white shadow-lg"><div className="text-xs font-semibold opacity-80">Total Tagihan</div><div className="text-2xl font-extrabold">{ringkasan.total}</div></div>
        <div className="rounded-2xl p-4 bg-emerald-50 border border-emerald-100"><div className="text-xs font-semibold text-emerald-400">Lunas</div><div className="text-2xl font-extrabold text-emerald-800">{ringkasan.lunas}</div><div className="text-sm font-bold text-emerald-600">{formatRupiah(ringkasan.totalLunas)}</div></div>
        <div className="rounded-2xl p-4 bg-amber-50 border border-amber-100"><div className="text-xs font-semibold text-amber-400">Belum Bayar</div><div className="text-2xl font-extrabold text-amber-800">{ringkasan.belum}</div><div className="text-sm font-bold text-amber-600">{formatRupiah(ringkasan.totalBelum)}</div></div>
        <div className="rounded-2xl p-4 bg-red-50 border border-red-100"><div className="text-xs font-semibold text-red-400">Terlambat</div><div className="text-2xl font-extrabold text-red-800">{ringkasan.terlambat}</div><div className="text-sm font-bold text-red-600">{formatRupiah(ringkasan.totalTerlambat)}</div></div>
        <div className="rounded-2xl p-4 bg-emerald-50 border border-emerald-100"><div className="text-xs font-semibold text-emerald-400">Persentase Terbayar</div><div className="text-2xl font-extrabold text-emerald-800">{ringkasan.persenBayar}%</div></div>
        <div className="rounded-2xl p-4 bg-emerald-50 border border-emerald-100"><div className="text-xs font-semibold text-emerald-400">Kamar Terisi</div><div className="text-2xl font-extrabold text-emerald-800">{ringkasan.kamarTerisi} / {ringkasan.kamarTotal}</div></div>
      </div>

      {loading && <div className="text-center py-8 text-emerald-500">Memuat...</div>}
      {error && <div className="rounded-xl bg-red-50 border border-red-100 text-red-700 px-4 py-3 mb-4">{error}</div>}
      {!loading && tagihan.length === 0 && <EmptyState title="Belum ada tagihan pada periode ini" desc="Coba periode lain atau buat tagihan baru." />}

      <div className="overflow-x-auto rounded-3xl shadow-xl border border-emerald-100 bg-white/80 backdrop-blur mb-6">
        <table className="w-full text-sm text-left">
          <thead className="bg-emerald-600 text-white">
            <tr>
              <th className="px-4 py-3 font-bold">Kamar</th>
              <th className="px-4 py-3 font-bold">Penghuni</th>
              <th className="px-4 py-3 font-bold">Jumlah</th>
              <th className="px-4 py-3 font-bold">Jatuh Tempo</th>
              <th className="px-4 py-3 font-bold">Status</th>
              <th className="px-4 py-3 font-bold">Tanggal Bayar</th>
              <th className="px-4 py-3 font-bold">Metode</th>
            </tr>
          </thead>
          <tbody>
            {tagihan.map(i => (
              <tr key={i.id} className="border-b border-emerald-50 hover:bg-emerald-50/40">
                <td className="px-4 py-3 font-semibold text-emerald-800">{i.sewa?.kamar?.nomor || '-'}</td>
                <td className="px-4 py-3 text-emerald-700">{i.sewa?.penghuni?.nama || '-'}</td>
                <td className="px-4 py-3 font-bold text-emerald-800">{formatRupiah(i.jumlah || 0)}</td>
                <td className="px-4 py-3 text-emerald-600">{formatTanggal(i.jatuh_tempo) || '-'}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${i.status === 'lunas' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : i.status === 'belum' && (i.jatuh_tempo || '') < new Date().toISOString().split('T')[0] ? 'bg-red-100 text-red-700 border-red-200' : 'bg-amber-100 text-amber-700 border-amber-200'}`}>
                    {i.status === 'lunas' ? 'Lunas' : i.status === 'belum' && (i.jatuh_tempo || '') < new Date().toISOString().split('T')[0] ? 'Terlambat' : 'Belum bayar'}
                  </span>
                </td>
                <td className="px-4 py-3 text-emerald-600">{i.tanggal_bayar ? formatTanggal(i.tanggal_bayar) : '-'}</td>
                <td className="px-4 py-3 text-emerald-600">{i.metode ? i.metode.charAt(0).toUpperCase() + i.metode.slice(1) : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {terlambat.length > 0 && (
        <div className="bg-red-50 rounded-3xl border border-red-100 p-6 mb-6">
          <h3 className="text-lg font-extrabold text-red-800 mb-3">Penghuni Menunggak</h3>
          <div className="space-y-2">
            {terlambat.map(i => {
              const days = Math.floor((new Date().getTime() - new Date(i.jatuh_tempo || '').getTime()) / (1000 * 60 * 60 * 24))
              return (
                <div key={i.id} className="flex items-center justify-between p-3 rounded-xl bg-white border border-red-100">
                  <div>
                    <div className="font-bold text-emerald-800 text-sm">Kamar {i.sewa?.kamar?.nomor || '-'}</div>
                    <div className="text-xs text-emerald-500">{i.sewa?.penghuni?.nama || '-'}</div>
                    <div className="text-xs text-red-600 font-medium">Terlambat {days} hari &bull; {formatRupiah(i.jumlah || 0)}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
