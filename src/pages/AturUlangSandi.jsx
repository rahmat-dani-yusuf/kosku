import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient.js'
import { useToast } from '../components/Toast.jsx'
import InputSandi from '../components/InputSandi.jsx'

export default function AturUlangSandi() {
  const navigate = useNavigate()
  const { show } = useToast()
  const [recovery, setRecovery] = useState(null)
  const [password, setPassword] = useState('')
  const [konfirmasi, setKonfirmasi] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { document.title = 'Atur Ulang Kata Sandi - KosKu' }, [])

  useEffect(() => {
    let mounted = true
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return
      if (event === 'PASSWORD_RECOVERY' || session) {
        setRecovery(true)
      }
    })
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return
      if (data?.session) setRecovery(true)
      else setRecovery(false)
    })
    const t = setTimeout(() => {
      if (mounted) setRecovery((r) => (r === null ? false : r))
    }, 2000)
    return () => {
      mounted = false
      subscription.unsubscribe()
      clearTimeout(t)
    }
  }, [])

  const valid = password.length >= 8 && password === konfirmasi

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (password.length < 8) {
      setError('Kata sandi minimal 8 karakter')
      return
    }
    if (password !== konfirmasi) {
      setError('Konfirmasi kata sandi tidak sama')
      return
    }
    setLoading(true)
    try {
      const { error: err } = await supabase.auth.updateUser({ password })
      if (err) throw err
      show('Kata sandi diperbarui')
      await supabase.auth.signOut()
      navigate('/login', { replace: true })
    } catch (err) {
      setError(err?.message || 'Gagal memperbarui kata sandi')
    } finally {
      setLoading(false)
    }
  }

  if (recovery === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 dark:from-gray-950 dark:to-gray-900 flex items-center justify-center px-6 py-12">
        <div className="w-10 h-10 border-4 border-emerald-300 border-t-emerald-600 rounded-full animate-spin" />
      </div>
    )
  }

  if (!recovery) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 dark:from-gray-950 dark:to-gray-900 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm bg-white/90 dark:bg-gray-800/90 backdrop-blur rounded-3xl shadow-2xl p-8 border border-white/40 dark:border-gray-700 text-center">
          <h1 className="text-2xl font-extrabold text-emerald-800 dark:text-emerald-300 mb-3">Tautan tidak valid atau sudah kedaluwarsa</h1>
          <p className="text-emerald-600 dark:text-gray-300 text-sm mb-6">Minta tautan baru untuk mengatur ulang kata sandi.</p>
          <a href="/lupa-sandi" className="block w-full py-3 rounded-xl bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition">Ke Lupa Kata Sandi</a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 dark:from-gray-950 dark:to-gray-900 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm bg-white/90 dark:bg-gray-800/90 backdrop-blur rounded-3xl shadow-2xl p-8 border border-white/40 dark:border-gray-700">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-emerald-800 dark:text-emerald-300 tracking-tight">Kosku</h1>
          <p className="text-emerald-600 dark:text-gray-300 text-sm mt-1">Atur ulang kata sandi</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label htmlFor="password" className="block text-xs font-semibold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider mb-1">Kata Sandi Baru</label>
            <InputSandi
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimal 8 karakter"
              className="w-full px-4 py-3 rounded-xl bg-emerald-50/60 dark:bg-gray-900 border border-emerald-100 dark:border-gray-700 text-emerald-900 dark:text-gray-100 placeholder:text-emerald-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition"
              required
              minLength={8}
            />
          </div>
          <div>
            <label htmlFor="konfirmasi" className="block text-xs font-semibold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider mb-1">Konfirmasi Kata Sandi</label>
            <InputSandi
              id="konfirmasi"
              value={konfirmasi}
              onChange={(e) => setKonfirmasi(e.target.value)}
              placeholder="Ulangi kata sandi"
              className="w-full px-4 py-3 rounded-xl bg-emerald-50/60 dark:bg-gray-900 border border-emerald-100 dark:border-gray-700 text-emerald-900 dark:text-gray-100 placeholder:text-emerald-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition"
              required
              minLength={8}
            />
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-100 dark:border-red-800 text-red-700 dark:text-red-200 text-sm px-4 py-3" role="alert">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !valid}
            className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg shadow-emerald-200 transition transform active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                <span>Memperbarui...</span>
              </>
            ) : (
              'Perbarui Kata Sandi'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
