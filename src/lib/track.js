// Firestore-д "view" ба "checkout" үйлдлийг бүртгэнэ. Алдаа гарвал чимээгүй алгасна.
import { getDb } from './firebase.js'

// ?utm_source=facebook гэх мэт параметрийг сесс турш хадгална
export function getSource() {
  const params = new URLSearchParams(window.location.search)
  const fromUrl = params.get('utm_source') || params.get('src')
  try {
    if (fromUrl) sessionStorage.setItem('olz_src', fromUrl)
    return fromUrl || sessionStorage.getItem('olz_src') || 'direct'
  } catch {
    return fromUrl || 'direct'
  }
}

export async function track(type, data = {}) {
  try {
    const { db, fs } = await getDb()
    await fs.addDoc(fs.collection(db, 'events'), {
      type,
      source: getSource(),
      referrer: document.referrer ? new URL(document.referrer).hostname : '',
      mobile: window.matchMedia('(max-width: 760px)').matches,
      ...data,
      createdAt: fs.serverTimestamp(),
    })
  } catch (e) {
    console.warn('track failed', e)
  }
}

// Checkout руу явахаас өмнө бүртгэлийг дээд тал нь 400ms хүлээнэ
export async function trackThenGo(url, data) {
  await Promise.race([track('checkout', data), new Promise((r) => setTimeout(r, 400))])
  window.location.href = url
}
