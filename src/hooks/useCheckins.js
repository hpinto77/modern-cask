import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

const LS_KEY = 'tmc_checkins_v2'

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

  // Add a new check-in occasion (always creates new row)
  const addCheckin = useCallback(async (checkin) => {
    const row = {
      ...checkin,
      id: Date.now(),
      user_id: user?.id || null,
      date: new Date().toISOString(),
    }
    setCheckins(prev => {
      const next = [row, ...prev]
      saveLocal(next)
      return next
    })
    if (user) {
      await supabase.from('checkins').insert(row)
    }
    return row
  }, [user])

  // Toggle owned status on latest checkin for a whisky
  const setOwned = useCallback(async (whiskyId, owned) => {
    setCheckins(prev => {
      const next = prev.map(c => {
        if (String(c.whisky_id) === String(whiskyId)) return { ...c, owned }
        return c
      })
      saveLocal(next)
      return next
    })
    if (user) {
      await supabase
        .from('checkins')
        .update({ owned })
        .eq('whisky_id', String(whiskyId))
        .eq('user_id', user.id)
    }
  }, [user])

  const removeCheckin = useCallback(async (id) => {
    setCheckins(prev => {
      const next = prev.filter(c => c.id !== id)
      saveLocal(next)
      return next
    })
    if (user) await supabase.from('checkins').delete().eq('id', id).eq('user_id', user.id)
  }, [user])

  // Get all check-ins for a whisky
  const getCheckins = useCallback((whiskyId) =>
    checkins.filter(c => String(c.whisky_id) === String(whiskyId))
  , [checkins])

  // Get most recent check-in for a whisky
  const getCheckin = useCallback((whiskyId) =>
    checkins.find(c => String(c.whisky_id) === String(whiskyId)) || null
  , [checkins])

  // Get unique tried whiskies (one entry per whisky_id)
  const triedWhiskies = [...new Map(
    checkins.map(c => [String(c.whisky_id), c])
  ).values()]

  // Get owned whiskies
  const ownedWhiskies = [...new Map(
    checkins.filter(c => c.owned).map(c => [String(c.whisky_id), c])
  ).values()]

  return { checkins, addCheckin, removeCheckin, setOwned, getCheckin, getCheckins, triedWhiskies, ownedWhiskies }
}
