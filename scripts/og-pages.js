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

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
const base = readFileSync('dist/index.html', 'utf8')

for (const p of products) {
  const title = p.seo?.title || p.name
  const desc = p.seo?.description || p.tagline
  const url = `${siteUrl}/p/${p.slug}`
  const image = siteUrl + p.images[0].src
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
