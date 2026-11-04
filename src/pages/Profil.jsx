import { useState } from 'react'
import { useAuth } from '../hooks/useAuth.jsx'
import { useProfil } from '../hooks/useProfil.jsx'
import { normalisasiNomor } from '../lib/whatsapp.js'
import { supabase } from '../lib/supabaseClient.js'
import { useToast } from '../components/Toast.jsx'
import { Link } from 'react-router-dom'
import TombolPasang from '../components/TombolPasang.jsx'
import ConfirmDialog from '../components/ConfirmDialog.jsx'

export default function Profil() {
  const { user, signOut } = useAuth()
  const { profil, loading, refresh } = useProfil()
  const { show } = useToast()
  const [namaPemilik, setNamaPemilik] = useState('')
  const [namaKos, setNamaKos] = useState('')
  const [alamat, setAlamat] = useState('')
  const [noWa, setNoWa] = useState('')
  const [pwBaru, setPwBaru] = useState('')
  const [pwKonf, setPwKonf] = useState('')
  const [openConfirm, setOpenConfirm] = useState(false)
  const [saving, setSaving] = useState(false)

  const init = () => {
    setNamaPemilik(profil?.nama_pemilik || '')
    setNamaKos(profil?.nama_kos || '')
    setAlamat(profil?.alamat || '')
    setNoWa(profil?.no_wa || '')
  }

  useState(() => { init() }, [profil])

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    try {
      const waClean = normalisasiNomor(noWa)
      const { error: err } = await supabase.from('profiles').upsert({
        id: user.id,
        nama_pemilik: namaPemilik.trim() || null,
        nama_kos: namaKos.trim() || null,
        alamat: alamat.trim() || null,
        no_wa: waClean || null,
      })
      if (err) throw err
      await refresh()
      show('Profil berhasil diperbarui', 'success')
    } catch (e) {
      show(e.message || 'Gagal menyimpan profil', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handlePassword = async () => {
    if (pwBaru.length < 6) return show('Password minimal 6 karakter', 'error')
    if (pwBaru !== pwKonf) return show('Konfirmasi password tidak cocok', 'error')
    try {
      const { error } = await supabase.auth.updateUser({ password: pwBaru })
      if (error) throw error
      setPwBaru('')
      setPwKonf('')
      show('Kata sandi berhasil diubah', 'success')
    } catch (e) {
      show(e.message || 'Gagal mengubah kata sandi', 'error')
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-emerald-50"><div className="w-10 h-10 border-4 border-emerald-300 border-t-emerald-600 rounded-full animate-spin"/></div>

  return (
    <div className="bg-white/80 backdrop-blur rounded-3xl shadow-xl border border-emerald-100 p-8 md:p-10">
      <h1 className="text-2xl font-extrabold text-emerald-800 mb-6">Profil</h1>
      <div className="mb-6"><TombolPasang /></div>
      <div className="mb-6"><Link to="/pengaturan" className="text-emerald-700 font-semibold underline">Pengaturan Kos</Link></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">Nama Pemilik</label>
          <input value={namaPemilik} onChange={e => setNamaPemilik(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-emerald-50/60 border border-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-400" />
        </div>
        <div>
          <label className="block text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">Nama Kos</label>
          <input value={namaKos} onChange={e => setNamaKos(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-emerald-50/60 border border-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-400" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">Alamat</label>
          <input value={alamat} onChange={e => setAlamat(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-emerald-50/60 border border-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-400" />
        </div>
        <div>
          <label className="block text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">Nomor WhatsApp</label>
          <input value={noWa} onChange={e => setNoWa(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-emerald-50/60 border border-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-400" placeholder="0812..." />
        </div>
        <div>
          <label className="block text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">Email Akun</label>
          <input value={user?.email || ''} disabled className="w-full px-4 py-3 rounded-xl bg-gray-100 text-gray-500 border border-gray-200" />
        </div>
      </div>
      <button onClick={init} className="text-xs text-emerald-600 font-bold mb-6 hover:underline">Reset ke data tersimpan</button>

      <button onClick={handleSave} disabled={saving} className="w-full py-3 rounded-xl bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition disabled:opacity-70 mb-6">Simpan Profil</button>

      <div className="border-t border-emerald-100 pt-6 mb-6">
        <h2 className="text-lg font-extrabold text-emerald-800 mb-3">Ubah Kata Sandi</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">Kata Sandi Baru</label>
            <input type="password" value={pwBaru} onChange={e => setPwBaru(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-emerald-50/60 border border-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-400" />
          </div>
          <div>
            <label className="block text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">Konfirmasi</label>
            <input type="password" value={pwKonf} onChange={e => setPwKonf(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-emerald-50/60 border border-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-400" />
          </div>
        </div>
        <button onClick={handlePassword} className="w-full py-3 rounded-xl bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition">Ubah Kata Sandi</button>
      </div>

      <button onClick={() => setOpenConfirm(true)} className="w-full py-3 rounded-xl bg-red-50 text-red-700 font-bold border border-red-100 hover:bg-red-100 transition">Keluar</button>
      <ConfirmDialog open={openConfirm} title="Keluar" message="Anda yakin ingin keluar?" onConfirm={() => { setOpenConfirm(false); signOut() }} onCancel={() => setOpenConfirm(false)} />
    </div>
  )
}
