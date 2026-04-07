import { useCheckins } from '../hooks/useCheckins'
import { Stars, BottleSVG } from '../components/UI'
import { useToast } from '../components/UI'

function SmallBtn({ icon, onClick, children }) {
  return (
    <button onClick={onClick} style={{ background: 'none', border: '1px solid rgba(80,72,64,.3)', borderRadius: 8, padding: '4px 10px', fontSize: 10, color: '#7a7060', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', display: 'flex', alignItems: 'center', gap: 3 }}>
      <span className="ms" style={{ fontSize: 11 }}>{icon}</span>{children}
    </button>
  )
}

export default function Journal({ onSelect }) {
  const { checkins, removeCheckin } = useCheckins()
  const toast = useToast()

  const share = (c) => {
    const stars = '★'.repeat(c.rating || 0) + '☆'.repeat(5 - (c.rating || 0))
    const text = `Just had ${c.whisky_name} ${stars}${c.notes ? ` — "${c.notes}"` : ''}\n\nLogged on The Modern Cask 🥃\nhttps://modern-cask.netlify.app`
    if (navigator.share) navigator.share({ text }).catch(() => {})
    else { navigator.clipboard?.writeText(text); toast('Copied to clipboard') }
  }

  const sorted = [...checkins].sort((a, b) => new Date(b.date) - new Date(a.date))

  return (
    <div style={{ paddingTop: 56, paddingBottom: 80 }}>
      <div style={{ padding: '24px 18px 8px' }}>
        <p style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '.2em', color: '#7a7060', marginBottom: 4 }}>Your Tasting Log</p>
        <h2 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 42, fontWeight: 800, letterSpacing: '-.02em', lineHeight: 1, color: '#e8e4dc' }}>Journal.</h2>
      </div>

      <div style={{ padding: '12px 16px' }}>
        <div style={{ background: '#1a1917', borderRadius: 12, padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <p style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '.1em', color: '#7a7060' }}>Total drams</p>
            <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 40, fontWeight: 800, color: '#ffbf00', lineHeight: 1, marginTop: 2 }}>{checkins.length}</p>
          </div>
          <span className="ms" style={{ fontSize: 32, color: '#3d3a35' }}>liquor</span>
        </div>

        {sorted.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <span className="ms" style={{ fontSize: 44, color: '#3d3a35', display: 'block', marginBottom: 10 }}>menu_book</span>
            <p style={{ color: '#7a7060', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.1em' }}>Journal is empty</p>
            <p style={{ color: '#504840', fontSize: 10, marginTop: 4 }}>Check in a dram to get started</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 8 }}>
            {sorted.map(c => (
              <div key={c.id} style={{ background: '#1a1917', borderRadius: 12, padding: 14, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <div style={{ flexShrink: 0, marginTop: 2 }}>
                  <BottleSVG region="" width={22} height={38} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: '#e8e4dc', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 200 }}>{c.whisky_name}</p>
                    {c.rating && <Stars rating={c.rating} size={11} />}
                  </div>
                  <p style={{ fontSize: 11, color: '#7a7060', marginTop: 2 }}>
                    {new Date(c.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    {c.location ? ` · 📍 ${c.location}` : ''}
                  </p>
                  {c.notes && <p style={{ fontSize: 12, color: '#504840', marginTop: 4, fontStyle: 'italic', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>"{c.notes}"</p>}
                  <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                    <SmallBtn icon="ios_share" onClick={() => share(c)}>Share</SmallBtn>
                    {c.whisky_id && <SmallBtn icon="open_in_new" onClick={() => onSelect({ id: c.whisky_id, name: c.whisky_name, slug: c.whisky_id })}>View</SmallBtn>}
                    <SmallBtn icon="delete" onClick={async () => { await removeCheckin(c.id); toast('Entry deleted') }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
