import { readdir, readFile } from 'fs/promises'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const SUPABASE_URL = 'https://nluezhsmgwuqdryarrmd.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5sdWV6aHNtZ3d1cWRyeWFycm1kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0MDMyODMsImV4cCI6MjA5MDk3OTI4M30.61Gt5y8k46nIBjtlpyu3n2B4RVcHpPYI1WBRoqnTOYM'
const ASSETS_DIR = join(dirname(fileURLToPath(import.meta.url)), 'assets')
const H = { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }

async function ensureBucket(name) {
  const r = await fetch(`${SUPABASE_URL}/storage/v1/bucket`, {
    method: 'POST', headers: { ...H, 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: name, name, public: true }),
  })
  const j = await r.json()
  console.log(r.ok || j.error === 'Duplicate' ? `  ✓ bucket "${name}" ready` : `  ? bucket "${name}": ${JSON.stringify(j)}`)
}

async function upload(bucket, filename, data) {
  const r = await fetch(`${SUPABASE_URL}/storage/v1/object/${bucket}/${filename}`, {
    method: 'POST', headers: { ...H, 'Content-Type': 'image/png', 'x-upsert': 'true' }, body: data,
  })
  return r.ok
}

async function run() {
  await ensureBucket('stamps'); await ensureBucket('badges'); await ensureBucket('logo')
  const files = (await readdir(ASSETS_DIR)).filter(f => f.endsWith('.png'))
  console.log(`\nFound ${files.length} PNGs\n`)
  let ok = 0, fail = 0
  for (const fname of files.sort()) {
    const bucket = fname.startsWith('stamp_') ? 'stamps' : fname.startsWith('badge_') ? 'badges' : fname.startsWith('logo_') ? 'logo' : null
    if (!bucket) { console.log(`  — skip: ${fname}`); continue }
    const data = await readFile(join(ASSETS_DIR, fname))
    const success = await upload(bucket, fname, data)
    console.log(success ? `  ✓ ${bucket}/${fname}` : `  ✗ FAILED: ${fname}`)
    success ? ok++ : fail++
    await new Promise(r => setTimeout(r, 80))
  }
  console.log(`\nDone: ${ok} uploaded, ${fail} failed`)
}
run().catch(console.error)
