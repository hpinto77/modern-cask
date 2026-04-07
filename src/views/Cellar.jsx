import { useState, useEffect } from 'react'
import { useCheckins } from '../hooks/useCheckins'
import { useAuth } from '../hooks/useAuth'
import { Stars, WhiskyThumb, RegionBadge } from '../components/UI'
import { fetchWhisky } from '../lib/api'

export default function Cellar({ onSelect }) {
  const { user } = useAuth()
  const { triedWhiskies, ownedWhiskies, setOwned } = useCheckins()
  const [filter, setFilter] = useState('tried') // 'tried' | 'owned'
  const [whiskies, setWhiskies] = useState({})
  const [loading, setLoading] = useState(true)

  const displayed = filter === 'owned' ? ownedWhiskies : triedWhiskies

  // Enrich checkins with full whisky data
  useEffect(() => {
    const ids = displayed.map(c => String(c.whisky_id))
    const missing = ids.filter(id => !whiskies[id])
    if (!missing.length) { setLoading(false); return }

    Promise.all(missing.map(id => fetchWhisky(id).then(w => ({ id, w }))))
      .then(results => {
        setWhiskies(prev => {
          const next = { ...prev }
          results.forEach(({ id, w }) => { if (w) next[id] = w })
          return next
        })
        setLoading(false)
      })
  }, [displayed.length, filter])

  return (
    <div style={{ paddingTop: 56, paddingBottom: 80 }}>
      <div style={{ padding: '24px 18px 16px' }}>
        <p style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '.2em', color: '#7a7060', marginBottom: 4 }}>Your Whiskies</p>
        <h2 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 42, fontWeight: 800, letterSpacing: '-.02em', lineHeight: 1, color: '#e8e4dc' }}>Cellar.</h2>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, padding: '0 16px 16px' }}>
        <div style={{ background: '#1a1917', borderRadius: 12, padding: '14px 16px' }}>
          <p style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '.1em', color: '#7a7060', marginBottom: 4 }}>Whiskies tried</p>
          <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 32, fontWeight: 800, color: '#ffbf00', lineHeight: 1 }}>{triedWhiskies.length}</p>
        </div>
        <div style={{ background: '#1a1917', borderRadius: 12, padding: '14px 16px' }}>
          <p style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '.1em', color: '#7a7060', marginBottom: 4 }}>Bottles owned</p>
          <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 32, fontWeight: 800, color: '#ffbf00', lineHeight: 1 }}>{ownedWhiskies.length}</p>
        </div>
      </div>

      {/* Toggle filter */}
      <div style={{ display: 'flex', gap: 8, padding: '0 16px 16px' }}>
        {[['tried', 'All Tried'], ['owned', 'My Bottles']].map(([id, label]) => (
          <button key={id} onClick={() => setFilter(id)} style={{ flex: 1, padding: '10px', borderRadius: 10, border: `1px solid ${filter === id ? 'rgba(255,191,0,.4)' : 'rgba(80,72,64,.3)'}`, background: filter === id ? 'rgba(255,191,0,.1)' : 'transparent', color: filter === id ? '#ffe2ab' : '#7a7060', fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all .15s' }}>
            {label}
          </button>
        ))}
      </div>

      {/* List */}
      <div style={{ padding: '0 16px', display: 'grid', gap: 8 }}>
        {displayed.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0' }}>
            <span className="ms" style={{ fontSize: 44, color: '#3d3a35', display: 'block', marginBottom: 10 }}>
              {filter === 'owned' ? 'liquor' : 'local_bar'}
            </span>
            <p style={{ color: '#7a7060', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.1em' }}>
              {filter === 'owned' ? 'No bottles yet' : 'No whiskies tried yet'}
            </p>
            <p style={{ color: '#504840', fontSize: 10, marginTop: 4 }}>
              {filter === 'owned' ? 'Toggle "I own a bottle" when checking in' : 'Discover a whisky and check in'}
            </p>
          </div>
        ) : (
          displayed.map(checkin => {
            const wid = String(checkin.whisky_id)
            const w = whiskies[wid]
            const m = w?.metadata || {}
            return (
              <div key={wid} onClick={() => w && onSelect(w)} style={{ background: '#1a1917', borderRadius: 14, padding: 14, display: 'flex', gap: 12, alignItems: 'center', cursor: w ? 'pointer' : 'default' }}>
                <WhiskyThumb whisky={w || {}} width={48} height={64} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#e8e4dc', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {checkin.whisky_name}
                  </p>
                  <p style={{ fontSize: 11, color: '#7a7060', marginTop: 2 }}>
                    {m.distillery || checkin.whisky_region || ''}
                    {m.age ? ` · ${m.age}yr` : ''}
                    {m.abv ? ` · ${m.abv}%` : ''}
                  </p>
                  <div style={{ display: 'flex', gap: 5, marginTop: 5, flexWrap: 'wrap', alignItems: 'center' }}>
                    <RegionBadge region={m.region || checkin.whisky_region} />
                    {checkin.rating && <Stars rating={checkin.rating} size={11} />}
                  </div>
                </div>
                {/* Owned toggle */}
                <div
                  onClick={e => { e.stopPropagation(); setOwned(wid, !checkin.owned) }}
                  title={checkin.owned ? 'Remove from cellar' : 'Add to cellar'}
                  style={{ width: 36, height: 36, borderRadius: 10, background: checkin.owned ? 'rgba(255,191,0,.15)' : 'rgba(80,72,64,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, cursor: 'pointer', border: `1px solid ${checkin.owned ? 'rgba(255,191,0,.3)' : 'rgba(80,72,64,.3)'}` }}>
                  <span className="ms" style={{ fontSize: 18, color: checkin.owned ? '#ffbf00' : '#504840', fontVariationSettings: `'FILL' ${checkin.owned ? 1 : 0}` }}>
                    liquor
                  </span>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
