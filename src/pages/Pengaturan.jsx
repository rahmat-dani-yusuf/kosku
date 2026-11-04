import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth.jsx'
import { usePengaturan } from '../hooks/usePengaturan.jsx'
import { parseRupiah, formatRupiah } from '../lib/format.js'
import { useToast } from '../components/Toast.jsx'

export default function Pengaturan() {
  useEffect(() => { document.title = 'Pengaturan - KosKu' }, [])
  const { user } = useAuth()
  const { pengaturan, loading, simpan } = usePengaturan()
  const { show } = useToast()
  const [dendaStr, setDendaStr] = useState('')
  const [tenggang, setTenggang] = useState(0)
  const [hariTagih, setHariTagih] = useState(1)
  const [depositStr, setDepositStr] = useState('')
  const [aturan, setAturan] = useState('')
  const [saving, setSaving] = useState(false)

  useState(() => {
    setDendaStr(formatRupiah(pengaturan.denda_per_hari))
    setTenggang(pengaturan.masa_tenggang_hari)
    setHariTagih(pengaturan.hari_tagih_default)
    setDepositStr(formatRupiah(pengaturan.deposit_default))
    setAturan(pengaturan.aturan_kos)
  }, [pengaturan])

  const handleSave = async () => {
    if (aturan.length > 2000) return show('Aturan kos maksimal 2000 karakter', 'error')
    setSaving(true)
    const ok = await simpan({
      denda_per_hari: parseRupiah(dendaStr),
      masa_tenggang_hari: Math.max(0, Math.min(31, parseInt(tenggang || 0))),
      hari_tagih_default: Math.max(1, Math.min(28, parseInt(hariTagih || 1))),
      deposit_default: parseRupiah(depositStr),
      aturan_kos: aturan.trim(),
    })
    setSaving(false)
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-emerald-50"><div className="w-10 h-10 border-4 border-emerald-300 border-t-emerald-600 rounded-full animate-spin" /></div>

  return (
    <div className="max-w-2xl mx-auto bg-white/80 backdrop-blur rounded-3xl shadow-xl border border-emerald-100 p-8 md:p-10">
      <h1 className="text-2xl font-extrabold text-emerald-800 mb-6">Pengaturan Kos</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">Denda per hari</label>
          <input value={dendaStr} onChange={e => setDendaStr(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-emerald-50/60 border border-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-400" placeholder="Rp 0" />
        </div>
        <div>
          <label className="block text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">Masa tenggang (0-31 hari)</label>
          <input type="number" min={0} max={31} value={tenggang} onChange={e => setTenggang(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-emerald-50/60 border border-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-400" />
        </div>
        <div>
          <label className="block text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">Hari tagih bawaan (1-28)</label>
          <input type="number" min={1} max={28} value={hariTagih} onChange={e => setHariTagih(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-emerald-50/60 border border-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-400" />
        </div>
        <div>
          <label className="block text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">Deposit bawaan</label>
          <input value={depositStr} onChange={e => setDepositStr(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-emerald-50/60 border border-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-400" placeholder="Rp 0" />
        </div>
      </div>
      <div className="mb-4">
        <label className="block text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">Aturan kos (maks 2000 karakter)</label>
        <textarea value={aturan} onChange={e => setAturan(e.target.value)} rows={5} maxLength={2000} className="w-full px-4 py-3 rounded-xl bg-emerald-50/60 border border-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-400" placeholder="Tulis aturan kos..." />
        <div className="text-xs text-emerald-400 mt-1">{aturan.length}/2000</div>
      </div>
      <button onClick={handleSave} disabled={saving} className="w-full py-3 rounded-xl bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition">Simpan Pengaturan</button>
    </div>
  )
}
