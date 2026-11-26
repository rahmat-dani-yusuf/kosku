import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient.js'

export default function LupaSandi() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [terkirim, setTerkirim] = useState(false)
  const [loading, setLoading] = useState(false)
  const [cooldown, setCooldown] = useState(0)

  useEffect(() => { document.title = 'Lupa Kata Sandi - KosKu' }, [])

  useEffect(() => {
    if (cooldown <= 0) return
    const t = setInterval(() => setCooldown(c => (c > 0 ? c - 1 : 0)), 1000)
    return () => clearInterval(t)
  }, [cooldown])

  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!validEmail) {
      setError('Format email tidak valid')
      return
    }
    if (cooldown > 0 || loading) return
    setLoading(true)
    try {
      const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/atur-ulang-sandi`,
      })
      if (err) throw err
      setTerkirim(true)
      setCooldown(60)
    } catch (err) {
      const msg = String(err?.message || '').toLowerCase()
      if (msg.includes('rate') || msg.includes('too many')) {
        setError('Terlalu banyak percobaan, coba lagi nanti.')
      } else if (msg.includes('network') || msg.includes('fetch') || msg.includes('failed to fetch')) {
        setError('Gagal terhubung ke server, periksa koneksi Anda.')
      } else {
        setError(err?.message || 'Terjadi kesalahan, coba lagi.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 dark:from-gray-950 dark:to-gray-900 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm bg-white/90 dark:bg-gray-800/90 backdrop-blur rounded-3xl shadow-2xl p-8 border border-white/40 dark:border-gray-700">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-emerald-800 dark:text-emerald-300 tracking-tight">Kosku</h1>
          <p className="text-emerald-600 dark:text-gray-300 text-sm mt-1">Lupa kata sandi</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label htmlFor="email" className="block text-xs font-semibold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider mb-1">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
              className="w-full px-4 py-3 rounded-xl bg-emerald-50/60 dark:bg-gray-900 border border-emerald-100 dark:border-gray-700 text-emerald-900 dark:text-gray-100 placeholder:text-emerald-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition"
              required
            />
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-100 dark:border-red-800 text-red-700 dark:text-red-200 text-sm px-4 py-3" role="alert">
              {error}
            </div>
          )}

          {terkirim && !error && (
            <div className="rounded-xl bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-800 text-emerald-700 dark:text-emerald-200 text-sm px-4 py-3" role="status">
              Jika email terdaftar, tautan untuk mengatur ulang kata sandi sudah dikirim. Periksa kotak masuk dan folder spam.
            </div>
          )}

          <button
            type="submit"
            disabled={loading || cooldown > 0 || !validEmail}
            className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg shadow-emerald-200 transition transform active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                <span>Mengirim...</span>
              </>
            ) : cooldown > 0 ? (
              `Kirim ulang (${cooldown})`
            ) : (
              'Kirim tautan reset'
            )}
          </button>
        </form>

        <p className="text-center text-sm text-emerald-600 dark:text-gray-300 mt-6">
          <Link to="/login" className="font-bold text-emerald-700 dark:text-emerald-300 hover:underline">Kembali ke masuk</Link>
        </p>
      </div>
    </div>
  )
}
