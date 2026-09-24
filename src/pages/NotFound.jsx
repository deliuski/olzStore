import { Link } from 'react-router-dom'
import { Header, Footer } from '../components/Layout.jsx'

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="wrap nf">
        <h1>Хуудас олдсонгүй</h1>
        <p className="lede">Энэ бараа дууссан эсвэл холбоос буруу байж магадгүй.</p>
        <Link to="/" className="cta cta-inline">Бүх бараа үзэх</Link>
      </main>
      <Footer />
    </>
  )
}
