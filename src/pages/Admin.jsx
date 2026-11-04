import { useEffect } from 'react'
import { useAuth } from '../hooks/useAuth.jsx'
import { useProfil } from '../hooks/useProfil.jsx'

export default function Admin() {
  useEffect(() => { document.title = 'Super Admin - KosKu' }, [])
  const { signOut } = useAuth()
  const { profil } = useProfil()

  return (
    <div className="min-h-screen bg-emerald-50 flex flex-col">
      <header className="bg-emerald-800 text-white px-6 py-4 flex items-center justify-between shadow-lg">
        <h1 className="text-xl font-extrabold tracking-tight">KosKu Super Admin</h1>
        <button onClick={() => signOut()} className="px-4 py-2 rounded-xl bg-white text-emerald-800 font-bold text-sm hover:bg-emerald-50 transition">Keluar</button>
      </header>
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="bg-white/90 backdrop-blur rounded-3xl shadow-2xl border border-emerald-100 p-10 max-w-lg w-full text-center">
          <h2 className="text-3xl font-extrabold text-emerald-800 mb-2">Halo, {profil?.nama_pemilik || 'Admin'}</h2>
          <p className="text-emerald-600 text-lg">Dashboard Super Admin akan tampil di sini</p>
        </div>
      </main>
    </div>
  )
}
