import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAuthMod, getDb } from '../lib/firebase.js'
import { useAdmin } from '../lib/auth.js'
import { fetchDbProducts, PLACEHOLDER } from '../lib/products.js'
import { uploadToCloudinary, cloudinaryReady, cld, videoPoster } from '../lib/cloudinary.js'
import { getProduct as getStatic } from '../data/products.js'
import { fmt, parseProductId, site } from '../data/site.js'

// ============================================================
//  /admin — бараа нэмэх, засах хэсэг
//  Нэвтрэх: Google. Эрх: Firestore-ийн admins/<uid> баримт байвал л бичих эрхтэй.
// ============================================================

const empty = {
  slug: '', name: '', category: '', tagline: '', description: '',
  price: '', deliveryFee: '7000', dealQty: '', dealPercent: '',
  orderUrl: '', images: [], video: null, badges: '', includes: '', active: true,
}

const tr = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'yo', ж: 'j', з: 'z', и: 'i', й: 'i', к: 'k', л: 'l', м: 'm',
  н: 'n', о: 'o', ө: 'u', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ү: 'u', ф: 'f', х: 'h', ц: 'ts', ч: 'ch', ш: 'sh',
  щ: 'sh', ъ: '', ы: 'i', ь: '', э: 'e', ю: 'yu', я: 'ya',
}
const toSlug = (s) => s.toLowerCase().split('').map((c) => tr[c] ?? c).join('')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60)

const toForm = (p) => ({
  ...empty, ...p,
  price: String(p.price ?? ''), deliveryFee: String(p.deliveryFee ?? ''),
  dealQty: p.deal ? String(p.deal.minQty) : '', dealPercent: p.deal ? String(p.deal.percent) : '',
  badges: (p.badges || []).join(', '), includes: (p.includes || []).join('\n'),
  images: p.images?.filter((im) => im.src !== PLACEHOLDER) || [],
})

