import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'
import { useProfil } from '../hooks/useProfil.jsx'

export default function ProtectedRoute({ children }) {
  const { user, loading: authLoading, signOut } = useAuth()
  const { profil, loading: profilLoading } = useProfil()
  const location = useLocation()
  if (authLoading || profilLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-emerald-50">
        <div className="w-10 h-10 border-4 border-emerald-300 border-t-emerald-600 rounded-full animate-spin" />
      </div>
    )
  }
  if (!user) return <Navigate to="/login" replace />
  if (profil?.aktif === false) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-emerald-50 px-6 text-center">
        <div className="bg-white/90 backdrop-blur rounded-3xl shadow-xl border border-red-100 p-10 max-w-md w-full">
          <h1 className="text-2xl font-extrabold text-red-700 mb-3">Akun Anda dinonaktifkan</h1>
          <p className="text-emerald-700 mb-6">Silakan hubungi pengelola KosKu</p>
          <button onClick={() => signOut()} className="w-full py-3 rounded-xl bg-red-600 text-white font-bold shadow hover:bg-red-700 transition">Keluar</button>
        </div>
      </div>
    )
  }
  if (profil?.role === 'admin' && profil?.aktif !== false && location.pathname !== '/admin') {
    return <Navigate to="/admin" replace />
  }
  return children
}
