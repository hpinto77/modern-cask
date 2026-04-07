import { useState, useEffect } from 'react'
import { fetchWhisky } from '../lib/api'
import { imgURL, avgRating } from '../lib/supabase'
import { RegionBadge, FlavourTag, Stars, BottleSVG, GoldButton, OutlineButton, IconButton, Input, Textarea, Select, BottomSheet } from '../components/UI'
import { CheckInModal } from '../components/CheckInModal'
import { useCheckins } from '../hooks/useCheckins'
import { useToast } from '../components/UI'
import { supabase } from '../lib/supabase'

function Tag({ children }) {
  return <span style={{ fontSize: 9, textTransform: 'uppercase', fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: 'rgba(80,72,64,.25)', color: '#7a7060', display: 'inline-block' }}>{children}</span>
}

function ReportModal({ whisky, open, onClose }) {
  const toast = useToast()
  const [type, setType] = useState('wrong_info')
  const [notes, setNotes] = useState('')
  const submit = async () => {
    await supabase.from('feedback').insert({ whisky_id: String(whisky.id || whisky.slug), whisky_name: whisky.name, type, notes, date: new Date().toISOString() })
    setNotes(''); onClose(); toast('Report sent — thank you')
  }
  return (
    <BottomSheet open={open} onClose={onClose} title="Report an Issue">
      <div style={{ display: 'grid', gap: 12 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: '#ffe2ab' }}>{whisky?.name}</p>
        <div>
          <label style={{ display: 'block', fontSize: 10, textTransform: 'uppercase', letterSpacing: '.08em', color: '#7a7060', marginBottom: 6 }}>Issue type</label>
          <Select value={type} onChange={e => setType(e.target.value)}>
            <option value="wrong_info">Wrong info (age, ABV, region)</option>
            <option value="wrong_name">Wrong name or spelling</option>
            <option value="duplicate">Duplicate entry</option>
            <option value="other">Other</option>
          </Select>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 10, textTransform: 'uppercase', letterSpacing: '.08em', color: '#7a7060', marginBottom: 6 }}>Details (optional)</label>
          <Textarea rows={3} placeholder="Tell us what's wrong…" value={notes} onChange={e => setNotes(e.target.value)} />
        </div>
        <GoldButton onClick={submit}>Send Report</GoldButton>
      </div>
    </BottomSheet>
  )
}

