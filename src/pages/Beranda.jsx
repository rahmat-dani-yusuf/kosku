import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'
import { usePemesanan } from '../hooks/usePemesanan.js'
import { useProfil } from '../hooks/useProfil.jsx'
import { usePengaturan } from '../hooks/usePengaturan.jsx'
import { useDashboard } from '../hooks/useDashboard.jsx'
import { formatRupiah, formatTanggal } from '../lib/format.js'
import { supabase } from '../lib/supabaseClient.js'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { buatLinkWA, buatPesanTagihan } from '../lib/whatsapp.js'
import { useToast } from '../components/Toast.jsx'
import TombolPasang from '../components/TombolPasang.jsx'

export default function Beranda() {
  const { user } = useAuth()
  const profil = useProfil()
  const { pengaturan } = usePengaturan()
  const { show } = useToast()
  const { kamar, tagihan, sewaAktif, loading, error, okupansi, ringkasanPendapatan, tunggakan, tunggakanNominal, jatuhTempo7, menunggak, grafikPendapatan } = useDashboard()
  const { jumlahMenunggu } = usePemesanan()
  const [showInstallBanner, setShowInstallBanner] = useState(true)
  const [installAvailable, setInstallAvailable] = useState(false)
  const [installed, setInstalled] = useState(false)
  const [nama, setNama] = useState('')

  useEffect(() => {
    const handle = (e) => { e.preventDefault(); setInstallAvailable(true); }
    window.addEventListener('beforeinstallprompt', handle)
    const installedHandler = () => setInstalled(true)
    window.addEventListener('appinstalled', installedHandler)
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) setInstalled(true)
    return () => { window.removeEventListener('beforeinstallprompt', handle); window.removeEventListener('appinstalled', installedHandler) }
  }, [])

  useEffect(() => {
    if (!user) return
    supabase.from('profiles').select('nama_pemilik').eq('id', user.id).single().then(({ data }) => { if (data?.nama_pemilik) setNama(data.nama_pemilik) })
  }, [user])

  const todayStr = new Date().toISOString().split('T')[0]

  const handleWA = (item) => {
    const nomor = item.sewa?.penghuni?.no_hp || ''
    if (!nomor || !nomor.replace(/\D/g, '').length) return show('Nomor HP tidak valid', 'error')
    const terlambat = item.status === 'belum' && (item.jatuh_tempo || '') < todayStr
    const msg = buatPesanTagihan({ nama: item.sewa?.penghuni?.nama || '-', nama_kos: profil?.nama_kos || 'kos kami', nomor_kamar: item.sewa?.kamar?.nomor || '-', periode: item.periode || '', jumlah: item.jumlah || 0, jatuh_tempo: item.jatuh_tempo || '', terlambat, info_pembayaran: pengaturan.info_pembayaran })
    window.open(buatLinkWA(nomor, msg), '_blank', 'noopener')
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-3xl shadow-2xl p-8 md:p-10 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white dark:bg-gray-800/10 rounded-full -translate-y-1/2 translate-x-1/3" />
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight relative z-10">{loading ? 'Memuat...' : `Halo, ${nama || 'Pemilik'}`}</h1>
        <p className="text-emerald-100 mt-2 relative z-10">Ringkasan bisnis kos Anda hari ini.</p>
        <Link to="/tagihan" className="inline-block mt-6 px-5 py-3 rounded-xl bg-white dark:bg-gray-800 text-emerald-700 dark:text-emerald-300 font-extrabold shadow-lg hover:bg-emerald-50 dark:hover:bg-gray-800/50 transition relative z-10">Buat Tagihan Bulan Ini</Link>
      </div>

      {showInstallBanner && installAvailable && !installed && (
        <div className="flex items-center justify-between gap-3 bg-emerald-50 dark:bg-gray-800/50 border border-emerald-100 dark:border-gray-700 rounded-2xl px-4 py-3 shadow-sm">
          <div className="flex items-center gap-3">
            <TombolPasang />
          </div>
          <button onClick={() => setShowInstallBanner(false)} className="text-emerald-700 dark:text-emerald-300 hover:text-emerald-900 dark:text-gray-100 font-bold px-2" aria-label="Tutup"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg></button>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-2xl p-4 bg-white dark:bg-gray-800 shadow-md border border-emerald-100 dark:border-gray-700"><div className="text-xs font-semibold text-emerald-400 dark:text-emerald-300">Okupansi</div><div className="text-2xl font-extrabold text-emerald-800 dark:text-emerald-300">{okupansi.terisi} dari {okupansi.total} <span className="text-base font-bold text-emerald-500 dark:text-emerald-400 dark:text-emerald-300">({okupansi.pct}%)</span></div></div>
        <div className="rounded-2xl p-4 bg-white dark:bg-gray-800 shadow-md border border-emerald-100 dark:border-gray-700"><div className="text-xs font-semibold text-emerald-400 dark:text-emerald-300">Kamar Kosong</div><div className="text-2xl font-extrabold text-emerald-800 dark:text-emerald-300">{kamar.filter(k => k.status === 'kosong').length}</div></div>
        <div className="rounded-2xl p-4 bg-white dark:bg-gray-800 shadow-md border border-emerald-100 dark:border-gray-700"><div className="text-xs font-semibold text-emerald-400 dark:text-emerald-300">Pendapatan Bulan Ini</div><div className="text-2xl font-extrabold text-emerald-800 dark:text-emerald-300">{formatRupiah(ringkasanPendapatan)}</div><div className="text-xs text-emerald-500 dark:text-emerald-400 dark:text-emerald-300">Uang yang sudah masuk bulan ini</div></div>
        <div className="rounded-2xl p-4 bg-red-50 dark:bg-red-900/30 shadow-md border border-red-100 dark:border-red-800"><div className="text-xs font-semibold text-red-400 dark:text-red-300">Tunggakan</div><div className="text-2xl font-extrabold text-red-800 dark:text-red-200">{tunggakan.length}</div><div className="text-xs font-bold text-red-600 dark:text-red-300">{formatRupiah(tunggakanNominal)}</div></div>
      </div>

      <Link
        to="/pemesanan"
        className={`flex items-center justify-between gap-3 rounded-2xl p-4 shadow-md border transition hover:shadow-lg ${jumlahMenunggu > 0 ? 'bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800 hover:bg-amber-100' : 'bg-white dark:bg-gray-800 border-emerald-100 dark:border-gray-700 hover:bg-emerald-50 dark:hover:bg-gray-800/50'}`}
      >
        <div>
          <div className={`text-xs font-semibold ${jumlahMenunggu > 0 ? 'text-amber-500 dark:text-amber-300' : 'text-emerald-400 dark:text-emerald-300'}`}>Pemesanan Menunggu</div>
          <div className={`text-2xl font-extrabold ${jumlahMenunggu > 0 ? 'text-amber-800 dark:text-amber-200' : 'text-emerald-800 dark:text-emerald-300'}`}>{jumlahMenunggu}</div>
        </div>
        <span className={`text-xs font-bold ${jumlahMenunggu > 0 ? 'text-amber-700 dark:text-amber-200' : 'text-emerald-600 dark:text-emerald-300'}`}>Lihat &rarr;</span>
      </Link>

      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-emerald-100 dark:border-gray-700 p-6">
        <h2 className="text-xl font-extrabold text-emerald-800 dark:text-emerald-300 mb-4">Pendapatan 6 Bulan Terakhir</h2>
        <div className="w-full h-48 md:h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={grafikPendapatan} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#9ca3af' }} />
              <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} tickFormatter={(v) => `Rp ${(v / 1000000).toFixed(0)}jt`} />
              <Tooltip formatter={(v) => formatRupiah(v)} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {grafikPendapatan.map((_, i) => <Cell key={i} fill={i === grafikPendapatan.length - 1 ? '#059669' : '#6ee7b7'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-emerald-100 dark:border-gray-700 p-6">
          <h2 className="text-xl font-extrabold text-emerald-800 dark:text-emerald-300 mb-4">Jatuh Tempo 7 Hari</h2>
          {jatuhTempo7.length === 0 ? <p className="text-emerald-500 dark:text-emerald-400 dark:text-emerald-300 text-sm">Tidak ada tagihan jatuh tempo dalam 7 hari.</p> : (
            <div className="space-y-3">
              {[...jatuhTempo7].sort((a, b) => (a.jatuh_tempo || '').localeCompare(b.jatuh_tempo || '')).slice(0, 5).map(i => (
                <div key={i.id} className="flex items-center justify-between p-3 rounded-xl bg-amber-50 dark:bg-amber-900/30 border border-amber-100 dark:border-amber-800">
                  <div>
                    <div className="font-bold text-emerald-800 dark:text-emerald-300 text-sm">Kamar {i.sewa?.kamar?.nomor || '-'}</div>
                    <div className="text-xs text-emerald-500 dark:text-emerald-400 dark:text-emerald-300">{i.sewa?.penghuni?.nama || '-'}</div>
                    <div className="text-xs text-amber-600 dark:text-amber-300 font-medium">{formatRupiah(Number(i.jumlah || 0) - Number(i.terbayar || 0))} &bull; {formatTanggal(i.jatuh_tempo)}{Number(i.terbayar || 0) > 0 ? ' ? Dicicil' : ''}</div>
                  </div>
                  <button onClick={() => handleWA(i)} className="px-3 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition">Ingatkan</button>
                </div>
              ))}
              {jatuhTempo7.length > 5 && (
                <div className="text-xs text-amber-600 dark:text-amber-300 font-medium">dan {jatuhTempo7.length - 5} lainnya <Link to="/tagihan" className="underline font-bold">Lihat semua</Link></div>
              )}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-emerald-100 dark:border-gray-700 p-6">
          <h2 className="text-xl font-extrabold text-emerald-800 dark:text-emerald-300 mb-4">Menunggak</h2>
          {menunggak.length === 0 ? <p className="text-emerald-500 dark:text-emerald-400 dark:text-emerald-300 text-sm">Tidak ada tagihan menunggak.</p> : (
            <div className="space-y-3">
              {menunggak.slice(0, 5).map(i => {
                const daysLate = Math.floor((new Date().getTime() - new Date(i.jatuh_tempo || '').getTime()) / (1000 * 60 * 60 * 24))
                return (
                  <div key={i.id} className="flex items-center justify-between p-3 rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-100 dark:border-red-800">
                    <div>
                      <div className="font-bold text-emerald-800 dark:text-emerald-300 text-sm">Kamar {i.sewa?.kamar?.nomor || '-'}</div>
                      <div className="text-xs text-emerald-500 dark:text-emerald-400 dark:text-emerald-300">{i.sewa?.penghuni?.nama || '-'}</div>
                      <div className="text-xs text-red-600 dark:text-red-300 font-medium">{formatRupiah(Number(i.jumlah || 0) - Number(i.terbayar || 0))} &bull; Terlambat {daysLate} hari{Number(i.terbayar || 0) > 0 ? ' • Dicicil' : ''}</div>
                    </div>
                    <button onClick={() => handleWA(i)} className="px-3 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition">Ingatkan</button>
                  </div>
                )
              })}
              {menunggak.length > 5 && (
                <div className="text-xs text-red-600 dark:text-red-300 font-medium">dan {menunggak.length - 5} lainnya <Link to="/tagihan" className="underline font-bold">Lihat semua</Link></div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
