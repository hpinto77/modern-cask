import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useCheckins } from '../hooks/useCheckins'
import { supabase } from '../lib/supabase'
import { useToast } from '../components/UI'
import { EditProfileModal } from '../components/EditProfileModal'
import { STAMP_URLS, BADGE_URLS } from '../lib/assets'

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
    const region = (c.whisky_region || '').toLowerCase()
    const country = (c.whisky_country || '').toLowerCase()
    if (country) countries[country] = 1
    REGIONS.forEach(r => {
      if (region && (region.includes(r.id) || region === r.label.toLowerCase())) {
        counts[r.id] = (counts[r.id] || 0) + 1
      }
    })
  })
  counts._regions = REGIONS.filter(r => (counts[r.id] || 0) >= 1).length
  counts._countries = Object.keys(countries).length
  return counts
}

function insightStats(checkins) {
  const regionCounts = {}
  const scores = []
  checkins.forEach(c => {
    const r = c.whisky_region
    if (r) regionCounts[r] = (regionCounts[r] || 0) + 1
    if (c.rating) scores.push(c.rating)
  })
  const topRegion = Object.entries(regionCounts).sort((a,b) => b[1]-a[1])[0]
  const avgScore = scores.length ? (scores.reduce((a,b)=>a+b,0)/scores.length).toFixed(1) : null
  const fiveStars = checkins.filter(c => c.rating === 5)
  return { topRegion: topRegion?.[0], avgScore, fiveStars }
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

export default function Profile() {
  const { user, displayName, initials, signInWithGoogle, signOut } = useAuth()
  const { checkins, triedWhiskies, ownedWhiskies } = useCheckins()
  const toast = useToast()
  const [editOpen, setEditOpen] = useState(false)
  const [extProfile, setExtProfile] = useState(() => {
    try { return JSON.parse(localStorage.getItem('tmc_profile')) || {} } catch { return {} }
  })
  const [submissions, setSubmissions] = useState(() => {
    try { return JSON.parse(localStorage.getItem('tmc_submissions')) || [] } catch { return [] }
  })

  // Load extended profile from Supabase
  useEffect(() => {
    if (!user) return
    supabase.from('profiles').select('*').eq('id', user.id).single()
      .then(({ data }) => {
        if (data) {
          const p = { bio: data.bio, favouriteRegion: data.favourite_region }
          setExtProfile(p)
          localStorage.setItem('tmc_profile', JSON.stringify(p))
        }
      })
  }, [user?.id])

  const stats = passportStats(checkins)
  const insights = insightStats(checkins)
  const pct = Math.round((stats._regions || 0) / 22 * 100)
  const earnedTitles = TITLES.filter(t => t.check(stats))
  const lockedTitles = TITLES.filter(t => !t.check(stats))

  return (
    <div style={{ paddingTop: 56, paddingBottom: 80 }}>
      <div style={{ padding: '24px 18px 12px' }}>
        <p style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '.2em', color: '#7a7060', marginBottom: 4 }}>Your Journey</p>
        <h2 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 42, fontWeight: 800, letterSpacing: '-.02em', lineHeight: 1, color: '#e8e4dc' }}>Profile.</h2>
      </div>

      <div style={{ padding: '0 16px', display: 'grid', gap: 12 }}>

        {/* Auth + profile card */}
        <div style={{ background: '#1a1917', borderRadius: 16, padding: 16 }}>
          {user ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: extProfile.bio ? 12 : 0 }}>
                <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg,#ffe2ab,#ffbf00)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: 18, color: '#2a1a00', overflow: 'hidden', border: '2px solid rgba(255,191,0,.3)' }}>
                  {extProfile.avatarUrl
                    ? <img src={extProfile.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : initials}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 15, fontWeight: 700, color: '#e8e4dc', fontFamily: 'Manrope, sans-serif' }}>{displayName}</p>
                  <p style={{ fontSize: 11, color: '#7a7060', marginTop: 2 }}>{user.email}</p>
                  {extProfile.favouriteRegion && (
                    <p style={{ fontSize: 11, color: '#ffbf00', marginTop: 3 }}>❤️ {extProfile.favouriteRegion}</p>
                  )}
                </div>
                <button
                  onClick={() => setEditOpen(true)}
                  style={{ width: 34, height: 34, background: 'rgba(80,72,64,.3)', border: 'none', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
                >
                  <span className="ms" style={{ fontSize: 18, color: '#7a7060' }}>edit</span>
                </button>
              </div>
              {extProfile.bio && (
                <p style={{ fontSize: 13, color: '#7a7060', lineHeight: 1.5, marginTop: 10, paddingTop: 10, borderTop: '0.5px solid rgba(80,72,64,.2)' }}>{extProfile.bio}</p>
              )}
              <button onClick={signOut} style={{ marginTop: 10, fontSize: 10, color: '#504840', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Sign out</button>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(80,72,64,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span className="ms" style={{ fontSize: 24, color: '#504840' }}>person</span>
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, color: '#7a7060', marginBottom: 10 }}>Sign in to sync across devices</p>
                <button onClick={signInWithGoogle} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: 'none', borderRadius: 10, padding: '9px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#1a1a1a' }}>
                  <GoogleIcon /> Continue with Google
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          {[['Tried', triedWhiskies.length], ['Owned', ownedWhiskies.length], ['Drams', checkins.length]].map(([label, val]) => (
            <div key={label} style={{ background: '#1a1917', borderRadius: 12, padding: '14px 10px' }}>
              <span style={{ display: 'block', fontSize: 9, textTransform: 'uppercase', letterSpacing: '.1em', color: '#7a7060', marginBottom: 4 }}>{label}</span>
              <span style={{ fontFamily: 'Manrope, sans-serif', fontSize: 24, fontWeight: 800, color: '#ffbf00' }}>{val}</span>
            </div>
          ))}
        </div>

        {/* Insights */}
        {checkins.length > 0 && (
          <div style={{ background: '#1a1917', borderRadius: 16, padding: 16 }}>
            <p style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '.12em', color: '#7a7060', marginBottom: 12, fontWeight: 700 }}>Insights</p>
            <div style={{ display: 'grid', gap: 10 }}>
              {insights.topRegion && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 13, color: '#7a7060' }}>Favourite region</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#e8e4dc' }}>{insights.topRegion}</span>
                </div>
              )}
              {insights.avgScore && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 13, color: '#7a7060' }}>Average rating</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#ffbf00' }}>{insights.avgScore} / 5</span>
                </div>
              )}
              {insights.fiveStars.length > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 13, color: '#7a7060' }}>Five-star drams</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#e8e4dc' }}>{insights.fiveStars.length}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, color: '#7a7060' }}>Countries explored</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#e8e4dc' }}>{stats._countries || 0}</span>
              </div>
            </div>
          </div>
        )}

        {/* Passport progress */}
        <div style={{ background: '#1a1917', borderRadius: 16, padding: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
            <div>
              <p style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '.1em', color: '#7a7060' }}>Regions explored</p>
              <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 36, fontWeight: 800, color: '#ffbf00', lineHeight: 1 }}>
                {stats._regions || 0}<span style={{ fontSize: 16, color: '#3d3a35' }}>/22</span>
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '.1em', color: '#7a7060' }}>Passport</p>
              <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 36, fontWeight: 800, color: '#ffbf00', lineHeight: 1 }}>{pct}%</p>
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
            <p style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '.12em', color: '#7a7060', marginBottom: 12, fontWeight: 700 }}>Titles Earned</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
              {earnedTitles.map(t => (
                <div key={t.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 72, height: 72 }}>
                    {BADGE_URLS[t.id]
                      ? <img src={BADGE_URLS[t.id]} alt={t.label} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                      : <div style={{ width: '100%', height: '100%', background: 'rgba(255,191,0,.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>{t.emoji}</div>
                    }
                  </div>
                  <p style={{ fontSize: 9, fontWeight: 700, color: '#ffe2ab', textAlign: 'center', lineHeight: 1.3, fontFamily: 'Manrope, sans-serif' }}>{t.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Passport grid */}
        <div>
          <p style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '.12em', color: '#7a7060', marginBottom: 12, fontWeight: 700 }}>Passport</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
            {REGIONS.map(reg => {
              const count = stats[reg.id] || 0
              const stamped = count >= 1
              const stampUrl = STAMP_URLS[reg.id]
              return (
                <div key={reg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 80, height: 80, borderRadius: '50%', overflow: 'hidden', position: 'relative', opacity: stamped ? 1 : 0.25, transition: 'opacity .4s ease', filter: stamped ? 'none' : 'grayscale(100%)' }}>
                    {stampUrl
                      ? <img src={stampUrl} alt={reg.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <div style={{ width: '100%', height: '100%', background: '#2a2825', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span className="ms" style={{ fontSize: 28, color: stamped ? '#ffbf00' : '#504840' }}>location_on</span></div>
                    }
                    {stamped && (
                      <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid rgba(255,191,0,.6)', pointerEvents: 'none' }} />
                    )}
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: 10, fontWeight: 600, color: stamped ? '#e8e4dc' : '#504840', lineHeight: 1.2 }}>{reg.label}</p>
                    {!stamped && <p style={{ fontSize: 9, color: '#3d3a35', marginTop: 1 }}>{count}/{reg.min}</p>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Next titles */}
        {lockedTitles.length > 0 && (
          <div>
            <p style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '.12em', color: '#7a7060', marginBottom: 12, fontWeight: 700 }}>Next to Unlock</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
              {lockedTitles.slice(0, 6).map(t => (
                <div key={t.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, opacity: 0.35, filter: 'grayscale(100%)' }}>
                  <div style={{ width: 72, height: 72 }}>
                    {BADGE_URLS[t.id]
                      ? <img src={BADGE_URLS[t.id]} alt={t.label} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                      : <div style={{ width: '100%', height: '100%', background: 'rgba(80,72,64,.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>{t.emoji}</div>
                    }
                  </div>
                  <p style={{ fontSize: 9, fontWeight: 600, color: '#504840', textAlign: 'center', lineHeight: 1.3, fontFamily: 'Manrope, sans-serif' }}>{t.label}<br/><span style={{ fontSize: 8, color: '#3d3a35' }}>{t.desc}</span></p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contributions */}
        <div>
          <p style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '.12em', color: '#7a7060', marginBottom: 8, fontWeight: 700 }}>My Contributions</p>
          {submissions.length === 0 ? (
            <p style={{ fontSize: 12, color: '#504840', fontStyle: 'italic' }}>No submissions yet. Use the Add button to contribute a whisky.</p>
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
            </div>
          )}
        </div>

        <div style={{ height: 8 }} />
      </div>

      <EditProfileModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSaved={(profile) => {
          setExtProfile(profile)
          setEditOpen(false)
        }}
      />
    </div>
  )
}
