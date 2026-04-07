import { useState, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { BottomSheet, GoldButton, Input, Textarea, useToast } from './UI'

export function EditProfileModal({ open, onClose, onSaved }) {
  const { user, displayName } = useAuth()
  const toast = useToast()
  const fileRef = useRef(null)

  const stored = (() => { try { return JSON.parse(localStorage.getItem('tmc_profile')) || {} } catch { return {} } })()

  const [name, setName] = useState(displayName || '')
  const [bio, setBio] = useState(stored.bio || '')
  const [favouriteRegion, setFavouriteRegion] = useState(stored.favouriteRegion || '')
  const [avatarUrl, setAvatarUrl] = useState(stored.avatarUrl || null)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)

  const handlePhoto = async (e) => {
    const file = e.target.files[0]
    if (!file || !user) return
    if (file.size > 2097152) { toast('Photo must be under 2MB'); return }

    setUploading(true)
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(user.id, file, { upsert: true, contentType: file.type })

    if (error) { toast('Upload failed'); setUploading(false); return }

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(user.id)

    // Add cache-busting timestamp
    const url = `${publicUrl}?t=${Date.now()}`
    setAvatarUrl(url)
    setUploading(false)
    toast('Photo uploaded')
  }

  const save = async () => {
    setSaving(true)
    if (name && name !== displayName) {
      await supabase.auth.updateUser({ data: { full_name: name } })
    }
    const profile = { bio, favouriteRegion, avatarUrl, updatedAt: new Date().toISOString() }
    localStorage.setItem('tmc_profile', JSON.stringify(profile))
    if (user) {
      await supabase.from('profiles').upsert({
        id: user.id,
        full_name: name,
        bio,
        favourite_region: favouriteRegion,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString()
      })
    }
    setSaving(false)
    toast('Profile updated')
    onSaved?.(profile)
    onClose()
  }

  return (
    <BottomSheet open={open} onClose={onClose} title="Edit Profile">
      <div style={{ display: 'grid', gap: 16 }}>

        {/* Avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            onClick={() => fileRef.current?.click()}
            style={{ width: 72, height: 72, borderRadius: '50%', background: avatarUrl ? 'transparent' : 'linear-gradient(135deg,#ffe2ab,#ffbf00)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, overflow: 'hidden', position: 'relative', border: '2px solid rgba(255,191,0,.3)' }}
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: 22, color: '#2a1a00' }}>
                {(displayName || '?')[0].toUpperCase()}
              </span>
            )}
            {/* Overlay on hover */}
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: uploading ? 1 : 0, transition: 'opacity .2s' }}>
              <span className="ms" style={{ fontSize: 20, color: '#fff' }}>{uploading ? 'progress_activity' : 'photo_camera'}</span>
            </div>
          </div>
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#e8e4dc', marginBottom: 4 }}>Profile photo</p>
            <p style={{ fontSize: 11, color: '#7a7060', lineHeight: 1.4 }}>Tap to upload · Max 2MB<br/>JPG, PNG or WebP</p>
          </div>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handlePhoto} style={{ display: 'none' }} />
        </div>

        <div style={{ borderTop: '0.5px solid rgba(80,72,64,.2)' }} />

        <div>
          <label style={{ display: 'block', fontSize: 10, textTransform: 'uppercase', letterSpacing: '.08em', color: '#7a7060', marginBottom: 6 }}>Display name</label>
          <Input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 10, textTransform: 'uppercase', letterSpacing: '.08em', color: '#7a7060', marginBottom: 6 }}>About you</label>
          <Textarea rows={3} value={bio} onChange={e => setBio(e.target.value)} placeholder="A whisky enthusiast based in…" />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 10, textTransform: 'uppercase', letterSpacing: '.08em', color: '#7a7060', marginBottom: 6 }}>Favourite region</label>
          <select value={favouriteRegion} onChange={e => setFavouriteRegion(e.target.value)}
            style={{ width: '100%', background: '#1a1917', border: '1px solid rgba(80,72,64,.35)', borderRadius: 12, padding: '11px 14px', color: favouriteRegion ? '#e8e4dc' : '#504840', fontSize: 14, fontFamily: 'DM Sans, sans-serif', outline: 'none', appearance: 'none', boxSizing: 'border-box' }}>
            <option value="">Select a region…</option>
            {['Islay','Speyside','Highland','Lowland','Campbeltown','Islands','Japan','Ireland','Taiwan','India','Australia','Scandinavia','France','USA'].map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        <GoldButton onClick={save} disabled={saving || uploading}>
          {saving ? 'Saving…' : 'Save Profile'}
        </GoldButton>
        <div style={{ height: 4 }} />
      </div>
    </BottomSheet>
  )
}
