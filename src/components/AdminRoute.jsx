import { Navigate } from 'react-router-dom'
import { useProfil } from '../hooks/useProfil.jsx'

export default function AdminRoute({ children }) {
  const { profil, loading } = useProfil()
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-emerald-50"><div className="w-10 h-10 border-4 border-emerald-300 border-t-emerald-600 rounded-full animate-spin" /></div>
  if (profil?.role === 'admin' && profil?.aktif !== false) return children
  return <Navigate to="/" replace />
}
