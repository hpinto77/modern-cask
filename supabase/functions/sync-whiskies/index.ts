import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const API_BASE = 'https://thewhiskyedition.com/api/whisky-reviews'
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

Deno.serve(async (req) => {
  // Allow manual trigger via POST
  const auth = req.headers.get('Authorization')
  if (req.method !== 'POST' && !auth) {
    return new Response('Method not allowed', { status: 405 })
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
  let totalSynced = 0
  let page = 1
  const perPage = 50

  try {
    while (true) {
      const url = `${API_BASE}?type=Single+Malt&lang=en&page=${page}&per_page=${perPage}`
      const res = await fetch(url)
      if (!res.ok) throw new Error(`API error: ${res.status}`)
      const data = await res.json()
      if (!data.items?.length) break

      const rows = data.items.map((w: any) => ({
        id: String(w.id),
        slug: w.slug,
        name: w.name,
        description: w.description || null,
        metadata: w.metadata || null,
        rating: w.rating || null,
        tasting_notes: w.tasting_notes || null,
        image: w.image || null,
        synced_at: new Date().toISOString(),
      }))

      const { error } = await supabase
        .from('whiskies')
        .upsert(rows, { onConflict: 'id' })

      if (error) throw error

      totalSynced += rows.length
      console.log(`Synced page ${page} — ${totalSynced} total`)

      if (data.items.length < perPage) break
      page++

      // Small delay to be respectful to the API
      await new Promise(r => setTimeout(r, 300))
    }

    return new Response(JSON.stringify({ success: true, synced: totalSynced }), {
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (err) {
    console.error('Sync error:', err)
    return new Response(JSON.stringify({ success: false, error: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})
