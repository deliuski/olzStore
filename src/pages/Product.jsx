import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getProduct } from '../data/products.js'
import { checkoutUrl, priceFor, fmt, site } from '../data/site.js'
import { track, trackThenGo } from '../lib/track.js'
import { Header, Footer, Icon } from '../components/Layout.jsx'
import NotFound from './NotFound.jsx'

export default function Product() {
  const { slug } = useParams()
  const product = getProduct(slug)
  const [qty, setQty] = useState(1)
  const [img, setImg] = useState(0)
  const [going, setGoing] = useState(false)
  const [showBar, setShowBar] = useState(false)
  const buyRef = useRef(null)

  useEffect(() => {
    if (!product) return
    document.title = `${product.name} — ${site.brand}`
    track('view', { slug: product.slug })
  }, [product])

  // Худалдан авах хайрцаг дэлгэцээс гарахад доод талын bar гарч ирнэ
  useEffect(() => {
    const el = buyRef.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setShowBar(!e.isIntersecting && e.boundingClientRect.top < 0))
    io.observe(el)
    return () => io.disconnect()
  }, [product])

  if (!product) return <NotFound />

  const p = priceFor(product, qty)
  const deal = product.deal
  const nextDeal = deal && qty < deal.minQty

  const order = () => {
    if (going) return
    setGoing(true)
    trackThenGo(checkoutUrl(product, qty), { slug: product.slug, qty, total: p.total })
  }

  return (
    <>
      <Header />
      <main className="wrap">
        <section className="hero">
          <div className="gallery">
            <div className="gallery-main">
              <img src={product.images[img].src} alt={product.images[img].alt} />
              {deal && (
                <span className="sticker">
                  <b>−{deal.percent}%</b>
                  <small>{deal.minQty}+ авбал</small>
                </span>
              )}
            </div>
            {product.images.length > 1 && (
              <div className="thumbs">
                {product.images.map((im, i) => (
                  <button key={im.src} className={i === img ? 'on' : ''} onClick={() => setImg(i)} aria-label={`Зураг ${i + 1}`}>
                    <img src={im.src} alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="buy" ref={buyRef}>
            <div className="eyebrow">{product.category}</div>
            <h1>{product.name}</h1>
            <p className="lede">{product.tagline}</p>

            <div className="badges">
              {product.badges.map((b) => <span key={b}><Icon name="check" />{b}</span>)}
            </div>

            <div className="price-row">
              <span className="price">{fmt(product.price)}</span>
              <span className="muted">/ ширхэг</span>
            </div>

            <div className="qty-row">
              <span className="label">Тоо ширхэг</span>
              <div className="stepper">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Хасах" disabled={qty <= 1}>−</button>
                <output aria-live="polite">{qty}</output>
                <button onClick={() => setQty((q) => Math.min(20, q + 1))} aria-label="Нэмэх">+</button>
              </div>
            </div>

            {deal && (
              <button className={`deal ${nextDeal ? '' : 'deal-on'}`} onClick={() => nextDeal && setQty(deal.minQty)}>
                <Icon name={nextDeal ? 'gift' : 'check'} />
                {nextDeal
                  ? <span>Дахиад <b>{deal.minQty - qty}</b> авбал ширхэг тутам <b>{deal.percent}%</b> хямдарна</span>
                  : <span><b>{fmt(p.deal)}</b> хэмнэлээ — {deal.percent}% хямдрал идэвхжсэн</span>}
              </button>
            )}

            <dl className="sum">
              <div><dt>Барааны үнэ</dt><dd>{fmt(p.subtotal)}</dd></div>
              {p.deal > 0 && <div className="save"><dt>Хямдрал</dt><dd>−{fmt(p.deal)}</dd></div>}
              <div><dt>Хүргэлт</dt><dd>{fmt(p.delivery)}</dd></div>
              <div className="tot"><dt>Нийт</dt><dd>{fmt(p.total)}</dd></div>
            </dl>

            <button className="cta" onClick={order} disabled={going}>
              {going ? 'Шилжиж байна…' : <>Захиалах <Icon name="arrow" /></>}
            </button>

            <ul className="assure">
              <li><Icon name="qr" /> QPay эсвэл хүргэлтээр төлнө</li>
              <li><Icon name="clock" /> 10:00-с өмнө захиалбал өдөртөө</li>
            </ul>
          </div>
        </section>

        <section className="sec">
          <h2>{product.whyTitle || 'Яагаад сонгох вэ?'}</h2>
          <div className="benefits">
            {product.benefits.map((b) => (
              <article key={b.title} className="benefit">
                <span className="benefit-ic"><Icon name={b.icon} /></span>
                <h3>{b.title}</h3>
                <p>{b.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="sec split">
          <div>
            <h2>Хэрхэн ашиглах вэ</h2>
            <ol className="steps">
              {product.steps.map((s, i) => (
                <li key={s.title}>
                  <span className="step-n">{i + 1}</span>
                  <div><h3>{s.title}</h3><p>{s.text}</p></div>
                </li>
              ))}
            </ol>
          </div>
          <div className="box">
            <h2>Багцад юу орсон бэ</h2>
            <ul className="includes">
              {product.includes.map((x) => <li key={x}><Icon name="check" />{x}</li>)}
            </ul>
          </div>
        </section>

        {product.reviews.length > 0 && (
          <section className="sec">
            <h2>Худалдан авагчид юу гэж байна</h2>
            <div className="reviews">
              {product.reviews.map((r, i) => (
                <figure key={i} className="review">
                  <div className="stars" aria-label={`${r.stars} од`}>
                    {Array.from({ length: r.stars }).map((_, k) => <Icon key={k} name="star" />)}
                  </div>
                  <blockquote>{r.text}</blockquote>
                  <figcaption>{r.name}</figcaption>
                </figure>
              ))}
            </div>
          </section>
        )}

        <section className="sec faq">
          <h2>Түгээмэл асуулт</h2>
          {product.faq.map((f) => (
            <details key={f.q}>
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </section>

        <section className="final">
          <div>
            <h2>{product.name}</h2>
            <p>{qty} ширхэг · хүргэлттэй нийт <b>{fmt(p.total)}</b></p>
          </div>
          <button className="cta cta-light" onClick={order} disabled={going}>
            Захиалах <Icon name="arrow" />
          </button>
        </section>
      </main>
      <Footer />

      <div className={`bar ${showBar ? 'bar-on' : ''}`} aria-hidden={!showBar}>
        <div>
          <div className="bar-name">{qty} ш · {product.name}</div>
          <div className="bar-price">{fmt(p.total)}</div>
        </div>
        <button className="cta" onClick={order} disabled={going} tabIndex={showBar ? 0 : -1}>Захиалах</button>
      </div>
    </>
  )
}
