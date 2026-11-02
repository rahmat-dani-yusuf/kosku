import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '../hooks/useAuth.jsx'
import { useKamar } from '../hooks/useKamar.jsx'
import { formatRupiah, parseRupiah } from '../lib/format.js'
import Modal from '../components/Modal.jsx'
import ConfirmDialog from '../components/ConfirmDialog.jsx'
import EmptyState from '../components/EmptyState.jsx'
import { supabase } from '../lib/supabaseClient.js'

export default function Kamar() {
  const { user } = useAuth()
  const { data: kamarList, loading, error, reload, tambah, ubah, hapus } = useKamar()
  const [modalOpen, setModalOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState({ nomor: '', tipe: '', harga_bulanan: '', fasilitas: '', status: 'kosong' })
  const [tenants, setTenants] = useState({})

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

  const counts = useMemo(() => ({
    total: kamarList.length,
    kosong: kamarList.filter(r => r.status === 'kosong').length,
    terisi: kamarList.filter(r => r.status === 'terisi').length,
    perbaikan: kamarList.filter(r => r.status === 'perbaikan').length,
  }), [kamarList])

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

  const openDelete = (k) => { setEditId(k.id); setConfirmOpen(true) }
  const doDelete = async () => { if (editId) await hapus(editId); setConfirmOpen(false) }

  const statusColor = (s) => s === 'kosong' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : s === 'terisi' ? 'bg-blue-100 text-blue-800 border-blue-200' : 'bg-amber-100 text-amber-800 border-amber-200'
  const statusLabel = (s) => s === 'kosong' ? 'Kosong' : s === 'terisi' ? 'Terisi' : 'Perbaikan'

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-extrabold text-emerald-800">Kamar</h1>
        <button onClick={openAdd} className="px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-200 transition hover:bg-emerald-700">+ Tambah Kamar</button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total', val: counts.total, bg: 'bg-emerald-600 text-white' },
          { label: 'Kosong', val: counts.kosong, bg: 'bg-emerald-50 text-emerald-700 border border-emerald-100' },
          { label: 'Terisi', val: counts.terisi, bg: 'bg-blue-50 text-blue-700 border border-blue-100' },
          { label: 'Perbaikan', val: counts.perbaikan, bg: 'bg-amber-50 text-amber-700 border border-amber-100' },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl p-4 shadow-sm ${s.bg}`}>
            <div className="text-xs font-semibold opacity-80">{s.label}</div>
            <div className="text-2xl font-extrabold">{s.val}</div>
          </div>
        ))}
      </div>

      {loading && <div className="text-center py-8 text-emerald-500">Memuat...</div>}
      {error && <div className="rounded-xl bg-red-50 border border-red-100 text-red-700 px-4 py-3 mb-4">{error}</div>}

      {!loading && kamarList.length === 0 && <EmptyState title="Belum ada kamar" desc="Yuk tambahkan yang pertama." />}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {kamarList.map(k => (
          <div key={k.id} className={`rounded-3xl border shadow-lg bg-white/80 backdrop-blur p-5 transition hover:shadow-xl ${statusColor(k.status)} border-opacity-60`}>
            <div className="flex items-start justify-between mb-2">
              <div className="font-extrabold text-xl">No. {k.nomor}</div>
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${statusColor(k.status)}`}>{statusLabel(k.status)}</span>
            </div>
            <div className="text-sm text-emerald-600 mb-1">{k.tipe || '-'}</div>
            <div className="text-lg font-bold text-emerald-800 mb-1">{formatRupiah(k.harga_bulanan)}<span className="text-xs font-normal text-emerald-400">/bulan</span></div>
            <div className="text-sm text-emerald-500 mb-2">Fasilitas: {k.fasilitas || '-'}</div>
            {k.status === 'terisi' && tenants[k.id] && (
              <div className="text-sm font-medium text-blue-700 bg-blue-50 rounded-xl px-3 py-2 mb-3 border border-blue-100">Penghuni aktif: {tenants[k.id]}</div>
            )}
            <div className="flex gap-2 mt-3">
              <button onClick={() => openEdit(k)} className="flex-1 py-2 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 transition">Ubah</button>
              <button onClick={() => openDelete(k)} className="flex-1 py-2 rounded-xl bg-red-50 text-red-600 text-sm font-bold hover:bg-red-100 transition">Hapus</button>
            </div>
          </div>
        ))}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Ubah Kamar' : 'Tambah Kamar'}>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">Nomor <span className="text-red-500">*</span></label>
            <input value={form.nomor} onChange={e => setForm({ ...form, nomor: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-emerald-50/60 border border-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-400" placeholder="Contoh: 101" required />
          </div>
          <div>
            <label className="block text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">Tipe</label>
            <input value={form.tipe} onChange={e => setForm({ ...form, tipe: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-emerald-50/60 border border-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-400" placeholder="Contoh: Kamar mandi dalam" />
          </div>
          <div>
            <label className="block text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">Harga Bulanan <span className="text-red-500">*</span></label>
            <input type="text" value={form.harga_bulanan} onChange={e => {
              const raw = e.target.value.replace(/[^0-9]/g, '')
              const num = Number(raw) || 0
              setForm({ ...form, harga_bulanan: num ? num.toLocaleString('id-ID', { maximumFractionDigits: 0 }) : '' })
            }} className="w-full px-4 py-3 rounded-xl bg-emerald-50/60 border border-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-400" placeholder="1500000" />
          </div>
          <div>
            <label className="block text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">Fasilitas</label>
            <input value={form.fasilitas} onChange={e => setForm({ ...form, fasilitas: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-emerald-50/60 border border-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-400" placeholder="AC, WiFi, TV" />
          </div>
          <div>
            <label className="block text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">Status</label>
            <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-emerald-50/60 border border-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-400">
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
