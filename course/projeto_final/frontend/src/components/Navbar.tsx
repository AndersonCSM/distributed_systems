import { useLocation, useNavigate } from 'react-router-dom'

export default function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const isActive = (path: string) => location.pathname === path

  return (
    <nav className="navbar">
      <button
        id="nav-feed"
        className={`nav-btn ${isActive('/feed') ? 'active' : ''}`}
        onClick={() => navigate('/feed')}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          <polyline points="9,22 9,12 15,12 15,22" />
        </svg>
        Feed
      </button>

      <button
        id="nav-cadastrar"
        className="nav-fab"
        onClick={() => navigate('/cadastrar')}
        aria-label="Cadastrar item"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} width={24} height={24}>
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>

      <button
        id="nav-perfil"
        className={`nav-btn ${isActive('/cadastrar') ? 'active' : ''}`}
        onClick={() => navigate('/cadastrar')}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <circle cx="12" cy="8" r="4" />
          <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
        </svg>
        Cadastrar
      </button>
    </nav>
  )
}
