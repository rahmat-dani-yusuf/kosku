import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient.js'
import { formatRupiah, formatTanggal, formatPeriode, parseRupiah } from '../lib/format.js'
import { buatLinkWA } from '../lib/whatsapp.js'
import { useToast } from '../components/Toast.jsx'

function kompresiGambar(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      let w = img.naturalWidth || img.width
      let h = img.naturalHeight || img.height
      const max = 1600
      if (w > max || h > max) {
        if (w >= h) {
          h = Math.round(h * max / w)
          w = max
        } else {
          w = Math.round(w * max / h)
          h = max
        }
      }
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, w, h)
      ctx.drawImage(img, 0, 0, w, h)
      canvas.toBlob((blob) => {
        if (!blob) reject(new Error('Gagal memproses gambar'))
        else resolve(blob)
      }, 'image/jpeg', 0.8)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Berkas bukan gambar yang valid'))
    }
    img.src = url
  })
}

const inputCls = (ada) =>
  `w-full px-4 py-3 rounded-xl bg-emerald-50/60 dark:bg-gray-900 border ${ada ? 'border-red-300' : 'border-emerald-100 dark:border-gray-700'} text-emerald-900 dark:text-gray-100 placeholder:text-emerald-400 dark:text-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition`
const labelCls = 'block text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider mb-1'
const errCls = 'text-xs text-red-600 dark:text-red-300 mt-1'

function SkeletonTagihan() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-6 w-40 rounded-lg bg-emerald-100 dark:bg-emerald-900/40" />
      <div className="rounded-3xl bg-white dark:bg-gray-800/80 border border-emerald-100 dark:border-gray-700 p-5 space-y-3">
        <div className="h-4 w-32 rounded bg-emerald-100 dark:bg-emerald-900/40" />
        <div className="h-4 w-48 rounded bg-emerald-100 dark:bg-emerald-900/40" />
        <div className="h-4 w-40 rounded bg-emerald-100 dark:bg-emerald-900/40" />
        <div className="h-10 w-full rounded-xl bg-emerald-100 dark:bg-emerald-900/40" />
      </div>
    </div>
  )
}

