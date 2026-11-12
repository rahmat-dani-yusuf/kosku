import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ToastProvider } from './components/Toast.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import Layout from './components/Layout.jsx'
import Login from './pages/Login.jsx'
import Daftar from './pages/Daftar.jsx'
import Kamar from './pages/Kamar.jsx'
import Penghuni from './pages/Penghuni.jsx'
import Sewa from './pages/Sewa.jsx'
import Pemesanan from './pages/Pemesanan.jsx'
import Tagihan from './pages/Tagihan.jsx'
import Profil from './pages/Profil.jsx'
import AdminRoute from './components/AdminRoute.jsx'
import Lainnya from './pages/Lainnya.jsx'
import Pengaturan from './pages/Pengaturan.jsx'
import PesanKamar from './pages/PesanKamar.jsx'

const Beranda = lazy(() => import('./pages/Beranda.jsx'))
const Laporan = lazy(() => import('./pages/Laporan.jsx'))
const Admin = lazy(() => import('./pages/Admin.jsx'))

function FallbackHalaman() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <span className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
        <span className="text-sm font-bold text-emerald-600">Memuat...</span>
      </div>
    </div>
  )
}

function Halaman({ children }) {
  return <Suspense fallback={<FallbackHalaman />}>{children}</Suspense>
}

function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/daftar" element={<Daftar />} />
          <Route path="/kos/:kosId" element={<PesanKamar />} />
          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route path="/" element={<Halaman><Beranda /></Halaman>} />
            <Route path="/kamar" element={<Kamar />} />
            <Route path="/penghuni" element={<Penghuni />} />
            <Route path="/sewa" element={<Sewa />} />
            <Route path="/pemesanan" element={<Pemesanan />} />
            <Route path="/tagihan" element={<Tagihan />} />
            <Route path="/laporan" element={<Halaman><Laporan /></Halaman>} />
            <Route path="/profil" element={<Profil />} />
            <Route path="/pengaturan" element={<Pengaturan />} />
            <Route path="/lainnya" element={<Lainnya />} />
          </Route>
          <Route path="/admin" element={<AdminRoute><Halaman><Admin /></Halaman></AdminRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  )
}

export default App
