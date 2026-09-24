import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useProducts } from '../lib/products.js'
import { useAdmin } from '../lib/auth.js'
import { cld } from '../lib/cloudinary.js'
import { fmt, site } from '../data/site.js'
import { track } from '../lib/track.js'
import { Header, Footer, Icon } from '../components/Layout.jsx'

// Бүх барааны жагсаалтыг зөвхөн админ харна. Бусад хүн барааны линкээр (/p/...) л орно.
export default function Home() {
  const { isAdmin } = useAdmin()

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
          {isAdmin && <Link to="/admin" className="cta cta-inline">Админ хэсэг</Link>}
        </section>
        {isAdmin && <ProductGrid />}
      </main>
      <Footer />
    </>
  )
}

function ProductGrid() {
  const products = useProducts()
  return (
    <section className="grid">
      {products.map((p) => (
        <Link key={p.slug} to={`/p/${p.slug}`} className="card">
          <div className="card-img"><img src={cld(p.images[0].src, 'f_auto,q_auto,w_700')} alt={p.images[0].alt} loading="lazy" /></div>
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
  )
}
