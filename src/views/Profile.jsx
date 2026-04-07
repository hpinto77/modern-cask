import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useCheckins } from '../hooks/useCheckins'
import { supabase } from '../lib/supabase'
import { GoldButton, Input, Textarea, Select, BottomSheet } from '../components/UI'
import { useToast } from '../components/UI'

const REGIONS = [
  {id:'islay',label:'Islay',country:'Scotland',min:3},
  {id:'speyside',label:'Speyside',country:'Scotland',min:3},
  {id:'highland',label:'Highland',country:'Scotland',min:3},
  {id:'lowland',label:'Lowland',country:'Scotland',min:2},
  {id:'campbeltown',label:'Campbeltown',country:'Scotland',min:2},
  {id:'islands',label:'Islands',country:'Scotland',min:2},
  {id:'japan',label:'Japan',country:'Japan',min:3},
  {id:'ireland',label:'Ireland',country:'Ireland',min:2},
  {id:'taiwan',label:'Taiwan',country:'Taiwan',min:2},
  {id:'india',label:'India',country:'India',min:2},
  {id:'australia',label:'Australia',country:'Australia',min:2},
  {id:'scandinavia',label:'Scandinavia',country:'Europe',min:2},
  {id:'france',label:'France',country:'Europe',min:2},
  {id:'germany',label:'Germany & Austria',country:'Europe',min:2},
  {id:'wales',label:'Wales & England',country:'UK',min:2},
  {id:'usa',label:'USA — Single Malt',country:'USA',min:2},
  {id:'canada',label:'Canada',country:'Canada',min:2},
  {id:'south-america',label:'South America',country:'Americas',min:2},
  {id:'africa',label:'Africa',country:'Africa',min:2},
  {id:'asia-rest',label:'Rest of Asia',country:'Asia',min:2},
  {id:'europe-rest',label:'Rest of Europe',country:'Europe',min:2},
  {id:'middle-east',label:'Middle East',country:'Middle East',min:2},
]

const TITLES = [
  {id:'islayan',label:'The Islayan',emoji:'🏝️',desc:'3+ Islay drams',check:s=>s.islay>=3},
  {id:'strathspey',label:'The Strathspey',emoji:'🌾',desc:'3+ Speyside drams',check:s=>s.speyside>=3},
  {id:'gaidheal',label:'The Gàidheal',emoji:'🏔️',desc:'3+ Highland drams',check:s=>s.highland>=3},
  {id:'lowlander',label:'The Lowlander',emoji:'🌿',desc:'2+ Lowland drams',check:s=>s.lowland>=2},
  {id:'campsalt',label:'The Campbeltown Salt',emoji:'⚓',desc:'2+ Campbeltown drams',check:s=>s.campbeltown>=2},
  {id:'islandkeeper',label:'The Island Keeper',emoji:'🌊',desc:'2+ Islands drams',check:s=>s.islands>=2},
  {id:'wabisabi',label:'The Wabisabi',emoji:'🎋',desc:'3+ Japanese drams',check:s=>s.japan>=3},
  {id:'emerald',label:'The Emerald Dram',emoji:'☘️',desc:'2+ Irish drams',check:s=>s.ireland>=2},
  {id:'formosan',label:'The Formosan',emoji:'🏯',desc:'2+ Taiwanese drams',check:s=>s.taiwan>=2},
  {id:'subcontinental',label:'The Subcontinental',emoji:'🌅',desc:'2+ Indian drams',check:s=>s.india>=2},
  {id:'antipodean',label:'The Antipodean',emoji:'🦘',desc:'2+ Australian drams',check:s=>s.australia>=2},
  {id:'norseman',label:'The Norseman',emoji:'🧊',desc:'2+ Scandinavian drams',check:s=>s.scandinavia>=2},
  {id:'globetrotter',label:'The Globetrotter',emoji:'🌍',desc:'5+ countries',check:s=>s._countries>=5},
  {id:'completescot',label:'The Complete Scot',emoji:'🏴󠁧󠁢󠁳󠁣󠁴󠁿',desc:'All 6 Scottish regions',check:s=>s.islay>=1&&s.speyside>=1&&s.highland>=1&&s.lowland>=1&&s.campbeltown>=1&&s.islands>=1},
  {id:'cartographer',label:'The Cartographer',emoji:'🗺️',desc:'10+ regions',check:s=>s._regions>=10},
  {id:'masterdram',label:'The Master Dram',emoji:'👑',desc:'All 22 regions',check:s=>s._regions>=22},
]

