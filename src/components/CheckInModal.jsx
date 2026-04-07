import { useState } from 'react'
import { BottomSheet, StarPicker, GoldButton, Textarea, Input } from './UI'
import { useCheckins } from '../hooks/useCheckins'
import { useToast } from './UI'

export function CheckInModal({ whisky, open, onClose }) {
  const { addCheckin } = useCheckins()
  const toast = useToast()
  const [rating, setRating] = useState(0)
  const [nose, setNose] = useState('')
  const [notes, setNotes] = useState('')
  const [location, setLocation] = useState('')
  const [owned, setOwned] = useState(false)
  const [saving, setSaving] = useState(false)

  const reset = () => {
    setRating(0); setNose(''); setNotes(''); setLocation(''); setOwned(false)
  }
  const handleClose = () => { reset(); onClose() }

  const submit = async () => {
    if (!rating) { toast('Please select a rating'); return }
    setSaving(true)
    const m = whisky?.metadata || {}
    await addCheckin({
      whisky_id: String(whisky.id || whisky.slug),
      whisky_name: whisky.name,
      whisky_region: m.region || null,
      whisky_country: m.country || null,
      rating, nose, notes,
      location: location || null,
      owned,
    })
    setSaving(false)
    toast(`Archived — ${whisky.name}`)
    handleClose()
  }

  const m = whisky?.metadata || {}

  return (
    <BottomSheet open={open} onClose={handleClose} title="Check In">
      <div style={{ display: 'grid', gap: 16 }}>

        {/* Whisky identity */}
        <div style={{ textAlign: 'center', paddingBottom: 4 }}>
          <p style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 700, fontSize: 15, color: '#e8e4dc' }}>{whisky?.name}</p>
          <p style={{ fontSize: 11, color: '#7a7060', marginTop: 3 }}>{m.distillery}{m.region ? ` · ${m.region}` : ''}</p>
        </div>

        {/* Rating */}
        <div>
          <label style={{ display: 'block', fontSize: 10, textTransform: 'uppercase', letterSpacing: '.08em', color: '#7a7060', marginBottom: 10 }}>Your Rating</label>
          <StarPicker value={rating} onChange={setRating} />
        </div>

        {/* Notes */}
        <div>
          <label style={{ display: 'block', fontSize: 10, textTransform: 'uppercase', letterSpacing: '.08em', color: '#7a7060', marginBottom: 6 }}>Nose</label>
          <Textarea rows={2} placeholder="First aromas…" value={nose} onChange={e => setNose(e.target.value)} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 10, textTransform: 'uppercase', letterSpacing: '.08em', color: '#7a7060', marginBottom: 6 }}>Palate &amp; Finish</label>
          <Textarea rows={2} placeholder="Tasting notes…" value={notes} onChange={e => setNotes(e.target.value)} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 10, textTransform: 'uppercase', letterSpacing: '.08em', color: '#7a7060', marginBottom: 6 }}>Location</label>
          <Input placeholder="Where are you?" value={location} onChange={e => setLocation(e.target.value)} />
        </div>

        {/* Own a bottle toggle */}
        <div onClick={() => setOwned(o => !o)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: owned ? 'rgba(255,191,0,.08)' : '#1a1917', border: `1px solid ${owned ? 'rgba(255,191,0,.3)' : 'rgba(80,72,64,.3)'}`, borderRadius: 12, padding: '12px 14px', cursor: 'pointer' }}>
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#e8e4dc' }}>I own a bottle</p>
            <p style={{ fontSize: 11, color: '#7a7060', marginTop: 2 }}>Add to your Cellar</p>
          </div>
          <div style={{ width: 44, height: 24, borderRadius: 12, background: owned ? '#ffbf00' : 'rgba(80,72,64,.4)', position: 'relative', transition: 'background .2s', flexShrink: 0 }}>
            <div style={{ position: 'absolute', top: 2, left: owned ? 22 : 2, width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,.3)' }} />
          </div>
        </div>

        <GoldButton onClick={submit} disabled={saving}>
          {saving ? 'Saving…' : 'Archive Dram'}
        </GoldButton>
        <div style={{ height: 6 }} />
      </div>
    </BottomSheet>
  )
}
