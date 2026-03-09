import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import PageShell from './layout/PageShell'

export default function PublicHeader() {
  const { T } = useTheme()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  const isLanding = pathname === '/landing'
  const featureHref = isLanding ? '#features' : '/landing#features'

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
        <Link to="/landing" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <img
            src="/logo.png"
            alt="Cushn Logo"
            style={{ width: 24, height: 24, borderRadius: 6 }}
          />
          <span
            style={{
              fontSize: 17,
              fontWeight: 700,
              color: T.fgHigh,
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
              color: T.fgMedium,
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
              color: T.fgMedium,
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

        <button
          className="interactive-btn md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
        >
          {menuOpen ? <X size={22} color={T.fgMedium} /> : <Menu size={22} color={T.fgMedium} />}
        </button>
      </PageShell>

      {menuOpen && (
        <div className="md:hidden" style={{ borderTop: `1px solid ${T.border}` }}>
          <PageShell
            width="wide"
            style={{
              paddingTop: 12,
              paddingBottom: 16,
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}
          >
            <a
              href={featureHref}
              onClick={() => setMenuOpen(false)}
              className="interactive-btn font-mono"
              style={{ fontSize: 11, color: T.fgMedium, textDecoration: 'none', fontWeight: 600 }}
            >
              Features
            </a>
            <button
              onClick={() => {
                setMenuOpen(false)
                navigate('/login')
              }}
              className="interactive-btn cursor-pointer border-none font-mono"
              style={{
                height: 36,
                padding: '0 12px',
                borderRadius: 999,
                background: T.bgElevated,
                color: T.fgHigh,
                border: `1px solid ${T.border}`,
                fontSize: 11,
                textAlign: 'left',
              }}
            >
              Log in
            </button>
            <button
              onClick={() => {
                setMenuOpen(false)
                navigate('/signup')
              }}
              className="interactive-btn cursor-pointer border-none font-mono"
              style={{
                height: 36,
                padding: '0 12px',
                borderRadius: 999,
                background: T.accentSoft,
                color: T.accentPrimary,
                border: `1px solid ${T.accentPrimary}`,
                fontSize: 11,
                textAlign: 'left',
              }}
            >
              Create account
            </button>
          </PageShell>
        </div>
      )}
    </nav>
  )
}
