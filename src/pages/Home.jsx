import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { products } from '../data/products.js'
import { fmt, site } from '../data/site.js'
import { track } from '../lib/track.js'
import { Header, Footer, Icon } from '../components/Layout.jsx'

export default function Home() {
  useEffect(() => {
    document.title = `${site.brand} — ${site.tagline}`
    track('view', { slug: 'home' })
  }, [])

  return (
    <>
      <Header />
      <main className="wrap">
        <section className="home-hero">
          <h1>{site.tagline}</h1>
          <p className="lede">Цөөн, гэхдээ шалгарсан бараа. Улаанбаатарт өдөртөө хүргэнэ, QPay эсвэл хүргэлтээр төлнө.</p>
        </section>
        <section className="grid">
          {products.map((p) => (
            <Link key={p.slug} to={`/p/${p.slug}`} className="card">
              <div className="card-img"><img src={p.images[0].src} alt={p.images[0].alt} /></div>
              <div className="card-body">
                <div className="eyebrow">{p.category}</div>
                <h2>{p.name}</h2>
                <div className="card-foot">
                  <span className="price">{fmt(p.price)}</span>
                  {p.deal && <span className="chip">{p.deal.minQty}+ авбал −{p.deal.percent}%</span>}
                  <Icon name="arrow" className="card-arrow" />
                </div>
              </div>
            </Link>
          ))}
        </section>
      </main>
      <Footer />
    </>
  )
}
