const API_BASE = 'https://thewhiskyedition.com/api/whisky-reviews'

export const FALLBACK = [
  {id:1,slug:'lagavulin-16',name:'Lagavulin 16 Year Old',description:'Crown jewel of Islay — a masterclass in balanced peat.',metadata:{distillery:'Lagavulin',region:'Islay',country:'Scotland',abv:43,age:16,flavour:'Peated'},rating:{marcel:94,sascha:92},tasting_notes:{nose:'Intense peat smoke, iodine, seaweed.',palate:'Full-bodied with dried fruit and coffee.',finish:'Very long, smoky, warming.'}},
  {id:2,slug:'macallan-12-sherry',name:'Macallan 12 Sherry Oak',description:'The quintessential sherry-matured Scotch.',metadata:{distillery:'The Macallan',region:'Speyside',country:'Scotland',abv:40,age:12,flavour:'Sherry'},rating:{marcel:91,sascha:90},tasting_notes:{nose:'Christmas spice, dried fruit, raisin.',palate:'Rich dried fruit, toffee, warming oak.',finish:'Long, spicy with sherry sweetness.'}},
  {id:3,slug:'ardbeg-10',name:'Ardbeg 10 Year Old',description:'Non-chill filtered at 46% — exceptional depth.',metadata:{distillery:'Ardbeg',region:'Islay',country:'Scotland',abv:46,age:10,flavour:'Peated'},rating:{marcel:93,sascha:94},tasting_notes:{nose:'Smoke, dark chocolate, lemon, espresso.',palate:'Intense peat, citrus, coffee, vanilla.',finish:'Long, smoky, dry and spiced.'}},
  {id:4,slug:'yamazaki-12',name:'Yamazaki 12 Year Old',description:'Pioneering single malt from Suntory.',metadata:{distillery:'Yamazaki',region:'Japan',country:'Japan',abv:43,age:12,flavour:'Fruity'},rating:{marcel:95,sascha:94},tasting_notes:{nose:'Peach, pineapple, Mizunara oak.',palate:'Honey, red berries, coconut and spice.',finish:'Long and elegant, ginger and jasmine.'}},
  {id:5,slug:'springbank-10',name:'Springbank 10 Year Old',description:'Campbeltown pride — wholly independent.',metadata:{distillery:'Springbank',region:'Campbeltown',country:'Scotland',abv:46,age:10,flavour:'Maritime'},rating:{marcel:92,sascha:91},tasting_notes:{nose:'Brine, pear drops, light smoke.',palate:'Oily — maritime salt, vanilla, peat.',finish:'Long — salty and sweet.'}},
  {id:6,slug:'highland-park-12',name:'Highland Park 12 Year Old',description:'Scotland\'s northernmost distillery.',metadata:{distillery:'Highland Park',region:'Islands',country:'Scotland',abv:40,age:12,flavour:'Peated'},rating:{marcel:88,sascha:87},tasting_notes:{nose:'Heather honey, smoke, dried fruit.',palate:'Smoky, sweet, malty.',finish:'Smooth, gently peated.'}},
  {id:7,slug:'glenmorangie-10',name:'Glenmorangie Original 10',description:'Distilled in Scotland\'s tallest stills.',metadata:{distillery:'Glenmorangie',region:'Highland',country:'Scotland',abv:40,age:10,flavour:'Floral'},rating:{marcel:85,sascha:86},tasting_notes:{nose:'Citrus, floral, vanilla, peach.',palate:'Smooth and peachy with vanilla cream.',finish:'Clean, floral and refreshing.'}},
  {id:8,slug:'laphroaig-10',name:'Laphroaig 10 Year Old',description:'The most distinctive whisky in the world.',metadata:{distillery:'Laphroaig',region:'Islay',country:'Scotland',abv:40,age:10,flavour:'Peated'},rating:{marcel:88,sascha:89},tasting_notes:{nose:'Medicinal, seaweed, bonfire smoke.',palate:'Full, peaty, maritime.',finish:'Long, dry and smoky.'}},
  {id:9,slug:'balvenie-14-caribbean',name:'Balvenie 14 Caribbean Cask',description:'Rum cask finished Speyside.',metadata:{distillery:'The Balvenie',region:'Speyside',country:'Scotland',abv:43,age:14,flavour:'Fruity'},rating:{marcel:89,sascha:88},tasting_notes:{nose:'Vanilla, toffee, tropical fruit.',palate:'Creamy — coconut, mango, oak.',finish:'Smooth with rum sweetness.'}},
  {id:10,slug:'glenfiddich-15',name:'Glenfiddich 15 Solera',description:'The solera system at work.',metadata:{distillery:'Glenfiddich',region:'Speyside',country:'Scotland',abv:40,age:15,flavour:'Fruity'},rating:{marcel:87,sascha:88},tasting_notes:{nose:'Honey, citrus, apple blossom.',palate:'Creamy malt, tropical fruit.',finish:'Smooth with lingering fruit.'}},
  {id:11,slug:'bowmore-12',name:'Bowmore 12 Year Old',description:'One of Islay\'s oldest distilleries.',metadata:{distillery:'Bowmore',region:'Islay',country:'Scotland',abv:40,age:12,flavour:'Peated'},rating:{marcel:86,sascha:85},tasting_notes:{nose:'Lemon, honey, light peat.',palate:'Balanced smoke and citrus.',finish:'Warm, subtle smoke.'}},
  {id:12,slug:'nikka-yoichi',name:'Nikka Yoichi Single Malt',description:'Scottish-style on Hokkaido\'s north coast.',metadata:{distillery:'Yoichi',region:'Japan',country:'Japan',abv:45,flavour:'Peated'},rating:{marcel:91,sascha:92},tasting_notes:{nose:'Coal smoke, peat, apple.',palate:'Dried fruit, peat and brine.',finish:'Dry, smoky and warming.'}},
]

async function apiFetch(params = {}) {
  const p = new URLSearchParams({ type: 'Single Malt', lang: 'en', ...params })
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const r = await fetch(`${API_BASE}?${p}`, { signal: AbortSignal.timeout(14000), mode: 'cors' })
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      const d = await r.json()
      if (d?.ok === false) return null
      return d
    } catch (e) {
      console.warn(`API attempt ${attempt + 1}:`, e.message)
      if (attempt === 0) await new Promise(res => setTimeout(res, 1200))
    }
  }
  return null
}

export async function fetchWhiskies(page = 1, perPage = 30) {
  const d = await apiFetch({ page, per_page: perPage })
  if (d?.items?.length) return { items: d.items, total: d.total, live: true }
  return { items: FALLBACK, total: FALLBACK.length, live: false }
}

export async function fetchWhisky(slug) {
  try {
    const r = await fetch(`${API_BASE}/${slug}`, { signal: AbortSignal.timeout(8000) })
    if (!r.ok) throw new Error('not found')
    return await r.json()
  } catch {
    return FALLBACK.find(w => w.slug === slug || String(w.id) === String(slug)) || null
  }
}