export default function Admin() {
  const { user, isAdmin, error: authError } = useAdmin()
  const [list, setList] = useState([])
  const [form, setForm] = useState(empty)
  const [editing, setEditing] = useState(null)
  const [busy, setBusy] = useState('')
  const [msg, setMsg] = useState(null)
  const [progress, setProgress] = useState(null)

  useEffect(() => { document.title = `Админ — ${site.brand}` }, [])
  useEffect(() => { if (authError) flash('err', authError) }, [authError])

  useEffect(() => { if (isAdmin) reload() }, [isAdmin])

  const reload = () => fetchDbProducts().then(setList).catch((e) => flash('err', e.message))
  const flash = (type, text) => setMsg({ type, text })
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))

  const login = async () => {
    const { auth, a } = await getAuthMod()
    try { await a.signInWithPopup(auth, new a.GoogleAuthProvider()) } catch (e) { flash('err', e.message) }
  }
  const logout = async () => { const { auth, a } = await getAuthMod(); a.signOut(auth) }

  const onName = (e) => {
    const name = e.target.value
    setForm((f) => ({ ...f, name, slug: editing ? f.slug : toSlug(name) }))
  }

  const upload = async (files) => {
    if (!cloudinaryReady) return flash('err', 'Cloudinary тохируулаагүй байна (.env → VITE_CLOUDINARY_*)')
    setBusy('upload')
    setMsg(null)
    try {
      for (const [i, file] of [...files].entries()) {
        setProgress({ name: file.name, n: i + 1, total: files.length, pct: 0 })
        const r = await uploadToCloudinary(file, (pct) => setProgress((p) => ({ ...p, pct })))
        setForm((f) => r.type === 'video'
          ? { ...f, video: { src: r.src } }
          : { ...f, images: [...f.images, { src: r.src, alt: f.name }] })
      }
    } catch (e) {
      flash('err', e.message)
    } finally {
      setBusy('')
      setProgress(null)
    }
  }

  const moveImage = (i, dir) => setForm((f) => {
    const images = [...f.images]
    const j = i + dir
    if (j < 0 || j >= images.length) return f
    ;[images[i], images[j]] = [images[j], images[i]]
    return { ...f, images }
  })
  const removeImage = (i) => setForm((f) => ({ ...f, images: f.images.filter((_, k) => k !== i) }))

  const save = async (e) => {
    e.preventDefault()
    const slug = form.slug.trim()
    if (!/^[a-z0-9-]{2,60}$/.test(slug)) return flash('err', 'Slug зөвхөн латин жижиг үсэг, тоо, зураас (-) байна')
    if (!editing && (getStatic(slug) || list.some((p) => p.slug === slug))) return flash('err', 'Ийм slug-тай бараа аль хэдийн байна')
    if (!form.images.length) return flash('err', 'Дор хаяж нэг зураг оруулна уу')
    if (!form.orderUrl.trim()) return flash('err', 'Захиалгын линк оруулна уу')

    const dealQty = parseInt(form.dealQty, 10)
    const dealPercent = parseInt(form.dealPercent, 10)
    const orderUrl = form.orderUrl.trim()
    const data = {
      name: form.name.trim(),
      category: form.category.trim(),
      tagline: form.tagline.trim(),
      description: form.description.trim(),
      price: Number(form.price) || 0,
      deliveryFee: Number(form.deliveryFee) || 0,
      deal: dealQty > 1 && dealPercent > 0 ? { minQty: dealQty, percent: dealPercent } : null,
      orderUrl,
      productId: parseProductId(orderUrl),
      images: form.images.map((im) => ({ src: im.src, alt: im.alt || form.name.trim() })),
      video: form.video?.src ? { src: form.video.src } : null,
      badges: form.badges.split(',').map((s) => s.trim()).filter(Boolean),
      includes: form.includes.split('\n').map((s) => s.trim()).filter(Boolean),
      active: form.active,
    }

    setBusy('save')
    try {
      const { db, fs } = await getDb()
      const ref = fs.doc(db, 'products', slug)
      await fs.setDoc(ref, {
        ...data,
        updatedAt: fs.serverTimestamp(),
        ...(editing ? {} : { createdAt: fs.serverTimestamp() }),
      }, { merge: true })
      flash('ok', editing ? 'Хадгаллаа' : 'Бараа нэмэгдлээ')
      setForm(empty)
      setEditing(null)
      reload()
    } catch (e) {
      flash('err', e.message)
    } finally {
      setBusy('')
    }
  }

  const edit = (p) => {
    setEditing(p.slug)
    setForm(toForm(p))
    setMsg(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const remove = async (p) => {
    if (!confirm(`"${p.name}" барааг устгах уу?`)) return
    const { db, fs } = await getDb()
    try {
      await fs.deleteDoc(fs.doc(db, 'products', p.slug))
      if (editing === p.slug) { setEditing(null); setForm(empty) }
      reload()
    } catch (e) { flash('err', e.message) }
  }

  const toggle = async (p) => {
    const { db, fs } = await getDb()
    try {
      await fs.updateDoc(fs.doc(db, 'products', p.slug), { active: !p.active, updatedAt: fs.serverTimestamp() })
      reload()
    } catch (e) { flash('err', e.message) }
  }

  if (user === undefined || (user && isAdmin === undefined)) return <Shell><p className="muted">Ачаалж байна…</p></Shell>

  if (!user) {
    return (
      <Shell>
        <div className="adm-card adm-center">
          <h1>Админ</h1>
          <p className="muted">Бараа нэмэхийн тулд Google-ээр нэвтэрнэ үү.</p>
          <button className="cta cta-inline" onClick={login}>Google-ээр нэвтрэх</button>
          {msg && <p className={`adm-msg ${msg.type}`}>{msg.text}</p>}
        </div>
      </Shell>
    )
  }

  if (!isAdmin) {
    return (
      <Shell user={user} onLogout={logout}>
        <div className="adm-card">
          <h1>Эрх алга байна</h1>
        </div>
      </Shell>
    )
  }

  const pid = parseProductId(form.orderUrl)

  return (
    <Shell user={user} onLogout={logout}>
      <form className="adm-card adm-form" onSubmit={save}>
        <div className="adm-head">
          <h1>{editing ? 'Бараа засах' : 'Шинэ бараа нэмэх'}</h1>
          {editing && <button type="button" className="adm-btn" onClick={() => { setEditing(null); setForm(empty) }}>Болих</button>}
        </div>

        {!cloudinaryReady && (
          <p className="adm-msg err">Cloudinary тохируулаагүй: <code>.env</code> файлд <code>VITE_CLOUDINARY_CLOUD_NAME</code>, <code>VITE_CLOUDINARY_UPLOAD_PRESET</code> нэмнэ үү.</p>
        )}

        <fieldset>
          <legend>Зураг ба бичлэг</legend>
          <div className="adm-media">
            {form.images.map((im, i) => (
              <div key={im.src} className="adm-thumb">
                <img src={cld(im.src, 'f_auto,q_auto,w_240')} alt="" />
                {i === 0 && <span className="adm-tag">Нүүр</span>}
                <div className="adm-thumb-act">
                  <button type="button" onClick={() => moveImage(i, -1)} disabled={i === 0} aria-label="Зүүн">‹</button>
                  <button type="button" onClick={() => removeImage(i)} aria-label="Устгах">✕</button>
                  <button type="button" onClick={() => moveImage(i, 1)} disabled={i === form.images.length - 1} aria-label="Баруун">›</button>
                </div>
              </div>
            ))}
            {form.video && (
              <div className="adm-thumb">
                <video src={form.video.src} poster={videoPoster(form.video.src) || undefined} muted playsInline />
                <span className="adm-tag">Бичлэг</span>
                <div className="adm-thumb-act">
                  <button type="button" onClick={() => setForm((f) => ({ ...f, video: null }))} aria-label="Устгах">✕</button>
                </div>
              </div>
            )}
            <label className={`adm-drop ${busy === 'upload' ? 'busy' : ''}`}>
              <input type="file" accept="image/*,video/*" multiple disabled={busy === 'upload'}
                onChange={(e) => { upload(e.target.files); e.target.value = '' }} />
              <span>{progress
                ? `${progress.n}/${progress.total} · ${Math.round(progress.pct * 100)}%`
                : '+ Зураг / бичлэг'}</span>
            </label>
          </div>
          <p className="muted small">Эхний зураг нүүр зураг болно. Бичлэг нэг л байна (шинээр хуулбал солигдоно).</p>
        </fieldset>

        <fieldset>
          <legend>Үндсэн мэдээлэл</legend>
          <label>Барааны нэр *<input required value={form.name} onChange={onName} placeholder="Хүүхдийн гар зүгшрүүлэгч ном" /></label>
          <label>Хаяг (slug) *
            <input required value={form.slug} onChange={set('slug')} disabled={!!editing} placeholder="gar-zugshruulegch-nom" />
            <small className="muted">{location.origin}/p/{form.slug || '…'}</small>
          </label>
          <label>Ангилал<input value={form.category} onChange={set('category')} placeholder="Хүүхэд · Боловсрол" /></label>
          <label>Товч тайлбар<input value={form.tagline} onChange={set('tagline')} maxLength={200} placeholder="Нэг өгүүлбэрээр барааны гол давуу тал" /></label>
          <label>Дэлгэрэнгүй бичлэг / тайлбар
            <textarea rows={7} value={form.description} onChange={set('description')}
              placeholder={'Барааны тухай дэлгэрэнгүй.\n\nХоосон мөрөөр догол мөр тусгаарлана.'} />
          </label>
        </fieldset>

        <fieldset>
          <legend>Үнэ ба захиалга</legend>
          <div className="adm-row">
            <label>Үнэ (₮) *<input required type="number" min="0" inputMode="numeric" value={form.price} onChange={set('price')} /></label>
            <label>Хүргэлт (₮)<input type="number" min="0" inputMode="numeric" value={form.deliveryFee} onChange={set('deliveryFee')} /></label>
          </div>
          <div className="adm-row">
            <label>Хямдрал: хэдээс дээш авбал<input type="number" min="2" value={form.dealQty} onChange={set('dealQty')} placeholder="2" /></label>
            <label>Хэдэн хувь (%)<input type="number" min="1" max="90" value={form.dealPercent} onChange={set('dealPercent')} placeholder="10" /></label>
          </div>
          <label>Захиалгын линк *
            <input required type="url" value={form.orderUrl} onChange={set('orderUrl')}
              placeholder="https://dropperarena.com/checkout/prod_xxxx" />
            <small className={pid ? 'ok-text' : 'muted'}>
              {pid
                ? `Drop Arena бараа танигдлаа (${pid}) — тоо ширхэг, ref=${site.ref} автоматаар нэмэгдэнэ`
                : 'Drop Arena checkout линк эсвэл дурын захиалгын линк (Messenger, Google Form…)'}
            </small>
          </label>
        </fieldset>

        <fieldset>
          <legend>Нэмэлт</legend>
          <label>Онцлог шошго (таслалаар)<input value={form.badges} onChange={set('badges')} placeholder="Хүргэлттэй, 3–6 нас" /></label>
          <label>Багцад орсон зүйлс (мөр бүрт нэг)<textarea rows={4} value={form.includes} onChange={set('includes')} /></label>
          <label className="adm-check"><input type="checkbox" checked={form.active} onChange={set('active')} /> Сайт дээр харагдана</label>
        </fieldset>

        {msg && <p className={`adm-msg ${msg.type}`}>{msg.text}</p>}
        <button className="cta" disabled={!!busy}>
          {busy === 'save' ? 'Хадгалж байна…' : editing ? 'Хадгалах' : 'Бараа нэмэх'}
        </button>
      </form>

      <section className="adm-card">
        <h2>Нэмсэн бараанууд ({list.length})</h2>
        {list.length === 0 && <p className="muted">Одоогоор бараа алга.</p>}
        <ul className="adm-list">
          {list.map((p) => (
            <li key={p.slug} className={p.active ? '' : 'off'}>
              <img src={cld(p.images[0].src, 'f_auto,q_auto,w_160')} alt="" />
              <div className="adm-list-body">
                <b>{p.name}</b>
                <span className="muted small">{fmt(p.price)} · {p.video ? 'бичлэгтэй · ' : ''}{p.active ? 'идэвхтэй' : 'нуусан'}</span>
              </div>
              <div className="adm-list-act">
                <Link className="adm-btn" to={`/p/${p.slug}`} target="_blank">Үзэх</Link>
                <button className="adm-btn" onClick={() => edit(p)}>Засах</button>
                <button className="adm-btn" onClick={() => toggle(p)}>{p.active ? 'Нуух' : 'Харуулах'}</button>
                <button className="adm-btn danger" onClick={() => remove(p)}>Устгах</button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </Shell>
  )
}

function Shell({ user, onLogout, children }) {
  return (
    <div className="adm">
      <header className="hdr">
        <div className="wrap hdr-in">
          <Link to="/" className="logo">
            <span className="logo-mark" aria-hidden="true" />
            <span className="logo-word">{site.brand.toLowerCase()}</span>
          </Link>
          {user && (
            <div className="adm-user">
              <span className="muted small">{user.email}</span>
              <button className="adm-btn" onClick={onLogout}>Гарах</button>
            </div>
          )}
        </div>
      </header>
      <main className="wrap adm-main">{children}</main>
    </div>
  )
}
