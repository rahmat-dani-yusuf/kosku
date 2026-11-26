import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth.jsx'
import { usePemesananHalaman } from '../hooks/usePemesananHalaman.js'
import { usePengaturan } from '../hooks/usePengaturan.jsx'
import { formatTanggal, formatRupiah, parseRupiah } from '../lib/format.js'
import { buatPesanPemesanan, buatLinkWA, buatLinkWAShare } from '../lib/whatsapp.js'
import { useToast } from '../components/Toast.jsx'
import EmptyState from '../components/EmptyState.jsx'
import Modal from '../components/Modal.jsx'
import ConfirmDialog from '../components/ConfirmDialog.jsx'
import Pagination from '../components/Pagination.jsx'
import { DEFAULT_PER_HALAMAN, hitungTotalHalaman } from '../lib/paginasi.js'

const STATUS = {
  menunggu: { label: 'Menunggu', cls: 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-200 border-amber-200 dark:border-amber-800' },
  disetujui: { label: 'Disetujui', cls: 'bg-emerald-50 dark:bg-gray-800/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-gray-700' },
  ditolak: { label: 'Ditolak', cls: 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-200 border-red-200 dark:border-red-800' },
}

function formatWaktu(input) {
  const d = new Date(input)
  if (isNaN(d.getTime())) return '-'
  return d.toLocaleString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function hariDariTanggal(input) {
  const d = Number(String(input || '').split('-')[2])
  return Number.isFinite(d) && d >= 1 ? d : 1
}

function SkeletonKartu() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {[0, 1, 2, 3].map(i => (
        <div key={i} className="bg-white dark:bg-gray-800/80 backdrop-blur rounded-3xl border border-emerald-100 dark:border-gray-700 p-5 shadow-md animate-pulse">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="h-5 w-32 rounded-lg bg-emerald-100 dark:bg-emerald-900/40" />
            <div className="h-6 w-20 rounded-full bg-emerald-100 dark:bg-emerald-900/40" />
          </div>
          <div className="h-4 w-40 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 mb-2" />
          <div className="h-4 w-28 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 mb-4" />
          <div className="h-14 w-full rounded-xl bg-emerald-100 dark:bg-emerald-900/40" />
        </div>
      ))}
    </div>
  )
}

export default function Pemesanan() {
  const { user } = useAuth()
  const { show } = useToast()
  const { pengaturan } = usePengaturan()
  const [tab, setTab] = useState('menunggu')
  const [halaman, setHalaman] = useState(1)
  const [perHalaman, setPerHalaman] = useState(DEFAULT_PER_HALAMAN)
  const { data, total, jumlah, loading, error, setujui, tolak } = usePemesananHalaman({ halaman, perHalaman, tab })
  const jumlahMenunggu = jumlah.menunggu

  const [setujuiId, setSetujuiId] = useState(null)
  const [formSetujui, setFormSetujui] = useState({ hariTagih: 1, harga: '', deposit: '' })
  const [konfirmasiBuka, setKonfirmasiBuka] = useState(false)
  const [proses, setProses] = useState(false)

  const [tolakId, setTolakId] = useState(null)
  const [alasanTolak, setAlasanTolak] = useState('')

  // Saat tab atau perHalaman berubah, kembali ke halaman 1
  useEffect(() => { setHalaman(1) }, [tab, perHalaman])

  // Bila halaman saat ini melewati total halaman (mis. setelah setujui atau tolak), mundur
  useEffect(() => {
    if (loading || total === 0) return
    const akhir = hitungTotalHalaman(total, perHalaman)
    if (halaman > akhir) setHalaman(akhir)
  }, [loading, total, perHalaman, halaman])

  const linkPemesanan = user ? `${window.location.origin}/kos/${user.id}` : ''
  const pesanBagikan = `Halo! Silakan lihat kamar yang tersedia dan ajukan pemesanan lewat link ini: ${linkPemesanan}. Terima kasih.`

  const salinLink = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(linkPemesanan)
      } else {
        const ta = document.createElement('textarea')
        ta.value = linkPemesanan
        document.body.appendChild(ta)
        ta.select()
        document.execCommand('copy')
        document.body.removeChild(ta)
      }
      show('Link disalin', 'success')
    } catch {
      show('Gagal menyalin link', 'error')
    }
  }

  // Data sudah difilter per tab di server
  const daftar = data

  const pSetujui = data.find(p => p.id === setujuiId)
  const pTolak = data.find(p => p.id === tolakId)

  const bukaSetujui = (p) => {
    setSetujuiId(p.id)
    setKonfirmasiBuka(false)
    setFormSetujui({
      hariTagih: Math.min(28, Math.max(1, pengaturan.hari_tagih_default || hariDariTanggal(p.tanggal_masuk))),
      harga: formatRupiah(p.kamar?.harga_bulanan || 0),
      deposit: formatRupiah(pengaturan.deposit_default || 0),
    })
  }

  const ajukanSetujui = () => {
    if (parseRupiah(formSetujui.harga) <= 0) return show('Harga sewa wajib diisi', 'error')
    setKonfirmasiBuka(true)
  }

  const jalankanSetujui = async () => {
    if (!setujuiId) return
    setProses(true)
    const hasil = await setujui(setujuiId, {
      hariTagih: formSetujui.hariTagih,
      harga: parseRupiah(formSetujui.harga),
      deposit: parseRupiah(formSetujui.deposit),
    })
    setProses(false)
    setKonfirmasiBuka(false)
    if (hasil) setSetujuiId(null)
  }

  const bukaTolak = (p) => {
    setTolakId(p.id)
    setAlasanTolak('')
  }

  const jalankanTolak = async () => {
    if (!tolakId) return
    setProses(true)
    const hasil = await tolak(tolakId, alasanTolak.trim())
    setProses(false)
    if (hasil) setTolakId(null)
  }

  const hubungi = (p) => {
    const nomor = p.no_hp || ''
    if (!nomor.replace(/\D/g, '').length) return show('Nomor HP tidak valid', 'error')
    const pesan = buatPesanPemesanan({
      status: p.status,
      nama: p.nama,
      nomor_kamar: p.kamar?.nomor || '-',
      tanggal: p.tanggal_masuk,
      alasan: p.alasan_tolak,
    })
    window.open(buatLinkWA(nomor, pesan), '_blank', 'noopener')
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-extrabold text-emerald-800 dark:text-emerald-300">Pemesanan</h1>
        {jumlahMenunggu > 0 && (
          <span className="px-3 py-1 rounded-full bg-red-50 dark:bg-red-900/300 text-white text-xs font-bold shadow-sm">{jumlahMenunggu} menunggu</span>
        )}
      </div>

      <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-3xl shadow-xl p-5 md:p-6 text-white mb-6">
        <h2 className="font-extrabold text-lg">Link Pemesanan Anda</h2>
        <p className="mt-2 text-sm bg-white dark:bg-gray-800/10 rounded-xl px-3 py-2 break-all font-mono text-emerald-50">{linkPemesanan}</p>
        <div className="flex flex-col sm:flex-row gap-2 mt-3">
          <button onClick={salinLink} className="flex-1 py-2.5 rounded-xl bg-white dark:bg-gray-800 text-emerald-700 dark:text-emerald-300 font-bold text-sm shadow-sm hover:bg-emerald-50 dark:hover:bg-gray-800/50 transition">Salin link</button>
          <a href={buatLinkWAShare(pesanBagikan)} target="_blank" rel="noopener noreferrer" className="flex-1 py-2.5 rounded-xl bg-emerald-50 dark:bg-gray-800/500 text-white font-bold text-sm shadow-sm hover:bg-emerald-600 transition text-center">Bagikan via WhatsApp</a>
        </div>
        <p className="text-xs text-emerald-100 mt-3">Bagikan link ini ke calon penghuni. Mereka bisa memesan kamar tanpa membuat akun.</p>
      </div>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab('menunggu')}
          className={`px-4 py-2 rounded-xl font-bold text-sm transition ${tab === 'menunggu' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'bg-white dark:bg-gray-800 text-emerald-600 dark:text-emerald-300 border border-emerald-100 dark:border-gray-700'}`}
        >
          Menunggu ({jumlah.menunggu})
        </button>
        <button
          onClick={() => setTab('diproses')}
          className={`px-4 py-2 rounded-xl font-bold text-sm transition ${tab === 'diproses' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'bg-white dark:bg-gray-800 text-emerald-600 dark:text-emerald-300 border border-emerald-100 dark:border-gray-700'}`}
        >
          Diproses ({jumlah.diproses})
        </button>
      </div>

      {error && <div className="rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-100 dark:border-red-800 text-red-700 dark:text-red-200 px-4 py-3 mb-4">{error}</div>}

      {loading ? (
        <SkeletonKartu />
      ) : daftar.length === 0 ? (
        <EmptyState
          title="Belum ada pengajuan pemesanan"
          desc={tab === 'menunggu' ? 'Pengajuan baru dari calon penghuni akan tampil di sini.' : 'Belum ada pengajuan yang sudah diproses.'}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {daftar.map(p => {
            const badge = STATUS[p.status] || STATUS.menunggu
            return (
              <div key={p.id} className="bg-white dark:bg-gray-800/80 backdrop-blur rounded-3xl shadow-md border border-emerald-100 dark:border-gray-700 p-5 transition hover:shadow-xl">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h3 className="font-extrabold text-emerald-800 dark:text-emerald-300 text-lg leading-snug break-words">{p.nama}</h3>
                  <span className={`shrink-0 text-xs font-bold px-2.5 py-1 rounded-full border ${badge.cls}`}>{badge.label}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  <div className="bg-emerald-50 dark:bg-gray-800/50 rounded-xl px-3 py-2">
                    <div className="text-[10px] font-bold text-emerald-400 dark:text-emerald-300 uppercase">Nomor HP</div>
                    <div className="font-bold text-emerald-800 dark:text-emerald-300 break-words">{p.no_hp || '-'}</div>
                  </div>
                  <div className="bg-emerald-50 dark:bg-gray-800/50 rounded-xl px-3 py-2">
                    <div className="text-[10px] font-bold text-emerald-400 dark:text-emerald-300 uppercase">Kamar</div>
                    <div className="font-bold text-emerald-800 dark:text-emerald-300">{p.kamar?.nomor ? `No. ${p.kamar.nomor}` : '-'}</div>
                  </div>
                  <div className="bg-emerald-50 dark:bg-gray-800/50 rounded-xl px-3 py-2">
                    <div className="text-[10px] font-bold text-emerald-400 dark:text-emerald-300 uppercase">Tanggal Masuk</div>
                    <div className="font-bold text-emerald-800 dark:text-emerald-300">{formatTanggal(p.tanggal_masuk)}</div>
                  </div>
                  <div className="bg-emerald-50 dark:bg-gray-800/50 rounded-xl px-3 py-2">
                    <div className="text-[10px] font-bold text-emerald-400 dark:text-emerald-300 uppercase">Diajukan</div>
                    <div className="font-bold text-emerald-800 dark:text-emerald-300">{formatWaktu(p.created_at)}</div>
                  </div>
                  {p.status !== 'menunggu' && p.diproses_at && (
                    <div className="bg-emerald-50 dark:bg-gray-800/50 rounded-xl px-3 py-2">
                      <div className="text-[10px] font-bold text-emerald-400 dark:text-emerald-300 uppercase">Diproses</div>
                      <div className="font-bold text-emerald-800 dark:text-emerald-300">{formatWaktu(p.diproses_at)}</div>
                    </div>
                  )}
                </div>

                {p.catatan && (
                  <div className="mt-3 rounded-xl bg-amber-50 dark:bg-amber-900/30/60 border border-amber-100 dark:border-amber-800 px-3 py-2 text-sm text-amber-800 dark:text-amber-200 break-words">
                    <span className="text-[10px] font-bold uppercase text-amber-400 block">Catatan</span>
                    {p.catatan}
                  </div>
                )}

                {p.status === 'ditolak' && p.alasan_tolak && (
                  <div className="mt-3 rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-100 dark:border-red-800 px-3 py-2 text-sm text-red-700 dark:text-red-200 break-words">
                    <span className="text-[10px] font-bold uppercase text-red-400 dark:text-red-300 block">Alasan ditolak</span>
                    {p.alasan_tolak}
                  </div>
                )}

                <div className="mt-4 flex flex-wrap gap-2">
                  {p.status === 'menunggu' && (
                    <>
                      <button onClick={() => bukaSetujui(p)} className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-sm hover:bg-emerald-700 transition">Setujui</button>
                      <button onClick={() => bukaTolak(p)} className="px-4 py-2 rounded-xl bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-200 border border-red-200 dark:border-red-800 text-xs font-bold hover:bg-red-100 transition">Tolak</button>
                    </>
                  )}
                  <button onClick={() => hubungi(p)} className="px-4 py-2 rounded-xl bg-emerald-50 dark:bg-gray-800/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-gray-700 text-xs font-bold hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition">Hubungi via WhatsApp</button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Pagination
        halaman={halaman}
        perHalaman={perHalaman}
        total={total}
        onUbahHalaman={setHalaman}
        onUbahPerHalaman={setPerHalaman}
        loading={loading}
      />

      <Modal open={!!setujuiId} onClose={() => { if (!proses) { setKonfirmasiBuka(false); setSetujuiId(null) } }} title="Setujui Pemesanan">
        <div className="space-y-3">
          <div className="rounded-xl bg-emerald-50 dark:bg-gray-800/50 border border-emerald-100 dark:border-gray-700 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300">
            <div className="font-bold text-emerald-800 dark:text-emerald-300">{pSetujui?.nama || '-'}</div>
            <div className="text-xs mt-0.5">Kamar {pSetujui?.kamar?.nomor ? `No. ${pSetujui.kamar.nomor}` : '-'} &bull; Masuk {formatTanggal(pSetujui?.tanggal_masuk)}</div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="setujui-hari" className="block text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider mb-1">Hari Tagih (1-28)</label>
              <input
                id="setujui-hari"
                type="number"
                min={1}
                max={28}
                value={formSetujui.hariTagih}
                onChange={e => setFormSetujui(f => ({ ...f, hariTagih: Math.min(28, Math.max(1, parseInt(e.target.value || 1))) }))}
                className="w-full px-4 py-3 rounded-xl bg-emerald-50/60 dark:bg-gray-900 border border-emerald-100 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>
            <div>
              <label htmlFor="setujui-deposit" className="block text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider mb-1">Deposit</label>
              <input
                id="setujui-deposit"
                type="text"
                inputMode="numeric"
                value={formSetujui.deposit}
                onChange={e => { const raw = e.target.value.replace(/[^0-9]/g, ''); setFormSetujui(f => ({ ...f, deposit: raw ? Number(raw).toLocaleString('id-ID', { maximumFractionDigits: 0 }) : '' })) }}
                className="w-full px-4 py-3 rounded-xl bg-emerald-50/60 dark:bg-gray-900 border border-emerald-100 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                placeholder="0"
              />
            </div>
          </div>
          <div>
            <label htmlFor="setujui-harga" className="block text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider mb-1">Harga Sewa / Bulan <span className="text-red-500">*</span></label>
            <input
              id="setujui-harga"
              type="text"
              inputMode="numeric"
              value={formSetujui.harga}
              onChange={e => { const raw = e.target.value.replace(/[^0-9]/g, ''); setFormSetujui(f => ({ ...f, harga: raw ? Number(raw).toLocaleString('id-ID', { maximumFractionDigits: 0 }) : '' })) }}
              className="w-full px-4 py-3 rounded-xl bg-emerald-50/60 dark:bg-gray-900 border border-emerald-100 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              placeholder="1500000"
            />
          </div>
          <button onClick={ajukanSetujui} className="w-full py-3 rounded-xl bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition">Lanjut Setujui</button>
        </div>
      </Modal>

      <ConfirmDialog
        open={konfirmasiBuka}
        title="Setujui pemesanan ini?"
        message={`Sewa kamar ${pSetujui?.kamar?.nomor ? `No. ${pSetujui.kamar.nomor}` : '-'} akan dimulai untuk ${pSetujui?.nama || '-'} dengan ${formatRupiah(parseRupiah(formSetujui.harga))}/bulan.`}
        confirmLabel="Ya, Setujui"
        confirmClass="bg-emerald-600 hover:bg-emerald-700"
        busy={proses}
        onConfirm={jalankanSetujui}
        onCancel={() => setKonfirmasiBuka(false)}
      />

      <Modal open={!!tolakId} onClose={() => { if (!proses) setTolakId(null) }} title="Tolak Pemesanan">
        <div className="space-y-3">
          <div className="rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-100 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-200">
            <div className="font-bold text-red-800 dark:text-red-200">{pTolak?.nama || '-'}</div>
            <div className="text-xs mt-0.5">Kamar {pTolak?.kamar?.nomor ? `No. ${pTolak.kamar.nomor}` : '-'} &bull; Masuk {formatTanggal(pTolak?.tanggal_masuk)}</div>
          </div>
          <div>
            <label htmlFor="tolak-alasan" className="block text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider mb-1">Alasan (opsional)</label>
            <textarea
              id="tolak-alasan"
              value={alasanTolak}
              onChange={e => setAlasanTolak(e.target.value)}
              rows={3}
              maxLength={300}
              placeholder="Contoh: kamar sudah terisi"
              className="w-full px-4 py-3 rounded-xl bg-emerald-50/60 dark:bg-gray-900 border border-emerald-100 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 resize-none"
            />
          </div>
          <button onClick={jalankanTolak} disabled={proses} className="w-full py-3 rounded-xl bg-red-50 dark:bg-red-900/300 text-white font-bold shadow-lg shadow-red-200 hover:bg-red-600 transition disabled:opacity-60 disabled:cursor-not-allowed">Tolak Pemesanan</button>
        </div>
      </Modal>
    </div>
  )
}