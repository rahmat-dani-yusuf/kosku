import { useState, useEffect, useCallback, useMemo } from 'react'
import { supabase } from '../lib/supabaseClient.js'
import { useAuth } from './useAuth.jsx'
import { dengarDataBerubah } from '../lib/events.js'

export function useBuktiMenunggu(tagihanIds) {
  const { user } = useAuth()
  const [jumlah, setJumlah] = useState({})
  const [loading, setLoading] = useState(false)

  const ids = useMemo(() => (Array.isArray(tagihanIds) ? tagihanIds.filter(Boolean) : []), [tagihanIds])
  const idsKey = ids.join(',')

  const muat = useCallback(async () => {
    if (!user || ids.length === 0) {
      setJumlah({})
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('bukti_bayar')
        .select('tagihan_id')
        .eq('status', 'menunggu')
        .in('tagihan_id', ids)
      if (error) throw error
      const map = {}
      for (const row of data || []) {
        map[row.tagihan_id] = (map[row.tagihan_id] || 0) + 1
      }
      setJumlah(map)
    } catch {
      setJumlah({})
    } finally {
      setLoading(false)
    }
  }, [user, idsKey])

  useEffect(() => {
    muat()
  }, [muat])

  useEffect(() => {
    const handler = () => muat()
    const unsub = dengarDataBerubah(handler)
    return unsub
  }, [muat])

  return { jumlah, loading, muatUlang: muat }
}
