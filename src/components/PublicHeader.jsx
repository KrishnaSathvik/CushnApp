import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import PageShell from './layout/PageShell'

export default function PublicHeader() {
  const { T } = useTheme()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const isLanding = pathname === '/' || pathname === '/landing'
  const featureHref = isLanding ? '#features' : '/#features'

  return (
    <nav
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 60,
        background: T.bgBase + 'ee',
        backdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${T.border}`,
      }}
    >
      <PageShell
        width="wide"
        style={{
          height: 56,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <img
            src="/logo.png"
            alt="Cushn Logo"
            style={{ width: 24, height: 24, borderRadius: 6 }}
          />
          <span
            style={{
              fontSize: 17,
              fontWeight: 700,
              color: T.fgPrimary,
              letterSpacing: -0.5,
            }}
          >
            Cushn
          </span>
        </Link>

        <div className="hidden md:flex" style={{ gap: 24, alignItems: 'center' }}>
          <a
            href={featureHref}
            className="interactive-btn font-mono"
            style={{
              fontSize: 11,
              color: T.fgSecondary,
              textDecoration: 'none',
              fontWeight: 600,
              letterSpacing: 0.3,
            }}
          >
            Features
          </a>
        </div>

        <div className="hidden md:flex" style={{ gap: 10, alignItems: 'center' }}>
          <button
            onClick={() => navigate('/login')}
            className="interactive-btn cursor-pointer border-none font-mono"
            style={{
              height: 36,
              padding: '0 12px',
              borderRadius: 999,
              background: 'transparent',
              color: T.fgSecondary,
              border: `1px solid ${T.border}`,
              fontSize: 11,
            }}
          >
            Log in
          </button>
          <button
            onClick={() => navigate('/signup')}
            className="interactive-btn cursor-pointer border-none font-mono"
            style={{
              height: 36,
              padding: '0 12px',
              borderRadius: 999,
              background: T.accentSoft,
              color: T.accentPrimary,
              border: `1px solid ${T.accentPrimary}`,
              fontSize: 11,
            }}
          >
            Create account
          </button>
        </div>

      </PageShell>
    </nav>
  )
}