function passportStats(checkins) {
  const counts = {}
  const countries = {}
  checkins.forEach(c => {
    const region = (c.region || c.whisky_region || '').toLowerCase()
    const country = (c.country || c.whisky_country || '').toLowerCase()
    if (country) countries[country] = 1
    REGIONS.forEach(r => {
      if (region.includes(r.id) || region.includes(r.label.toLowerCase())) {
        counts[r.id] = (counts[r.id] || 0) + 1
      }
    })
  })
  const regionsVisited = REGIONS.filter(r => (counts[r.id] || 0) >= 1).length
  counts._regions = regionsVisited
  counts._countries = Object.keys(countries).length
  return counts
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  )
}

export function AddWhiskyModal({ open, onClose, onSubmit }) {
  const toast = useToast()
  const { user } = useAuth()
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
    const row = { id: Date.now(), name, distillery, age: age || null, abv: abv || null, region: region || null, country: country || null, description: description || null, has_photo: !!photo, status: 'pending', submitted_by: user?.email || 'anonymous', date: new Date().toISOString() }
    await supabase.from('whisky_requests').insert(row)
    onSubmit(row)
    setSaving(false)
    toast('Submitted — thank you!')
    onClose()
    setName(''); setDistillery(''); setAge(''); setAbv(''); setRegion(''); setCountry(''); setDescription(''); setPhoto(null)
  }

  return (
    <BottomSheet open={open} onClose={onClose} title="Add Whisky">
      <div style={{ display: 'grid', gap: 14 }}>
        {!photo ? (
          <label style={{ background: '#1a1917', border: '1.5px dashed rgba(80,72,64,.5)', borderRadius: 14, padding: 28, textAlign: 'center', cursor: 'pointer', display: 'block' }}>
            <span className="ms" style={{ fontSize: 36, color: '#504840', display: 'block', marginBottom: 8 }}>photo_camera</span>
            <p style={{ fontSize: 13, fontWeight: 500, color: '#7a7060', marginBottom: 4 }}>Take or upload a photo</p>
            <p style={{ fontSize: 10, color: '#504840' }}>Tap to capture the label</p>
            <input type="file" accept="image/*" capture="environment" onChange={handlePhoto} style={{ display: 'none' }} />
          </label>
        ) : (
          <div style={{ position: 'relative' }}>
            <img src={photo} alt="" style={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: 12 }} />
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
        <Textarea rows={3} placeholder="Brief description (optional)…" value={description} onChange={e => setDescription(e.target.value)} />
        <div style={{ background: '#1a1917', borderRadius: 12, padding: '12px 14px', display: 'flex', gap: 10 }}>
          <span className="ms" style={{ fontSize: 16, color: '#ffbf00', marginTop: 1 }}>info</span>
          <p style={{ fontSize: 12, color: '#7a7060', lineHeight: 1.5 }}>Reviewed before going live. Track status in your profile.</p>
        </div>
        <GoldButton onClick={submit} disabled={saving}>{saving ? 'Submitting…' : 'Submit for Review'}</GoldButton>
        <div style={{ height: 6 }} />
      </div>
    </BottomSheet>
  )
}

