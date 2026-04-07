import { useState } from 'react'
import { BottomSheet, StarPicker, GoldButton, Textarea, Input, WhiskyThumb } from './UI'
import { useCheckins } from '../hooks/useCheckins'
import { useToast } from './UI'

export function CheckInModal({ whisky, open, onClose }) {
  const { addCheckin } = useCheckins()
  const toast = useToast()
  const [rating, setRating] = useState(0)
  const [nose, setNose] = useState('')
  const [notes, setNotes] = useState('')
  const [location, setLocation] = useState('')
  const [saving, setSaving] = useState(false)

  const reset = () => { setRating(0); setNose(''); setNotes(''); setLocation('') }
  const handleClose = () => { reset(); onClose() }

  const submit = async () => {
    if (!rating) { toast('Please select a rating'); return }
    setSaving(true)
    await addCheckin({
      whisky_id: whisky.id || whisky.slug,
      whisky_name: whisky.name,
      rating, nose, notes,
      location: location || null,
    })
    setSaving(false)
    toast(`Archived — ${whisky.name}`)
    handleClose()
  }

  const m = whisky?.metadata || {}

  return (
    <BottomSheet open={open} onClose={handleClose} title="Check In">
      <div style={{ display: 'grid', gap: 16 }}>
        <div style={{ textAlign: 'center', paddingBottom: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
            <WhiskyThumb whisky={whisky} width={40} height={56} />
          </div>
          <p style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 700, fontSize: 15, color: '#e8e4dc' }}>{whisky?.name}</p>
          <p style={{ fontSize: 11, color: '#7a7060', marginTop: 3 }}>{m.distillery}</p>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 10, textTransform: 'uppercase', letterSpacing: '.08em', color: '#7a7060', marginBottom: 10 }}>Rating</label>
          <StarPicker value={rating} onChange={setRating} />
        </div>
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
        <GoldButton onClick={submit} disabled={saving}>{saving ? 'Saving…' : 'Archive Dram'}</GoldButton>
        <div style={{ height: 6 }} />
      </div>
    </BottomSheet>
  )
}
