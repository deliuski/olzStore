// Firebase-ийн нэгдсэн холболт. Firestore, Auth, Analytics-ийг хэрэгтэй үед нь л ачаална.
// Web config нь нууц биш (браузерт харагддаг) — хамгаалалтыг firestore.rules хийнэ.
// .env дотор VITE_FIREBASE_* утга байвал түүнийг, үгүй бол доорх olzstore төслийг ашиглана.
const env = import.meta.env
export const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || 'AIzaSyCMAQV0QZRCGQo03vKYlIHwudid681xo3w',
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || 'olzstore.firebaseapp.com',
  projectId: env.VITE_FIREBASE_PROJECT_ID || 'olzstore',
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || 'olzstore.firebasestorage.app',
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || '877946829654',
  appId: env.VITE_FIREBASE_APP_ID || '1:877946829654:web:18ae047faf3d3425a474f7',
  measurementId: env.VITE_FIREBASE_MEASUREMENT_ID || 'G-30VSM6BHXL',
}

let appPromise
function getApp() {
  if (!appPromise) {
    appPromise = import('firebase/app').then(({ initializeApp }) => {
      const app = initializeApp(firebaseConfig)
      // Analytics зөвхөн дэмжигдсэн браузерт асна (SSR, зарим in-app browser дээр алгасна)
      import('firebase/analytics')
        .then(({ getAnalytics, isSupported }) => isSupported().then((ok) => ok && getAnalytics(app)))
        .catch(() => {})
      return app
    })
  }
  return appPromise
}

let dbPromise
export function getDb() {
  if (!dbPromise) {
    dbPromise = Promise.all([getApp(), import('firebase/firestore')]).then(
      ([app, fs]) => ({ db: fs.getFirestore(app), fs })
    )
  }
  return dbPromise
}

let authPromise
export function getAuthMod() {
  if (!authPromise) {
    authPromise = Promise.all([getApp(), import('firebase/auth')]).then(
      ([app, a]) => ({ auth: a.getAuth(app), a })
    )
  }
  return authPromise
}
