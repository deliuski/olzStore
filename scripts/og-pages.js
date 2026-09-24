// Build-ийн дараа бараа бүрд dist/p/<slug>/index.html үүсгэнэ.
// Ингэснээр Facebook/Messenger дээр линк хуваалцахад барааны зураг, нэр, үнэ preview-д гарна.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { products } from '../src/data/products.js'
import { site } from '../src/data/site.js'

const envFile = existsSync('.env') ? readFileSync('.env', 'utf8') : ''
const fromEnvFile = envFile.match(/^VITE_SITE_URL=(.*)$/m)?.[1]?.trim()
const siteUrl = (process.env.VITE_SITE_URL || fromEnvFile ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : '')
).replace(/\/$/, '')

// Firestore-оос (/admin-аас нэмсэн) бараануудыг REST-ээр татна. Алдаа гарвал алгасна.
const projectId = process.env.VITE_FIREBASE_PROJECT_ID ||
  envFile.match(/^VITE_FIREBASE_PROJECT_ID=(.*)$/m)?.[1]?.trim() || 'olzstore'
const decode = (v) => {
  if (!v) return undefined
  if ('stringValue' in v) return v.stringValue
  if ('integerValue' in v) return Number(v.integerValue)
  if ('doubleValue' in v) return v.doubleValue
  if ('booleanValue' in v) return v.booleanValue
  if ('arrayValue' in v) return (v.arrayValue.values || []).map(decode)
  if ('mapValue' in v) return Object.fromEntries(Object.entries(v.mapValue.fields || {}).map(([k, x]) => [k, decode(x)]))
  return undefined
}
async function fetchDbProducts() {
  try {
    const res = await fetch(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/products?pageSize=300`)
    if (!res.ok) throw new Error(res.status)
    const { documents = [] } = await res.json()
    return documents
      .map((d) => ({ slug: d.name.split('/').pop(), ...decode({ mapValue: d }) }))
      .filter((p) => p.active !== false && p.images?.[0]?.src && !products.some((x) => x.slug === p.slug))
  } catch (e) {
    console.warn('og: Firestore бараа татаж чадсангүй —', e.message)
    return []
  }
}

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
const base = readFileSync('dist/index.html', 'utf8')

for (const p of [...products, ...(await fetchDbProducts())]) {
  const title = p.seo?.title || p.name
  const desc = p.seo?.description || p.tagline
  const url = `${siteUrl}/p/${p.slug}`
  const src = p.images[0].src
  const image = /^https?:/.test(src) ? src : siteUrl + src
  const og = `
    <title>${esc(title)} — ${esc(site.brand)}</title>
    <meta name="description" content="${esc(desc)}" />
    <meta property="og:title" content="${esc(title)}" />
    <meta property="og:description" content="${esc(desc)}" />
    <meta property="og:type" content="product" />
    <meta property="og:url" content="${esc(url)}" />
    <meta property="og:image" content="${esc(image)}" />
    <meta property="og:locale" content="mn_MN" />
    <meta name="twitter:card" content="summary_large_image" />
    `
  const html = base.replace(/<!--OG:START-->[\s\S]*<!--OG:END-->/, og)
  mkdirSync(`dist/p/${p.slug}`, { recursive: true })
  writeFileSync(`dist/p/${p.slug}/index.html`, html)
  console.log('og page →', `/p/${p.slug}`, siteUrl ? '' : '(VITE_SITE_URL хоосон: og:image харьцангуй зам)')
}
