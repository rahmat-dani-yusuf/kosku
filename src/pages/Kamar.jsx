import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../hooks/useAuth.jsx'
import { useKamarHalaman } from '../hooks/useKamarHalaman.js'
import { formatRupiah, parseRupiah } from '../lib/format.js'
import Modal from '../components/Modal.jsx'
import ConfirmDialog from '../components/ConfirmDialog.jsx'
import EmptyState from '../components/EmptyState.jsx'
import Pagination from '../components/Pagination.jsx'
import { useToast } from '../components/Toast.jsx'
import { supabase } from '../lib/supabaseClient.js'
import { umumkanDataBerubah, dengarDataBerubah } from '../lib/events.js'
import { DEFAULT_PER_HALAMAN, hitungTotalHalaman } from '../lib/paginasi.js'

export default function Kamar() {
  const { user } = useAuth()
  const { show } = useToast()
  const [halaman, setHalaman] = useState(1)
  const [perHalaman, setPerHalaman] = useState(DEFAULT_PER_HALAMAN)
  const [teksCari, setTeksCari] = useState('')
  const [cari, setCari] = useState('')
  const [status, setStatus] = useState('semua')
  const [modalOpen, setModalOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState({ nomor: '', tipe: '', harga_bulanan: '', fasilitas: '', status: 'kosong' })
  const [tenants, setTenants] = useState({})
  const [counts, setCounts] = useState({ total: 0, kosong: 0, terisi: 0, perbaikan: 0 })

  const { data: kamarList, total, loading, error } = useKamarHalaman({ halaman, perHalaman, cari, status })

  // Debounce pencarian 300 ms
  useEffect(() => {
    const t = setTimeout(() => setCari(teksCari.trim()), 300)
    return () => clearTimeout(t)
  }, [teksCari])

  // Saat cari, filter, atau perHalaman berubah, kembali ke halaman 1
  useEffect(() => { setHalaman(1) }, [cari, status, perHalaman])

  // Ringkasan jumlah per status: menghitung SELURUH data, bukan hanya halaman tampil
  const muatRingkasan = useCallback(async () => {
    if (!user) return
    const ambil = async (st) => {
      let q = supabase.from('kamar').select('id', { count: 'exact', head: true }).eq('user_id', user.id)
      if (st) q = q.eq('status', st)
      const { count } = await q
      return count || 0
    }
    const [t, kosong, terisi, perbaikan] = await Promise.all([
      ambil(null), ambil('kosong'), ambil('terisi'), ambil('perbaikan')
    ])
    setCounts({ total: t, kosong, terisi, perbaikan })
  }, [user])

  useEffect(() => { muatRingkasan() }, [muatRingkasan])
  useEffect(() => dengarDataBerubah(muatRingkasan), [muatRingkasan])

  useEffect(() => {
    if (!user || !kamarList.length) return
    const ids = kamarList.filter(r => r.status === 'terisi').map(r => r.id)
    if (!ids.length) { setTenants({}); return }
    supabase.from('sewa').select('kamar_id, penghinis:penghuni!penghuni_id(nama)').eq('user_id', user.id).eq('status', 'aktif').in('kamar_id', ids).then(({ data }) => {
      const m = {}
      ;(data || []).forEach(s => { if (s.kamar_id) m[s.kamar_id] = s.penghinis?.nama || 'Penhuni aktif' })
      setTenants(m)
    })
  }, [kamarList, user])

  const openAdd = () => {
    setEditId(null)
    setForm({ nomor: '', tipe: '', harga_bulanan: '', fasilitas: '', status: 'kosong' })
    setModalOpen(true)
  }

  const openEdit = (k) => {
    setEditId(k.id)
    // Check active sewa for status lock
    setForm({
      nomor: k.nomor || '',
      tipe: k.tipe || '',
      harga_bulanan: k.harga_bulanan != null ? Number(k.harga_bulanan).toLocaleString('id-ID', { maximumFractionDigits: 0 }) : '',
      fasilitas: k.fasilitas || '',
      status: k.status || 'kosong'
    })
    setModalOpen(true)
  }

  const handleSave = async () => {
    const nomor = form.nomor.trim()
    if (!nomor) return alert('Nomor kamar wajib diisi')
    const harga = parseRupiah(form.harga_bulanan)
    if (isNaN(harga) || harga < 0) return alert('Harga bulanan wajib dan tidak boleh negatif')
    const payload = {
      nomor,
      tipe: form.tipe.trim() || null,
      harga_bulanan: harga,
      fasilitas: form.fasilitas.trim() || null,
      status: form.status
    }
    if (editId) {
      await ubah(editId, payload)
    } else {
      await tambah(payload)
    }
    setModalOpen(false)
  }

  const tambah = async (payload) => {
    try {
      const { error: err } = await supabase.from('kamar').insert({
        ...payload,
        user_id: user.id,
        status: payload.status || 'kosong'
      })
      if (err) {
        if (err.message?.includes('duplicate') || err.code === '23505') throw new Error('Nomor kamar sudah digunakan')
        throw err
      }
      umumkanDataBerubah()
      show('Kamar berhasil ditambahkan', 'success')
      return true
    } catch (e) {
      show(e.message || 'Gagal menambahkan kamar', 'error')
      return false
    }
  }

  const ubah = async (id, payload) => {
    try {
      const { error: err } = await supabase.from('kamar').update(payload).eq('id', id).eq('user_id', user.id)
      if (err) {
        if (err.message?.includes('duplicate') || err.code === '23505') throw new Error('Nomor kamar sudah digunakan')
        throw err
      }
      umumkanDataBerubah()
      show('Kamar berhasil diubah', 'success')
      return true
    } catch (e) {
      show(e.message || 'Gagal mengubah kamar', 'error')
      return false
    }
  }

  const hapus = async (id) => {
    try {
      const { data: sewaCheck } = await supabase.from('sewa').select('id').eq('kamar_id', id).limit(1)
      if (sewaCheck && sewaCheck.length > 0) {
        show('Kamar ini masih memiliki data sewa', 'error')
        return false
      }
      const { error: err } = await supabase.from('kamar').delete().eq('id', id).eq('user_id', user.id)
      if (err) throw err
      umumkanDataBerubah()
      show('Kamar berhasil dihapus', 'success')
      return true
    } catch (e) {
      show(e.message || 'Gagal menghapus kamar', 'error')
      return false
    }
  }

  const openDelete = (k) => { setEditId(k.id); setConfirmOpen(true) }
  const doDelete = async () => {
    if (editId) {
      const ok = await hapus(editId)
      // Jika halaman saat ini menjadi kosong, mundur ke halaman terakhir yang masih ada
      if (ok) {
        const akhir = hitungTotalHalaman(Math.max(0, total - 1), perHalaman)
        if (halaman > akhir) setHalaman(akhir)
      }
    }
    setConfirmOpen(false)
  }

  const statusColor = (s) => s === 'kosong' ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-gray-700' : s === 'terisi' ? 'bg-blue-100 text-blue-800 border-blue-200' : 'bg-amber-100 text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-800'
  const statusLabel = (s) => s === 'kosong' ? 'Kosong' : s === 'terisi' ? 'Terisi' : 'Perbaikan'

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-extrabold text-emerald-800 dark:text-emerald-300">Kamar</h1>
        <button onClick={openAdd} className="px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-200 transition hover:bg-emerald-700">+ Tambah Kamar</button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total', val: counts.total, bg: 'bg-emerald-600 text-white' },
          { label: 'Kosong', val: counts.kosong, bg: 'bg-emerald-50 dark:bg-gray-800/50 text-emerald-700 dark:text-emerald-300 border border-emerald-100 dark:border-gray-700' },
          { label: 'Terisi', val: counts.terisi, bg: 'bg-blue-50 text-blue-700 border border-blue-100' },
          { label: 'Perbaikan', val: counts.perbaikan, bg: 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-200 border border-amber-100 dark:border-amber-800' },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl p-4 shadow-sm ${s.bg}`}>
            <div className="text-xs font-semibold opacity-80">{s.label}</div>
            <div className="text-2xl font-extrabold">{s.val}</div>
          </div>
        ))}
      </div>

      {/* Pencarian & filter status */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          value={teksCari}
          onChange={e => setTeksCari(e.target.value)}
          placeholder="Cari nomor atau tipe kamar..."
          className="flex-1 px-4 py-3 rounded-xl bg-emerald-50/60 dark:bg-gray-900 border border-emerald-100 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-400"
        />
        <select
          value={status}
          onChange={e => setStatus(e.target.value)}
          className="px-4 py-3 rounded-xl bg-emerald-50/60 dark:bg-gray-900 border border-emerald-100 dark:border-gray-700 font-semibold text-emerald-800 dark:text-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-400"
        >
          <option value="semua">Semua status</option>
          <option value="kosong">Kosong</option>
          <option value="terisi">Terisi</option>
          <option value="perbaikan">Perbaikan</option>
        </select>
      </div>

      {loading && <div className="text-center py-8 text-emerald-500 dark:text-emerald-400 dark:text-emerald-300">Memuat...</div>}
      {error && <div className="rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-100 dark:border-red-800 text-red-700 dark:text-red-200 px-4 py-3 mb-4">{error}</div>}

      {!loading && total === 0 && (cari || status !== 'semua'
        ? <EmptyState title="Tidak ada kamar yang cocok" desc="Coba ubah kata kunci atau filter." />
        : <EmptyState title="Belum ada kamar" desc="Yuk tambahkan yang pertama." />)}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {kamarList.map(k => (
          <div key={k.id} className={`rounded-3xl border shadow-lg bg-white dark:bg-gray-800/80 backdrop-blur p-5 transition hover:shadow-xl ${statusColor(k.status)} border-opacity-60`}>
            <div className="flex items-start justify-between mb-2">
              <div className="font-extrabold text-xl">No. {k.nomor}</div>
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${statusColor(k.status)}`}>{statusLabel(k.status)}</span>
            </div>
            <div className="text-sm text-emerald-600 dark:text-emerald-300 mb-1">{k.tipe || '-'}</div>
            <div className="text-lg font-bold text-emerald-800 dark:text-emerald-300 mb-1">{formatRupiah(k.harga_bulanan)}<span className="text-xs font-normal text-emerald-400 dark:text-emerald-300">/bulan</span></div>
            <div className="text-sm text-emerald-500 dark:text-emerald-400 dark:text-emerald-300 mb-2">Fasilitas: {k.fasilitas || '-'}</div>
            {k.status === 'terisi' && tenants[k.id] && (
              <div className="text-sm font-medium text-blue-700 bg-blue-50 rounded-xl px-3 py-2 mb-3 border border-blue-100">Penghuni aktif: {tenants[k.id]}</div>
            )}
            <div className="flex gap-2 mt-3">
              <button onClick={() => openEdit(k)} className="flex-1 py-2 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 transition">Ubah</button>
              <button onClick={() => openDelete(k)} className="flex-1 py-2 rounded-xl bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-300 text-sm font-bold hover:bg-red-100 transition">Hapus</button>
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Ubah Kamar' : 'Tambah Kamar'}>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider mb-1">Nomor <span className="text-red-500">*</span></label>
            <input value={form.nomor} onChange={e => setForm({ ...form, nomor: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-emerald-50/60 dark:bg-gray-900 border border-emerald-100 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-400" placeholder="Contoh: 101" required />
          </div>
          <div>
            <label className="block text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider mb-1">Tipe</label>
            <input value={form.tipe} onChange={e => setForm({ ...form, tipe: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-emerald-50/60 dark:bg-gray-900 border border-emerald-100 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-400" placeholder="Contoh: Kamar mandi dalam" />
          </div>
          <div>
            <label className="block text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider mb-1">Harga Bulanan <span className="text-red-500">*</span></label>
            <input type="text" value={form.harga_bulanan} onChange={e => {
              const raw = e.target.value.replace(/[^0-9]/g, '')
              const num = Number(raw) || 0
              setForm({ ...form, harga_bulanan: num ? num.toLocaleString('id-ID', { maximumFractionDigits: 0 }) : '' })
            }} className="w-full px-4 py-3 rounded-xl bg-emerald-50/60 dark:bg-gray-900 border border-emerald-100 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-400" placeholder="1500000" />
          </div>
          <div>
            <label className="block text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider mb-1">Fasilitas</label>
            <input value={form.fasilitas} onChange={e => setForm({ ...form, fasilitas: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-emerald-50/60 dark:bg-gray-900 border border-emerald-100 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-400" placeholder="AC, WiFi, TV" />
          </div>
          <div>
            <label className="block text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider mb-1">Status</label>
            <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-emerald-50/60 dark:bg-gray-900 border border-emerald-100 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-400">
              <option value="kosong">Kosong</option>
              <option value="perbaikan">Perbaikan</option>
            </select>
          </div>
          <button onClick={handleSave} className="w-full py-3 rounded-xl bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition">Simpan</button>
        </div>
      </Modal>

      <ConfirmDialog open={confirmOpen} title="Hapus Kamar" message="Anda yakin ingin menghapus kamar ini?" onConfirm={doDelete} onCancel={() => setConfirmOpen(false)} />
    </div>
  )
}
