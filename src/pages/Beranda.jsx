import { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth.jsx'
import { supabase } from '../lib/supabaseClient.js'

export default function Beranda() {
  const { user } = useAuth()
  const [nama, setNama] = useState('')
  const [load, setLoad] = useState(true)

  useEffect(() => {
    if (!user) return
    supabase.from('profiles').select('nama_pemilik').eq('id', user.id).single()
      .then(({ data }) => { if (data?.nama_pemilik) setNama(data.nama_pemilik); setLoad(false) })
      .catch(() => setLoad(false))
  }, [user])

  return (
    <div className="bg-white/80 backdrop-blur rounded-3xl shadow-xl border border-emerald-100 p-8 md:p-10 text-center">
      <h1 className="text-3xl md:text-4xl font-extrabold text-emerald-800 tracking-tight mb-2">
        {load ? 'Memuat...' : `Halo, ${nama || 'Pemilik'}`}
      </h1>
      <p className="text-emerald-600">Selamat mengelola kos Anda dari aplikasi KosKu.</p>
    </div>
  )
}