export default function Profile() {
  const { user, displayName, initials, signInWithGoogle, signOut } = useAuth()
  const { checkins } = useCheckins()
  const toast = useToast()
  const [addOpen, setAddOpen] = useState(false)
  const [submissions, setSubmissions] = useState(() => {
    try { return JSON.parse(localStorage.getItem('tmc_submissions')) || [] } catch { return [] }
  })

  const stats = passportStats(checkins)
  const pct = Math.round((stats._regions || 0) / 22 * 100)
  const earnedTitles = TITLES.filter(t => t.check(stats))
  const lockedTitles = TITLES.filter(t => !t.check(stats))
  const scores = checkins.map(c => c.rating).filter(Boolean)
  const avgScore = scores.length ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) + '★' : '—'
  const uniqueBottles = [...new Set(checkins.map(c => String(c.whisky_id)))].length

  return (
    <div style={{ paddingTop: 56, paddingBottom: 80 }}>
      <div style={{ padding: '24px 18px 12px' }}>
        <p style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '.2em', color: '#7a7060', marginBottom: 4 }}>Collection & Journey</p>
        <h2 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 42, fontWeight: 800, letterSpacing: '-.02em', lineHeight: 1, color: '#e8e4dc' }}>Profile.</h2>
      </div>

      <div style={{ padding: '0 16px', display: 'grid', gap: 12 }}>

        {/* Auth */}
        <div style={{ background: '#1a1917', borderRadius: 16, padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg,#ffe2ab,#ffbf00)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: 16, color: '#2a1a00' }}>
              {user ? initials : <span className="ms" style={{ fontSize: 20, color: '#2a1a00' }}>person</span>}
            </div>
            {user ? (
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#e8e4dc' }}>{displayName}</p>
                <p style={{ fontSize: 11, color: '#7a7060', marginTop: 2 }}>{user.email}</p>
                <button onClick={signOut} style={{ marginTop: 6, fontSize: 10, color: '#504840', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'DM Sans, sans-serif' }}>Sign out</button>
              </div>
            ) : (
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, color: '#7a7060', marginBottom: 10 }}>Sign in to sync your collection across devices</p>
                <button onClick={signInWithGoogle} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: 'none', borderRadius: 10, padding: '9px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#1a1a1a', fontFamily: 'DM Sans, sans-serif' }}>
                  <GoogleIcon /> Continue with Google
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          {[['Bottles', uniqueBottles], ['Regions', stats._regions || 0], ['Avg ★', avgScore]].map(([label, val]) => (
            <div key={label} style={{ background: '#1a1917', borderRadius: 12, padding: '14px 10px' }}>
              <span style={{ display: 'block', fontSize: 9, textTransform: 'uppercase', letterSpacing: '.1em', color: '#7a7060', marginBottom: 4 }}>{label}</span>
              <span style={{ fontFamily: 'Manrope, sans-serif', fontSize: 24, fontWeight: 800, color: '#ffbf00' }}>{val}</span>
            </div>
          ))}
        </div>

        {/* Passport progress */}
        <div style={{ background: '#1a1917', borderRadius: 16, padding: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
            <div>
              <p style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '.1em', color: '#7a7060' }}>Total drams</p>
              <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 36, fontWeight: 800, color: '#ffbf00', lineHeight: 1 }}>{checkins.length}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '.1em', color: '#7a7060' }}>Regions</p>
              <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 36, fontWeight: 800, color: '#ffbf00', lineHeight: 1 }}>{stats._regions || 0}<span style={{ fontSize: 16, color: '#3d3a35' }}>/22</span></p>
            </div>
          </div>
          <div style={{ height: 4, background: '#2a2825', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg,#ffe2ab,#ffbf00)', borderRadius: 2, transition: 'width .6s ease' }} />
          </div>
          <p style={{ fontSize: 10, color: '#504840', marginTop: 6 }}>{pct}% of the world explored</p>
        </div>

        {/* Earned titles */}
        {earnedTitles.length > 0 && (
          <div>
            <p style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '.12em', color: '#7a7060', marginBottom: 8, fontWeight: 700 }}>Titles Earned</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {earnedTitles.map(t => (
                <span key={t.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(255,191,0,.1)', border: '1px solid rgba(255,191,0,.25)', color: '#ffe2ab', fontSize: 10, fontWeight: 600, padding: '3px 10px', borderRadius: 99, fontFamily: 'Manrope, sans-serif' }}>
                  {t.emoji} {t.label}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Passport grid */}
        <div>
          <p style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '.12em', color: '#7a7060', marginBottom: 8, fontWeight: 700 }}>Passport</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            {REGIONS.map(reg => {
              const count = stats[reg.id] || 0
              const stamped = count >= 1
              return (
                <div key={reg.id} style={{ background: stamped ? 'rgba(255,191,0,.08)' : '#1a1917', border: `1px solid ${stamped ? 'rgba(255,191,0,.25)' : 'rgba(80,72,64,.25)'}`, borderRadius: 10, padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 600, color: stamped ? '#e8e4dc' : '#504840', lineHeight: 1.2 }}>{reg.label}</p>
                    <p style={{ fontSize: 10, color: '#504840', marginTop: 1 }}>{reg.country}</p>
                  </div>
                  {stamped
                    ? <span className="ms" style={{ fontSize: 16, color: '#ffbf00', fontVariationSettings: "'FILL' 1" }}>verified</span>
                    : <span style={{ fontSize: 10, color: '#3d3a35', fontWeight: 700 }}>{count}/{reg.min}</span>}
                </div>
              )
            })}
          </div>
        </div>

        {/* Next titles */}
        {lockedTitles.length > 0 && (
          <div>
            <p style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '.12em', color: '#7a7060', marginBottom: 8, fontWeight: 700 }}>Next to Unlock</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {lockedTitles.slice(0, 6).map(t => (
                <span key={t.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(80,72,64,.2)', border: '1px solid rgba(80,72,64,.3)', color: '#504840', fontSize: 10, fontWeight: 600, padding: '3px 10px', borderRadius: 99, fontFamily: 'Manrope, sans-serif' }}>
                  {t.emoji} {t.label} · {t.desc}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Add whisky */}
        <div>
          <p style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '.12em', color: '#7a7060', marginBottom: 8, fontWeight: 700 }}>My Contributions</p>
          {submissions.length === 0 ? (
            <button onClick={() => setAddOpen(true)} style={{ width: '100%', padding: 14, background: 'rgba(255,191,0,.06)', border: '1px solid rgba(255,191,0,.2)', borderRadius: 12, color: '#ffe2ab', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
              + Add a Whisky to the Database
            </button>
          ) : (
            <div style={{ display: 'grid', gap: 6 }}>
              {submissions.map(s => (
                <div key={s.id} style={{ background: '#1a1917', borderRadius: 12, padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#e8e4dc' }}>{s.name}</p>
                    <p style={{ fontSize: 11, color: '#7a7060', marginTop: 2 }}>{s.distillery}{s.region ? ` · ${s.region}` : ''}</p>
                  </div>
                  <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', padding: '3px 8px', borderRadius: 99, color: '#ffbf00', background: 'rgba(255,191,0,.15)', flexShrink: 0, marginLeft: 8 }}>Pending</span>
                </div>
              ))}
              <button onClick={() => setAddOpen(true)} style={{ width: '100%', marginTop: 4, padding: 12, background: 'transparent', border: '1px solid rgba(80,72,64,.4)', borderRadius: 12, color: '#7a7060', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                + Submit Another
              </button>
            </div>
          )}
        </div>
        <div style={{ height: 8 }} />
      </div>

      <AddWhiskyModal open={addOpen} onClose={() => setAddOpen(false)} onSubmit={s => {
        const next = [...submissions, s]
        setSubmissions(next)
        localStorage.setItem('tmc_submissions', JSON.stringify(next))
      }} />
    </div>
  )
}
