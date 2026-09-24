import { Link } from 'react-router-dom'
import { site } from '../data/site.js'

export function Header() {
  return (
    <header className="hdr">
      <div className="wrap hdr-in">
        <Link className="logo" aria-label={site.brand}>
          <span className="logo-mark" aria-hidden="true" />
          <span className="logo-word">{site.brand.toLowerCase()}</span>
        </Link>
        <div className="hdr-note">
          <Icon name="truck" /> УБ-т өдөртөө хүргэнэ
        </div>
      </div>
    </header>
  )
}

export function Footer() {
  return (
    <footer className="ftr">
      <div className="wrap ftr-in">
        <div>
          <div className="logo logo-sm">
            <span className="logo-mark" aria-hidden="true" />
            <span className="logo-word">{site.brand.toLowerCase()}</span>
          </div>
          <p className="muted">{site.tagline}</p>
        </div>
        <p className="muted small ftr-legal">
          Захиалга, төлбөр (QPay) болон хүргэлтийг Drop Arena платформ гүйцэтгэнэ.
          Захиалгаа <a href="https://dropperarena.com/track" target="_blank" rel="noreferrer">dropperarena.com/track</a> хуудсаас хянана.
        </p>
        <div className="ftr-links">
          {site.phone && <a href={`tel:${site.phone}`}>{site.phone}</a>}
          {site.facebook && <a href={site.facebook} target="_blank" rel="noreferrer">Facebook</a>}
          {site.instagram && <a href={site.instagram} target="_blank" rel="noreferrer">Instagram</a>}
        </div>
      </div>
    </footer>
  )
}

const paths = {
  truck: 'M3 6h11v9H3zM14 9h4l3 3v3h-7zM7 18.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm10 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z',
  groove: 'M4 17c2.5-7 5.5-7 8 0s5.5 7 8 0M4 11c2.5-7 5.5-7 8 0s5.5 7 8 0',
  erase: 'M4 20h16M7 16l9.5-9.5a2.1 2.1 0 0 1 3 3L10 19H7z',
  screen: 'M5 4h14v11H5zM9 19h6M3 3l18 18',
  gift: 'M4 11h16v9H4zM3 7h18v4H3zM12 7v13M12 7c-2-4-6-3-5 0M12 7c2-4 6-3 5 0',
  qr: 'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h2v2h-2zM18 14h2v2M14 18h2v2M18 18h2v2',
  cash: 'M3 7h18v10H3zM12 14.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
  check: 'M5 12.5l4.5 4.5L19 7.5',
  clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2',
  arrow: 'M5 12h14M13 6l6 6-6 6',
  shield: 'M12 3l8 3v6c0 4.5-3.4 8-8 9-4.6-1-8-4.5-8-9V6z',
  star: 'M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8L3.5 9.7l5.9-.9z',
}

export function Icon({ name, className = '' }) {
  return (
    <svg className={`ic ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={paths[name]} />
    </svg>
  )
}
