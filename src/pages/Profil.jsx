import { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth.jsx'
import { supabase } from '../lib/supabaseClient.js'

export default function Profil() {
  const { user, signOut } = useAuth()
  const [data, setData] = useState({ nama_pemilik: '', nama_kos: '', alamat: '', no_wa: '' })
  useEffect(() => {
    if (!user) return
    supabase.from('profiles').select('*').eq('id', user.id).single()
      .then(({ data }) => { if (data) setData(data) })
  }, [user])

  return (
    <div className="bg-white/80 backdrop-blur rounded-3xl shadow-xl border border-emerald-100 p-8 md:p-10">
      <h1 className="text-2xl font-extrabold text-emerald-800 mb-6">Profil</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
        <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-100"><strong>Nama Pemilik</strong><div className="text-emerald-800 font-medium">{data.nama_pemilik || '-'}</div></div>
        <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-100"><strong>Nama Kos</strong><div className="text-emerald-800 font-medium">{data.nama_kos || '-'}</div></div>
        <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-100"><strong>Alamat</strong><div className="text-emerald-800 font-medium">{data.alamat || '-'}</div></div>
        <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-100"><strong>No. WA</strong><div className="text-emerald-800 font-medium">{data.no_wa || '-'}</div></div>
      </div>
      <button onClick={signOut} className="mt-8 w-full py-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-bold border border-red-100 transition">Keluar</button>
    </div>
  )
}
