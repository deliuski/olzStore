// Бараануудыг хоёр эх сурвалжаас нэгтгэнэ:
//   1) src/data/products.js — код дотор бичсэн бараа
//   2) Firestore "products" collection — /admin хуудаснаас нэмсэн бараа
import { useEffect, useState } from 'react'
import { products as staticProducts, getProduct as getStatic, defaultFaq } from '../data/products.js'
import { getDb } from './firebase.js'

export const PLACEHOLDER = '/placeholder.svg'

export function normalize(id, d) {
  return {
    slug: id,
    productId: d.productId || '',
    orderUrl: d.orderUrl || '',
    name: d.name || '',
    tagline: d.tagline || '',
    description: d.description || '',
    category: d.category || '',
    price: Number(d.price) || 0,
    deal: d.deal?.minQty && d.deal?.percent ? d.deal : null,
    deliveryFee: d.deliveryFee ?? 7000,
    images: d.images?.length ? d.images : [{ src: PLACEHOLDER, alt: d.name || '' }],
    video: d.video?.src ? d.video : null,
    badges: d.badges || [],
    benefits: [],
    includes: d.includes || [],
    steps: [],
    reviews: [],
    faq: d.faq?.length ? d.faq : defaultFaq,
    seo: { title: d.name, description: d.tagline },
    active: d.active !== false,
    fromDb: true,
  }
}

export async function fetchDbProducts() {
  const { db, fs } = await getDb()
  const snap = await fs.getDocs(fs.collection(db, 'products'))
  return snap.docs
    .map((doc) => ({ ...normalize(doc.id, doc.data()), createdAt: doc.data().createdAt?.toMillis?.() ?? 0 }))
    .sort((a, b) => b.createdAt - a.createdAt)
}

export function useProducts() {
  const [list, setList] = useState(staticProducts)
  useEffect(() => {
    let alive = true
    fetchDbProducts()
      .then((db) => {
        if (!alive) return
        const fresh = db.filter((p) => p.active && !getStatic(p.slug))
        setList([...fresh, ...staticProducts])
      })
      .catch((e) => console.warn('products load failed', e))
    return () => { alive = false }
  }, [])
  return list
}

// undefined = ачаалж байна, null = олдсонгүй
export function useProduct(slug) {
  const local = getStatic(slug)
  const [product, setProduct] = useState(local)
  useEffect(() => {
    if (local) { setProduct(local); return }
    let alive = true
    setProduct(undefined)
    getDb()
      .then(({ db, fs }) => fs.getDoc(fs.doc(db, 'products', slug)))
      .then((snap) => {
        if (!alive) return
        const p = snap.exists() ? normalize(snap.id, snap.data()) : null
        setProduct(p && p.active ? p : null)
      })
      .catch((e) => { console.warn('product load failed', e); alive && setProduct(null) })
    return () => { alive = false }
  }, [slug, local])
  return product
}
