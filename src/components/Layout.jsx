import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'
import { usePemesanan } from '../hooks/usePemesanan.js'
import { supabase } from '../lib/supabaseClient.js'
import PemilihTema from './PemilihTema.jsx'

const navItems = [
  { to: '/', label: 'Beranda', mobile: true },
  { to: '/kamar', label: 'Kamar', mobile: true },
  { to: '/penghuni', label: 'Penghuni', mobile: false },
  { to: '/sewa', label: 'Sewa', mobile: false },
  { to: '/pemesanan', label: 'Pemesanan', mobile: false },
  { to: '/tagihan', label: 'Tagihan', mobile: true },
  { to: '/laporan', label: 'Laporan', mobile: false },
  { to: '/pengaturan', label: 'Pengaturan', mobile: false },
  { to: '/profil', label: 'Profil', mobile: false },
]

export default function Layout() {
  const { user } = useAuth()
  const { jumlahMenunggu } = usePemesanan()
  const [kosName, setKosName] = useState('Kosku')
  const [mobileMenu, setMobileMenu] = useState(false)
  const [offline, setOffline] = useState(!navigator.onLine)
  const location = useLocation()

  useEffect(() => {
    if (!user) return
    supabase.from('profiles').select('nama_kos').eq('id', user.id).single()
      .then(({ data }) => { if (data?.nama_kos) setKosName(data.nama_kos) })
  }, [user])

  useEffect(() => {
    setMobileMenu(false)
  }, [location.pathname])

  useEffect(() => {
    const on = () => setOffline(false)
    const off = () => setOffline(true)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off) }
  }, [])

  const isActive = (to) => location.pathname === to || (to !== '/' && location.pathname.startsWith(to))

  return (
    <div className="min-h-screen bg-emerald-50/60 dark:bg-gray-900 dark:bg-gray-950 flex flex-col md:flex-row">
      {/* Sidebar desktop */}
      <aside className="hidden md:flex md:w-72 md:shrink-0 md:flex-col md:fixed md:h-screen md:overflow-y-auto bg-white dark:bg-gray-800/80 dark:bg-gray-900/90 backdrop-blur-xl border-r border-emerald-100 dark:border-gray-800 shadow-[4px_0_24px_rgba(16,185,129,0.08)] z-30">
        <div className="p-6 border-b border-emerald-100 dark:border-gray-800 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-2xl font-extrabold text-emerald-800 dark:text-emerald-300 tracking-tight">{kosName}</h2>
            <p className="text-xs text-emerald-400 dark:text-gray-400 dark:text-gray-500 mt-1">Manajemen Kos</p>
          </div>
          <PemilihTema compact />
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                  isActive ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'text-emerald-700 dark:text-gray-200 hover:bg-emerald-50 dark:hover:bg-gray-800'
                }`
              }
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
              {item.label}
              {item.to === '/pemesanan' && jumlahMenunggu > 0 && (
                <span className="ml-auto min-w-[1.5rem] px-1.5 py-0.5 rounded-full bg-red-50 dark:bg-red-900/300 text-white text-[10px] font-bold text-center">{jumlahMenunggu}</span>
              )}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1 md:ml-72 md:pb-0 pb-16">
        {offline && (
          <div className="mx-4 mt-3 rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-2 text-sm font-semibold shadow-sm flex items-center gap-2">
            <span>⚠</span> Anda sedang offline, data tidak dapat dimuat
          </div>
        )}

        <header className="sticky top-0 z-20 bg-white dark:bg-gray-800/70 dark:bg-gray-900/80 backdrop-blur-md border-b border-emerald-100 dark:border-gray-800 md:hidden px-5 py-4 flex items-center justify-between shadow-sm">
          <h1 className="text-lg font-extrabold text-emerald-800 dark:text-emerald-300 truncate">{kosName}</h1>
          <div className="flex items-center gap-2">
            <PemilihTema compact />
            <button onClick={() => setMobileMenu(!mobileMenu)} className="p-2 rounded-xl bg-emerald-50 dark:bg-gray-800 text-emerald-700 dark:text-gray-200 font-bold text-xs">Menu</button>
          </div>
        </header>

        {/* Mobile overlay menu */}
        {mobileMenu && (
          <div className="md:hidden fixed inset-0 z-40 bg-black/20 backdrop-blur-sm" onClick={() => setMobileMenu(false)}>
            <div className="absolute top-16 left-4 right-4 bg-white dark:bg-gray-800/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-emerald-100 dark:border-gray-800 p-4 space-y-1" onClick={e => e.stopPropagation()}>
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition ${isActive ? 'bg-emerald-600 text-white' : 'text-emerald-700 dark:text-gray-200 hover:bg-emerald-50 dark:hover:bg-gray-800'}`
                  }
                >
                  {item.label}
                  {item.to === '/pemesanan' && jumlahMenunggu > 0 && (
                    <span className="min-w-[1.5rem] px-1.5 py-0.5 rounded-full bg-red-50 dark:bg-red-900/300 text-white text-[10px] font-bold text-center">{jumlahMenunggu}</span>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        )}

        <div className="p-4 md:p-8 max-w-5xl mx-auto">
          <Outlet />
        </div>
      </main>

      {/* Bottom nav mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white dark:bg-gray-800/90 dark:bg-gray-900/95 backdrop-blur-xl border-t border-emerald-100 dark:border-gray-800 shadow-[0_-4px_24px_rgba(16,185,129,0.08)] flex justify-around items-center px-2 py-2">
        {[
          { to: '/', label: 'Beranda', icon: '🏠' },
          { to: '/kamar', label: 'Kamar', icon: '🛏️' },
          { to: '/tagihan', label: 'Tagihan', icon: '💰' },
          { to: '/lainnya', label: 'Lainnya', icon: '⋯' },
        ].map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `relative flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl text-[10px] font-bold transition ${
                isActive ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-gray-800' : 'text-emerald-400 dark:text-gray-400 dark:text-gray-500 hover:text-emerald-600 dark:hover:text-gray-200'
              }`
            }
          >
            <span className="text-xl leading-none">{item.icon}</span>
            {item.to === '/lainnya' && jumlahMenunggu > 0 && (
              <span className="absolute top-0 right-1 min-w-[1.1rem] px-1 rounded-full bg-red-50 dark:bg-red-900/300 text-white text-[9px] font-bold leading-[1.1rem] text-center">{jumlahMenunggu}</span>
            )}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
