import { supabase } from './supabase'

const API_BASE = 'https://thewhiskyedition.com/api/whisky-reviews'

export const FALLBACK = [
  {id:1,slug:'lagavulin-16',name:'Lagavulin 16 Year Old',description:'Crown jewel of Islay.',metadata:{distillery:'Lagavulin',region:'Islay',country:'Scotland',abv:43,age:16,flavour:'Peated'},rating:{marcel:94,sascha:92},tasting_notes:{nose:'Intense peat smoke, iodine.',palate:'Full-bodied with dried fruit.',finish:'Very long and smoky.'}},
  {id:2,slug:'macallan-12-sherry',name:'Macallan 12 Sherry Oak',description:'Quintessential sherry-matured Scotch.',metadata:{distillery:'The Macallan',region:'Speyside',country:'Scotland',abv:40,age:12,flavour:'Sherry'},rating:{marcel:91,sascha:90},tasting_notes:{nose:'Christmas spice, dried fruit.',palate:'Rich dried fruit, toffee.',finish:'Long and spicy.'}},
  {id:3,slug:'ardbeg-10',name:'Ardbeg 10 Year Old',description:'Non-chill filtered at 46%.',metadata:{distillery:'Ardbeg',region:'Islay',country:'Scotland',abv:46,age:10,flavour:'Peated'},rating:{marcel:93,sascha:94},tasting_notes:{nose:'Smoke, chocolate, lemon.',palate:'Intense peat and citrus.',finish:'Long and smoky.'}},
  {id:4,slug:'yamazaki-12',name:'Yamazaki 12 Year Old',description:'Pioneering single malt from Suntory.',metadata:{distillery:'Yamazaki',region:'Japan',country:'Japan',abv:43,age:12,flavour:'Fruity'},rating:{marcel:95,sascha:94},tasting_notes:{nose:'Peach, pineapple, Mizunara.',palate:'Honey, red berries, coconut.',finish:'Long and elegant.'}},
  {id:5,slug:'springbank-10',name:'Springbank 10 Year Old',description:'Campbeltown pride.',metadata:{distillery:'Springbank',region:'Campbeltown',country:'Scotland',abv:46,age:10,flavour:'Maritime'},rating:{marcel:92,sascha:91},tasting_notes:{nose:'Brine, pear drops, smoke.',palate:'Oily, maritime salt, vanilla.',finish:'Long, salty and sweet.'}},
]

export async function fetchWhiskies(page = 1, perPage = 30) {
  const from = (page - 1) * perPage
  const to = from + perPage - 1
  const { data, error, count } = await supabase
    .from('whiskies')
    .select('*', { count: 'exact' })
    .range(from, to)
    .order('name')

  if (!error && data?.length) {
    return { items: data, total: count || data.length, live: true, source: 'supabase' }
  }

  return { items: FALLBACK, total: FALLBACK.length, live: false, source: 'fallback' }
}

export async function searchWhiskies(query, filter = 'all') {
  let q = supabase.from('whiskies').select('*').order('name').limit(50)

  if (query && query.trim()) {
    q = q.or(`name.ilike.%${query}%,metadata->>distillery.ilike.%${query}%,metadata->>region.ilike.%${query}%,metadata->>flavour.ilike.%${query}%`)
  }

  if (filter === 'scotland') q = q.eq('metadata->>country', 'Scotland')
  else if (filter === 'japan') q = q.eq('metadata->>country', 'Japan')
  else if (filter === 'peated') q = q.ilike('metadata->>flavour', '%peat%')
  else if (filter === 'sherry') q = q.ilike('metadata->>flavour', '%sherry%')
  else if (filter === 'cask-strength') q = q.gte('metadata->>abv', '55')

  const { data, error } = await q
  if (!error && data?.length) return { items: data, live: true }

  // Fallback local filter
  return { items: FALLBACK.filter(w => {
    const m = w.metadata || {}
    return !query || [w.name, m.distillery, m.region, m.flavour].some(v => v?.toLowerCase().includes(query.toLowerCase()))
  }), live: false }
}

export async function fetchWhisky(slugOrId) {
  const { data } = await supabase
    .from('whiskies')
    .select('*')
    .or(`slug.eq.${slugOrId},id.eq.${slugOrId}`)
    .single()

  if (data) return data

  try {
    const r = await fetch(`${API_BASE}/${slugOrId}`, { signal: AbortSignal.timeout(8000) })
    if (!r.ok) throw new Error('not found')
    return await r.json()
  } catch {
    return FALLBACK.find(w => w.slug === slugOrId || String(w.id) === String(slugOrId)) || null
  }
}
