import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { BottomSheet, GoldButton, Input, Textarea, useToast } from './UI'

export function EditProfileModal({ open, onClose }) {
  const { user, displayName } = useAuth()
  const toast = useToast()
  const [name, setName] = useState(displayName || '')
  const [bio, setBio] = useState(() => {
    try { return JSON.parse(localStorage.getItem('tmc_profile'))?.bio || '' } catch { return '' }
  })
  const [favouriteRegion, setFavouriteRegion] = useState(() => {
    try { return JSON.parse(localStorage.getItem('tmc_profile'))?.favouriteRegion || '' } catch { return '' }
  })
  const [saving, setSaving] = useState(false)

  const save = async () => {
    setSaving(true)
    // Update display name in Supabase auth
    if (name && name !== displayName) {
      await supabase.auth.updateUser({ data: { full_name: name } })
    }
    // Save extended profile to localStorage (and optionally a profiles table)
    const profile = { bio, favouriteRegion, updatedAt: new Date().toISOString() }
    localStorage.setItem('tmc_profile', JSON.stringify(profile))
    // Also upsert to a profiles table if it exists
    if (user) {
      await supabase.from('profiles').upsert({
        id: user.id,
        full_name: name,
        bio,
        favourite_region: favouriteRegion,
        updated_at: new Date().toISOString()
      }).then(() => {})
    }
    setSaving(false)
    toast('Profile updated')
    onClose()
  }

  return (
    <BottomSheet open={open} onClose={onClose} title="Edit Profile">
      <div style={{ display: 'grid', gap: 14 }}>
        <div>
          <label style={{ display: 'block', fontSize: 10, textTransform: 'uppercase', letterSpacing: '.08em', color: '#7a7060', marginBottom: 6 }}>Display name</label>
          <Input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Your name"
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 10, textTransform: 'uppercase', letterSpacing: '.08em', color: '#7a7060', marginBottom: 6 }}>About you</label>
          <Textarea
            rows={3}
            value={bio}
            onChange={e => setBio(e.target.value)}
            placeholder="A whisky enthusiast based in…"
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 10, textTransform: 'uppercase', letterSpacing: '.08em', color: '#7a7060', marginBottom: 6 }}>Favourite region</label>
          <select
            value={favouriteRegion}
            onChange={e => setFavouriteRegion(e.target.value)}
            style={{ width: '100%', background: '#1a1917', border: '1px solid rgba(80,72,64,.35)', borderRadius: 12, padding: '11px 14px', color: favouriteRegion ? '#e8e4dc' : '#504840', fontSize: 14, fontFamily: 'DM Sans, sans-serif', outline: 'none', appearance: 'none', boxSizing: 'border-box' }}
          >
            <option value="">Select a region…</option>
            {['Islay','Speyside','Highland','Lowland','Campbeltown','Islands','Japan','Ireland','Taiwan','India','Australia','Scandinavia','France','USA'].map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
        <GoldButton onClick={save} disabled={saving}>
          {saving ? 'Saving…' : 'Save Profile'}
        </GoldButton>
        <div style={{ height: 4 }} />
      </div>
    </BottomSheet>
  )
}
