import React from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import PageShell from './layout/PageShell'
import AppSurfaceCard from './ui/AppSurfaceCard'

export default function PublicFooter() {
  const { T } = useTheme()
  const groups = [
    {
      title: 'Product',
      links: [
        { label: 'Features', href: '/#features', external: false },
        { label: 'Guest mode', href: '/guest', external: false },
        { label: 'Create account', href: '/signup', external: false },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'Log in', href: '/login', external: false },
        { label: 'Privacy', href: '/privacy', external: false },
        { label: 'Terms', href: '/terms', external: false },
      ],
    },
  ]
  const trustItems = [
    'Email + in-app reminders',
    'Guest mode',
    'Cross-device sync',
  ]
  const renderLink = (link, compact = false) => {
    const sharedStyle = compact
      ? {
          color: T.fgMedium,
          textDecoration: 'none',
          fontSize: 13,
          lineHeight: 1.6,
        }
      : {
          height: 32,
          padding: '0 12px',
          borderRadius: 999,
          fontSize: 11,
          color: T.fgMedium,
          textDecoration: 'none',
          border: `1px solid ${T.border}`,
          display: 'inline-flex',
          alignItems: 'center',
        }

    if (link.external) {
      return (
        <a
          key={link.label}
          href={link.href}
          target="_blank"
          rel="noreferrer noopener"
          className={compact ? undefined : 'interactive-btn font-mono'}
          style={sharedStyle}
        >
          {link.label}
        </a>
      )
    }

    return (
      <Link
        key={link.label}
        to={link.href}
        className={compact ? undefined : 'interactive-btn font-mono'}
        style={sharedStyle}
      >
        {link.label}
      </Link>
    )
  }

  return (
    <footer
      style={{
        padding: '28px 0 32px',
        borderTop: `1px solid ${T.border}`,
      }}
    >
      <PageShell width="default">
        <AppSurfaceCard className="public-footer-card" style={{ background: T.bgSurface }}>
          <div className="public-footer-top">
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  marginBottom: 12,
                }}
              >
                <img
                  src="/logo.png"
                  alt="Cushn Logo"
                  style={{ width: 18, height: 18, borderRadius: 5 }}
                />
                <span style={{ fontSize: 16, fontWeight: 700, color: T.fgHigh }}>
                  Cushn
                </span>
              </div>

              <div
                style={{
                  maxWidth: 340,
                  color: T.fgMedium,
                  fontSize: 13,
                  lineHeight: 1.7,
                }}
              >
                Track subscriptions, review imports, and stay ahead of renewals from one cleaner dashboard.
              </div>

              <div
                style={{
                  display: 'flex',
                  gap: 8,
                  flexWrap: 'wrap',
                  marginTop: 16,
                }}
              >
                {trustItems.map((item) => (
                  <div
                    key={item}
                    className="font-mono"
                    style={{
                      height: 28,
                      padding: '0 10px',
                      borderRadius: 999,
                      border: `1px solid ${T.border}`,
                      background: T.bgElevated,
                      color: T.fgMedium,
                      display: 'inline-flex',
                      alignItems: 'center',
                      fontSize: 10,
                      letterSpacing: 0.2,
                    }}
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="public-footer-links">
              {groups.map((group) => (
                <div key={group.title}>
                  <div className="section-label" style={{ marginBottom: 12 }}>
                    {group.title}
                  </div>
                  <div
                    style={{
                      display: 'grid',
                      gap: 8,
                    }}
                  >
                    {group.links.map((link) => renderLink(link, true))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div
            className="public-footer-bottom"
            style={{
              display: 'flex',
              gap: 12,
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              marginTop: 24,
              paddingTop: 16,
              borderTop: `1px solid ${T.border}`,
            }}
          >
            <div style={{ fontSize: 11, color: T.fgSubtle }}>
              © {new Date().getFullYear()} Cushn. Subscription tracking without the spreadsheet drift.
            </div>
          </div>
        </AppSurfaceCard>
      </PageShell>
    </footer>
  )
}
