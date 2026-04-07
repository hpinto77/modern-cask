import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://nluezhsmgwuqdryarrmd.supabase.co'
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5sdWV6aHNtZ3d1cWRyeWFycm1kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0MDMyODMsImV4cCI6MjA5MDk3OTI4M30.61Gt5y8k46nIBjtlpyu3n2B4RVcHpPYI1WBRoqnTOYM'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON, {
  auth: { autoRefreshToken: true, persistSession: true, detectSessionInUrl: true }
})

const API_IMG_BASE = 'https://thewhiskyedition.com'
export function imgURL(whisky) {
  const url = whisky?.image?.url
  if (!url) return null
  return url.startsWith('http') ? url : API_IMG_BASE + url
}

export function avgRating(whisky) {
  const m = whisky?.rating?.marcel
  const s = whisky?.rating?.sascha
  if (m && s) return ((m + s) / 2).toFixed(1)
  if (m) return m.toFixed(1)
  return null
}

export function regionStyle(region = '') {
  const key = region.toLowerCase()
  const map = {
    islay:       { bg: 'rgba(74,122,138,.18)',  text: '#7ab4cc' },
    speyside:    { bg: 'rgba(100,140,80,.18)',  text: '#90c070' },
    highland:    { bg: 'rgba(160,120,70,.18)',  text: '#c49a50' },
    lowland:     { bg: 'rgba(120,150,100,.18)', text: '#a0c480' },
    campbeltown: { bg: 'rgba(150,90,70,.18)',   text: '#c07860' },
    islands:     { bg: 'rgba(80,120,160,.18)',  text: '#70a8d8' },
    japan:       { bg: 'rgba(190,100,100,.18)', text: '#e08080' },
    ireland:     { bg: 'rgba(60,160,80,.18)',   text: '#60c870' },
    taiwan:      { bg: 'rgba(60,100,180,.18)',  text: '#6090e0' },
    india:       { bg: 'rgba(220,140,40,.18)',  text: '#e8b040' },
    australia:   { bg: 'rgba(180,100,40,.18)',  text: '#d87830' },
  }
  const match = Object.entries(map).find(([k]) => key.includes(k))
  return match ? match[1] : { bg: 'rgba(120,110,100,.18)', text: '#a09080' }
}
