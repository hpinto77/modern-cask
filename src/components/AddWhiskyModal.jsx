import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { GoldButton, Input, Textarea, Select, BottomSheet, useToast } from './UI'

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  )
}

export function AddWhiskyModal({ open, onClose, onSubmit }) {
  const { user, signInWithGoogle } = useAuth()
  const toast = useToast()
  const [photo, setPhoto] = useState(null)
  const [name, setName] = useState('')
  const [distillery, setDistillery] = useState('')
  const [age, setAge] = useState('')
  const [abv, setAbv] = useState('')
  const [region, setRegion] = useState('')
  const [country, setCountry] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)

  const handlePhoto = (e) => {
    const file = e.target.files[0]; if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setPhoto(ev.target.result)
    reader.readAsDataURL(file)
  }

  const submit = async () => {
    if (!name || !distillery) { toast('Name and distillery are required'); return }
    setSaving(true)
    const row = {
      whisky_name: name,
      distillery: distillery || null,
      age: age ? parseInt(age) : null,
      abv: abv ? parseFloat(abv) : null,
      region: region || null,
      country: country || null,
      description: description || null,
      has_photo: !!photo,
      status: 'pending',
      requested_by: user?.id || null,
    }
    await supabase.from('whisky_requests').insert(row)
    onSubmit?.(row)
    setSaving(false)
    toast('Submitted — thank you!')
    onClose()
    setName(''); setDistillery(''); setAge(''); setAbv('')
    setRegion(''); setCountry(''); setDescription(''); setPhoto(null)
  }

  // Not logged in — show sign-in prompt
  if (!user) {
    return (
      <BottomSheet open={open} onClose={onClose} title="Add a Whisky">
        <div style={{ textAlign: 'center', padding: '8px 0 16px' }}>
          <span className="ms" style={{ fontSize: 48, color: '#ffbf00', display: 'block', marginBottom: 16 }}>liquor</span>
          <h3 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 20, fontWeight: 800, color: '#e8e4dc', marginBottom: 10 }}>
            Join the community
          </h3>
          <p style={{ fontSize: 14, color: '#7a7060', lineHeight: 1.6, marginBottom: 24 }}>
            Sign in to contribute whiskies to the database, track your collection across devices, and unlock your tasting passport.
          </p>
          <button
            onClick={signInWithGoogle}
            style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#fff', border: 'none', borderRadius: 12, padding: '13px 24px', fontSize: 14, fontWeight: 600, cursor: 'pointer', color: '#1a1a1a', fontFamily: 'DM Sans, sans-serif', margin: '0 auto', width: '100%', justifyContent: 'center' }}
          >
            <GoogleIcon /> Continue with Google
          </button>
          <p style={{ fontSize: 11, color: '#504840', marginTop: 14 }}>
            Free · No spam · Your data stays yours
          </p>
        </div>
      </BottomSheet>
    )
  }

  return (
    <BottomSheet open={open} onClose={onClose} title="Add a Whisky">
      <div style={{ display: 'grid', gap: 14 }}>
        {!photo ? (
          <label style={{ background: '#1a1917', border: '1.5px dashed rgba(80,72,64,.5)', borderRadius: 14, padding: 24, textAlign: 'center', cursor: 'pointer', display: 'block' }}>
            <span className="ms" style={{ fontSize: 32, color: '#504840', display: 'block', marginBottom: 8 }}>photo_camera</span>
            <p style={{ fontSize: 13, fontWeight: 500, color: '#7a7060', marginBottom: 4 }}>Take or upload a photo</p>
            <p style={{ fontSize: 10, color: '#504840' }}>Capture the label</p>
            <input type="file" accept="image/*" capture="environment" onChange={handlePhoto} style={{ display: 'none' }} />
          </label>
        ) : (
          <div style={{ position: 'relative' }}>
            <img src={photo} alt="" style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 12 }} />
            <button onClick={() => setPhoto(null)} style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,.65)', border: 'none', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}>
              <span className="ms" style={{ fontSize: 16 }}>close</span>
            </button>
          </div>
        )}
        <Input placeholder="Whisky name *" value={name} onChange={e => setName(e.target.value)} />
        <Input placeholder="Distillery *" value={distillery} onChange={e => setDistillery(e.target.value)} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <Input type="number" placeholder="Age (years)" value={age} onChange={e => setAge(e.target.value)} />
          <Input type="number" placeholder="ABV %" step="0.1" value={abv} onChange={e => setAbv(e.target.value)} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <Select value={region} onChange={e => setRegion(e.target.value)}>
            <option value="">Region…</option>
            {['Islay','Speyside','Highland','Lowland','Campbeltown','Islands','Japan','Ireland','Taiwan','India','Australia','USA','Other'].map(r => <option key={r}>{r}</option>)}
          </Select>
          <Select value={country} onChange={e => setCountry(e.target.value)}>
            <option value="">Country…</option>
            {['Scotland','Japan','Ireland','Taiwan','India','Australia','USA','Other'].map(c => <option key={c}>{c}</option>)}
          </Select>
        </div>
        <Textarea rows={2} placeholder="Brief description (optional)…" value={description} onChange={e => setDescription(e.target.value)} />
        <div style={{ background: '#1a1917', borderRadius: 12, padding: '10px 14px', display: 'flex', gap: 10 }}>
          <span className="ms" style={{ fontSize: 16, color: '#ffbf00', marginTop: 1 }}>info</span>
          <p style={{ fontSize: 12, color: '#7a7060', lineHeight: 1.5 }}>Reviewed before going live. Track status in your profile.</p>
        </div>
        <GoldButton onClick={submit} disabled={saving}>{saving ? 'Submitting…' : 'Submit for Review'}</GoldButton>
        <div style={{ height: 4 }} />
      </div>
    </BottomSheet>
  )
}
