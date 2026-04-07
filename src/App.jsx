import { useState } from 'react'
import { AuthProvider, useAuth } from './hooks/useAuth'
import { Toast } from './components/UI'
import { AddWhiskyModal } from './components/AddWhiskyModal'
import { LOGO_URL } from './lib/assets'
import Discover from './views/Discover'
import Journal from './views/Journal'
import Cellar from './views/Cellar'
import Detail from './views/Detail'
import Profile from './views/Profile'

const NAV = [
  { id: 'discover', label: 'Discover', icon: 'explore' },
  { id: 'cellar',   label: 'Cellar',   icon: 'liquor' },
  { id: 'journal',  label: 'Journal',  icon: 'menu_book' },
  { id: 'profile',  label: 'Profile',  icon: 'person' },
]

function AppInner() {
  const { initials, user } = useAuth()
  const [view, setView] = useState('discover')
  const [selected, setSelected] = useState(null)
  const [history, setHistory] = useState(['discover'])
  const [addOpen, setAddOpen] = useState(false)

  const navigate = (v) => {
    setView(v)
    setHistory(prev => [...prev, v])
  }

  const handleSelect = (whisky) => {
    setSelected(whisky)
    setHistory(prev => [...prev, 'detail'])
    setView('detail')
  }

  const handleBack = () => {
    const prev = history.slice(0, -1)
    setHistory(prev.length ? prev : ['discover'])
    setView(prev[prev.length - 1] || 'discover')
    setSelected(null)
  }

  return (
    <div style={{ minHeight: '100dvh', background: '#0f0e0d', color: '#e8e4dc', fontFamily: 'DM Sans, sans-serif', overflowX: 'hidden' }}>

      <header style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 56, background: 'rgba(15,14,13,.92)', backdropFilter: 'blur(20px)', borderBottom: '.5px solid rgba(80,72,64,.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 18px', zIndex: 400 }}>
        <img src={LOGO_URL} alt="The Modern Cask" style={{ height: 28, width: 'auto' }} onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='block' }} /><h1 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.22em', color: '#ffe2ab', display: 'none' }}>The Modern Cask</h1>
        <button onClick={() => navigate('profile')} style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg,#ffe2ab,#ffbf00)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', color: '#2a1a00', fontSize: user ? 10 : undefined, fontWeight: 800, fontFamily: 'Manrope, sans-serif' }}>
          {user ? initials : <span className="ms" style={{ fontSize: 16, color: '#2a1a00' }}>person</span>}
        </button>
      </header>

      {view === 'discover' && <Discover onSelect={handleSelect} />}
      {view === 'cellar'   && <Cellar   onSelect={handleSelect} />}
      {view === 'journal'  && <Journal  onSelect={handleSelect} />}
      {view === 'detail'   && selected && <Detail whisky={selected} onBack={handleBack} />}
      {view === 'profile'  && <Profile />}

      <AddWhiskyModal open={addOpen} onClose={() => setAddOpen(false)} onSubmit={() => {}} />

      {view !== 'detail' && (
        <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, height: 68, background: 'rgba(26,25,23,.96)', backdropFilter: 'blur(20px)', borderTop: '.5px solid rgba(80,72,64,.3)', display: 'flex', justifyContent: 'space-around', alignItems: 'center', zIndex: 300, paddingBottom: 'env(safe-area-inset-bottom)' }}>
          {NAV.map(n => {
            const active = view === n.id
            return (
              <button key={n.id} onClick={() => { navigate(n.id); setSelected(null) }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, padding: '6px 12px', borderRadius: 12, color: active ? '#ffe2ab' : '#504840', transition: 'color .15s', cursor: 'pointer', border: 'none', background: 'none' }}>
                <span className="ms" style={{ fontSize: 22, fontVariationSettings: `'FILL' ${active ? 1 : 0}` }}>{n.icon}</span>
                <span style={{ fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em' }}>{n.label}</span>
              </button>
            )
          })}
          <button onClick={() => setAddOpen(true)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, padding: '6px 12px', borderRadius: 12, color: '#ffe2ab', cursor: 'pointer', border: 'none', background: 'none' }}>
            <span className="ms" style={{ fontSize: 26 }}>add_circle</span>
            <span style={{ fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em' }}>Add</span>
          </button>
        </nav>
      )}

      <Toast />
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  )
}
