import { useState, useMemo } from 'react'
import { useAuth } from '../hooks/useAuth.jsx'
import { useTagihan } from '../hooks/useTagihan.jsx'
import { usePengaturan } from '../hooks/usePengaturan.jsx'
import { hitungDenda } from '../lib/denda.js'
import { formatRupiah, formatTanggal } from '../lib/format.js'
import { buatPesanTagihan, buatLinkWA, normalisasiNomor } from '../lib/whatsapp.js'
import { unduhKwitansi } from '../lib/kwitansi.js'
import { useProfil } from '../hooks/useProfil.jsx'
import { useToast } from '../components/Toast.jsx'
import Modal from '../components/Modal.jsx'
import ConfirmDialog from '../components/ConfirmDialog.jsx'
import EmptyState from '../components/EmptyState.jsx'

export default function Tagihan() {
  const { user } = useAuth()
  const profil = useProfil()
  const { show } = useToast()
  const { list, filteredList, loading, error, periode, setPeriode, statusFilter, setStatusFilter, reload, buatTagihan, tandaiLunas, batalkanLunas, ringkasan } = useTagihan()
  const { pengaturan } = usePengaturan()
  const [openMark, setOpenMark] = useState(false)
  const [markId, setMarkId] = useState(null)
  const [tglBayar, setTglBayar] = useState(new Date().toISOString().split('T')[0])
  const [metode, setMetode] = useState('tunai')
  const [dendaMark, setDendaMark] = useState(0)
  const [openCancel, setOpenCancel] = useState(false)
  const [cancelId, setCancelId] = useState(null)

  const yearOptions = useMemo(() => {
    const y = new Date().getFullYear()
    return [y - 1, y, y + 1]
  }, [])

  const monthOptions = [
    { val: 0, label: 'Januari' }, { val: 1, label: 'Februari' }, { val: 2, label: 'Maret' },
    { val: 3, label: 'April' }, { val: 4, label: 'Mei' }, { val: 5, label: 'Juni' },
    { val: 6, label: 'Juli' }, { val: 7, label: 'Agustus' }, { val: 8, label: 'September' },
    { val: 9, label: 'Oktober' }, { val: 10, label: 'November' }, { val: 11, label: 'Desember' },
  ]

  const handleMark = async () => {
    if (!tglBayar) return alert('Pilih tanggal bayar')
    if (tglBayar > new Date().toISOString().split('T')[0]) return alert('Tanggal bayar tidak boleh di masa depan')
    if (!markId) return
    await tandaiLunas(markId, tglBayar, metode, dendaMark)
    setOpenMark(false)
  }

  const handleCancel = async () => {
    if (!cancelId) return
    await batalkanLunas(cancelId)
    setOpenCancel(false)
  }

  const statusBadge = (i) => {
    const todayStr = new Date().toISOString().split('T')[0]
    if (i.status === 'lunas') return <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">Lunas</span>
    if (i.status === 'belum' && (i.jatuh_tempo || '') < todayStr) return <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200">Terlambat</span>
    return <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">Belum bayar</span>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-extrabold text-emerald-800">Tagihan</h1>
        <button onClick={buatTagihan} className="px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition">Buat Tagihan Bulan Ini</button>
      </div>

      <div className="flex flex-wrap gap-3 mb-4 items-end">
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

      <div className="flex gap-2 mb-6">
        {['semua', 'belum', 'lunas', 'terlambat'].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${statusFilter === s ? 'bg-emerald-600 text-white shadow-md' : 'bg-white text-emerald-600 border border-emerald-100'}`}>
            {s === 'semua' ? 'Semua' : s === 'belum' ? 'Belum bayar' : s === 'lunas' ? 'Lunas' : 'Terlambat'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="rounded-2xl p-4 bg-emerald-600 text-white shadow-lg shadow-emerald-200"><div className="text-xs font-semibold opacity-80">Total</div><div className="text-2xl font-extrabold">{ringkasan.total}</div></div>
        <div className="rounded-2xl p-4 bg-emerald-50 border border-emerald-100"><div className="text-xs font-semibold text-emerald-400">Sudah dibayar</div><div className="text-2xl font-extrabold text-emerald-800">{ringkasan.lunas}</div><div className="text-sm font-bold text-emerald-600">{formatRupiah(ringkasan.nominalLunas)}</div></div>
        <div className="rounded-2xl p-4 bg-amber-50 border border-amber-100"><div className="text-xs font-semibold text-amber-400">Belum bayar</div><div className="text-2xl font-extrabold text-amber-800">{ringkasan.belum}</div><div className="text-sm font-bold text-amber-600">{formatRupiah(ringkasan.nominalBelum)}</div></div>
        <div className="rounded-2xl p-4 bg-red-50 border border-red-100"><div className="text-xs font-semibold text-red-400">Terlambat</div><div className="text-2xl font-extrabold text-red-800">{ringkasan.terlambat}</div></div>
      </div>

      {loading && <div className="text-center py-8 text-emerald-500">Memuat...</div>}
      {error && <div className="rounded-xl bg-red-50 border border-red-100 text-red-700 px-4 py-3 mb-4">{error}</div>}
      {!loading && filteredList.length === 0 && <EmptyState title="Belum ada tagihan" desc="Tekan Buat Tagihan Bulan Ini." />}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredList.map(i => (
          <div key={i.id} className="bg-white/80 backdrop-blur rounded-3xl shadow-md border border-emerald-100 p-5 transition hover:shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <div className="font-extrabold text-emerald-800 text-lg">Kamar {i.sewa?.kamar?.nomor || '-'}</div>
              {statusBadge(i)}
            </div>
            <div className="text-sm text-emerald-600 mb-1">{i.sewa?.penghuni?.nama || '-'}</div>
            <div className="text-xs text-emerald-400 mb-2">Periode: {i.periode}</div>
            <div className="text-xl font-extrabold text-emerald-800 mb-1">{formatRupiah(i.jumlah || 0)}</div>
            <div className="text-sm text-emerald-500 mb-3">Jatuh tempo: {formatTanggal(i.jatuh_tempo)}</div>
            {i.status === 'belum' && (i.jatuh_tempo || '') < new Date().toISOString().split('T')[0] && (() => {
              const { denda, hariTelat } = hitungDenda(i, pengaturan, new Date().toISOString().split('T')[0])
              if (denda > 0) return <div className="text-xs font-bold text-red-600 mb-2">Denda: {formatRupiah(denda)} ({hariTelat} hari)</div>
              return null
            })()}
            <div className="flex gap-2">
              {i.status === 'belum' && (
                <button onClick={() => {
                  const item = list.find(x => x.id === i.id)
                  setMarkId(i.id)
                  setTglBayar(new Date().toISOString().split('T')[0])
                  setMetode('tunai')
                  const { denda } = hitungDenda(item, pengaturan, new Date().toISOString().split('T')[0])
                  setDendaMark(denda)
                  setOpenMark(true)
                }} className="flex-1 py-2 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 transition">Tandai Lunas</button>
              )}
              {i.status === 'lunas' && (
                <button onClick={() => { setCancelId(i.id); setOpenCancel(true) }} className="flex-1 py-2 rounded-xl bg-amber-50 text-amber-700 text-sm font-bold hover:bg-amber-100 transition">Batalkan Lunas</button>
              )}
              {i.status === 'belum' && (
                <button onClick={() => {
                  const nomor = i.sewa?.penghuni?.no_hp || ''
                  if (!normalisasiNomor(nomor)) return show('Nomor HP tidak valid', 'error')
                  const terlambat = i.status === 'belum' && (i.jatuh_tempo || '') < new Date().toISOString().split('T')[0]
                  const { denda, hariTelat } = terlambat ? hitungDenda(i, pengaturan, new Date().toISOString().split('T')[0]) : { denda: 0, hariTelat: 0 }
                  const msg = buatPesanTagihan({ nama: i.sewa?.penghuni?.nama || '-', nama_kos: profil?.nama_kos || 'kos kami', nomor_kamar: i.sewa?.kamar?.nomor || '-', periode: i.periode || '', jumlah: i.jumlah || 0, jatuh_tempo: i.jatuh_tempo || '', terlambat, denda, hariTelat })
                  window.open(buatLinkWA(nomor, msg), '_blank', 'noopener')
                }} className="px-3 py-2 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold hover:bg-emerald-100 transition">Ingatkan WA</button>
              )}
              {i.status === 'lunas' && (
                <button onClick={() => unduhKwitansi(i, profil).catch(e => show(e?.message || 'Gagal membuat kwitansi', 'error'))} className="px-3 py-2 rounded-xl bg-blue-50 text-blue-700 text-xs font-bold hover:bg-blue-100 transition">Kwitansi</button>
              )}
            </div>
          </div>
        ))}
      </div>

      <Modal open={openMark} onClose={() => setOpenMark(false)} title="Tandai Lunas">
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">Tanggal Bayar <span className="text-red-500">*</span></label>
            <input type="date" value={tglBayar} max={new Date().toISOString().split('T')[0]} onChange={e => setTglBayar(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-emerald-50/60 border border-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-400" />
          </div>
          <div>
            <label className="block text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">Metode</label>
            <select value={metode} onChange={e => setMetode(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-emerald-50/60 border border-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-400">
              <option value="tunai">Tunai</option>
              <option value="transfer">Transfer</option>
              <option value="lainnya">Lainnya</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">Denda (Bisa diubah)</label>
            <input type="number" min={0} value={dendaMark} onChange={e => setDendaMark(parseInt(e.target.value || 0))} className="w-full px-4 py-3 rounded-xl bg-emerald-50/60 border border-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-400" />
          </div>
          <button onClick={handleMark} className="w-full py-3 rounded-xl bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition">Simpan</button>
        </div>
      </Modal>

      <ConfirmDialog open={openCancel} title="Batalkan Lunas" message="Anda yakin ingin membatalkan status lunas?" onConfirm={handleCancel} onCancel={() => setOpenCancel(false)} />
    </div>
  )
}
