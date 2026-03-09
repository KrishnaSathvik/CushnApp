import React from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import PageShell from './layout/PageShell'
import AppSurfaceCard from './ui/AppSurfaceCard'

export default function PublicFooter() {
  const { T } = useTheme()
  const links = [
    { label: 'Privacy', href: '/privacy', external: false },
    { label: 'Terms', href: '/terms', external: false },
  ]

  return (
    <footer
      style={{
        padding: '24px 0 28px',
        borderTop: `1px solid ${T.border}`,
        textAlign: 'center',
      }}
    >
      <PageShell width="narrow">
        <AppSurfaceCard className="public-footer-card" style={{ background: T.bgSurface }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              marginBottom: 8,
            }}
          >
            <img
              src="/logo.png"
              alt="Cushn Logo"
              style={{ width: 16, height: 16, borderRadius: 4 }}
            />
            <span style={{ fontSize: 14, fontWeight: 700, color: T.fgHigh }}>
              Cushn
            </span>
          </div>
          <div className="section-label" style={{ marginBottom: 14 }}>
            Public links
          </div>
          <div
            style={{
              display: 'flex',
              gap: 10,
              justifyContent: 'center',
              marginBottom: 14,
              flexWrap: 'wrap',
            }}
          >
            {links.map((l) =>
              l.external ? (
                <a
                  key={l.label}
                  href={l.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="interactive-btn font-mono"
                  style={{
                    height: 32,
                    padding: '0 12px',
                    borderRadius: 999,
                    fontSize: 11,
                    color: T.fgMedium,
                    textDecoration: 'none',
                    border: `1px solid ${T.border}`,
                    display: 'inline-flex',
                    alignItems: 'center',
                  }}
                >
                  {l.label}
                </a>
              ) : (
                <Link
                  key={l.label}
                  to={l.href}
                  className="interactive-btn font-mono"
                  style={{
                    height: 32,
                    padding: '0 12px',
                    borderRadius: 999,
                    fontSize: 11,
                    color: T.fgMedium,
                    textDecoration: 'none',
                    border: `1px solid ${T.border}`,
                    display: 'inline-flex',
                    alignItems: 'center',
                  }}
                >
                  {l.label}
                </Link>
              ),
            )}
          </div>
          <div style={{ fontSize: 11, color: T.fgSubtle }}>
            © {new Date().getFullYear()} Cushn. All rights reserved.
          </div>
        </AppSurfaceCard>
      </PageShell>
    </footer>
  )
}
