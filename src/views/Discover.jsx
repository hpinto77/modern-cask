import { useState, useEffect, useCallback } from 'react'
import { fetchWhiskies, searchWhiskies } from '../lib/api'
import { WhiskyRow, Skeleton } from '../components/UI'
import { useCheckins } from '../hooks/useCheckins'

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'scotland', label: 'Scotland' },
  { id: 'japan', label: 'Japan' },
  { id: 'peated', label: 'Peated' },
  { id: 'sherry', label: 'Sherry' },
  { id: 'cask-strength', label: 'Cask Str.' },
]

export default function Discover({ onSelect }) {
  const { getCheckin } = useCheckins()
  const [whiskies, setWhiskies] = useState([])
  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(false)
  const [live, setLive] = useState(false)
  const [filter, setFilter] = useState('all')
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(2)
  const [total, setTotal] = useState(0)
  const [loadingMore, setLoadingMore] = useState(false)
  const [searchDebounce, setSearchDebounce] = useState(null)

  useEffect(() => {
    fetchWhiskies(1, 30).then(({ items, total, live }) => {
      setWhiskies(items)
      setTotal(total)
      setLive(live)
      setLoading(false)
    })
  }, [])

  const runSearch = useCallback(async (q, f) => {
    if (!q.trim() && f === 'all') {
      // Reset to paginated view
      setLoading(true)
      fetchWhiskies(1, 30).then(({ items, total, live }) => {
        setWhiskies(items)
        setTotal(total)
        setLive(live)
        setPage(2)
        setLoading(false)
      })
      return
    }
    setSearching(true)
    const { items } = await searchWhiskies(q, f)
    setWhiskies(items)
    setTotal(items.length)
    setSearching(false)
  }, [])

  const handleQueryChange = (q) => {
    setQuery(q)
    if (searchDebounce) clearTimeout(searchDebounce)
    setSearchDebounce(setTimeout(() => runSearch(q, filter), 350))
  }

  const handleFilterChange = (f) => {
    setFilter(f)
    runSearch(query, f)
  }

  const loadMore = async () => {
    if (loadingMore || query.trim() || filter !== 'all') return
    setLoadingMore(true)
    const { items } = await fetchWhiskies(page, 30)
    if (items?.length) {
      setWhiskies(prev => [...prev, ...items])
      setPage(p => p + 1)
    }
    setLoadingMore(false)
  }

  const hasMore = !query.trim() && filter === 'all' && whiskies.length < total

  return (
    <div style={{ paddingTop: 56, paddingBottom: 80 }}>
      <div style={{ padding: '24px 18px 12px' }}>
        <p style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '.2em', color: '#7a7060', marginBottom: 4 }}>Single Malt Discovery</p>
        <h2 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 42, fontWeight: 800, letterSpacing: '-.02em', lineHeight: 1, color: '#e8e4dc' }}>Discover.</h2>
      </div>

      <div style={{ padding: '0 16px 12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#1a1917', border: '1px solid rgba(80,72,64,.35)', borderRadius: 12, padding: '9px 13px' }}>
          <span className="ms" style={{ color: '#504840', fontSize: 16 }}>search</span>
          <input
            type="text"
            placeholder="Search all 389 whiskies…"
            value={query}
            onChange={e => handleQueryChange(e.target.value)}
            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#e8e4dc', fontSize: 14, fontFamily: 'DM Sans, sans-serif' }}
          />
          {(searching) && <span className="ms" style={{ fontSize: 16, color: '#504840', animation: 'spin 1s linear infinite' }}>progress_activity</span>}
          {query && !searching && (
            <button onClick={() => handleQueryChange('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#504840', display: 'flex' }}>
              <span className="ms" style={{ fontSize: 16 }}>close</span>
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 7, padding: '0 16px 14px', overflowX: 'auto', scrollbarWidth: 'none' }}>
        {FILTERS.map(f => (
          <button key={f.id} onClick={() => handleFilterChange(f.id)} style={{ display: 'inline-flex', alignItems: 'center', padding: '6px 14px', borderRadius: 99, border: `1px solid ${filter === f.id ? 'rgba(255,191,0,.4)' : 'rgba(80,72,64,.4)'}`, background: filter === f.id ? 'rgba(255,191,0,.1)' : 'transparent', color: filter === f.id ? '#ffe2ab' : '#7a7060', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', cursor: 'pointer', whiteSpace: 'nowrap' }}>
            {f.label}
          </button>
        ))}
      </div>

      {!loading && !live && (
        <div style={{ margin: '0 16px 10px', padding: '6px 12px', borderRadius: 8, fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', background: 'rgba(80,72,64,.1)', border: '1px solid rgba(80,72,64,.2)', color: '#504840' }}>
          Showing curated selection
        </div>
      )}

      <div style={{ padding: '0 10px' }}>
        {loading || searching ? (
          [0,1,2,3,4].map(i => <Skeleton key={i} height={72} delay={i * 0.1} />)
        ) : whiskies.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0' }}>
            <span className="ms" style={{ fontSize: 44, color: '#3d3a35', display: 'block', marginBottom: 10 }}>search_off</span>
            <p style={{ color: '#7a7060', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.1em' }}>No results found</p>
          </div>
        ) : (
          whiskies.map((w, i) => (
            <div key={w.id || w.slug}>
              {i > 0 && <div style={{ borderTop: '.5px solid rgba(80,72,64,.2)', margin: '0 8px' }} />}
              <WhiskyRow whisky={w} isCheckedIn={!!getCheckin(w.id || w.slug)} onClick={() => onSelect(w)} />
            </div>
          ))
        )}
      </div>

      {hasMore && !loading && (
        <div style={{ padding: '12px 16px' }}>
          <button onClick={loadMore} disabled={loadingMore} style={{ width: '100%', padding: 12, border: '1px solid rgba(80,72,64,.4)', borderRadius: 12, background: 'transparent', color: '#7a7060', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', cursor: 'pointer' }}>
            {loadingMore ? 'Loading…' : `Load More (${total - whiskies.length} remaining)`}
          </button>
        </div>
      )}
    </div>
  )
}
