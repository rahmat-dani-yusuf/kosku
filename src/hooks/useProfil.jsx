import { useState, useEffect } from 'react'
import { useAuth } from './useAuth.jsx'
import { supabase } from '../lib/supabaseClient.js'

export function useProfil() {
  const { user } = useAuth()
  const [profil, setProfil] = useState({ nama_pemilik: '', nama_kos: '', alamat: '', no_wa: '', email: '' })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!user) return
    setLoading(true)
    setError(null)
    supabase.from('profiles').select('*').eq('id', user.id).single()
      .then(({ data, error: err }) => {
        if (err) {
          // if not exists, try to create from auth metadata
          if (err.code === 'PGRST116') {
            const meta = user.user_metadata || {}
            const payload = {
              id: user.id,
              nama_pemilik: meta.nama_pemilik || meta.nama_pemilik || (user.email?.split('@')[0] || ''),
              nama_kos: meta.nama_kos || meta.nama_kos || 'Kosku',
              alamat: '',
              no_wa: '',
              created_at: new Date().toISOString()
            }
            supabase.from('profiles').insert(payload).then(({ error: insErr }) => {
              if (!insErr) setProfil({ ...payload, email: user.email })
              else setError(insErr.message || 'Gagal membuat profil')
              setLoading(false)
            })
          } else {
            setError(err.message || 'Gagal memuat profil')
            setLoading(false)
          }
        } else {
          setProfil({ ...data, email: user.email })
          setLoading(false)
        }
      })
  }, [user])

  const refresh = async () => {
    if (!user) return
    setLoading(true)
    const { data, error: err } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    if (err) setError(err.message)
    else setProfil({ ...data, email: user.email })
    setLoading(false)
  }

  return { profil, loading, error, refresh }
}
