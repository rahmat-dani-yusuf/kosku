import { useState, useEffect } from 'react'
import { useAuth } from './useAuth.jsx'
import { supabase } from '../lib/supabaseClient.js'

export function useProfil() {
  const { user } = useAuth()
  const [profil, setProfil] = useState({ nama_pemilik: '', nama_kos: '', alamat: '', no_wa: '' })
  useEffect(() => {
    if (!user) return
    supabase.from('profiles').select('*').eq('id', user.id).single().then(({ data }) => {
      if (data) setProfil(data)
    })
  }, [user])
  return profil
}
