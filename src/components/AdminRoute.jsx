import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'
import { useProfil } from '../hooks/useProfil.jsx'

export default function AdminRoute({ children }) {
  const { user, loading: authLoading } = useAuth()
  const { profil, loading } = useProfil()
  if (authLoading || loading) return <div className="min-h-screen flex items-center justify-center bg-emerald-50"><div className="w-10 h-10 border-4 border-emerald-300 border-t-emerald-600 rounded-full animate-spin" /></div>
  if (!user) return <Navigate to="/login" replace />
  if (profil?.role === 'admin' && profil?.aktif !== false) return children
  return <Navigate to="/" replace />
}
