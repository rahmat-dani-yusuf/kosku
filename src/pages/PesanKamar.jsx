import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient.js'
import { formatRupiah, formatTanggal } from '../lib/format.js'
import { buatLinkWA, normalisasiNomor } from '../lib/whatsapp.js'
import Modal from '../components/Modal.jsx'
import EmptyState from '../components/EmptyState.jsx'
import Pagination from '../components/Pagination.jsx'
import { DEFAULT_PER_HALAMAN, hitungRange, hitungTotalHalaman } from '../lib/paginasi.js'
import { useToast } from '../components/Toast.jsx'

const AWAL_FORM = { nama: '', noHp: '', tanggalMasuk: '', catatan: '', setuju: false, jebakan: '' }

function isoLokal(d) {
  const y = String(d.getFullYear())
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const t = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${t}`
}

function batasTanggal() {
  const kini = new Date()
  const akhir = new Date(kini)
  akhir.setFullYear(akhir.getFullYear() + 1)
  return { min: isoLokal(kini), max: isoLokal(akhir) }
}

function validasiForm(form) {
  const g = {}
  const nama = form.nama.trim()
  if (nama.length < 2) g.nama = 'Nama lengkap minimal 2 karakter'
  else if (nama.length > 100) g.nama = 'Nama lengkap maksimal 100 karakter'

  const hp = form.noHp.replace(/[\s\-+]/g, '')
  if (!hp) g.noHp = 'Nomor HP wajib diisi'
  else if (!/^\d+$/.test(hp) || !(hp.startsWith('08') || hp.startsWith('62')) || hp.length < 10 || hp.length > 14) {
    g.noHp = 'Nomor HP harus diawali 08 atau 62 dan berjumlah 10 sampai 14 digit'
  }

  const { min, max } = batasTanggal()
  if (!form.tanggalMasuk) {
    g.tanggalMasuk = 'Tanggal masuk wajib diisi'
  } else if (!/^\d{4}-\d{2}-\d{2}$/.test(form.tanggalMasuk) || isNaN(new Date(`${form.tanggalMasuk}T00:00:00`).getTime())) {
    g.tanggalMasuk = 'Tanggal masuk tidak valid'
  } else if (form.tanggalMasuk < min) {
    g.tanggalMasuk = 'Tanggal masuk tidak boleh sebelum hari ini'
  } else if (form.tanggalMasuk > max) {
    g.tanggalMasuk = 'Tanggal masuk paling jauh satu tahun dari hari ini'
  }

  if (form.catatan.length > 500) g.catatan = 'Catatan maksimal 500 karakter'
  if (!form.setuju) g.setuju = 'Centang persetujuan untuk melanjutkan'
  return g
}

function SkeletonKamar() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {[0, 1, 2].map(i => (
        <div key={i} className="rounded-3xl bg-white dark:bg-gray-800/80 border border-emerald-100 dark:border-gray-700 p-5 shadow-sm animate-pulse">
          <div className="h-5 w-24 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 mb-3" />
          <div className="h-4 w-32 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 mb-2" />
          <div className="h-6 w-40 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 mb-3" />
          <div className="h-4 w-full rounded-lg bg-emerald-100 dark:bg-emerald-900/40 mb-4" />
          <div className="h-10 w-full rounded-xl bg-emerald-100 dark:bg-emerald-900/40" />
        </div>
      ))}
    </div>
  )
}

const inputCls = (ada) =>
  `w-full px-4 py-3 rounded-xl bg-emerald-50/60 dark:bg-gray-900 border ${ada ? 'border-red-300' : 'border-emerald-100 dark:border-gray-700'} text-emerald-900 dark:text-gray-100 placeholder:text-emerald-400 dark:text-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition`
const labelCls = 'block text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider mb-1'
const errCls = 'text-xs text-red-600 dark:text-red-300 mt-1'

export default function PesanKamar() {
  const { kosId } = useParams()
  const { show } = useToast()

  const [kos, setKos] = useState(null)
  const [memuat, setMemuat] = useState(true)
  const [tidakDitemukan, setTidakDitemukan] = useState(false)

  const [kamar, setKamar] = useState([])
  const [memuatKamar, setMemuatKamar] = useState(false)
  const [galatKamar, setGalatKamar] = useState('')
  const [cari, setCari] = useState('')
  const [urut, setUrut] = useState('nomor')
  const [halaman, setHalaman] = useState(1)
  const [perHalaman, setPerHalaman] = useState(DEFAULT_PER_HALAMAN)
  const daftarRef = useRef(null)

  const [aturanTerbuka, setAturanTerbuka] = useState(false)

  const [modalBuka, setModalBuka] = useState(false)
  const [kamarTerpilih, setKamarTerpilih] = useState(null)
  const [form, setForm] = useState(AWAL_FORM)
  const [galat, setGalat] = useState({})
  const [kirimSedang, setKirimSedang] = useState(false)
  const [berhasil, setBerhasil] = useState(false)
  const [hasil, setHasil] = useState(null)

  useEffect(() => { document.title = 'Pesan Kamar - KosKu' }, [])

  const muatKamar = useCallback(async () => {
    setMemuatKamar(true)
    setGalatKamar('')
    try {
      const { data, error } = await supabase.rpc('kamar_kosong_publik', { p_kos: kosId })
      if (error) throw error
      setKamar(Array.isArray(data) ? data : [])
    } catch (e) {
      setKamar([])
      setGalatKamar(e?.message || 'Gagal memuat daftar kamar')
    } finally {
      setMemuatKamar(false)
    }
  }, [kosId])

  useEffect(() => {
    let batal = false
    async function muat() {
      setMemuat(true)
      setTidakDitemukan(false)
      setKos(null)
      const id = String(kosId || '').trim()
      if (!id) {
        if (!batal) { setTidakDitemukan(true); setMemuat(false) }
        return
      }
      let data = null
      let error = null
      try {
        ;({ data, error } = await supabase.rpc('kos_publik', { p_kos: id }))
      } catch (e) {
        error = e
      }
      if (batal) return
      const k = Array.isArray(data) ? data[0] : data
      const ada = !error && k && typeof k === 'object' && Object.keys(k).length > 0
      if (!ada) {
        setTidakDitemukan(true)
        setMemuat(false)
        return
      }
      setKos(k)
      setMemuat(false)
      muatKamar()
    }
    muat()
    return () => { batal = true }
  }, [kosId, muatKamar])

  const { min: minTanggal, max: maxTanggal } = batasTanggal()

  const pesanPerkenalan = kos?.nama_kos
    ? `Halo, saya ingin bertanya seputar kos ${kos.nama_kos}. Terima kasih.`
    : 'Halo, saya ingin bertanya seputar kos ini. Terima kasih.'
  const linkWA = kos?.no_wa ? buatLinkWA(kos.no_wa, pesanPerkenalan) : ''

  const kamarTerfilter = useMemo(() => {
    const q = cari.trim().toLowerCase()
    let list = kamar
    if (q) list = list.filter(k => String(k.nomor || '').toLowerCase().includes(q) || String(k.tipe || '').toLowerCase().includes(q))
    const sorted = [...list]
    if (urut === 'harga_asc') sorted.sort((a, b) => (a.harga_bulanan || 0) - (b.harga_bulanan || 0))
    else if (urut === 'harga_desc') sorted.sort((a, b) => (b.harga_bulanan || 0) - (a.harga_bulanan || 0))
    else sorted.sort((a, b) => String(a.nomor || '').localeCompare(String(b.nomor || ''), undefined, { numeric: true }))
    return sorted
  }, [kamar, cari, urut])

  useEffect(() => { setHalaman(1) }, [cari, urut, perHalaman])

  useEffect(() => {
    if (daftarRef.current) daftarRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [halaman])

  const { from, to } = hitungRange(halaman, perHalaman)
  const kamarHalaman = kamarTerfilter.slice(from, to + 1)
  const totalHalaman = hitungTotalHalaman(kamarTerfilter.length, perHalaman)

  const bukaModal = (k) => {
    setKamarTerpilih(k)
    setForm(AWAL_FORM)
    setGalat({})
    setBerhasil(false)
    setHasil(null)
    setKirimSedang(false)
    setModalBuka(true)
  }

  const tutupModal = () => {
    if (kirimSedang) return
    setModalBuka(false)
    setKamarTerpilih(null)
    setForm(AWAL_FORM)
    setGalat({})
    setBerhasil(false)
    setHasil(null)
    muatKamar()
  }

  const ubah = (nama, nilai) => {
    setForm(f => ({ ...f, [nama]: nilai }))
    setGalat(g => (g[nama] ? { ...g, [nama]: '' } : g))
  }

  const kirimPengajuan = async (e) => {
    e.preventDefault()
    if (kirimSedang) return
    if (form.jebakan.trim()) {
      setHasil({ nama: form.nama.trim(), nomor: kamarTerpilih?.nomor || '', tanggal: form.tanggalMasuk })
      setBerhasil(true)
      return
    }
    const g = validasiForm(form)
    setGalat(g)
    if (Object.keys(g).length) return
    setKirimSedang(true)
    try {
      const { error } = await supabase.rpc('ajukan_pemesanan', {
        p_kos: kosId,
        p_kamar: kamarTerpilih.id,
        p_nama: form.nama.trim(),
        p_no_hp: normalisasiNomor(form.noHp),
        p_tanggal_masuk: form.tanggalMasuk,
        p_catatan: form.catatan.trim(),
      })
      if (error) throw error
      setHasil({ nama: form.nama.trim(), nomor: kamarTerpilih?.nomor || '', tanggal: form.tanggalMasuk })
      setBerhasil(true)
    } catch (err) {
      show(err?.message || 'Gagal mengajukan pemesanan', 'error')
    } finally {
      setKirimSedang(false)
    }
  }

  const pesanSukses = hasil
    ? `Halo, saya ${hasil.nama}, baru mengajukan pemesanan kamar ${hasil.nomor} di ${kos?.nama_kos || ''} untuk masuk tanggal ${formatTanggal(hasil.tanggal)}. Mohon konfirmasinya. Terima kasih.`
    : ''
  const linkWASukses = hasil && kos?.no_wa ? buatLinkWA(kos.no_wa, pesanSukses) : ''

  if (memuat) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100">
        <header className="bg-emerald-600">
          <div className="max-w-3xl mx-auto px-4 py-5">
            <div className="text-xs font-bold uppercase tracking-widest text-emerald-200 mb-2">KosKu</div>
            <div className="h-7 w-48 rounded-lg bg-emerald-50 dark:bg-gray-800/500 animate-pulse mb-2" />
            <div className="h-4 w-64 max-w-full rounded-lg bg-emerald-50 dark:bg-gray-800/500 animate-pulse mb-4" />
            <div className="h-10 w-56 rounded-xl bg-emerald-50 dark:bg-gray-800/500 animate-pulse" />
          </div>
        </header>
        <main className="max-w-3xl mx-auto px-4 py-6">
          <div className="h-6 w-40 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 animate-pulse mb-4" />
          <SkeletonKamar />
        </main>
      </div>
    )
  }

  if (tidakDitemukan || !kos) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100">
        <header className="bg-emerald-600">
          <div className="max-w-3xl mx-auto px-4 py-5">
            <div className="text-xs font-bold uppercase tracking-widest text-emerald-200">KosKu</div>
          </div>
        </header>
        <main className="max-w-3xl mx-auto px-4 py-10">
          <div className="rounded-3xl bg-white dark:bg-gray-800/90 backdrop-blur border border-emerald-100 dark:border-gray-700 shadow-sm p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-3xl">🔍</div>
            <p className="font-extrabold text-emerald-800 dark:text-emerald-300">Kos tidak ditemukan atau tidak aktif</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100">
      <header className="bg-emerald-600 text-white shadow-lg shadow-emerald-200">
        <div className="max-w-3xl mx-auto px-4 py-5">
          <div className="text-xs font-bold uppercase tracking-widest text-emerald-200 mb-1">KosKu</div>
          <h1 className="text-xl sm:text-2xl font-extrabold leading-tight">{kos.nama_kos}</h1>
          {kos.alamat && <p className="text-emerald-100 text-sm mt-1 break-words">{kos.alamat}</p>}
          {linkWA && (
            <a
              href={linkWA}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-3 px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 text-emerald-700 dark:text-emerald-300 text-sm font-bold shadow-lg transition hover:bg-emerald-50 dark:hover:bg-gray-800/50"
            >
              <span>💬</span>
              <span>Hubungi pemilik via WhatsApp</span>
            </a>
          )}
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 pb-16">
        <section>
          <div ref={daftarRef} className="flex flex-col gap-3 mb-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-emerald-800 dark:text-emerald-300">Kamar Tersedia</h2>
              {!memuatKamar && !galatKamar && kamar.length > 0 && (
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/40 rounded-full px-2.5 py-1">{kamarTerfilter.length} kamar</span>
              )}
            </div>
            {!memuatKamar && !galatKamar && kamar.length > 0 && (
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={cari}
                  onChange={e => setCari(e.target.value)}
                  placeholder="Cari nomor kamar atau tipe..."
                  className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-50/60 dark:bg-gray-900 border border-emerald-100 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
                <select
                  value={urut}
                  onChange={e => setUrut(e.target.value)}
                  className="px-3 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-emerald-100 dark:border-gray-700 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-400"
                >
                  <option value="nomor">Nomor kamar</option>
                  <option value="harga_asc">Harga termurah</option>
                  <option value="harga_desc">Harga termahal</option>
                </select>
              </div>
            )}
          </div>

          {galatKamar && (
            <div className="rounded-2xl bg-red-50 dark:bg-red-900/30 border border-red-100 dark:border-red-800 text-red-700 dark:text-red-200 px-4 py-3 mb-4 text-sm" role="alert">{galatKamar}</div>
          )}

          {memuatKamar ? (
            <SkeletonKamar />
          ) : !galatKamar && kamar.length === 0 ? (
            <div className="rounded-3xl bg-white dark:bg-gray-800/80 backdrop-blur border border-emerald-100 dark:border-gray-700 shadow-sm px-4">
              <EmptyState title="Belum ada kamar kosong saat ini" desc="Hubungi pemilik kos untuk informasi lainnya." />
              {linkWA && (
                <div className="pb-10 -mt-4">
                  <a
                    href={linkWA}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full text-center px-4 py-3 rounded-xl bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-200 transition hover:bg-emerald-700"
                  >
                    Hubungi pemilik via WhatsApp
                  </a>
                </div>
              )}
            </div>
          ) : !galatKamar && kamarTerfilter.length === 0 ? (
            <div className="rounded-3xl bg-white dark:bg-gray-800/80 backdrop-blur border border-emerald-100 dark:border-gray-700 shadow-sm px-4">
              <EmptyState title="Tidak ada kamar yang cocok" desc="Coba ubah kata kunci pencarian." />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {kamarHalaman.map(k => (
                <div key={k.id} className="rounded-3xl bg-white dark:bg-gray-800/90 backdrop-blur border border-emerald-100 dark:border-gray-700 shadow-sm p-5 flex flex-col transition hover:shadow-lg">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="font-extrabold text-xl text-emerald-800 dark:text-emerald-300">No. {k.nomor}</div>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-gray-700 shrink-0">Kosong</span>
                  </div>
                  <div className="text-sm text-emerald-600 dark:text-emerald-300 mb-1">{k.tipe || '-'}</div>
                  <div className="text-lg font-bold text-emerald-800 dark:text-emerald-300 mb-2">
                    {formatRupiah(k.harga_bulanan)}<span className="text-xs font-normal text-emerald-400 dark:text-emerald-300">/bulan</span>
                  </div>
                  <div className="text-sm text-emerald-500 dark:text-emerald-400 dark:text-emerald-300 mb-4 flex-1">Fasilitas: {k.fasilitas || '-'}</div>
                  <button
                    type="button"
                    onClick={() => bukaModal(k)}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-bold shadow-lg shadow-emerald-200 transition hover:bg-emerald-700 active:scale-[0.99]"
                  >
                    Pesan Kamar
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Pagination
                halaman={halaman}
                perHalaman={perHalaman}
                total={kamarTerfilter.length}
                onUbahHalaman={setHalaman}
                onUbahPerHalaman={setPerHalaman}
                loading={memuatKamar}
              />
            </div>
          </>
          )}
        </section>

        {kos.aturan_kos && kos.aturan_kos.trim() && (
          <section className="mt-6 rounded-3xl bg-white dark:bg-gray-800/90 backdrop-blur border border-emerald-100 dark:border-gray-700 shadow-sm overflow-hidden">
            <button
              type="button"
              onClick={() => setAturanTerbuka(v => !v)}
              aria-expanded={aturanTerbuka}
              className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left"
            >
              <span className="font-extrabold text-emerald-800 dark:text-emerald-300">Aturan Kos</span>
              <span className="w-7 h-7 shrink-0 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-lg leading-none">
                {aturanTerbuka ? '−' : '+'}
              </span>
            </button>
            {aturanTerbuka && (
              <div className="px-5 pb-5 -mt-1 text-sm text-emerald-700 dark:text-emerald-300 leading-relaxed whitespace-pre-line">{kos.aturan_kos}</div>
            )}
          </section>
        )}
      </main>

      <Modal
        open={modalBuka}
        onClose={tutupModal}
        title={berhasil ? 'Pengajuan Terkirim' : kamarTerpilih ? `Pesan Kamar ${kamarTerpilih.nomor}` : 'Pesan Kamar'}
      >
        {berhasil ? (
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-3xl text-emerald-600 dark:text-emerald-300">✓</div>
            <p className="font-extrabold text-emerald-800 dark:text-emerald-300 leading-snug">
              Pengajuan terkirim. Pemilik kos akan menghubungi Anda lewat WhatsApp.
            </p>
            <div className="mt-4 rounded-2xl bg-emerald-50 dark:bg-gray-800/50 border border-emerald-100 dark:border-gray-700 text-left text-sm text-emerald-800 dark:text-emerald-300 divide-y divide-emerald-100">
              <div className="flex items-center justify-between gap-3 px-4 py-2.5">
                <span className="text-emerald-500 dark:text-emerald-400 dark:text-emerald-300">Kamar</span>
                <span className="font-bold text-right">No. {hasil?.nomor}</span>
              </div>
              <div className="flex items-center justify-between gap-3 px-4 py-2.5">
                <span className="text-emerald-500 dark:text-emerald-400 dark:text-emerald-300">Tanggal masuk</span>
                <span className="font-bold text-right">{formatTanggal(hasil?.tanggal)}</span>
              </div>
            </div>
            {linkWASukses && (
              <a
                href={linkWASukses}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full mt-4 px-4 py-3 rounded-xl bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-200 transition hover:bg-emerald-700"
              >
                Kabari pemilik via WhatsApp
              </a>
            )}
            <button
              type="button"
              onClick={tutupModal}
              className="w-full mt-3 py-3 rounded-xl bg-emerald-50 dark:bg-gray-800/50 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-100 dark:border-gray-700 transition hover:bg-emerald-100 dark:hover:bg-emerald-900/40"
            >
              Tutup
            </button>
          </div>
        ) : (
          <form onSubmit={kirimPengajuan} className="space-y-3" noValidate>
            <div>
              <label htmlFor="pm-nama" className={labelCls}>Nama Lengkap <span className="text-red-500">*</span></label>
              <input
                id="pm-nama"
                type="text"
                value={form.nama}
                onChange={e => ubah('nama', e.target.value)}
                placeholder="Nama Anda"
                maxLength={100}
                autoComplete="name"
                className={inputCls(galat.nama)}
              />
              {galat.nama && <p className={errCls}>{galat.nama}</p>}
            </div>

            <div>
              <label htmlFor="pm-hp" className={labelCls}>Nomor HP / WhatsApp <span className="text-red-500">*</span></label>
              <input
                id="pm-hp"
                type="tel"
                value={form.noHp}
                onChange={e => ubah('noHp', e.target.value)}
                placeholder="08xxxxxxxxxx"
                inputMode="tel"
                autoComplete="tel"
                className={inputCls(galat.noHp)}
              />
              {galat.noHp && <p className={errCls}>{galat.noHp}</p>}
            </div>

            <div>
              <label htmlFor="pm-tanggal" className={labelCls}>Tanggal Masuk Yang Diinginkan <span className="text-red-500">*</span></label>
              <input
                id="pm-tanggal"
                type="date"
                value={form.tanggalMasuk}
                onChange={e => ubah('tanggalMasuk', e.target.value)}
                min={minTanggal}
                max={maxTanggal}
                className={inputCls(galat.tanggalMasuk)}
              />
              {galat.tanggalMasuk && <p className={errCls}>{galat.tanggalMasuk}</p>}
            </div>

            <div>
              <label htmlFor="pm-catatan" className={labelCls}>Catatan (opsional)</label>
              <textarea
                id="pm-catatan"
                value={form.catatan}
                onChange={e => ubah('catatan', e.target.value)}
                placeholder="Permintaan khusus, pertanyaan, dll."
                rows={3}
                maxLength={500}
                className={`${inputCls(galat.catatan)} resize-none`}
              />
              <div className={`text-xs mt-1 text-right ${form.catatan.length > 450 ? 'text-amber-600 dark:text-amber-300 font-bold' : 'text-emerald-500 dark:text-emerald-400 dark:text-emerald-300'}`}>
                {form.catatan.length}/500
              </div>
              {galat.catatan && <p className={`${errCls} -mt-1`}>{galat.catatan}</p>}
            </div>

            <div>
              <label className="flex items-start gap-3 text-sm text-emerald-800 dark:text-emerald-300">
                <input
                  type="checkbox"
                  checked={form.setuju}
                  onChange={e => ubah('setuju', e.target.checked)}
                  className="mt-0.5 w-4 h-4 shrink-0 accent-emerald-600"
                />
                <span>Data saya dipakai pemilik kos hanya untuk menghubungi dan memproses pemesanan ini</span>
              </label>
              {galat.setuju && <p className={errCls}>{galat.setuju}</p>}
            </div>

            <div className="absolute left-[-9999px] w-px h-px overflow-hidden" aria-hidden="true">
              <label htmlFor="pm-jebakan">Website</label>
              <input
                id="pm-jebakan"
                type="text"
                name="website"
                value={form.jebakan}
                onChange={e => ubah('jebakan', e.target.value)}
                tabIndex={-1}
                autoComplete="off"
              />
            </div>

            <button
              type="submit"
              disabled={kirimSedang}
              className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg shadow-emerald-200 transition transform active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {kirimSedang ? (
                <>
                  <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  <span>Mengirim...</span>
                </>
              ) : (
                'Kirim Pengajuan'
              )}
            </button>
          </form>
        )}
      </Modal>
    </div>
  )
}
