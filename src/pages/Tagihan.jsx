import { useState, useEffect, useMemo } from 'react'
import { useTagihanHalaman, hariIni } from '../hooks/useTagihanHalaman.js'
import { useBuktiMenunggu } from '../hooks/useBuktiMenunggu.js'
import { useBuktiBayar } from '../hooks/useBuktiBayar.js'
import { usePengaturan } from '../hooks/usePengaturan.jsx'
import { hitungDenda } from '../lib/denda.js'
import { formatRupiah, formatTanggal, parseRupiah } from '../lib/format.js'
import { buatPesanTagihan, buatLinkWA, normalisasiNomor } from '../lib/whatsapp.js'
import { unduhKwitansi, unduhKwitansiPembayaran } from '../lib/kwitansi.js'
import { useProfil } from '../hooks/useProfil.jsx'
import { supabase } from '../lib/supabaseClient.js'
import { useToast } from '../components/Toast.jsx'
import Modal from '../components/Modal.jsx'
import ConfirmDialog from '../components/ConfirmDialog.jsx'
import EmptyState from '../components/EmptyState.jsx'
import Pagination from '../components/Pagination.jsx'
import { DEFAULT_PER_HALAMAN, hitungTotalHalaman } from '../lib/paginasi.js'

export default function Tagihan() {
  const profil = useProfil()
  const { show } = useToast()
  const { pengaturan } = usePengaturan()

  const [periode, setPeriode] = useState(() => {
    const d = new Date()
    return new Date(d.getFullYear(), d.getMonth(), 1)
  })
  const periodeStr = `${periode.getFullYear()}-${String(periode.getMonth() + 1).padStart(2, '0')}-01`
  const [statusFilter, setStatusFilter] = useState('semua')
  const [halaman, setHalaman] = useState(1)
  const [perHalaman, setPerHalaman] = useState(DEFAULT_PER_HALAMAN)
  const [teksCari, setTeksCari] = useState('')
  const [cari, setCari] = useState('')

  const { data, total, ringkasan, loading, error, buatTagihan, catatPembayaran, batalkanPembayaran, batalkanLunas } = useTagihanHalaman({
    halaman, perHalaman, periode: periodeStr, status: statusFilter, cari
  })

  const idsTagihan = useMemo(() => data.map(i => i.id), [data])
  const { jumlah: buktiMenunggu } = useBuktiMenunggu(idsTagihan)
  const { ambilBukti, terima, tolak } = useBuktiBayar()

  const [openCatat, setOpenCatat] = useState(false)
  const [catatItem, setCatatItem] = useState(null)
  const [catatJumlah, setCatatJumlah] = useState('')
  const [catatTanggal, setCatatTanggal] = useState(hariIni())
  const [catatMetode, setCatatMetode] = useState('transfer')
  const [catatDenda, setCatatDenda] = useState(0)
  const [catatCatatan, setCatatCatatan] = useState('')
  const [sedangCatat, setSedangCatat] = useState(false)

  const [openCancel, setOpenCancel] = useState(false)
  const [cancelId, setCancelId] = useState(null)

  const [openRiwayat, setOpenRiwayat] = useState(false)
  const [riwayatItem, setRiwayatItem] = useState(null)
  const [riwayatList, setRiwayatList] = useState([])
  const [memuatRiwayat, setMemuatRiwayat] = useState(false)
  const [hapusPembayaranId, setHapusPembayaranId] = useState(null)
  const [sedangHapusPembayaran, setSedangHapusPembayaran] = useState(false)
  const [openLink, setOpenLink] = useState(false)
  const [linkItem, setLinkItem] = useState(null)

  const [openBukti, setOpenBukti] = useState(false)
  const [buktiItem, setBuktiItem] = useState(null)
  const [buktiList, setBuktiList] = useState([])
  const [memuatBukti, setMemuatBukti] = useState(false)

  const [openTerima, setOpenTerima] = useState(false)
  const [terimaBuktiId, setTerimaBuktiId] = useState(null)
  const [tanggalTerima, setTanggalTerima] = useState(hariIni())
  const [metodeTerima, setMetodeTerima] = useState('transfer')
  const [dendaTerima, setDendaTerima] = useState(0)
  const [jumlahTerima, setJumlahTerima] = useState('')
  const [sedangTerima, setSedangTerima] = useState(false)

  const [openTolak, setOpenTolak] = useState(false)
  const [tolakBuktiId, setTolakBuktiId] = useState(null)
  const [alasanTolak, setAlasanTolak] = useState('')
  const [sedangTolak, setSedangTolak] = useState(false)

  // Debounce pencarian 300 ms
  useEffect(() => {
    const t = setTimeout(() => setCari(teksCari.trim()), 300)
    return () => clearTimeout(t)
  }, [teksCari])

  // Saat cari, filter, periode, atau perHalaman berubah, kembali ke halaman 1
  useEffect(() => { setHalaman(1) }, [cari, statusFilter, periodeStr, perHalaman])

  // Bila halaman saat ini melewati total halaman (mis. setelah tandai lunas di filter Belum bayar), mundur
  useEffect(() => {
    if (loading || total === 0) return
    const akhir = hitungTotalHalaman(total, perHalaman)
    if (halaman > akhir) setHalaman(akhir)
  }, [loading, total, perHalaman, halaman])

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

  const handleCatat = async () => {
    if (sedangCatat || !catatItem) return
    const jumlahNum = parseRupiah(catatJumlah)
    const sisaTotal = Number(catatItem.jumlah || 0) + Number(catatDenda || 0) - Number(catatItem.terbayar || 0)
    if (!catatTanggal) return show('Pilih tanggal bayar', 'error')
    if (catatTanggal > hariIni()) return show('Tanggal bayar tidak boleh di masa depan', 'error')
    if (jumlahNum <= 0) return show('Jumlah harus lebih dari 0', 'error')
    if (jumlahNum > sisaTotal) return show('Jumlah tidak boleh melebihi sisa', 'error')
    if (!pengaturan.izinkan_cicilan && jumlahNum < sisaTotal) return show('Cicilan tidak diizinkan, bayar lunas', 'error')
    if (Number(pengaturan.cicilan_minimum || 0) > 0 && jumlahNum < Number(pengaturan.cicilan_minimum) && jumlahNum < sisaTotal) return show(`Minimal tiap pembayaran ${formatRupiah(pengaturan.cicilan_minimum)}`, 'error')
    setSedangCatat(true)
    try {
      const res = await catatPembayaran(catatItem.id, { jumlah: jumlahNum, tanggal: catatTanggal, metode: catatMetode, denda: catatDenda, catatan: catatCatatan })
      if (res) {
        setOpenCatat(false)
        setCatatItem(null)
      }
    } finally {
      setSedangCatat(false)
    }
  }

  const bukaRiwayat = async (item) => {
    setRiwayatItem(item)
    setRiwayatList([])
    setOpenRiwayat(true)
    setMemuatRiwayat(true)
    try {
      const { data: list, error: e } = await supabase
        .from('pembayaran')
        .select('*')
        .eq('tagihan_id', item.id)
        .order('tanggal', { ascending: true })
        .order('created_at', { ascending: true })
      if (e) throw e
      setRiwayatList(list || [])
    } catch (e) {
      show(e?.message || 'Gagal memuat riwayat', 'error')
    } finally {
      setMemuatRiwayat(false)
    }
  }

  const sisaSaatPembayaran = (p) => {
    const totalTagihan = Number(riwayatItem?.jumlah || 0) + (riwayatItem?.status === 'lunas' ? Number(riwayatItem?.denda || 0) : 0)
    const sorted = [...riwayatList].sort((a, b) => (a.tanggal || '').localeCompare(b.tanggal || '') || (a.created_at || '').localeCompare(b.created_at || ''))
    let cum = 0
    for (const x of sorted) {
      cum += Number(x.jumlah || 0)
      if (x.id === p.id) break
    }
    return totalTagihan - cum
  }

  const handleHapusPembayaran = async () => {
    if (!hapusPembayaranId) return
    setSedangHapusPembayaran(true)
    try {
      const ok = await batalkanPembayaran(hapusPembayaranId)
      if (ok) {
        setHapusPembayaranId(null)
        if (riwayatItem) {
          setMemuatRiwayat(true)
          const { data: list } = await supabase.from('pembayaran').select('*').eq('tagihan_id', riwayatItem.id).order('tanggal', { ascending: true }).order('created_at', { ascending: true })
          setRiwayatList(list || [])
          setMemuatRiwayat(false)
        }
      }
    } finally {
      setSedangHapusPembayaran(false)
    }
  }

  const handleCancel = async () => {
    if (!cancelId) return
    const ok = await batalkanLunas(cancelId)
    if (ok) setOpenCancel(false)
  }

  const bukaBukti = async (item) => {
    setBuktiItem(item)
    setBuktiList([])
    setOpenBukti(true)
    setMemuatBukti(true)
    const list = await ambilBukti(item.id)
    setBuktiList(list)
    setMemuatBukti(false)
  }

  const bukaTerima = (b) => {
    if (!buktiItem) return
    const { denda } = hitungDenda(buktiItem, pengaturan, hariIni())
    const sisa = Number(buktiItem.jumlah || 0) + Number(denda || 0) - Number(buktiItem.terbayar || 0)
    setTerimaBuktiId(b.id)
    setTanggalTerima(hariIni())
    setMetodeTerima('transfer')
    setDendaTerima(denda || 0)
    setJumlahTerima(formatRupiah(b.jumlah_transfer != null ? Number(b.jumlah_transfer) : sisa))
    setOpenTerima(true)
  }

  const handleTerima = async () => {
    if (sedangTerima || !terimaBuktiId) return
    if (!tanggalTerima) return
    setSedangTerima(true)
    try {
      const res = await terima(terimaBuktiId, { tanggal: tanggalTerima, metode: metodeTerima, denda: dendaTerima, jumlah: parseRupiah(jumlahTerima) })
      if (res) {
        setOpenTerima(false)
        setTerimaBuktiId(null)
        if (buktiItem) {
          setMemuatBukti(true)
          const list = await ambilBukti(buktiItem.id)
          setBuktiList(list)
          setMemuatBukti(false)
        }
      }
    } finally {
      setSedangTerima(false)
    }
  }

  const handleTolak = async () => {
    if (sedangTolak || !tolakBuktiId) return
    setSedangTolak(true)
    try {
      const ok = await tolak(tolakBuktiId, alasanTolak)
      if (ok) {
        setOpenTolak(false)
        setTolakBuktiId(null)
        setAlasanTolak('')
        if (buktiItem) {
          setMemuatBukti(true)
          const list = await ambilBukti(buktiItem.id)
          setBuktiList(list)
          setMemuatBukti(false)
        }
      }
    } finally {
      setSedangTolak(false)
    }
  }

  const statusBadge = (i) => {
    if (i.status === 'lunas') return <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-gray-700">Lunas</span>
    if (i.status === 'belum' && Number(i.terbayar || 0) > 0) return <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:text-blue-200 border border-blue-200 dark:border-blue-800">Dicicil</span>
    if (i.status === 'belum' && (i.jatuh_tempo || '') < hariIni()) return <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:text-red-200 border border-red-200 dark:border-red-800">Terlambat</span>
    return <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:text-amber-200 border border-amber-200 dark:border-amber-800">Belum bayar</span>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-extrabold text-emerald-800 dark:text-emerald-300">Tagihan</h1>
        <button onClick={buatTagihan} className="px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition">Buat Tagihan Bulan Ini</button>
      </div>

      <div className="flex flex-wrap gap-3 mb-4 items-end">
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

      <div className="flex flex-wrap gap-2 mb-4">
        {['semua', 'belum', 'lunas', 'terlambat'].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${statusFilter === s ? 'bg-emerald-600 text-white shadow-md' : 'bg-white dark:bg-gray-800 text-emerald-600 dark:text-emerald-300 border border-emerald-100 dark:border-gray-700'}`}>
            {s === 'semua' ? 'Semua' : s === 'belum' ? 'Belum bayar' : s === 'lunas' ? 'Lunas' : 'Terlambat'}
          </button>
        ))}
      </div>

      <input
        value={teksCari}
        onChange={e => setTeksCari(e.target.value)}
        placeholder="Cari nama penghuni, nomor HP, atau nomor kamar..."
        className="w-full mb-6 px-4 py-3 rounded-xl bg-emerald-50/60 dark:bg-gray-900 border border-emerald-100 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-400"
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="rounded-2xl p-4 bg-emerald-600 text-white shadow-lg shadow-emerald-200"><div className="text-xs font-semibold opacity-80">Total</div><div className="text-2xl font-extrabold">{ringkasan.total}</div></div>
        <div className="rounded-2xl p-4 bg-emerald-50 dark:bg-gray-800/50 border border-emerald-100 dark:border-gray-700"><div className="text-xs font-semibold text-emerald-400 dark:text-emerald-300">Sudah dibayar</div><div className="text-2xl font-extrabold text-emerald-800 dark:text-emerald-300">{ringkasan.lunas}</div><div className="text-sm font-bold text-emerald-600 dark:text-emerald-300">{formatRupiah(ringkasan.nominalLunas)}</div></div>
        <div className="rounded-2xl p-4 bg-amber-50 dark:bg-amber-900/30 border border-amber-100 dark:border-amber-800"><div className="text-xs font-semibold text-amber-400">Belum bayar</div><div className="text-2xl font-extrabold text-amber-800 dark:text-amber-200">{ringkasan.belum}</div><div className="text-sm font-bold text-amber-600 dark:text-amber-300">{formatRupiah(ringkasan.nominalBelum)}</div></div>
        <div className="rounded-2xl p-4 bg-red-50 dark:bg-red-900/30 border border-red-100 dark:border-red-800"><div className="text-xs font-semibold text-red-400 dark:text-red-300">Terlambat</div><div className="text-2xl font-extrabold text-red-800 dark:text-red-200">{ringkasan.terlambat}</div></div>
      </div>

      {loading && <div className="text-center py-8 text-emerald-500 dark:text-emerald-400 dark:text-emerald-300">Memuat...</div>}
      {error && <div className="rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-100 dark:border-red-800 text-red-700 dark:text-red-200 px-4 py-3 mb-4">{error}</div>}
      {!loading && !error && total === 0 && (cari || statusFilter !== 'semua'
        ? <EmptyState title="Tidak ada tagihan yang cocok" desc="Coba ubah kata kunci atau filter." />
        : <EmptyState title="Belum ada tagihan" desc="Tekan Buat Tagihan Bulan Ini." />)}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.map(i => (
          <div key={i.id} className="bg-white dark:bg-gray-800/80 backdrop-blur rounded-3xl shadow-md border border-emerald-100 dark:border-gray-700 p-5 transition hover:shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <div className="font-extrabold text-emerald-800 dark:text-emerald-300 text-lg">Kamar {i.sewa?.kamar?.nomor || '-'}</div>
              <div className="flex items-center gap-2">
                {buktiMenunggu?.[i.id] > 0 && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:text-amber-200 border border-amber-200 dark:border-amber-800">
                    Bukti diunggah{buktiMenunggu[i.id] > 1 ? ` ${buktiMenunggu[i.id]}` : ''}
                  </span>
                )}
                {statusBadge(i)}
              </div>
            </div>
            <div className="text-sm text-emerald-600 dark:text-emerald-300 mb-1">{i.sewa?.penghuni?.nama || '-'}</div>
            <div className="text-xs text-emerald-400 dark:text-emerald-300 mb-2">Periode: {i.periode}</div>
            <div className="text-xl font-extrabold text-emerald-800 dark:text-emerald-300 mb-1">{formatRupiah(i.jumlah || 0)}</div>
            <div className="text-sm text-emerald-500 dark:text-emerald-400 dark:text-emerald-300 mb-3">Jatuh tempo: {formatTanggal(i.jatuh_tempo)}</div>
            {i.status === 'belum' && (i.jatuh_tempo || '') < hariIni() && (() => {
              const { denda, hariTelat } = hitungDenda(i, pengaturan, hariIni())
              if (denda > 0) return <div className="text-xs font-bold text-red-600 dark:text-red-300 mb-2">Denda: {formatRupiah(denda)} ({hariTelat} hari)</div>
              return null
            })()}
            {i.status === 'belum' && Number(i.terbayar || 0) > 0 && (() => {
              const { denda } = hitungDenda(i, pengaturan, hariIni())
              const total = Number(i.jumlah || 0) + Number(denda || 0)
              const pct = total > 0 ? Math.min(100, (Number(i.terbayar || 0) / total) * 100) : 0
              const sisa = total - Number(i.terbayar || 0)
              return (
                <div className="mb-3">
                  <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                    <div className="h-2 bg-blue-500 dark:bg-blue-400" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="text-xs text-blue-600 dark:text-blue-300 mt-1">Terbayar {formatRupiah(i.terbayar)}, sisa {formatRupiah(sisa)}</div>
                </div>
              )
            })()}
            <div className="flex gap-2">
              {i.status === 'belum' && (
                <button onClick={() => {
                  const { denda } = hitungDenda(i, pengaturan, hariIni())
                  const sisa = Number(i.jumlah || 0) + Number(denda || 0) - Number(i.terbayar || 0)
                  setCatatItem(i)
                  setCatatTanggal(hariIni())
                  setCatatMetode('transfer')
                  setCatatDenda(denda || 0)
                  setCatatJumlah(formatRupiah(sisa))
                  setCatatCatatan('')
                  setOpenCatat(true)
                }} className="flex-1 py-2 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 transition">Catat Pembayaran</button>
              )}
              {Number(i.terbayar || 0) > 0 && (
                <button onClick={() => bukaRiwayat(i)} className="px-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition">Riwayat</button>
              )}
              {i.status === 'belum' && (
                <button onClick={() => { if (!normalisasiNomor(i.sewa?.penghuni?.no_hp || '')) show('Nomor HP tidak valid', 'error'); setLinkItem(i); setOpenLink(true) }} className="px-3 py-2 rounded-xl bg-blue-50 text-blue-700 text-xs font-bold hover:bg-blue-100 transition">Link bayar</button>
              )}
              {buktiMenunggu?.[i.id] > 0 && (
                <button onClick={() => bukaBukti(i)} className="px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-200 text-xs font-bold hover:bg-amber-100 transition">Lihat bukti</button>
              )}
              {i.status === 'lunas' && (
                <button onClick={() => { setCancelId(i.id); setOpenCancel(true) }} className="flex-1 py-2 rounded-xl bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-200 text-sm font-bold hover:bg-amber-100 transition">Batalkan Lunas</button>
              )}
              {i.status === 'belum' && (
                <button onClick={() => {
                  const nomor = i.sewa?.penghuni?.no_hp || ''
                  if (!normalisasiNomor(nomor)) return show('Nomor HP tidak valid', 'error')
                  const terlambat = i.status === 'belum' && (i.jatuh_tempo || '') < hariIni()
                  const { denda, hariTelat } = terlambat ? hitungDenda(i, pengaturan, hariIni()) : { denda: 0, hariTelat: 0 }
                  const msg = buatPesanTagihan({ nama: i.sewa?.penghuni?.nama || '-', nama_kos: profil?.nama_kos || 'kos kami', nomor_kamar: i.sewa?.kamar?.nomor || '-', periode: i.periode || '', jumlah: i.jumlah || 0, jatuh_tempo: i.jatuh_tempo || '', terlambat, denda, hariTelat, info_pembayaran: pengaturan.info_pembayaran, link_bayar: `${window.location.origin}/bayar/${i.id}`, terbayar: i.terbayar || 0 })
                  window.open(buatLinkWA(nomor, msg), '_blank', 'noopener')
                }} className="px-3 py-2 rounded-xl bg-emerald-50 dark:bg-gray-800/50 text-emerald-700 dark:text-emerald-300 text-xs font-bold hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition">Ingatkan WA</button>
              )}
              {i.status === 'lunas' && (
                <button onClick={async () => {
                  try {
                    const { data: list } = await supabase.from('pembayaran').select('*').eq('tagihan_id', i.id).order('tanggal', { ascending: true }).order('created_at', { ascending: true })
                    await unduhKwitansi(i, profil, list || [])
                  } catch (e) {
                    show(e?.message || 'Gagal membuat kwitansi', 'error')
                  }
                }} className="px-3 py-2 rounded-xl bg-blue-50 text-blue-700 text-xs font-bold hover:bg-blue-100 transition">Kwitansi</button>
              )}
            </div>
          </div>
        ))}
      </div>

      <Pagination
        halaman={halaman}
        perHalaman={perHalaman}
        total={total}
        onUbahHalaman={setHalaman}
        onUbahPerHalaman={setPerHalaman}
        loading={loading}
      />

      <Modal open={openCatat} onClose={() => { if (!sedangCatat) { setOpenCatat(false); setCatatItem(null) } }} title="Catat Pembayaran">
        {catatItem && (() => {
          const sisaTotal = Number(catatItem.jumlah || 0) + Number(catatDenda || 0) - Number(catatItem.terbayar || 0)
          const jumlahNum = parseRupiah(catatJumlah)
          const sisaSetelah = sisaTotal - jumlahNum
          return (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider mb-1">Jumlah dibayar <span className="text-red-500">*</span></label>
                <input type="text" value={catatJumlah} onChange={e => setCatatJumlah(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-emerald-50/60 dark:bg-gray-900 border border-emerald-100 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-400" />
                {parseRupiah(catatJumlah) > 0 && parseRupiah(catatJumlah) > sisaTotal && (
                  <p className="text-xs text-red-600 dark:text-red-300 mt-1">Jumlah melebihi sisa tagihan (sisa {formatRupiah(sisaTotal)})</p>
                )}
                <div className="flex gap-2 mt-2">
                  <button type="button" onClick={() => setCatatJumlah(formatRupiah(sisaTotal))} className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-gray-800/50 text-emerald-700 dark:text-emerald-300 text-xs font-bold hover:bg-emerald-100 transition">Lunasi sisa</button>
                  <button type="button" onClick={() => setCatatJumlah(formatRupiah(Math.round(sisaTotal / 2)))} className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-gray-800/50 text-emerald-700 dark:text-emerald-300 text-xs font-bold hover:bg-emerald-100 transition">50%</button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider mb-1">Tanggal Bayar <span className="text-red-500">*</span></label>
                <input type="date" value={catatTanggal} max={hariIni()} onChange={e => setCatatTanggal(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-emerald-50/60 dark:bg-gray-900 border border-emerald-100 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-400" />
              </div>
              <div>
                <label className="block text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider mb-1">Metode</label>
                <select value={catatMetode} onChange={e => setCatatMetode(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-emerald-50/60 dark:bg-gray-900 border border-emerald-100 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-400">
                  <option value="tunai">Tunai</option>
                  <option value="transfer">Transfer</option>
                  <option value="lainnya">Lainnya</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider mb-1">Denda (Bisa diubah)</label>
                <input type="number" min={0} value={catatDenda} onChange={e => setCatatDenda(parseInt(e.target.value || 0))} className="w-full px-4 py-3 rounded-xl bg-emerald-50/60 dark:bg-gray-900 border border-emerald-100 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-400" />
              </div>
              <div>
                <label className="block text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider mb-1">Catatan (opsional)</label>
                <textarea value={catatCatatan} onChange={e => setCatatCatatan(e.target.value)} rows={2} maxLength={300} className="w-full px-4 py-3 rounded-xl bg-emerald-50/60 dark:bg-gray-900 border border-emerald-100 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 resize-none" />
              </div>
              <div className={`text-sm font-bold ${parseRupiah(catatJumlah) > 0 && parseRupiah(catatJumlah) > sisaTotal ? 'text-red-600 dark:text-red-300' : 'text-emerald-700 dark:text-emerald-300'}`}>Sisa setelah pembayaran ini: {parseRupiah(catatJumlah) > 0 && parseRupiah(catatJumlah) > sisaTotal ? '-' : formatRupiah(sisaSetelah)}</div>
              <button
                onClick={handleCatat}
                disabled={sedangCatat || parseRupiah(catatJumlah) <= 0 || parseRupiah(catatJumlah) > sisaTotal}
                className="w-full py-3 rounded-xl bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {sedangCatat ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    <span>Memproses...</span>
                  </>
                ) : (
                  'Catat Pembayaran'
                )}
              </button>
            </div>
          )
        })()}
      </Modal>

      <Modal open={openRiwayat} onClose={() => { setOpenRiwayat(false); setRiwayatItem(null); setRiwayatList([]) }} title="Riwayat Pembayaran">
        {memuatRiwayat ? (
          <div className="text-center py-6 text-emerald-500 dark:text-emerald-400">Memuat...</div>
        ) : riwayatList.length === 0 ? (
          <p className="text-sm text-emerald-600 dark:text-emerald-300">Belum ada pembayaran.</p>
        ) : (
          <div className="space-y-3">
            {riwayatList.map(p => (
              <div key={p.id} className="rounded-2xl border border-emerald-100 dark:border-gray-700 p-3 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="font-bold text-emerald-800 dark:text-emerald-300">{formatRupiah(p.jumlah)}</div>
                  <div className="flex gap-2">
                    <button onClick={() => unduhKwitansiPembayaran(riwayatItem, p, profil, sisaSaatPembayaran(p)).catch(e => show(e?.message || 'Gagal membuat kwitansi', 'error'))} className="px-2 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-bold hover:bg-blue-100 transition">Kwitansi</button>
                    <button onClick={() => setHapusPembayaranId(p.id)} className="px-2 py-1 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-200 text-xs font-bold hover:bg-red-100 transition">Hapus</button>
                  </div>
                </div>
                <div className="text-xs text-emerald-500 dark:text-emerald-400">{formatTanggal(p.tanggal)} • {p.metode}</div>
                {p.catatan && <p className="text-xs text-emerald-700 dark:text-emerald-300 whitespace-pre-line">{p.catatan}</p>}
                {p.bukti_id && <span className="text-xs font-bold text-blue-600 dark:text-blue-300">dari bukti transfer</span>}
              </div>
            ))}
          </div>
        )}
      </Modal>

      <ConfirmDialog open={!!hapusPembayaranId} title="Hapus Pembayaran" message="Hapus pembayaran ini?" onConfirm={handleHapusPembayaran} onCancel={() => setHapusPembayaranId(null)} busy={sedangHapusPembayaran} />

      <ConfirmDialog open={openCancel} title="Batalkan Lunas" message="Semua pembayaran tagihan ini akan dihapus dan tagihan kembali belum bayar" onConfirm={handleCancel} onCancel={() => setOpenCancel(false)} />

      <Modal open={openLink} onClose={() => setOpenLink(false)} title="Link Bayar">
        {linkItem && (() => {
          const url = `${window.location.origin}/bayar/${linkItem.id}`
          const nomor = linkItem.sewa?.penghuni?.no_hp || ''
          const valid = !!normalisasiNomor(nomor)
          const msg = `Halo ${linkItem.sewa?.penghuni?.nama || '-'}, tagihan kamar ${linkItem.sewa?.kamar?.nomor || '-'} periode ${linkItem.periode || ''} sebesar ${formatRupiah(linkItem.jumlah || 0)} dapat dibayar dan bukti transfernya diunggah lewat link ini: ${url}`
          const linkWA = valid ? buatLinkWA(nomor, msg) : ''
          const salin = async () => {
            try {
              await navigator.clipboard.writeText(url)
              show('Link disalin')
            } catch {
              const ta = document.createElement('textarea')
              ta.value = url
              document.body.appendChild(ta)
              ta.select()
              try { document.execCommand('copy'); show('Link disalin') } catch { show('Gagal menyalin', 'error') }
              document.body.removeChild(ta)
            }
          }
          return (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider mb-1">URL Pembayaran</label>
                <input type="text" readOnly value={url} className="w-full px-4 py-3 rounded-xl bg-emerald-50/60 dark:bg-gray-900 border border-emerald-100 dark:border-gray-700 text-emerald-900 dark:text-gray-100 text-sm" />
              </div>
              <button onClick={salin} className="w-full py-3 rounded-xl bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition">Salin link</button>
              {valid ? (
                <a href={linkWA} target="_blank" rel="noopener noreferrer" className="block w-full text-center py-3 rounded-xl bg-emerald-50 dark:bg-gray-800/50 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-100 dark:border-gray-700 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition">Kirim via WhatsApp</a>
              ) : (
                <p className="text-xs text-red-600 dark:text-red-300">Nomor HP penghuni tidak valid</p>
              )}
            </div>
          )
        })()}
      </Modal>

      <Modal open={openBukti} onClose={() => { setOpenBukti(false); setBuktiItem(null); setBuktiList([]) }} title="Bukti Transfer">
        {memuatBukti ? (
          <div className="space-y-3 animate-pulse">
            <div className="h-40 rounded-xl bg-emerald-100 dark:bg-emerald-900/40" />
            <div className="h-4 w-32 rounded bg-emerald-100 dark:bg-emerald-900/40" />
          </div>
        ) : buktiList.length === 0 ? (
          <p className="text-sm text-emerald-600 dark:text-emerald-300">Belum ada bukti.</p>
        ) : (
          <div className="space-y-4">
            {buktiList.map(b => {
              const statusCls = b.status === 'diterima'
                ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-gray-700'
                : b.status === 'ditolak'
                ? 'bg-red-100 text-red-700 dark:text-red-200 border-red-200 dark:border-red-800'
                : 'bg-amber-100 text-amber-700 dark:text-amber-200 border-amber-200 dark:border-amber-800'
              const statusLabel = b.status === 'diterima' ? 'Diterima' : b.status === 'ditolak' ? 'Ditolak' : 'Menunggu'
              return (
                <div key={b.id} className="rounded-2xl border border-emerald-100 dark:border-gray-700 p-3 space-y-2">
                  {b.signedUrl ? (
                    <a href={b.signedUrl} target="_blank" rel="noopener noreferrer" className="block">
                      <img src={b.signedUrl} alt="Bukti" className="w-full max-h-64 object-contain rounded-xl bg-emerald-50 dark:bg-gray-800/50" onError={(e) => { e.currentTarget.style.display = 'none'; const n = e.currentTarget.nextElementSibling; if (n) n.style.display = 'block' }} />
                      <p className="hidden text-sm text-red-600 dark:text-red-300">Foto gagal dimuat.</p>
                    </a>
                  ) : (
                    <p className="text-sm text-red-600 dark:text-red-300">Foto gagal dimuat.</p>
                  )}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-emerald-500 dark:text-emerald-400 dark:text-emerald-300">{b.nama_pengirim || 'Tanpa nama'}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${statusCls}`}>{statusLabel}</span>
                  </div>
                  {b.catatan && <p className="text-sm text-emerald-700 dark:text-emerald-300 whitespace-pre-line">{b.catatan}</p>}
                  {b.jumlah_transfer != null && <p className="text-xs text-emerald-600 dark:text-emerald-300">Jumlah ditransfer: {formatRupiah(b.jumlah_transfer)}</p>}
                  <p className="text-xs text-emerald-400 dark:text-emerald-300">{new Date(b.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                  {b.status === 'ditolak' && b.alasan_tolak && (
                    <p className="text-xs text-red-600 dark:text-red-300">Alasan: {b.alasan_tolak}</p>
                  )}
                  {b.status === 'menunggu' && buktiItem?.status === 'belum' && (
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => bukaTerima(b)}
                        className="flex-1 py-2 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 transition"
                      >
                        Terima Pembayaran
                      </button>
                      <button
                        onClick={() => { setTolakBuktiId(b.id); setAlasanTolak(''); setOpenTolak(true) }}
                        className="px-3 py-2 rounded-xl bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-200 text-sm font-bold hover:bg-red-100 transition"
                      >
                        Tolak
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </Modal>

      <Modal open={openTerima} onClose={() => { if (!sedangTerima) { setOpenTerima(false); setTerimaBuktiId(null) } }} title="Terima Pembayaran">
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider mb-1">Jumlah</label>
            <input type="text" value={jumlahTerima} onChange={e => setJumlahTerima(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-emerald-50/60 dark:bg-gray-900 border border-emerald-100 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-400" />
          </div>
          <div>
            <label className="block text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider mb-1">Tanggal Bayar</label>
            <input type="date" value={tanggalTerima} max={hariIni()} onChange={e => setTanggalTerima(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-emerald-50/60 dark:bg-gray-900 border border-emerald-100 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-400" />
          </div>
          <div>
            <label className="block text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider mb-1">Metode</label>
            <select value={metodeTerima} onChange={e => setMetodeTerima(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-emerald-50/60 dark:bg-gray-900 border border-emerald-100 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-400">
              <option value="tunai">Tunai</option>
              <option value="transfer">Transfer</option>
              <option value="lainnya">Lainnya</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider mb-1">Denda</label>
            <input type="number" min={0} value={dendaTerima} onChange={e => setDendaTerima(parseInt(e.target.value || 0))} className="w-full px-4 py-3 rounded-xl bg-emerald-50/60 dark:bg-gray-900 border border-emerald-100 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-400" />
          </div>
          <button
            onClick={handleTerima}
            disabled={sedangTerima}
            className="w-full py-3 rounded-xl bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {sedangTerima ? (
              <>
                <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                <span>Memproses...</span>
              </>
            ) : (
              parseRupiah(jumlahTerima) > 0 && parseRupiah(jumlahTerima) < (Number(buktiItem?.jumlah || 0) + Number(dendaTerima || 0) - Number(buktiItem?.terbayar || 0)) ? 'Terima sebagai cicilan' : 'Terima dan Tandai Lunas'
            )}
          </button>
        </div>
      </Modal>

      <Modal open={openTolak} onClose={() => { if (!sedangTolak) { setOpenTolak(false); setTolakBuktiId(null); setAlasanTolak('') } }} title="Tolak Bukti">
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider mb-1">Alasan (opsional)</label>
            <textarea
              value={alasanTolak}
              onChange={e => setAlasanTolak(e.target.value)}
              rows={3}
              maxLength={300}
              className="w-full px-4 py-3 rounded-xl bg-emerald-50/60 dark:bg-gray-900 border border-emerald-100 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 resize-none"
            />
          </div>
          <button
            onClick={handleTolak}
            disabled={sedangTolak}
            className="w-full py-3 rounded-xl bg-red-600 text-white font-bold shadow-lg shadow-red-200 hover:bg-red-700 transition disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {sedangTolak ? (
              <>
                <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                <span>Memproses...</span>
              </>
            ) : (
              'Tolak Bukti'
            )}
          </button>
        </div>
      </Modal>
    </div>
  )
}