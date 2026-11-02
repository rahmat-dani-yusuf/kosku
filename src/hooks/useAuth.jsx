import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient.js'

const AuthContext = createContext({ user: null, loading: true, signIn: async () => {}, signUp: async () => {}, signOut: async () => {} })

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    }).finally(() => setLoading(false))

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })
    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email, password) => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) throw error
    return { error: null }
  }

  const signUp = async (email, password, namaPemilik, namaKos) => {
    setLoading(true)
    const { error, data } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nama_pemilik: namaPemilik,
          nama_kos: namaKos
        }
      }
    })
    setLoading(false)
    if (error) throw error
    return { data, error: null }
  }

  const signOut = async () => {
    setLoading(true)
    await supabase.auth.signOut()
    setLoading(false)
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
