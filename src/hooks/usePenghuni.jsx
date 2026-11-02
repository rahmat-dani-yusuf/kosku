import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient.js'
import { useAuth } from './useAuth.jsx'
import { useToast } from '../components/Toast.jsx'

export function usePenghuni() {
  const { user } = useAuth()
  const { show } = useToast()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const reload = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError(null)
    try {
      const { data: rows, error: err } = await supabase
        .from('penghuni')
        .select('*')
        .eq('user_id', user.id)
        .order('nama', { ascending: true })
      if (err) throw err
      setData(rows || [])
    } catch (e) {
      setError(e.message || 'Gagal memuat data penghuni')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => { reload() }, [reload])

  const tambah = async (payload) => {
    try {
      const { error: err } = await supabase.from('penghuni').insert({ ...payload, user_id: user.id })
      if (err) throw err
      await reload()
      show('Penghuni berhasil ditambahkan', 'success')
      return true
    } catch (e) {
      show(e.message || 'Gagal menambahkan penghuni', 'error')
      return false
    }
  }

  const ubah = async (id, payload) => {
    try {
      const { error: err } = await supabase.from('penghuni').update(payload).eq('id', id).eq('user_id', user.id)
      if (err) throw err
      await reload()
      show('Penghuni berhasil diubah', 'success')
      return true
    } catch (e) {
      show(e.message || 'Gagal mengubah penghuni', 'error')
      return false
    }
  }

  const hapus = async (id) => {
    try {
      const { data: aktif } = await supabase.from('sewa').select('id').eq('penghuni_id', id).eq('status', 'aktif').limit(1)
      if (aktif && aktif.length > 0) {
        show('Penghuni ini masih memiliki sewa aktif, akhiri sewa dulu', 'error')
        return false
      }
      const { data: riwayat } = await supabase.from('sewa').select('id').eq('penghuni_id', id).limit(1)
      if (riwayat && riwayat.length > 0) {
        show('Penghuni ini memiliki riwayat sewa dan tidak bisa dihapus', 'error')
        return false
      }
      const { error: err } = await supabase.from('penghuni').delete().eq('id', id).eq('user_id', user.id)
      if (err) throw err
      await reload()
      show('Penghuni berhasil dihapus', 'success')
      return true
    } catch (e) {
      show(e.message || 'Gagal menghapus penghuni', 'error')
      return false
    }
  }

  return { data, loading, error, reload, tambah, ubah, hapus }
}
