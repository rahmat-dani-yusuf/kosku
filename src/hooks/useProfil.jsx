import { useState, useEffect } from 'react'
import { useAuth } from './useAuth.jsx'
import { supabase } from '../lib/supabaseClient.js'

export function useProfil() {
  const { user } = useAuth()
  const [profil, setProfil] = useState({ nama_pemilik: '', nama_kos: '', alamat: '', no_wa: '', email: '', role: 'pemilik', aktif: true })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!user) {
      setProfil({ nama_pemilik: '', nama_kos: '', alamat: '', no_wa: '', email: '', role: 'pemilik', aktif: true })
      setLoading(false)
      setError(null)
      return
    }
    setLoading(true)
    setError(null)
    supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()
      .then(({ data, error: err }) => {
        if (err) {
          setError(err.message || 'Profil tidak ditemukan')
          setProfil({ nama_pemilik: '', nama_kos: '', alamat: '', no_wa: '', email: user.email || '', role: 'pemilik', aktif: true })
          setLoading(false)
        } else if (!data) {
          setError('Profil tidak ditemukan untuk akun ini')
          setProfil({ nama_pemilik: '', nama_kos: '', alamat: '', no_wa: '', email: user.email || '', role: 'pemilik', aktif: true })
          setLoading(false)
        } else {
          setProfil({ ...data, email: user.email || data.email || '', role: data.role || 'pemilik', aktif: data.aktif !== false })
          setLoading(false)
        }
      })
  }, [user])

  const refresh = async () => {
    if (!user) return
    setLoading(true)
    setError(null)
    try {
      const { data, error: err } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()
      if (err) {
        setError(err.message || 'Profil tidak ditemukan')
        setProfil({ nama_pemilik: '', nama_kos: '', alamat: '', no_wa: '', email: user.email || '', role: 'pemilik', aktif: true })
      } else if (!data) {
        setError('Profil tidak ditemukan')
        setProfil({ nama_pemilik: '', nama_kos: '', alamat: '', no_wa: '', email: user.email || '', role: 'pemilik', aktif: true })
      } else {
        setProfil({ ...data, email: user.email || data.email || '', role: data.role || 'pemilik', aktif: data.aktif !== false })
      }
    } catch (e) {
      setError(e.message || 'Gagal memuat profil')
    } finally {
      setLoading(false)
    }
  }

  const isAdmin = (profil?.role === 'admin') && (profil?.aktif !== false)
  return { profil, loading, error, refresh, isAdmin }
}
