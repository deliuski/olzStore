// Нэвтэрсэн хэрэглэгч админ эсэхийг шалгана (Firestore: admins/<uid> баримт байгаа эсэх).
import { useEffect, useState } from 'react'
import { getAuthMod, getDb } from './firebase.js'

// user: undefined = ачаалж байна, null = нэвтрээгүй
// isAdmin: undefined = шалгаж байна
export function useAdmin() {
  const [state, setState] = useState({ user: undefined, isAdmin: undefined, error: '' })
  useEffect(() => {
    let unsub = () => {}
    let alive = true
    getAuthMod().then(({ auth, a }) => {
      if (!alive) return
      unsub = a.onAuthStateChanged(auth, async (user) => {
        if (!user) return setState({ user: null, isAdmin: false, error: '' })
        setState({ user, isAdmin: undefined, error: '' })
        try {
          const { db, fs } = await getDb()
          const snap = await fs.getDoc(fs.doc(db, 'admins', user.uid))
          setState({ user, isAdmin: snap.exists(), error: '' })
        } catch (e) {
          setState({
            user, isAdmin: false,
            error: e.code === 'permission-denied'
              ? 'Firestore эрх хүрэхгүй байна: firestore.rules-ийг Firebase Console → Firestore → Rules хэсэгт буулгаж Publish хийнэ үү.'
              : e.message,
          })
        }
      })
    })
    return () => { alive = false; unsub() }
  }, [])
  return state
}
