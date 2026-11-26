import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth.jsx'
import { useSewaHalaman } from '../hooks/useSewaHalaman.js'
import { formatRupiah, parseRupiah, formatTanggal } from '../lib/format.js'
import { supabase } from '../lib/supabaseClient.js'
import { usePengaturan } from '../hooks/usePengaturan.jsx'
import Modal from '../components/Modal.jsx'
import EmptyState from '../components/EmptyState.jsx'
import Pagination from '../components/Pagination.jsx'
import { DEFAULT_PER_HALAMAN, hitungTotalHalaman } from '../lib/paginasi.js'

// Tanggal lokal (bukan UTC) dalam format YYYY-MM-DD
function todayStr() {
  const d = new Date()
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

export default function Sewa() {
  const { user } = useAuth()
  const [tab, setTab] = useState('aktif')
  const [halaman, setHalaman] = useState(1)
  const [perHalaman, setPerHalaman] = useState(DEFAULT_PER_HALAMAN)
  const [teksCari, setTeksCari] = useState('')
  const [cari, setCari] = useState('')

  const statusDb = tab === 'aktif' ? 'aktif' : 'selesai'
  const { data, total, jumlah, loading, error, mulaiSewa, akhiriSewa } = useSewaHalaman({
    halaman, perHalaman, cari, status: statusDb
  })

  const [openStart, setOpenStart] = useState(false)
  const [openEnd, setOpenEnd] = useState(false)
  const [endId, setEndId] = useState(null)
  const [endDate, setEndDate] = useState(todayStr())

  // Start modal state
  const [kamarOptions, setKamarOptions] = useState([])
  const [penghuniOptions, setPenghuniOptions] = useState([])
  const [selectedKamar, setSelectedKamar] = useState('')
  const [selectedPenghuni, setSelectedPenghuni] = useState('')
  const [tanggalMasuk, setTanggalMasuk] = useState(todayStr())
  const { pengaturan } = usePengaturan()
  const [hariTagih, setHariTagih] = useState(new Date().getDate())
  const [hargaSewa, setHargaSewa] = useState('')
  const [deposit, setDeposit] = useState('0')
  const [quickName, setQuickName] = useState('')
  const [quickNo, setQuickNo] = useState('')
  const [quickOpen, setQuickOpen] = useState(false)

  // Debounce pencarian 300 ms
  useEffect(() => {
    const t = setTimeout(() => setCari(teksCari.trim()), 300)
    return () => clearTimeout(t)
  }, [teksCari])

  // Saat cari, tab, atau perHalaman berubah, kembali ke halaman 1
  useEffect(() => { setHalaman(1) }, [cari, tab, perHalaman])

  // Bila halaman saat ini melewati total halaman (mis. setelah akhiri sewa), mundur
  useEffect(() => {
    if (loading || total === 0) return
    const akhir = hitungTotalHalaman(total, perHalaman)
    if (halaman > akhir) setHalaman(akhir)
  }, [loading, total, perHalaman, halaman])

  useEffect(() => {
    if (!openStart || !user) return
    supabase.from('kamar').select('id,nomor').eq('user_id', user.id).eq('status', 'kosong').order('nomor').then(({ data }) => setKamarOptions(data || []))
    supabase.from('penghuni').select('id,nama').eq('user_id', user.id).order('nama').then(({ data }) => {
      // exclude those with active sewa
      supabase.from('sewa').select('penghuni_id').eq('user_id', user.id).eq('status', 'aktif').then(({ data: s }) => {
        const activeIds = new Set((s || []).map(x => x.penghuni_id))
        setPenghuniOptions((data || []).filter(p => !activeIds.has(p.id)))
      })
    })
  }, [openStart, user])

  const handleStart = async () => {
    if (!selectedKamar || !selectedPenghuni) return alert('Pilih kamar dan penghuni')
    if (!tanggalMasuk) return alert('Pilih tanggal masuk')
    const tagih = Math.max(1, Math.min(28, parseInt(hariTagih || 1)))
    const harga = parseRupiah(hargaSewa)
    if (harga <= 0) return alert('Harga sewa wajib')
    const ok = await mulaiSewa({
      p_kamar: selectedKamar,
      p_penghuni: selectedPenghuni,
      p_tanggal_masuk: tanggalMasuk,
      p_hari_tagih: tagih,
      p_harga: harga,
      p_deposit: parseRupiah(deposit)
    })
    if (ok) {
      setOpenStart(false)
      setSelectedKamar('')
      setSelectedPenghuni('')
      setHargaSewa('')
    }
  }

  const handleSaveQuick = async () => {
    if (!quickName.trim()) return alert('Nama wajib')
    const { data, error } = await supabase.from('penghuni').insert({ user_id: user.id, nama: quickName.trim(), no_hp: quickNo.trim() || null, pekerjaan: null, kontak_darurat: null, catatan: null }).select('id,nama').single()
    if (error) return alert(error.message || 'Gagal tambah penghuni')
    setPenghuniOptions(prev => [...prev, data])
    setSelectedPenghuni(data.id)
    setQuickOpen(false)
    setQuickName('')
    setQuickNo('')
  }

  const handleEnd = async () => {
    if (!endId) return
    if (endDate < (data.find(a => a.id === endId)?.tanggal_masuk || '')) return alert('Tanggal keluar tidak boleh sebelum tanggal masuk')
    const ok = await akhiriSewa(endId, endDate)
    if (ok) setOpenEnd(false)
  }

  useEffect(() => {
    if (openStart) {
      setHariTagih(Math.max(1, Math.min(28, pengaturan.hari_tagih_default || new Date().getDate())))
      setDeposit(Number(pengaturan.deposit_default || 0).toLocaleString('id-ID', { maximumFractionDigits: 0 }))
    }
  }, [openStart, pengaturan])

  // Auto-fill price when kamar selected
  useEffect(() => {
    if (!selectedKamar || !user) return
    supabase.from('kamar').select('harga_bulanan').eq('id', selectedKamar).single().then(({ data }) => {
      if (data) setHargaSewa(Number(data.harga_bulanan || 0).toLocaleString('id-ID', { maximumFractionDigits: 0 }))
    })
  }, [selectedKamar, user])

  // Default tagih from tanggal masuk
  useEffect(() => {
    if (tanggalMasuk) {
      const day = parseInt(tanggalMasuk.split('-')[2], 10)
      if (day) setHariTagih(Math.min(28, day))
    }
  }, [tanggalMasuk])

  const gayaTab = (aktifTab) => `px-4 py-2 rounded-xl font-bold text-sm transition ${aktifTab ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'bg-white dark:bg-gray-800 text-emerald-600 dark:text-emerald-300 border border-emerald-100 dark:border-gray-700'}`

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-extrabold text-emerald-800 dark:text-emerald-300">Sewa</h1>
        <button onClick={() => setOpenStart(true)} className="px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition">+ Mulai Sewa</button>
      </div>

      <div className="flex gap-2 mb-4">
        <button onClick={() => setTab('aktif')} className={gayaTab(tab === 'aktif')}>Aktif ({jumlah.aktif})</button>
        <button onClick={() => setTab('riwayat')} className={gayaTab(tab === 'riwayat')}>Riwayat ({jumlah.selesai})</button>
      </div>

      <input
        value={teksCari}
        onChange={e => setTeksCari(e.target.value)}
        placeholder="Cari nama penghuni, nomor HP, atau nomor kamar..."
        className="w-full mb-6 px-4 py-3 rounded-xl bg-emerald-50/60 dark:bg-gray-900 border border-emerald-100 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-400"
      />

      {loading && <div className="text-center py-8 text-emerald-500 dark:text-emerald-400 dark:text-emerald-300">Memuat...</div>}
      {error && <div className="rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-100 dark:border-red-800 text-red-700 dark:text-red-200 px-4 py-3 mb-4">{error}</div>}
      {!loading && !error && total === 0 && (cari
        ? <EmptyState title="Tidak ada sewa yang cocok" desc="Coba ubah kata kunci pencarian." />
        : <EmptyState title={tab === 'aktif' ? 'Belum ada sewa aktif' : 'Belum ada riwayat'} desc="Yuk mulai sewa pertama." />)}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.map(s => (
          <div key={s.id} className="bg-white dark:bg-gray-800/80 backdrop-blur rounded-3xl shadow-md border border-emerald-100 dark:border-gray-700 p-5 transition hover:shadow-xl">
            <div className="flex items-start justify-between gap-3 mb-3">
              <h3 className="font-extrabold text-emerald-800 dark:text-emerald-300 text-lg">Kamar {s.kamar?.nomor || '-'}</h3>
              {tab === 'aktif' && (
                <button onClick={() => { setEndId(s.id); setEndDate(todayStr()); setOpenEnd(true) }} className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-200 text-xs font-bold hover:bg-amber-100 transition">Akhiri Sewa</button>
              )}
            </div>
            <div className="text-sm text-emerald-600 dark:text-emerald-300 mb-1">{s.penghuni?.nama || '-'}</div>
            <div className="text-xs text-emerald-500 dark:text-emerald-400 dark:text-emerald-300 mb-2">{s.penghuni?.no_hp || '-'}</div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="bg-emerald-50 dark:bg-gray-800/50 rounded-xl px-3 py-2"><div className="text-[10px] font-bold text-emerald-400 dark:text-emerald-300 uppercase">Masuk</div><div className="font-bold text-emerald-800 dark:text-emerald-300">{formatTanggal(s.tanggal_masuk)}</div></div>
              {tab === 'riwayat' && s.tanggal_keluar && <div className="bg-amber-50 dark:bg-amber-900/30 rounded-xl px-3 py-2"><div className="text-[10px] font-bold text-amber-400 uppercase">Keluar</div><div className="font-bold text-amber-800 dark:text-amber-200">{formatTanggal(s.tanggal_keluar)}</div></div>}
            </div>
            <div className="text-sm font-bold text-emerald-800 dark:text-emerald-300 mt-3">{formatRupiah(s.harga_sewa)} <span className="text-xs font-normal text-emerald-400 dark:text-emerald-300">/bulan</span></div>
            <div className="text-xs text-emerald-500 dark:text-emerald-400 dark:text-emerald-300">Deposit: {formatRupiah(s.deposit || 0)} &bull; Tagih tiap bulan: {s.hari_tagih}</div>
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

      {/* Start Modal */}
      <Modal open={openStart} onClose={() => setOpenStart(false)} title="Mulai Sewa">
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider mb-1">Kamar <span className="text-red-500">*</span></label>
            <select value={selectedKamar} onChange={e => setSelectedKamar(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-emerald-50/60 dark:bg-gray-900 border border-emerald-100 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-400">
              <option value="">Pilih kamar kosong</option>
              {kamarOptions.map(k => <option key={k.id} value={k.id}>No. {k.nomor}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider mb-1">Penghuni <span className="text-red-500">*</span></label>
            <div className="flex gap-2">
              <select value={selectedPenghuni} onChange={e => setSelectedPenghuni(e.target.value)} className="flex-1 px-4 py-3 rounded-xl bg-emerald-50/60 dark:bg-gray-900 border border-emerald-100 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-400">
                <option value="">Pilih penghuni</option>
                {penghuniOptions.map(p => <option key={p.id} value={p.id}>{p.nama}</option>)}
              </select>
              <button onClick={() => setQuickOpen(true)} className="px-3 py-3 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition">+ Baru</button>
            </div>
            {quickOpen && (
              <div className="mt-2 p-3 rounded-xl bg-emerald-50 dark:bg-gray-800/50 border border-emerald-100 dark:border-gray-700 space-y-2">
                <input value={quickName} onChange={e => setQuickName(e.target.value)} placeholder="Nama" className="w-full px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-emerald-200 dark:border-gray-700 text-sm" />
                <input value={quickNo} onChange={e => setQuickNo(e.target.value)} placeholder="Nomor HP" className="w-full px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-emerald-200 dark:border-gray-700 text-sm" />
                <div className="flex gap-2">
                  <button onClick={handleSaveQuick} className="px-3 py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold">Simpan</button>
                  <button onClick={() => setQuickOpen(false)} className="px-3 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 text-xs font-bold">Batal</button>
                </div>
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider mb-1">Tanggal Masuk <span className="text-red-500">*</span></label>
              <input type="date" value={tanggalMasuk} onChange={e => setTanggalMasuk(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-emerald-50/60 dark:bg-gray-900 border border-emerald-100 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-400" />
            </div>
            <div>
              <label className="block text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider mb-1">Hari Tagih (1-28)</label>
              <input type="number" min={1} max={28} value={hariTagih} onChange={e => setHariTagih(Math.min(28, Math.max(1, parseInt(e.target.value || 1))))} className="w-full px-4 py-3 rounded-xl bg-emerald-50/60 dark:bg-gray-900 border border-emerald-100 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-400" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider mb-1">Harga Sewa <span className="text-red-500">*</span></label>
            <input type="text" value={hargaSewa} onChange={e => { const raw = e.target.value.replace(/[^0-9]/g, ''); setHargaSewa(raw ? Number(raw).toLocaleString('id-ID', { maximumFractionDigits: 0 }) : '') }} className="w-full px-4 py-3 rounded-xl bg-emerald-50/60 dark:bg-gray-900 border border-emerald-100 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-400" placeholder="1500000" />
          </div>
          <div>
            <label className="block text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider mb-1">Deposit</label>
            <input type="text" value={deposit} onChange={e => { const raw = e.target.value.replace(/[^0-9]/g, ''); setDeposit(raw ? Number(raw).toLocaleString('id-ID', { maximumFractionDigits: 0 }) : '') }} className="w-full px-4 py-3 rounded-xl bg-emerald-50/60 dark:bg-gray-900 border border-emerald-100 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-400" placeholder="0" />
          </div>
          <button onClick={handleStart} className="w-full py-3 rounded-xl bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition">Mulai Sewa</button>
        </div>
      </Modal>

      {/* End Modal */}
      <Modal open={openEnd} onClose={() => setOpenEnd(false)} title="Akhiri Sewa">
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider mb-1">Tanggal Keluar <span className="text-red-500">*</span></label>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-emerald-50/60 dark:bg-gray-900 border border-emerald-100 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-400" />
          </div>
          <button onClick={handleEnd} className="w-full py-3 rounded-xl bg-amber-50 dark:bg-amber-900/300 text-white font-bold shadow-lg shadow-amber-200 hover:bg-amber-600 transition">Konfirmasi Akhiri</button>
        </div>
      </Modal>
    </div>
  )
}