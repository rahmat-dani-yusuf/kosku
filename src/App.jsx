import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ToastProvider } from './components/Toast.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import Layout from './components/Layout.jsx'
import Login from './pages/Login.jsx'
import Daftar from './pages/Daftar.jsx'
import Beranda from './pages/Beranda.jsx'
import Kamar from './pages/Kamar.jsx'
import Penghuni from './pages/Penghuni.jsx'
import Sewa from './pages/Sewa.jsx'
import Tagihan from './pages/Tagihan.jsx'
import Laporan from './pages/Laporan.jsx'
import Profil from './pages/Profil.jsx'
import Lainnya from './pages/Lainnya.jsx'

function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/daftar" element={<Daftar />} />
          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route path="/" element={<Beranda />} />
            <Route path="/kamar" element={<Kamar />} />
            <Route path="/penghuni" element={<Penghuni />} />
            <Route path="/sewa" element={<Sewa />} />
            <Route path="/tagihan" element={<Tagihan />} />
            <Route path="/laporan" element={<Laporan />} />
            <Route path="/profil" element={<Profil />} />
            <Route path="/lainnya" element={<Lainnya />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  )
}

export default App
