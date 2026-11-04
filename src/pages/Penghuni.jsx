import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '../hooks/useAuth.jsx'
import { usePenghuni } from '../hooks/usePenghuni.jsx'
import { usePengaturan } from '../hooks/usePengaturan.jsx'
import { useProfil } from '../hooks/useProfil.jsx'
import { normalisasiNomor, buatLinkWA } from '../lib/whatsapp.js'
import { supabase } from '../lib/supabaseClient.js'
import Modal from '../components/Modal.jsx'
import ConfirmDialog from '../components/ConfirmDialog.jsx'
import EmptyState from '../components/EmptyState.jsx'

function validateNoHP(str) {
  const cleaned = String(str || '').replace(/[\s\-+]/g, '').replace(/\D/g, '')
  if (!cleaned) return 'Nomor HP wajib diisi'
  if (cleaned.length < 10 || cleaned.length > 14) return 'Panjang nomor harus 10-14 digit'
  if (!cleaned.startsWith('08') && !cleaned.startsWith('62')) return 'Harus diawali 08 atau 62'
  return null
}

export default function Penghuni() {
  const { user } = useAuth()
  const { data: list, loading, error, reload, tambah, ubah, hapus } = usePenghuni()
  const { pengaturan } = usePengaturan()
  const profil = useProfil()
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState({ nama: '', no_hp: '', pekerjaan: '', kontak_darurat: '', catatan: '' })
  const [activeSewa, setActiveSewa] = useState({})

  useEffect(() => {
    if (!user || !list.length) { setActiveSewa({}); return }
    const ids = list.map(p => p.id)
    supabase.from('sewa').select('penghuni_id,kamar_id,kamar:kamar_id(nomor)').eq('user_id', user.id).eq('status', 'aktif').in('penghuni_id', ids).then(({ data }) => {
      const m = {}
      ;(data || []).forEach(s => { if (s.penghuni_id) m[s.penghuni_id] = s.kamar?.nomor || '-' })
      setActiveSewa(m)
    })
  }, [list, user])

  const filtered = useMemo(() => {
    const kw = search.toLowerCase()
    return list.filter(p =>
      (p.nama || '').toLowerCase().includes(kw) ||
      (p.no_hp || '').toLowerCase().includes(kw)
    )
  }, [list, search])

  const counts = useMemo(() => ({
    total: list.length,
    aktif: list.filter(p => activeSewa[p.id]).length,
    tidak: list.filter(p => !activeSewa[p.id]).length,
  }), [list, activeSewa])

  const openAdd = () => { setEditId(null); setForm({ nama: '', no_hp: '', pekerjaan: '', kontak_darurat: '', catatan: '' }); setModalOpen(true) }
  const openEdit = (p) => { setEditId(p.id); setForm({ nama: p.nama || '', no_hp: p.no_hp || '', pekerjaan: p.pekerjaan || '', kontak_darurat: p.kontak_darurat || '', catatan: p.catatan || '' }); setModalOpen(true) }

  const handleSave = async () => {
    if (!form.nama.trim()) return alert('Nama wajib diisi')
    const errNo = validateNoHP(form.no_hp)
    if (errNo) return alert(errNo)
    const payload = {
      nama: form.nama.trim(),
      no_hp: normalisasiNomor(form.no_hp),
      pekerjaan: form.pekerjaan.trim() || null,
      kontak_darurat: form.kontak_darurat.trim() || null,
      catatan: form.catatan.trim() || null,
    }
    if (editId) await ubah(editId, payload)
    else await tambah(payload)
    setModalOpen(false)
  }

  const openDelete = (p) => { setEditId(p.id); setConfirmOpen(true) }
  const doDelete = async () => { if (editId) await hapus(editId); setConfirmOpen(false) }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-extrabold text-emerald-800">Penghuni</h1>
        <button onClick={openAdd} className="px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition">+ Tambah</button>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { label: 'Total', val: counts.total, bg: 'bg-emerald-600 text-white' },
          { label: 'Aktif', val: counts.aktif, bg: 'bg-blue-50 text-blue-700 border border-blue-100' },
          { label: 'Tidak aktif', val: counts.tidak, bg: 'bg-amber-50 text-amber-700 border border-amber-100' },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl p-4 shadow-sm ${s.bg}`}>
            <div className="text-xs font-semibold opacity-80">{s.label}</div>
            <div className="text-2xl font-extrabold">{s.val}</div>
          </div>
        ))}
      </div>

      <div className="mb-4">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari nama atau nomor HP..." className="w-full px-4 py-3 rounded-xl bg-white border border-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-400" />
      </div>

      {loading && <div className="text-center py-8 text-emerald-500">Memuat...</div>}
      {error && <div className="rounded-xl bg-red-50 border border-red-100 text-red-700 px-4 py-3 mb-4">{error}</div>}
      {!loading && filtered.length === 0 && <EmptyState title="Belum ada penghuni" desc="Yuk tambahkan yang pertama." />}

      <div className="space-y-3">
        {filtered.map(p => (
          <div key={p.id} className="bg-white/80 backdrop-blur rounded-3xl shadow-md border border-emerald-100 p-5 transition hover:shadow-lg">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="font-extrabold text-lg text-emerald-800">{p.nama}</div>
                <div className="text-sm text-emerald-600">{p.no_hp || '-'}</div>
                {p.pekerjaan && <div className="text-xs text-emerald-500 mt-0.5">{p.pekerjaan}</div>}
                <div className="mt-2 flex flex-wrap gap-2">
                  {activeSewa[p.id] ? (
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">Aktif di kamar {activeSewa[p.id]}</span>
                  ) : (
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-100">Tidak aktif</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a href={buatLinkWA(p.no_hp, `Halo ${p.nama}`)} target="_blank" rel="noopener noreferrer" className="px-3 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition">Chat WA</a>
                <button onClick={() => openEdit(p)} className="px-3 py-2 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold hover:bg-emerald-100 transition">Ubah</button>
                {activeSewa[p.id] && (
                  pengaturan.aturan_kos ? (
                    <a href={buatLinkWA(p.no_hp, `Halo ${p.nama}, berikut aturan kos ${profil?.nama_kos || 'kami'}:\n${pengaturan.aturan_kos || ''}`)} target="_blank" rel="noopener noreferrer" className="px-3 py-2 rounded-xl bg-blue-50 text-blue-700 text-xs font-bold hover:bg-blue-100 transition">Aturan WA</a>
                  ) : (
                    <span className="px-3 py-2 rounded-xl bg-gray-100 text-gray-400 text-xs font-bold" title="Aturan kos belum diisi">Aturan WA</span>
                  )
                )}
                <button onClick={() => openDelete(p)} className="px-3 py-2 rounded-xl bg-red-50 text-red-600 text-xs font-bold hover:bg-red-100 transition">Hapus</button>
              </div>
            </div>
            {p.kontak_darurat && <div className="text-xs text-emerald-500 mt-2">Kontak darurat: {p.kontak_darurat}</div>}
            {p.catatan && <div className="text-xs text-emerald-400 mt-1">Catatan: {p.catatan}</div>}
          </div>
        ))}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Ubah Penghuni' : 'Tambah Penghuni'}>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">Nama <span className="text-red-500">*</span></label>
            <input value={form.nama} onChange={e => setForm({...form, nama: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-emerald-50/60 border border-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-400" placeholder="Nama lengkap" required />
          </div>
          <div>
            <label className="block text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">Nomor HP <span className="text-red-500">*</span></label>
            <input value={form.no_hp} onChange={e => setForm({...form, no_hp: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-emerald-50/60 border border-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-400" placeholder="Contoh: 0812 3456 7890" />
          </div>
          <div>
            <label className="block text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">Pekerjaan</label>
            <input value={form.pekerjaan} onChange={e => setForm({...form, pekerjaan: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-emerald-50/60 border border-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-400" placeholder="Contoh: Mahasiswa" />
          </div>
          <div>
            <label className="block text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">Kontak Darurat</label>
            <input value={form.kontak_darurat} onChange={e => setForm({...form, kontak_darurat: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-emerald-50/60 border border-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-400" placeholder="Nama / Nomor" />
          </div>
          <div>
            <label className="block text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">Catatan</label>
            <textarea value={form.catatan} onChange={e => setForm({...form, catatan: e.target.value})} rows={2} className="w-full px-4 py-3 rounded-xl bg-emerald-50/60 border border-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-400" placeholder="Catatan tambahan" />
          </div>
          <button onClick={handleSave} className="w-full py-3 rounded-xl bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition">Simpan</button>
        </div>
      </Modal>

      <ConfirmDialog open={confirmOpen} title="Hapus Penghuni" message="Anda yakin ingin menghapus penghuni ini?" onConfirm={doDelete} onCancel={() => setConfirmOpen(false)} />
    </div>
  )
}
