// Firestore-д "view" ба "checkout" үйлдлийг бүртгэнэ.
// Env тохируулаагүй бол чимээгүй алгасна — сайт хэвийн ажиллана.
const cfg = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}
const enabled = Boolean(cfg.apiKey && cfg.projectId)

let dbPromise
function getDb() {
  if (!enabled) return null
  if (!dbPromise) {
    dbPromise = Promise.all([import('firebase/app'), import('firebase/firestore')]).then(
      ([{ initializeApp }, fs]) => ({ db: fs.getFirestore(initializeApp(cfg)), fs })
    )
  }
  return dbPromise
}

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
  const p = getDb()
  if (!p) return
  try {
    const { db, fs } = await p
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
