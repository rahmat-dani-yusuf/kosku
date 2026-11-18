import { useState, useEffect, useMemo, useCallback } from 'react'
import { useAuth } from '../hooks/useAuth.jsx'
import { usePenghuniHalaman } from '../hooks/usePenghuniHalaman.js'
import { usePengaturan } from '../hooks/usePengaturan.jsx'
import { useProfil } from '../hooks/useProfil.jsx'
import { normalisasiNomor, buatLinkWA } from '../lib/whatsapp.js'
import { supabase } from '../lib/supabaseClient.js'
import Modal from '../components/Modal.jsx'
import ConfirmDialog from '../components/ConfirmDialog.jsx'
import EmptyState from '../components/EmptyState.jsx'
import Pagination from '../components/Pagination.jsx'
import { useToast } from '../components/Toast.jsx'
import { umumkanDataBerubah, dengarDataBerubah } from '../lib/events.js'
import { DEFAULT_PER_HALAMAN, hitungTotalHalaman } from '../lib/paginasi.js'

function validateNoHP(str) {
  const cleaned = String(str || '').replace(/[\s\-+]/g, '').replace(/\D/g, '')
  if (!cleaned) return 'Nomor HP wajib diisi'
  if (cleaned.length < 10 || cleaned.length > 14) return 'Panjang nomor harus 10-14 digit'
  if (!cleaned.startsWith('08') && !cleaned.startsWith('62')) return 'Harus diawali 08 atau 62'
  return null
}

export default function Penghuni() {
  const { user } = useAuth()
  const { show } = useToast()
  const { pengaturan } = usePengaturan()
  const profil = useProfil()
  const [halaman, setHalaman] = useState(1)
  const [perHalaman, setPerHalaman] = useState(DEFAULT_PER_HALAMAN)
  const [teksCari, setTeksCari] = useState('')
  const [cari, setCari] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState({ nama: '', no_hp: '', pekerjaan: '', kontak_darurat: '', catatan: '' })
  const [activeSewa, setActiveSewa] = useState({})
  const [ringkasan, setRingkasan] = useState({ total: 0, aktif: 0 })

  const { data: list, total, loading, error } = usePenghuniHalaman({ halaman, perHalaman, cari })

  // Debounce pencarian 300 ms
  useEffect(() => {
    const t = setTimeout(() => setCari(teksCari.trim()), 300)
    return () => clearTimeout(t)
  }, [teksCari])

  // Saat cari atau perHalaman berubah, kembali ke halaman 1
  useEffect(() => { setHalaman(1) }, [cari, perHalaman])

  // Ringkasan jumlah: menghitung SELURUH data, bukan hanya halaman tampil
  const muatRingkasan = useCallback(async () => {
    if (!user) return
    const [{ count: tot }, { data: sewaAktif }] = await Promise.all([
      supabase.from('penghuni').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('sewa').select('penghuni_id').eq('user_id', user.id).eq('status', 'aktif')
    ])
    const unik = new Set((sewaAktif || []).map(s => s.penghuni_id).filter(Boolean))
    setRingkasan({ total: tot || 0, aktif: unik.size })
  }, [user])

  useEffect(() => { muatRingkasan() }, [muatRingkasan])
  useEffect(() => dengarDataBerubah(muatRingkasan), [muatRingkasan])

  useEffect(() => {
    if (!user || !list.length) { setActiveSewa({}); return }
    const ids = list.map(p => p.id)
    supabase.from('sewa').select('penghuni_id,kamar_id,kamar:kamar_id(nomor)').eq('user_id', user.id).eq('status', 'aktif').in('penghuni_id', ids).then(({ data }) => {
      const m = {}
      ;(data || []).forEach(s => { if (s.penghuni_id) m[s.penghuni_id] = s.kamar?.nomor || '-' })
      setActiveSewa(m)
    })
  }, [list, user])

  const counts = useMemo(() => ({
    total: ringkasan.total,
    aktif: ringkasan.aktif,
    tidak: Math.max(0, ringkasan.total - ringkasan.aktif),
  }), [ringkasan])

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

  const tambah = async (payload) => {
    try {
      const { error: err } = await supabase.from('penghuni').insert({ ...payload, user_id: user.id })
      if (err) throw err
      umumkanDataBerubah()
      show('Penghuni berhasil ditambahkan', 'success')
      return true
    } catch (e) {
      show(e.message || 'Gagal menambahkan penghuni', 'error')
      return false
    }
  }

  const ubah = async (id, payload) => {
    try {
      const { error: err } = await supabase.from('penghuni').update(payload).eq('id', id).eq('user_id', user.id)
      if (err) throw err
      umumkanDataBerubah()
      show('Penghuni berhasil diubah', 'success')
      return true
    } catch (e) {
      show(e.message || 'Gagal mengubah penghuni', 'error')
      return false
    }
  }

  const hapus = async (id) => {
    try {
      const { data: aktif } = await supabase.from('sewa').select('id').eq('penghuni_id', id).eq('status', 'aktif').limit(1)
      if (aktif && aktif.length > 0) {
        show('Penghuni ini masih memiliki sewa aktif, akhiri sewa dulu', 'error')
        return false
      }
      const { data: riwayat } = await supabase.from('sewa').select('id').eq('penghuni_id', id).limit(1)
      if (riwayat && riwayat.length > 0) {
        show('Penghuni ini memiliki riwayat sewa dan tidak bisa dihapus', 'error')
        return false
      }
      const { error: err } = await supabase.from('penghuni').delete().eq('id', id).eq('user_id', user.id)
      if (err) throw err
      umumkanDataBerubah()
      show('Penghuni berhasil dihapus', 'success')
      return true
    } catch (e) {
      show(e.message || 'Gagal menghapus penghuni', 'error')
      return false
    }
  }

  const openDelete = (p) => { setEditId(p.id); setConfirmOpen(true) }
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
        <input value={teksCari} onChange={e => setTeksCari(e.target.value)} placeholder="Cari nama, nomor HP, atau pekerjaan..." className="w-full px-4 py-3 rounded-xl bg-white border border-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-400" />
      </div>

      {loading && <div className="text-center py-8 text-emerald-500">Memuat...</div>}
      {error && <div className="rounded-xl bg-red-50 border border-red-100 text-red-700 px-4 py-3 mb-4">{error}</div>}
      {!loading && total === 0 && (cari
        ? <EmptyState title="Tidak ada penghuni yang cocok" desc="Coba ubah kata kunci pencarian." />
        : <EmptyState title="Belum ada penghuni" desc="Yuk tambahkan yang pertama." />)}

      <div className="space-y-3">
        {list.map(p => (
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

      <Pagination
        halaman={halaman}
        perHalaman={perHalaman}
        total={total}
        onUbahHalaman={setHalaman}
        onUbahPerHalaman={setPerHalaman}
        loading={loading}
      />

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
