import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient.js'
import { useAuth } from './useAuth.jsx'
import { useToast } from '../components/Toast.jsx'

export function usePengaturan() {
  const { user } = useAuth()
  const { show } = useToast()
  const [pengaturan, setPengaturan] = useState({
    denda_per_hari: 0,
    masa_tenggang_hari: 0,
    hari_tagih_default: 1,
    deposit_default: 0,
    aturan_kos: '',
  })
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('pengaturan_kos')
        .select('*')
        .eq('user_id', user.id)
        .single()
      if (error && error.code !== 'PGRST116') throw error
      if (data) {
        setPengaturan({
          denda_per_hari: data.denda_per_hari ?? 0,
          masa_tenggang_hari: data.masa_tenggang_hari ?? 0,
          hari_tagih_default: data.hari_tagih_default ?? 1,
          deposit_default: data.deposit_default ?? 0,
          aturan_kos: data.aturan_kos || '',
        })
      } else {
        setPengaturan({ denda_per_hari: 0, masa_tenggang_hari: 0, hari_tagih_default: 1, deposit_default: 0, aturan_kos: '' })
      }
    } catch (e) {
      // default values already set
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => { reload() }, [reload])

  const simpan = useCallback(async (values) => {
    if (!user) return false
    try {
      const payload = {
        user_id: user.id,
        denda_per_hari: Number(values.denda_per_hari) || 0,
        masa_tenggang_hari: Number(values.masa_tenggang_hari) || 0,
        hari_tagih_default: Number(values.hari_tagih_default) || 1,
        deposit_default: Number(values.deposit_default) || 0,
        aturan_kos: String(values.aturan_kos || ''),
        updated_at: new Date().toISOString(),
      }
      const { error } = await supabase.from('pengaturan_kos').upsert(payload, { onConflict: 'user_id' })
      if (error) throw error
      setPengaturan({ ...values })
      show('Pengaturan berhasil disimpan', 'success')
      return true
    } catch (e) {
      show(e.message || 'Gagal menyimpan pengaturan', 'error')
      return false
    }
  }, [user, show])

  return { pengaturan, loading, reload, simpan }
}
