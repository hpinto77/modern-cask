import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

const LS_KEY = 'tmc_checkins_v1'

function loadLocal() {
  try { return JSON.parse(localStorage.getItem(LS_KEY)) || [] }
  catch { return [] }
}

function saveLocal(data) {
  localStorage.setItem(LS_KEY, JSON.stringify(data))
}

export function useCheckins() {
  const { user } = useAuth()
  const [checkins, setCheckins] = useState(loadLocal)

  useEffect(() => {
    if (!user) return
    supabase
      .from('checkins')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .then(({ data }) => {
        if (data?.length) { setCheckins(data); saveLocal(data) }
      })
  }, [user?.id])

  const addCheckin = useCallback(async (checkin) => {
    const row = {
      ...checkin,
      id: Date.now(),
      user_id: user?.id || null,
      date: new Date().toISOString(),
    }
    setCheckins(prev => {
      const filtered = prev.filter(c => String(c.whisky_id) !== String(row.whisky_id))
      const next = [row, ...filtered]
      saveLocal(next)
      return next
    })
    if (user) {
      await supabase.from('checkins').upsert(row, { onConflict: 'whisky_id,user_id' })
    }
    return row
  }, [user])

  const removeCheckin = useCallback(async (id) => {
    setCheckins(prev => {
      const next = prev.filter(c => c.id !== id)
      saveLocal(next)
      return next
    })
    if (user) await supabase.from('checkins').delete().eq('id', id).eq('user_id', user.id)
  }, [user])

  const getCheckin = useCallback((whiskyId) =>
    checkins.find(c => String(c.whisky_id) === String(whiskyId)) || null
  , [checkins])

  return { checkins, addCheckin, removeCheckin, getCheckin }
}
