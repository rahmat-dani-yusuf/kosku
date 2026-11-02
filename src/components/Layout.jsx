import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'
import { supabase } from '../lib/supabaseClient.js'

const navItems = [
  { to: '/', label: 'Beranda', mobile: true },
  { to: '/kamar', label: 'Kamar', mobile: true },
  { to: '/penghuni', label: 'Penghuni', mobile: false },
  { to: '/sewa', label: 'Sewa', mobile: false },
  { to: '/tagihan', label: 'Tagihan', mobile: true },
  { to: '/laporan', label: 'Laporan', mobile: false },
  { to: '/profil', label: 'Profil', mobile: false },
]

export default function Layout() {
  const { user } = useAuth()
  const [kosName, setKosName] = useState('Kosku')
  const [mobileMenu, setMobileMenu] = useState(false)
  const location = useLocation()

  useEffect(() => {
    if (!user) return
    supabase.from('profiles').select('nama_kos').eq('id', user.id).single()
      .then(({ data }) => { if (data?.nama_kos) setKosName(data.nama_kos) })
  }, [user])

  useEffect(() => {
    setMobileMenu(false)
  }, [location.pathname])

  const isActive = (to) => location.pathname === to || (to !== '/' && location.pathname.startsWith(to))

  return (
    <div className="min-h-screen bg-emerald-50/60 flex flex-col md:flex-row">
      {/* Sidebar desktop */}
      <aside className="hidden md:flex md:w-72 md:shrink-0 md:flex-col md:fixed md:h-screen md:overflow-y-auto bg-white/80 backdrop-blur-xl border-r border-emerald-100 shadow-[4px_0_24px_rgba(16,185,129,0.08)] z-30">
        <div className="p-6 border-b border-emerald-100">
          <h2 className="text-2xl font-extrabold text-emerald-800 tracking-tight">{kosName}</h2>
          <p className="text-xs text-emerald-400 mt-1">Manajemen Kos</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                  isActive ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'text-emerald-700 hover:bg-emerald-50'
                }`
              }
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1 md:ml-72 md:pb-0 pb-16">
        <header className="sticky top-0 z-20 bg-white/70 backdrop-blur-md border-b border-emerald-100 md:hidden px-5 py-4 flex items-center justify-between shadow-sm">
          <h1 className="text-lg font-extrabold text-emerald-800 truncate">{kosName}</h1>
          <button onClick={() => setMobileMenu(!mobileMenu)} className="p-2 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-xs">Menu</button>
        </header>

        {/* Mobile overlay menu */}
        {mobileMenu && (
          <div className="md:hidden fixed inset-0 z-40 bg-black/20 backdrop-blur-sm" onClick={() => setMobileMenu(false)}>
            <div className="absolute top-16 left-4 right-4 bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-emerald-100 p-4 space-y-1" onClick={e => e.stopPropagation()}>
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `block px-4 py-3 rounded-xl text-sm font-semibold transition ${isActive ? 'bg-emerald-600 text-white' : 'text-emerald-700 hover:bg-emerald-50'}`
                  }
                >
                  {item.label}
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
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/90 backdrop-blur-xl border-t border-emerald-100 shadow-[0_-4px_24px_rgba(16,185,129,0.08)] flex justify-around items-center px-2 py-2">
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
              `flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl text-[10px] font-bold transition ${
                isActive ? 'text-emerald-700 bg-emerald-50' : 'text-emerald-400 hover:text-emerald-600'
              }`
            }
          >
            <span className="text-xl leading-none">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
