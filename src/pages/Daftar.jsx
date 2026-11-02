import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'

function translateError(err) {
  const msg = err?.message || ''
  if (msg.includes('already registered') || msg.includes('User already registered')) return 'Email sudah terdaftar'
  if (msg.includes('Password should be at least 6 characters')) return 'Password minimal 6 karakter'
  if (msg.includes('Invalid email')) return 'Format email tidak valid'
  if (msg.includes('Email not confirmed')) return 'Email belum dikonfirmasi'
  return msg || 'Terjadi kesalahan'
}

export default function Daftar() {
  const { user, loading: authLoading, signUp } = useAuth()
  const [namaPemilik, setNamaPemilik] = useState('')
  const [namaKos, setNamaKos] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  if (user) return <Navigate to="/" replace />

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (!namaPemilik.trim() || !namaKos.trim()) {
      setError('Isi nama pemilik dan nama kos')
      return
    }
    if (password.length < 6) {
      setError('Password minimal 6 karakter')
      return
    }
    setLoading(true)
    try {
      const { data } = await signUp(email.trim(), password, namaPemilik.trim(), namaKos.trim())
      if (data?.user && !data?.session) {
        setSuccess('Pendaftaran berhasil. Periksa email Anda untuk konfirmasi sebelum masuk.')
      }
    } catch (err) {
      setError(translateError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm bg-white/90 backdrop-blur rounded-3xl shadow-2xl p-8 border border-white/40">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-emerald-800 tracking-tight">Kosku</h1>
          <p className="text-emerald-600 text-sm mt-1">Buat akun baru</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label htmlFor="namaPemilik" className="block text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1">Nama Pemilik</label>
            <input
              id="namaPemilik"
              value={namaPemilik}
              onChange={(e) => setNamaPemilik(e.target.value)}
              placeholder="Contoh: Budi Santoso"
              className="w-full px-4 py-3 rounded-xl bg-emerald-50/60 border border-emerald-100 text-emerald-900 placeholder:text-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition"
              required
            />
          </div>
          <div>
            <label htmlFor="namaKos" className="block text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1">Nama Kos</label>
            <input
              id="namaKos"
              value={namaKos}
              onChange={(e) => setNamaKos(e.target.value)}
              placeholder="Contoh: Kos Mawar"
              className="w-full px-4 py-3 rounded-xl bg-emerald-50/60 border border-emerald-100 text-emerald-900 placeholder:text-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition"
              required
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="anda@email.com"
              className="w-full px-4 py-3 rounded-xl bg-emerald-50/60 border border-emerald-100 text-emerald-900 placeholder:text-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimal 6 karakter"
              className="w-full px-4 py-3 rounded-xl bg-emerald-50/60 border border-emerald-100 text-emerald-900 placeholder:text-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition"
              required
              minLength={6}
            />
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm px-4 py-3" role="alert">
              {error}
            </div>
          )}
          {success && (
            <div className="rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm px-4 py-3" role="status">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || authLoading}
            className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg shadow-emerald-200 transition transform active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                <span>Mendaftar...</span>
              </>
            ) : (
              'Daftar'
            )}
          </button>
        </form>

        <p className="text-center text-sm text-emerald-600 mt-6">
          Sudah punya akun?{' '}
          <Link to="/login" className="font-bold text-emerald-700 hover:underline">Masuk</Link>
        </p>
      </div>
    </div>
  )
}
