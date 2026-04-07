import { useState } from 'react'
import { regionStyle, avgRating, imgURL } from '../lib/supabase'

export function RegionBadge({ region }) {
  if (!region) return null
  const s = regionStyle(region)
  return <span style={{ background: s.bg, color: s.text, fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', padding: '2px 8px', borderRadius: 99, display: 'inline-block' }}>{region}</span>
}

export function FlavourTag({ flavour }) {
  if (!flavour) return null
  return <span style={{ background: 'rgba(80,72,64,.25)', color: '#7a7060', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', padding: '2px 8px', borderRadius: 99, display: 'inline-block' }}>{flavour}</span>
}

export function Stars({ rating, max = 5, size = 12 }) {
  return (
    <span style={{ display: 'flex', gap: 1 }}>
      {Array.from({ length: max }).map((_, i) => (
        <span key={i} className="ms" style={{ fontSize: size, color: i < rating ? '#ffbf00' : '#3d3a35', fontVariationSettings: `'FILL' ${i < rating ? 1 : 0}` }}>star</span>
      ))}
    </span>
  )
}

const BOTTLE_COLOURS = {
  islay: ['#4a7a8a','#2a5a6a'], speyside: ['#5a8a4a','#3a6a2a'],
  highland: ['#8a6a3a','#6a4a1a'], lowland: ['#6a8a5a','#4a6a3a'],
  campbeltown: ['#8a5a4a','#6a3a2a'], islands: ['#4a6a9a','#2a4a7a'],
  japan: ['#9a5a5a','#7a3a3a'], ireland: ['#3a8a5a','#1a6a3a'],
  taiwan: ['#3a5a9a','#1a3a7a'], india: ['#c87a20','#a05a10'],
  australia: ['#9a5a30','#7a3a10'],
}

function bottleColour(region = '') {
  const key = region.toLowerCase()
  const match = Object.entries(BOTTLE_COLOURS).find(([k]) => key.includes(k))
  return match ? match[1] : ['#5a6a7a','#3a4a5a']
}

export function BottleSVG({ region, width = 28, height = 49 }) {
  const [c1, c2] = bottleColour(region)
  return (
    <svg width={width} height={height} viewBox="0 0 40 70" fill="none">
      <rect x="15" y="0" width="10" height="5" rx="1" fill="#2a2420"/>
      <path d="M17 5L17 14L13 18L13 65C13 67 15 69 20 69C25 69 27 67 27 65L27 18L23 14L23 5Z" fill={c1} opacity=".9"/>
      <rect x="17" y="5" width="6" height="8" fill={c1}/>
      <rect x="14" y="28" width="12" height="22" rx="1" fill="#f5f0e8" opacity=".95"/>
      <rect x="15" y="30" width="10" height="2" fill={c2}/>
      <path d="M14 52L14 65C14 66.5 16 68 20 68C24 68 26 66.5 26 65L26 52Z" fill={c2} opacity=".4"/>
    </svg>
  )
}

export function WhiskyThumb({ whisky, width = 44, height = 60 }) {
  const photo = imgURL(whisky)
  const region = whisky?.metadata?.region
  const [imgFailed, setImgFailed] = useState(false)
  if (!photo || imgFailed) return <div style={{ flexShrink: 0 }}><BottleSVG region={region} width={Math.round(width * 0.65)} height={height} /></div>
  return (
    <div style={{ width, height, flexShrink: 0 }}>
      <img src={photo} alt="" loading="lazy" style={{ width, height, objectFit: 'cover', borderRadius: 7, display: 'block' }} onError={() => setImgFailed(true)} />
    </div>
  )
}

export function WhiskyRow({ whisky, isCheckedIn, onClick }) {
  const m = whisky?.metadata || {}
  const score = avgRating(whisky)
  return (
    <div onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 8px', borderRadius: 12, cursor: 'pointer' }}
      onMouseDown={e => e.currentTarget.style.background = 'rgba(255,226,171,.06)'}
      onMouseUp={e => e.currentTarget.style.background = 'transparent'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
      <WhiskyThumb whisky={whisky} width={44} height={60} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: '#e8e4dc', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{whisky.name}</p>
            <p style={{ fontSize: 11, color: '#7a7060', marginTop: 2 }}>{m.distillery}{m.age ? ` · ${m.age}yr` : ''}{m.abv ? ` · ${m.abv}%` : ''}</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3, flexShrink: 0 }}>
            {score && <span style={{ fontSize: 16, fontWeight: 800, color: '#ffbf00', fontFamily: 'Manrope, sans-serif', lineHeight: 1 }}>{score}</span>}
            {isCheckedIn && <span className="ms" style={{ fontSize: 14, color: '#ffbf00', fontVariationSettings: "'FILL' 1" }}>check_circle</span>}
          </div>
        </div>
        <div style={{ marginTop: 5, display: 'flex', gap: 5, flexWrap: 'wrap' }}>
          <RegionBadge region={m.region || m.country} />
          <FlavourTag flavour={m.flavour} />
        </div>
      </div>
    </div>
  )
}

export function Skeleton({ height = 68, delay = 0 }) {
  return <div style={{ height, borderRadius: 10, marginBottom: 2, background: 'linear-gradient(90deg,#1a1917 25%,#2a2825 50%,#1a1917 75%)', backgroundSize: '200% 100%', animation: `shimmer 1.6s ${delay}s infinite` }} />
}

let _setToast = null
export function useToast() {
  return (msg) => _setToast?.(msg)
}
export function Toast() {
  const [msg, setMsg] = useState(null)
  _setToast = (m) => { setMsg(m); setTimeout(() => setMsg(null), 2400) }
  if (!msg) return null
  return <div style={{ position: 'fixed', bottom: 82, left: '50%', transform: 'translateX(-50%)', background: '#ffe2ab', color: '#2a1a00', padding: '8px 18px', borderRadius: 99, fontSize: 12, fontWeight: 600, zIndex: 9999, whiteSpace: 'nowrap', pointerEvents: 'none', fontFamily: 'DM Sans, sans-serif', animation: 'fadeInUp .25s ease' }}>{msg}</div>
}

export function GoldButton({ children, onClick, disabled, style = {} }) {
  return <button onClick={onClick} disabled={disabled} style={{ background: 'linear-gradient(135deg,#ffe2ab 0%,#ffbf00 100%)', color: '#2a1a00', fontFamily: 'Manrope, sans-serif', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', fontSize: 11, borderRadius: 14, border: 'none', cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? .6 : 1, padding: '15px 20px', width: '100%', ...style }}>{children}</button>
}

export function OutlineButton({ children, onClick, style = {} }) {
  return <button onClick={onClick} style={{ background: 'transparent', border: '1px solid rgba(255,191,0,.35)', color: '#ffe2ab', fontFamily: 'Manrope, sans-serif', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.08em', fontSize: 11, borderRadius: 14, cursor: 'pointer', padding: '15px 20px', width: '100%', ...style }}>{children}</button>
}

export function IconButton({ icon, onClick, title, style = {} }) {
  return <button onClick={onClick} title={title} style={{ width: 50, height: 50, background: '#1a1917', border: '1px solid rgba(80,72,64,.4)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, color: '#7a7060', ...style }}><span className="ms" style={{ fontSize: 20 }}>{icon}</span></button>
}

export function Input({ style = {}, ...props }) {
  return <input {...props} style={{ width: '100%', background: '#1a1917', border: '1px solid rgba(80,72,64,.35)', borderRadius: 12, padding: '11px 14px', color: '#e8e4dc', fontSize: 14, fontFamily: 'DM Sans, sans-serif', outline: 'none', boxSizing: 'border-box', ...style }} />
}

export function Textarea({ style = {}, ...props }) {
  return <textarea {...props} style={{ width: '100%', background: '#1a1917', border: '1px solid rgba(80,72,64,.35)', borderRadius: 12, padding: '11px 14px', color: '#e8e4dc', fontSize: 14, fontFamily: 'DM Sans, sans-serif', outline: 'none', resize: 'none', boxSizing: 'border-box', ...style }} />
}

export function Select({ children, style = {}, ...props }) {
  return <select {...props} style={{ width: '100%', background: '#1a1917', border: '1px solid rgba(80,72,64,.35)', borderRadius: 12, padding: '11px 14px', color: '#e8e4dc', fontSize: 14, fontFamily: 'DM Sans, sans-serif', outline: 'none', appearance: 'none', boxSizing: 'border-box', ...style }}>{children}</select>
}

export function StarPicker({ value, onChange, size = 28 }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
      {[1,2,3,4,5].map(n => (
        <span key={n} className="ms" onClick={() => onChange(n)} style={{ fontSize: size, cursor: 'pointer', color: n <= value ? '#ffbf00' : '#3d3a35', fontVariationSettings: `'FILL' ${n <= value ? 1 : 0}`, transition: 'color .12s' }}>star</span>
      ))}
    </div>
  )
}

export function BottomSheet({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <div onClick={e => e.target === e.currentTarget && onClose()} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.9)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 600 }}>
      <div style={{ width: '100%', maxWidth: 480, maxHeight: '90vh', background: '#1a1917', borderRadius: '20px 20px 0 0', overflowY: 'auto', animation: 'slideUp .32s cubic-bezier(.22,1,.36,1)' }}>
        <div style={{ width: 36, height: 4, background: 'rgba(80,72,64,.5)', borderRadius: 2, margin: '12px auto' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 18px 12px', borderBottom: '.5px solid rgba(80,72,64,.2)' }}>
          <h3 style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 700, fontSize: 16, color: '#e8e4dc' }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7a7060' }}><span className="ms" style={{ fontSize: 22 }}>close</span></button>
        </div>
        <div style={{ padding: 18 }}>{children}</div>
      </div>
    </div>
  )
}