export default function BayarTagihan() {
  const { tagihanId } = useParams()
  const { show } = useToast()

  const [data, setData] = useState(null)
  const [memuat, setMemuat] = useState(true)
  const [tidakDitemukan, setTidakDitemukan] = useState(false)

  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState('')
  const [namaPengirim, setNamaPengirim] = useState('')
  const [catatan, setCatatan] = useState('')
  const [jumlahStr, setJumlahStr] = useState('')
  const [galatJumlah, setGalatJumlah] = useState('')
  const [galatFile, setGalatFile] = useState('')
  const [galatNama, setGalatNama] = useState('')
  const [galatCatatan, setGalatCatatan] = useState('')
  const [errorKirim, setErrorKirim] = useState('')
  const [sedangKirim, setSedangKirim] = useState(false)
  const [berhasil, setBerhasil] = useState(false)

  useEffect(() => { document.title = 'Bayar Tagihan - KosKu' }, [])

  useEffect(() => {
    let batal = false
    async function muat() {
      setMemuat(true)
      setTidakDitemukan(false)
      setData(null)
      const id = String(tagihanId || '').trim()
      if (!id) {
        if (!batal) {
          setTidakDitemukan(true)
          setMemuat(false)
        }
        return
      }
      let d = null
      let error = null
      try {
        ;({ data: d, error } = await supabase.rpc('tagihan_publik', { p_tagihan: id }))
      } catch (e) {
        error = e
      }
      if (batal) return
      const row = Array.isArray(d) ? d[0] : d
      const ada = !error && row && typeof row === 'object' && Object.keys(row).length > 0
      if (!ada) {
        setTidakDitemukan(true)
        setMemuat(false)
        return
      }
      setData(row)
      setMemuat(false)
    }
    muat()
    return () => { batal = true }
  }, [tagihanId])

  useEffect(() => {
    if (!data) return
    const sisa = Number(data.jumlah || 0) - Number(data.terbayar || 0)
    setJumlahStr(formatRupiah(sisa))
    setGalatJumlah('')
  }, [data])

  const onFile = (e) => {
    const f = e.target.files?.[0]
    if (!f) return
    const tipeOk = ['image/jpeg', 'image/png', 'image/webp'].includes(f.type)
    if (!tipeOk) {
      setGalatFile('Berkas harus berupa gambar JPEG, PNG, atau WebP')
      setFile(null)
      if (preview) setPreview('')
      return
    }
    if (f.size > 10 * 1024 * 1024) {
      setGalatFile('Ukuran berkas maksimal 10 MB')
      setFile(null)
      if (preview) setPreview('')
      return
    }
    setGalatFile('')
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  const salinInfo = async () => {
    const info = String(data?.info_pembayaran || '').trim()
    if (!info) return
    try {
      await navigator.clipboard.writeText(info)
      show('Disalin')
    } catch {
      show('Gagal menyalin', 'error')
    }
  }

  const kirim = async (e) => {
    e.preventDefault()
    if (sedangKirim) return
    setErrorKirim('')
    let ok = true
    if (!file) {
      setGalatFile('Pilih gambar bukti transfer')
      ok = false
    }
    const n = namaPengirim.trim()
    if (n && (n.length < 2 || n.length > 100)) {
      setGalatNama('Nama pengirim 2 sampai 100 karakter')
      ok = false
    } else {
      setGalatNama('')
    }
    if (catatan.length > 300) {
      setGalatCatatan('Catatan maksimal 300 karakter')
      ok = false
    } else {
      setGalatCatatan('')
    }
    const izinkan = data?.izinkan_cicilan ?? true
    const cicilanMinimum = Number(data?.cicilan_minimum || 0)
    const terbayar = Number(data?.terbayar || 0)
    const sisa = Number(data?.jumlah || 0) - terbayar
    const jumlahNum = parseRupiah(jumlahStr)
    let galatJ = ''
    if (jumlahNum <= 0) galatJ = 'Jumlah harus lebih dari 0'
    else if (jumlahNum > sisa) galatJ = `Jumlah melebihi sisa tagihan (sisa ${formatRupiah(sisa)})`
    else if (jumlahNum < sisa && izinkan && cicilanMinimum > 0 && jumlahNum < cicilanMinimum) galatJ = `Minimal tiap pembayaran ${formatRupiah(cicilanMinimum)}`
    else if (!izinkan && jumlahNum !== sisa) galatJ = 'Pemilik kos hanya menerima pembayaran penuh'
    if (galatJ) {
      setGalatJumlah(galatJ)
      ok = false
    } else {
      setGalatJumlah('')
    }
    if (!ok) return

    setSedangKirim(true)
    try {
      const blob = await kompresiGambar(file)
      const path = `${tagihanId}/${crypto.randomUUID()}.jpg`
      const { error: upErr } = await supabase.storage
        .from('bukti-bayar')
        .upload(path, blob, { contentType: 'image/jpeg', upsert: false })
      if (upErr) throw upErr
      const { error: rpcErr } = await supabase.rpc('kirim_bukti_bayar', {
        p_tagihan: tagihanId,
        p_path: path,
        p_nama: n || null,
        p_catatan: catatan.trim() || null,
        p_jumlah: parseRupiah(jumlahStr) || null,
      })
      if (rpcErr) throw rpcErr
      setBerhasil(true)
    } catch (err) {
      setErrorKirim(err?.message || 'Gagal mengirim bukti')
    } finally {
      setSedangKirim(false)
    }
  }

  if (memuat) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100">
        <header className="bg-emerald-600">
          <div className="max-w-md mx-auto px-4 py-5">
            <div className="text-xs font-bold uppercase tracking-widest text-emerald-200 mb-2">KosKu</div>
            <div className="h-7 w-40 rounded-lg bg-emerald-50 dark:bg-gray-800/500 animate-pulse mb-2" />
            <div className="h-4 w-56 rounded-lg bg-emerald-50 dark:bg-gray-800/500 animate-pulse" />
          </div>
        </header>
        <main className="max-w-md mx-auto px-4 py-6">
          <SkeletonTagihan />
        </main>
      </div>
    )
  }

  if (tidakDitemukan || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100">
        <header className="bg-emerald-600">
          <div className="max-w-md mx-auto px-4 py-5">
            <div className="text-xs font-bold uppercase tracking-widest text-emerald-200">KosKu</div>
          </div>
        </header>
        <main className="max-w-md mx-auto px-4 py-10">
          <div className="rounded-3xl bg-white dark:bg-gray-800/90 backdrop-blur border border-emerald-100 dark:border-gray-700 shadow-sm p-8 text-center">
            <p className="font-extrabold text-emerald-800 dark:text-emerald-300">Tagihan tidak ditemukan</p>
          </div>
        </main>
      </div>
    )
  }

  if (data.status !== 'belum') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100">
        <header className="bg-emerald-600 text-white shadow-lg shadow-emerald-200">
          <div className="max-w-md mx-auto px-4 py-5">
            <div className="text-xs font-bold uppercase tracking-widest text-emerald-200 mb-1">KosKu</div>
            <h1 className="text-xl font-extrabold leading-tight">{data.nama_kos}</h1>
          </div>
        </header>
        <main className="max-w-md mx-auto px-4 py-10">
          <div className="rounded-3xl bg-white dark:bg-gray-800/90 backdrop-blur border border-emerald-100 dark:border-gray-700 shadow-sm p-8 text-center">
            <p className="font-extrabold text-emerald-800 dark:text-emerald-300">Tagihan ini sudah dibayar. Terima kasih.</p>
          </div>
        </main>
      </div>
    )
  }

  const info = String(data.info_pembayaran || '').trim()
  const periodeStr = formatPeriode(data.periode)
  const izinkanCicilan = data.izinkan_cicilan ?? true
  const cicilanMinimum = Number(data.cicilan_minimum || 0)
  const terbayarPub = Number(data.terbayar || 0)
  const sisaPub = Number(data.jumlah || 0) - terbayarPub
  const jumlahNumPub = parseRupiah(jumlahStr)
  const jumlahValid = jumlahNumPub > 0 && jumlahNumPub <= sisaPub && !(jumlahNumPub < sisaPub && izinkanCicilan && cicilanMinimum > 0 && jumlahNumPub < cicilanMinimum) && (izinkanCicilan || jumlahNumPub === sisaPub)
  const waMsg = `Halo, saya sudah mengunggah bukti pembayaran ${formatRupiah(parseRupiah(jumlahStr))} untuk kamar ${data.nomor_kamar} periode ${periodeStr} di ${data.nama_kos}. Mohon dicek. Terima kasih.`
  const linkWA = data.no_wa ? buatLinkWA(data.no_wa, waMsg) : ''

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100">
      <header className="bg-emerald-600 text-white shadow-lg shadow-emerald-200">
        <div className="max-w-md mx-auto px-4 py-5">
          <div className="text-xs font-bold uppercase tracking-widest text-emerald-200 mb-1">KosKu</div>
          <h1 className="text-xl font-extrabold leading-tight">{data.nama_kos}</h1>
          <p className="text-emerald-100 text-sm mt-1">Bayar Tagihan</p>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-6 pb-16 space-y-4">
        <section className="rounded-3xl bg-white dark:bg-gray-800/90 backdrop-blur border border-emerald-100 dark:border-gray-700 shadow-sm p-5">
          <h2 className="text-lg font-extrabold text-emerald-800 dark:text-emerald-300 mb-3">Detail Tagihan</h2>
          <div className="space-y-2 text-sm">
            <div className="flex items-start justify-between gap-3">
              <span className="text-emerald-500 dark:text-emerald-400 dark:text-emerald-300 shrink-0">Nama kos</span>
              <span className="font-bold text-emerald-900 dark:text-gray-100 text-right break-words">{data.nama_kos}</span>
            </div>
            <div className="flex items-start justify-between gap-3">
              <span className="text-emerald-500 dark:text-emerald-400 dark:text-emerald-300 shrink-0">Nomor kamar</span>
              <span className="font-bold text-emerald-900 dark:text-gray-100 text-right break-words">{data.nomor_kamar}</span>
            </div>
            <div className="flex items-start justify-between gap-3">
              <span className="text-emerald-500 dark:text-emerald-400 dark:text-emerald-300 shrink-0">Periode</span>
              <span className="font-bold text-emerald-900 dark:text-gray-100 text-right break-words">{periodeStr}</span>
            </div>
            <div className="flex items-start justify-between gap-3">
              <span className="text-emerald-500 dark:text-emerald-400 dark:text-emerald-300 shrink-0">Tagihan</span>
              <span className="font-extrabold text-emerald-800 dark:text-emerald-300 text-right break-words">{formatRupiah(data.jumlah)}</span>
            </div>
            {Number(data.terbayar || 0) > 0 && (
              <>
                <div className="flex items-start justify-between gap-3">
                  <span className="text-emerald-500 dark:text-emerald-400 dark:text-emerald-300 shrink-0">Sudah dibayar</span>
                  <span className="font-bold text-emerald-900 dark:text-gray-100 text-right break-words">{formatRupiah(data.terbayar)}</span>
                </div>
                <div className="flex items-start justify-between gap-3">
                  <span className="text-emerald-500 dark:text-emerald-400 dark:text-emerald-300 shrink-0">Sisa tagihan</span>
                  <span className="font-extrabold text-emerald-800 dark:text-emerald-300 text-right break-words">{formatRupiah(Number(data.jumlah || 0) - Number(data.terbayar || 0))}</span>
                </div>
                <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                  <div className="h-2 bg-blue-500 dark:bg-blue-400" style={{ width: `${Math.min(100, (Number(data.terbayar || 0) / Number(data.jumlah || 1)) * 100)}%` }} />
                </div>
              </>
            )}
            <div className="flex items-start justify-between gap-3">
              <span className="text-emerald-500 dark:text-emerald-400 dark:text-emerald-300 shrink-0">Jatuh tempo</span>
              <span className="font-bold text-emerald-900 dark:text-gray-100 text-right break-words">{formatTanggal(data.jatuh_tempo)}</span>
            </div>
          </div>

          {info && (
            <div className="mt-4 rounded-2xl bg-emerald-50 dark:bg-gray-800/50 border border-emerald-100 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between gap-3 mb-2">
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">Info Pembayaran</span>
                <button
                  type="button"
                  onClick={salinInfo}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition"
                >
                  Salin
                </button>
              </div>
              <div className="text-sm text-emerald-800 dark:text-emerald-300 whitespace-pre-line break-words">{info}</div>
            </div>
          )}

          <p className="mt-4 text-xs text-emerald-600 dark:text-emerald-300 leading-relaxed">
            Bila melewati jatuh tempo, denda dapat dikenakan sesuai aturan kos; pemilik akan mengonfirmasi total akhir. Jumlah akhir yang diterima dikonfirmasi pemilik.
          </p>

          {data.ada_bukti_menunggu && (
            <div className="mt-3 rounded-2xl bg-amber-50 dark:bg-amber-900/30 border border-amber-100 dark:border-amber-800 text-amber-800 dark:text-amber-200 px-4 py-3 text-sm">
              Bukti sebelumnya sedang diperiksa pemilik, Anda masih bisa mengirim bukti baru.
            </div>
          )}
        </section>

        <section className="rounded-3xl bg-white dark:bg-gray-800/90 backdrop-blur border border-emerald-100 dark:border-gray-700 shadow-sm p-5">
          {berhasil ? (
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100 dark:bg-emerald-900/40" />
              <p className="font-extrabold text-emerald-800 dark:text-emerald-300 leading-snug">
                Bukti terkirim, jumlah {formatRupiah(parseRupiah(jumlahStr))}. Pemilik kos akan memeriksa dan mengonfirmasi pembayaran Anda.
              </p>
              {linkWA && (
                <a
                  href={linkWA}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full mt-4 px-4 py-3 rounded-xl bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-200 transition hover:bg-emerald-700"
                >
                  Kabari pemilik via WhatsApp
                </a>
              )}
            </div>
          ) : (
            <form onSubmit={kirim} className="space-y-3" noValidate>
              <div>
                <label htmlFor="bt-file" className={labelCls}>Bukti Transfer <span className="text-red-500">*</span></label>
                <input
                  id="bt-file"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={onFile}
                  className="w-full text-sm text-emerald-700 dark:text-emerald-300 file:mr-3 file:px-3 file:py-2 file:rounded-lg file:border-0 file:bg-emerald-600 file:text-white file:font-bold"
                />
                {galatFile && <p className={errCls}>{galatFile}</p>}
                {preview && (
                  <div className="mt-3">
                    <img src={preview} alt="Pratinjau" className="max-h-48 w-full object-contain rounded-xl border border-emerald-100 dark:border-gray-700 bg-emerald-50 dark:bg-gray-800/50" />
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="bt-nama" className={labelCls}>Nama Pengirim (opsional)</label>
                <input
                  id="bt-nama"
                  type="text"
                  value={namaPengirim}
                  onChange={(e) => { setNamaPengirim(e.target.value); if (galatNama) setGalatNama('') }}
                  placeholder="Nama pengirim"
                  maxLength={100}
                  className={inputCls(galatNama)}
                />
                {galatNama && <p className={errCls}>{galatNama}</p>}
              </div>

              <div>
                <label htmlFor="bt-catatan" className={labelCls}>Catatan (opsional)</label>
                <textarea
                  id="bt-catatan"
                  value={catatan}
                  onChange={(e) => { setCatatan(e.target.value); if (galatCatatan) setGalatCatatan('') }}
                  placeholder="Catatan tambahan"
                  rows={3}
                  maxLength={300}
                  className={`${inputCls(galatCatatan)} resize-none`}
                />
                <div className={`text-xs mt-1 text-right ${catatan.length > 270 ? 'text-amber-600 dark:text-amber-300 font-bold' : 'text-emerald-500 dark:text-emerald-400 dark:text-emerald-300'}`}>
                  {catatan.length}/300
                </div>
                {galatCatatan && <p className={`${errCls} -mt-1`}>{galatCatatan}</p>}
              </div>

              <div>
                <label htmlFor="bt-jumlah" className={labelCls}>Jumlah yang ditransfer (Rp) <span className="text-red-500">*</span></label>
                <input
                  id="bt-jumlah"
                  type="text"
                  value={jumlahStr}
                  onChange={(e) => { setJumlahStr(e.target.value); if (galatJumlah) setGalatJumlah('') }}
                  disabled={! (data?.izinkan_cicilan ?? true)}
                  className={inputCls(galatJumlah)}
                />
                {!(data?.izinkan_cicilan ?? true) && (
                  <p className="text-xs text-emerald-500 dark:text-emerald-400 dark:text-emerald-300 mt-1">Pemilik kos hanya menerima pembayaran penuh</p>
                )}
                {(data?.izinkan_cicilan ?? true) && Number(data?.cicilan_minimum || 0) > 0 && (
                  <p className="text-xs text-emerald-500 dark:text-emerald-400 dark:text-emerald-300 mt-1">Minimal tiap pembayaran {formatRupiah(data.cicilan_minimum)}, kecuali melunasi sisa</p>
                )}
                <div className="flex gap-2 mt-2">
                  <button type="button" onClick={() => { const s = Number(data?.jumlah || 0) - Number(data?.terbayar || 0); setJumlahStr(formatRupiah(s)); setGalatJumlah('') }} className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-gray-800/50 text-emerald-700 dark:text-emerald-300 text-xs font-bold hover:bg-emerald-100 transition">Bayar penuh (sisa)</button>
                  {(data?.izinkan_cicilan ?? true) && (
                    <button type="button" onClick={() => { const s = Number(data?.jumlah || 0) - Number(data?.terbayar || 0); setJumlahStr(formatRupiah(Math.max(Number(data?.cicilan_minimum || 0), Math.round(s / 2)))) ; setGalatJumlah('') }} className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-gray-800/50 text-emerald-700 dark:text-emerald-300 text-xs font-bold hover:bg-emerald-100 transition">Bayar sebagian</button>
                  )}
                </div>
                {galatJumlah && <p className={errCls}>{galatJumlah}</p>}
              </div>

              {errorKirim && (
                <div className="rounded-2xl bg-red-50 dark:bg-red-900/30 border border-red-100 dark:border-red-800 text-red-700 dark:text-red-200 px-4 py-3 text-sm" role="alert">
                  {errorKirim}
                </div>
              )}

              <button
                type="submit"
                disabled={sedangKirim || !jumlahValid}
                className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg shadow-emerald-200 transition transform active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {sedangKirim ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    <span>Mengunggah...</span>
                  </>
                ) : (
                  'Kirim Bukti'
                )}
              </button>
            </form>
          )}
        </section>
      </main>
    </div>
  )
}
