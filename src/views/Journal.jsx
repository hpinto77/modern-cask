import { useCheckins } from '../hooks/useCheckins'
import { Stars } from '../components/UI'
import { useToast } from '../components/UI'

function SmallBtn({ icon, onClick, children }) {
  return (
    <button onClick={onClick} style={{ background: 'none', border: '1px solid rgba(80,72,64,.3)', borderRadius: 8, padding: '4px 10px', fontSize: 10, color: '#7a7060', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', display: 'flex', alignItems: 'center', gap: 3 }}>
      <span className="ms" style={{ fontSize: 11 }}>{icon}</span>{children}
    </button>
  )
}

function groupByDate(checkins) {
  const groups = {}
  checkins.forEach(c => {
    const date = new Date(c.date)
    const key = date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    if (!groups[key]) groups[key] = []
    groups[key].push(c)
  })
  return Object.entries(groups)
}

export default function Journal({ onSelect }) {
  const { checkins, removeCheckin } = useCheckins()
  const toast = useToast()

  const share = (c) => {
    const stars = '★'.repeat(c.rating || 0) + '☆'.repeat(5 - (c.rating || 0))
    const text = `Just had ${c.whisky_name} ${stars}${c.notes ? ` — "${c.notes}"` : ''}${c.location ? ` at ${c.location}` : ''}\n\nLogged on The Modern Cask 🥃\nhttps://modern-cask.netlify.app`
    if (navigator.share) navigator.share({ text }).catch(() => {})
    else { navigator.clipboard?.writeText(text); toast('Copied to clipboard') }
  }

  const sorted = [...checkins].sort((a, b) => new Date(b.date) - new Date(a.date))
  const grouped = groupByDate(sorted)

  return (
    <div style={{ paddingTop: 56, paddingBottom: 80 }}>
      <div style={{ padding: '24px 18px 8px' }}>
        <p style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '.2em', color: '#7a7060', marginBottom: 4 }}>Your Tasting Log</p>
        <h2 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 42, fontWeight: 800, letterSpacing: '-.02em', lineHeight: 1, color: '#e8e4dc' }}>Journal.</h2>
      </div>

      <div style={{ padding: '8px 16px' }}>
        {/* Counter */}
        <div style={{ background: '#1a1917', borderRadius: 12, padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <p style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '.1em', color: '#7a7060' }}>Total drams logged</p>
            <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 36, fontWeight: 800, color: '#ffbf00', lineHeight: 1, marginTop: 2 }}>{checkins.length}</p>
          </div>
          <span className="ms" style={{ fontSize: 32, color: '#3d3a35' }}>menu_book</span>
        </div>

        {grouped.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <span className="ms" style={{ fontSize: 44, color: '#3d3a35', display: 'block', marginBottom: 10 }}>menu_book</span>
            <p style={{ color: '#7a7060', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.1em' }}>Journal is empty</p>
            <p style={{ color: '#504840', fontSize: 10, marginTop: 4 }}>Check in a dram to get started</p>
          </div>
        ) : (
          grouped.map(([date, items]) => (
            <div key={date} style={{ marginBottom: 24 }}>
              {/* Date header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#7a7060', textTransform: 'uppercase', letterSpacing: '.08em', whiteSpace: 'nowrap' }}>{date}</span>
                <div style={{ flex: 1, height: '0.5px', background: 'rgba(80,72,64,.3)' }} />
              </div>

              {/* Entries for this date */}
              <div style={{ display: 'grid', gap: 8 }}>
                {items.map(c => (
                  <div key={c.id} style={{ background: '#1a1917', borderRadius: 12, padding: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                      <div style={{ flex: 1, minWidth: 0, paddingRight: 8 }}>
                        <p
                          onClick={() => c.whisky_id && onSelect({ id: c.whisky_id, name: c.whisky_name, slug: c.whisky_id })}
                          style={{ fontSize: 14, fontWeight: 600, color: '#e8e4dc', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', cursor: 'pointer' }}
                        >
                          {c.whisky_name}
                        </p>
                        <p style={{ fontSize: 11, color: '#7a7060', marginTop: 2 }}>
                          {new Date(c.date).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                          {c.location ? ` · 📍 ${c.location}` : ''}
                          {c.whisky_region ? ` · ${c.whisky_region}` : ''}
                        </p>
                      </div>
                      {c.rating && <Stars rating={c.rating} size={12} />}
                    </div>

                    {c.nose && (
                      <p style={{ fontSize: 12, color: '#7a7060', marginBottom: 3 }}>
                        <span style={{ color: '#ffbf00', fontWeight: 600, fontSize: 10, textTransform: 'uppercase', letterSpacing: '.06em' }}>Nose </span>
                        {c.nose}
                      </p>
                    )}
                    {c.notes && (
                      <p style={{ fontSize: 12, color: '#7a7060', fontStyle: 'italic' }}>"{c.notes}"</p>
                    )}

                    <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                      <SmallBtn icon="ios_share" onClick={() => share(c)}>Share</SmallBtn>
                      <SmallBtn icon="delete" onClick={async () => { await removeCheckin(c.id); toast('Entry deleted') }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
