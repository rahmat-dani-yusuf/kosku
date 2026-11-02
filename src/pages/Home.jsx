import { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth.jsx'
import { supabase } from '../lib/supabaseClient.js'

export default function Home() {
  const { user, signOut } = useAuth()
  const [nama, setNama] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    supabase.from('profiles').select('nama_pemilik').eq('id', user.id).single()
      .then(({ data }) => {
        if (data?.nama_pemilik) setNama(data.nama_pemilik)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [user])

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-md bg-white/90 backdrop-blur rounded-3xl shadow-2xl p-10 border border-white/40 text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-emerald-100 flex items-center justify-center text-3xl shadow-inner" aria-hidden="true">
          🏠
        </div>
        <h1 className="text-3xl font-extrabold text-emerald-800 tracking-tight mb-2">
          {loading ? 'Memuat...' : `Halo, ${nama || 'Pemilik'}`}
        </h1>
        <p className="text-emerald-600 mb-8">Selamat mengelola kos Anda.</p>

        <button
          onClick={signOut}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-bold border border-red-100 transition"
        >
          Keluar
        </button>

        <p className="text-xs text-emerald-400 mt-6">Auth UID: {user?.id}</p>
      </div>
    </div>
  )
}