export default function Detail({ whisky: initial, onBack }) {
  const { getCheckin } = useCheckins()
  const toast = useToast()
  const [whisky, setWhisky] = useState(initial)
  const [checkInOpen, setCheckInOpen] = useState(false)
  const [reportOpen, setReportOpen] = useState(false)

  useEffect(() => {
    if (!initial) return
    fetchWhisky(initial.slug || initial.id).then(w => { if (w) setWhisky(w) })
  }, [initial?.slug])

  if (!whisky) return null

  const m = whisky.metadata || {}
  const notes = whisky.tasting_notes || {}
  const score = avgRating(whisky)
  const photo = imgURL(whisky)
  const checkin = getCheckin(whisky.id || whisky.slug)
  const isCheckedIn = !!checkin

  const share = () => {
    const text = `Just discovered ${whisky.name}${m.distillery ? ` from ${m.distillery}` : ''}. ${m.region ? m.region + ', ' : ''}On The Modern Cask 🥃\nhttps://modern-cask.netlify.app`
    if (navigator.share) navigator.share({ text }).catch(() => {})
    else { navigator.clipboard?.writeText(text); toast('Copied to clipboard') }
  }

  return (
    <div style={{ paddingTop: 56, paddingBottom: 160 }}>
      <div style={{ padding: '12px 16px 4px' }}>
        <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', color: '#7a7060', cursor: 'pointer', fontSize: 14, fontFamily: 'DM Sans, sans-serif', fontWeight: 500 }}>
          <span className="ms" style={{ fontSize: 18 }}>arrow_back</span> Back
        </button>
      </div>

      {photo && (
        <div style={{ height: 220, overflow: 'hidden' }}>
          <img src={photo} alt={whisky.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.parentElement.style.display = 'none'} />
        </div>
      )}

      <div style={{ textAlign: 'center', padding: photo ? '16px 18px 20px' : '20px 18px 20px' }}>
        {!photo && <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}><BottleSVG region={m.region} width={56} height={98} /></div>}
        <p style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '.1em', color: '#7a7060', marginBottom: 4 }}>{m.distillery}</p>
        <h2 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 22, fontWeight: 800, letterSpacing: '-.01em', lineHeight: 1.2, marginBottom: 12, color: '#e8e4dc' }}>{whisky.name}</h2>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
          <RegionBadge region={m.region || m.country} />
          {m.age && <Tag>{m.age} Yr</Tag>}
          {m.abv && <Tag>{m.abv}% ABV</Tag>}
          {m.flavour && <Tag>{m.flavour}</Tag>}
        </div>
        {score && <div><span style={{ fontFamily: 'Manrope, sans-serif', fontSize: 56, fontWeight: 900, color: '#ffbf00', lineHeight: 1 }}>{score}</span><span style={{ color: '#7a7060', fontSize: 14, marginLeft: 4 }}>/100</span></div>}
      </div>

      <div style={{ padding: '0 16px' }}>
        {whisky.description && <div style={{ background: '#1a1917', borderRadius: 16, padding: 16, marginBottom: 12 }}><p style={{ color: '#7a7060', fontSize: 13, lineHeight: 1.6, fontStyle: 'italic' }}>"{whisky.description}"</p></div>}

        {(notes.nose || notes.palate || notes.finish) && (
          <div style={{ display: 'grid', gap: 8, marginBottom: 12 }}>
            {[['Nose', notes.nose], ['Palate', notes.palate], ['Finish', notes.finish]].map(([label, text]) =>
              text ? (
                <div key={label} style={{ background: '#1a1917', borderRadius: 16, padding: 14 }}>
                  <span style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '.08em', color: '#ffbf00', fontWeight: 700, display: 'block', marginBottom: 6 }}>{label}</span>
                  <p style={{ fontSize: 13, color: '#e8e4dc', lineHeight: 1.5 }}>{text}</p>
                </div>
              ) : null
            )}
          </div>
        )}

        {checkin && (
          <div style={{ background: '#1a1917', borderRadius: 16, padding: 14, marginBottom: 12, border: '1px solid rgba(255,191,0,.15)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '.08em', color: '#ffbf00', fontWeight: 700 }}>Your Note</span>
              <Stars rating={checkin.rating} />
            </div>
            {checkin.notes && <p style={{ fontSize: 13, color: '#7a7060', fontStyle: 'italic', lineHeight: 1.5 }}>"{checkin.notes}"</p>}
            {checkin.location && <p style={{ fontSize: 10, color: '#504840', marginTop: 4 }}>📍 {checkin.location}</p>}
            <p style={{ fontSize: 10, color: '#504840', marginTop: 4 }}>{new Date(checkin.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
          </div>
        )}
      </div>

      <div style={{ position: 'fixed', bottom: 68, left: 0, right: 0, padding: '0 16px 8px', background: 'linear-gradient(transparent, #0f0e0d 40%)', zIndex: 200 }}>
        <div style={{ display: 'flex', gap: 8, maxWidth: 480, margin: '0 auto' }}>
          {!isCheckedIn
            ? <GoldButton onClick={() => setCheckInOpen(true)}>Add to Cellar</GoldButton>
            : <OutlineButton onClick={() => setCheckInOpen(true)}>Log a Dram</OutlineButton>
          }
          {isCheckedIn && <IconButton icon="ios_share" onClick={share} />}
          <IconButton icon="flag" onClick={() => setReportOpen(true)} title="Report an issue" />
        </div>
      </div>

      <CheckInModal whisky={whisky} open={checkInOpen} onClose={() => setCheckInOpen(false)} />
      <ReportModal whisky={whisky} open={reportOpen} onClose={() => setReportOpen(false)} />
    </div>
  )
}
