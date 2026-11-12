import { useState, useEffect } from 'react'
import { useAuth } from './useAuth.jsx'
import { supabase } from '../lib/supabaseClient.js'
import { useToast } from '../components/Toast.jsx'
import { dengarDataBerubah } from '../lib/events.js'

export function useKamar() {
  const { user } = useAuth()
  const { show } = useToast()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const reload = async () => {
    if (!user) return
    setLoading(true)
    setError(null)
    try {
      const { data: rooms, error: err } = await supabase
        .from('kamar')
        .select('*')
        .eq('user_id', user.id)
        .order('nomor', { ascending: true })
      if (err) throw err
      setData(rooms || [])
    } catch (e) {
      setError(e.message || 'Gagal memuat data kamar')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { reload() }, [user]) // eslint-disable-line
  useEffect(() => dengarDataBerubah(reload), [user]) // eslint-disable-line

  const tambah = async (payload) => {
    try {
      const { error: err } = await supabase.from('kamar').insert({
        ...payload,
        user_id: user.id,
        status: payload.status || 'kosong'
      })
      if (err) {
        if (err.message?.includes('duplicate') || err.code === '23505') throw new Error('Nomor kamar sudah digunakan')
        throw err
      }
      await reload()
      show('Kamar berhasil ditambahkan', 'success')
      return true
    } catch (e) {
      show(e.message || 'Gagal menambahkan kamar', 'error')
      return false
    }
  }

  const ubah = async (id, payload) => {
    try {
      const { error: err } = await supabase.from('kamar').update(payload).eq('id', id).eq('user_id', user.id)
      if (err) {
        if (err.message?.includes('duplicate') || err.code === '23505') throw new Error('Nomor kamar sudah digunakan')
        throw err
      }
      await reload()
      show('Kamar berhasil diubah', 'success')
      return true
    } catch (e) {
      show(e.message || 'Gagal mengubah kamar', 'error')
      return false
    }
  }

  const hapus = async (id) => {
    try {
      const { data: sewaCheck } = await supabase.from('sewa').select('id').eq('kamar_id', id).limit(1)
      if (sewaCheck && sewaCheck.length > 0) {
        show('Kamar ini masih memiliki data sewa', 'error')
        return false
      }
      const { error: err } = await supabase.from('kamar').delete().eq('id', id).eq('user_id', user.id)
      if (err) throw err
      await reload()
      show('Kamar berhasil dihapus', 'success')
      return true
    } catch (e) {
      show(e.message || 'Gagal menghapus kamar', 'error')
      return false
    }
  }

  return { data, loading, error, reload, tambah, ubah, hapus }
}
