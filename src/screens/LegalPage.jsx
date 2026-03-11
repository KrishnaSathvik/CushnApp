import React from 'react'
import { Mail, Shield, Scale, LifeBuoy } from 'lucide-react'
import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import PublicHeader from '../components/PublicHeader'
import PublicFooter from '../components/PublicFooter'
import PageShell from '../components/layout/PageShell'
import PageIntro from '../components/layout/PageIntro'
import AppHeroCard from '../components/ui/AppHeroCard'
import AppSurfaceCard from '../components/ui/AppSurfaceCard'

const CONTACT_EMAIL = 'support@cushn.app'
const PAGE_NOTES = {
  privacy:
    'Questions about this Privacy Policy or how your data is handled? Reach out and we will help clarify or process your request.',
  terms:
    'Questions about these Terms of Service or other legal use conditions? Reach out and we will provide guidance.',
  contact:
    'Need help with your account, billing tracking, or app behavior? Reach out directly by email.',
}

const CONTENT = {
  privacy: {
    title: 'Privacy Policy',
    eyebrow: 'Data and privacy',
    summary:
      'This policy explains what information is processed, where it is stored, and how you can request support related to your data.',
    icon: Shield,
    sections: [
      {
        heading: '1. Data We Process',
        body: [
          'In guest mode, subscription records and app preferences are stored locally on your device/browser.',
          'When you sign in, subscription data, categories, budgets, and notification preferences are stored in Supabase under your account for synchronization purposes.',
        ],
      },
      {
        heading: '2. Sensitive Information',
        body: [
          'Cushn is not designed to collect or process full payment card credentials.',
          'You are responsible for avoiding submission of highly sensitive personal or payment secrets in free-text fields.',
        ],
      },
      {
        heading: '3. Retention, Access, and Deletion',
        body: [
          'You may clear locally stored data from in-app settings at any time.',
          'For account-level data support requests, contact support and include the email address associated with your account.',
        ],
      },
    ],
  },
  terms: {
    title: 'Terms of Service',
    eyebrow: 'Usage terms',
    summary: 'These terms govern use of Cushn and define service limitations and user responsibilities.',
    icon: Scale,
    sections: [
      {
        heading: '1. Eligibility and Acceptable Use',
        body: [
          'You are responsible for all information you submit and for maintaining the confidentiality of your account credentials.',
          'You agree not to use Cushn for unlawful conduct, abuse of service infrastructure, or prohibited content.',
        ],
      },
      {
        heading: '2. Service Scope and Availability',
        body: [
          'Cushn is provided on an “as is” and “as available” basis without warranty of uninterrupted operation.',
          'Features, integrations, and user interface behavior may change over time, including modification or removal of functionality.',
        ],
      },
      {
        heading: '3. Financial and Legal Disclaimer',
        body: [
          'Cushn provides organizational tooling and estimated calculations only and does not provide financial, investment, tax, or legal advice.',
          'You should independently verify billing terms, renewal amounts, and provider policies directly with each subscription provider.',
        ],
      },
      {
        heading: '4. Limitation of Liability',
        body: [
          'To the maximum extent permitted by law, Cushn is not liable for indirect, incidental, or consequential damages arising from use of the service.',
          'Your sole remedy for dissatisfaction is to discontinue use of the application.',
        ],
      },
    ],
  },
  contact: {
    title: 'Contact',
    eyebrow: 'Support channels',
    summary: 'Use the form below to email support, privacy, or legal requests directly.',
    icon: LifeBuoy,
    sections: [
      {
        heading: 'Support and Legal Contacts',
        body: [
          `Support email: ${CONTACT_EMAIL}`,
          'Use a clear subject so requests can be triaged faster.',
          'For account-related issues, include the email linked to your account.',
        ],
      },
      {
        heading: 'Response Expectations',
        body: [
          'Please include relevant account context and request details so issues can be triaged efficiently.',
          'Response times may vary based on request complexity and volume.',
        ],
      },
    ],
  },
}

export default function LegalPage() {
  const { T } = useTheme()
  const { pathname } = useLocation()
  const page = pathname.replace('/', '')
  const content = CONTENT[page] || CONTENT.privacy
  const Icon = content.icon
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })

  function onContactChange(event) {
    const { name, value } = event.target
    setContactForm((prev) => ({ ...prev, [name]: value }))
  }

  function onContactSubmit(event) {
    event.preventDefault()
    const subject = contactForm.subject.trim() || 'Cushn Support Request'
    const body = [
      `Name: ${contactForm.name.trim()}`,
      `Email: ${contactForm.email.trim()}`,
      '',
      'Message:',
      contactForm.message.trim(),
    ].join('\n')
    const mailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.location.href = mailto
  }

  return (
    <div
      className="public-page"
      style={{
        background: T.bgBase,
        color: T.fgPrimary,
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <PublicHeader />
      <div
        style={{
          position: 'absolute',
          inset: '56px 0 0 0',
          opacity: 0.04,
          backgroundImage: `linear-gradient(${T.accentPrimary} 1px, transparent 1px), linear-gradient(90deg, ${T.accentPrimary} 1px, transparent 1px)`,
          backgroundSize: '32px 32px',
          pointerEvents: 'none',
        }}
      />

      <div
        className="flex-1"
        style={{
          position: 'relative',
          zIndex: 1,
          padding: '14px 0 36px',
        }}
      >
        <PageShell width="narrow">
          <div style={{ padding: '8px 0 16px', borderBottom: `1px solid ${T.border}`, marginBottom: 16 }} />

          <AppHeroCard
            className="motion-scale-in"
            style={{
              background: T.bgSurface,
              border: `1px solid ${T.border}`,
              padding: '20px 16px',
              marginBottom: 12,
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '5px 10px',
                borderRadius: 999,
                border: `1px solid ${T.accentPrimary}55`,
                background: `${T.accentPrimary}1a`,
                marginBottom: 12,
              }}
            >
              <Icon size={12} color={T.accentPrimary} />
              <span
                style={{
                  fontSize: 10,
                  letterSpacing: 1.1,
                  fontWeight: 700,
                  color: T.accentPrimary,
                  fontFamily: "var(--font-mono)",
                }}
              >
                {content.eyebrow.toUpperCase()}
              </span>
            </div>

            <PageIntro
              title={content.title}
              subtitle={content.summary}
              titleStyle={{ fontSize: 'clamp(2rem, 5vw, 2.6rem)' }}
              subtitleStyle={{ marginTop: 10, maxWidth: 720, lineHeight: 1.65, fontSize: 14 }}
            />
            <p
              className="font-mono"
              style={{ margin: '10px 0 0', fontSize: 10, color: T.fgTertiary }}
            >
              Last updated: March 5, 2026
            </p>
          </AppHeroCard>

          <div className="grid grid-cols-1 gap-3">
            {content.sections.map((section) => (
              <AppSurfaceCard
                className="motion-rise-in"
                key={section.heading}
                as="article"
                style={{
                  background: T.bgSurface,
                  padding: '14px 14px',
                }}
              >
                <h2
                  style={{
                    margin: '0 0 8px',
                    fontSize: 16,
                    color: T.fgPrimary,
                    letterSpacing: -0.2,
                  }}
                >
                  {section.heading}
                </h2>
                {section.body.map((line, idx) => (
                  <p
                    key={idx}
                    style={{
                      margin: '0 0 8px',
                      color: T.fgSecondary,
                      fontSize: 14,
                      lineHeight: 1.7,
                    }}
                  >
                    {line}
                  </p>
                ))}
              </AppSurfaceCard>
            ))}
          </div>

          {page === 'contact' && (
            <AppSurfaceCard
              as="article"
              className="motion-rise-in motion-delay-1"
              style={{
                marginTop: 14,
                background: T.bgSurface,
                padding: '14px 14px',
              }}
            >
              <h2
                style={{
                  margin: '0 0 8px',
                  fontSize: 16,
                  color: T.fgPrimary,
                  letterSpacing: -0.2,
                }}
              >
                Send a Message
              </h2>
              <form onSubmit={onContactSubmit} style={{ display: 'grid', gap: 10 }}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                  <input
                    name="name"
                    value={contactForm.name}
                    onChange={onContactChange}
                    required
                    placeholder="Your name"
                    className="interactive-input"
                    style={{
                      background: T.bgElevated,
                      border: `1px solid ${T.border}`,
                      borderRadius: 14,
                      color: T.fgPrimary,
                      fontSize: 13,
                      padding: '12px 14px',
                    }}
                  />
                  <input
                    name="email"
                    type="email"
                    value={contactForm.email}
                    onChange={onContactChange}
                    required
                    placeholder="Your email"
                    className="interactive-input"
                    style={{
                      background: T.bgElevated,
                      border: `1px solid ${T.border}`,
                      borderRadius: 14,
                      color: T.fgPrimary,
                      fontSize: 13,
                      padding: '12px 14px',
                    }}
                  />
                </div>
                <input
                  name="subject"
                  value={contactForm.subject}
                  onChange={onContactChange}
                  required
                  placeholder="Subject"
                  className="interactive-input"
                  style={{
                    background: T.bgElevated,
                    border: `1px solid ${T.border}`,
                    borderRadius: 14,
                    color: T.fgPrimary,
                    fontSize: 13,
                    padding: '12px 14px',
                  }}
                />
                <textarea
                  name="message"
                  value={contactForm.message}
                  onChange={onContactChange}
                  required
                  placeholder="Tell us how we can help"
                  rows={6}
                  className="interactive-input"
                  style={{
                    background: T.bgElevated,
                    border: `1px solid ${T.border}`,
                    borderRadius: 14,
                    color: T.fgPrimary,
                    fontSize: 13,
                    padding: '12px 14px',
                    resize: 'vertical',
                  }}
                />
                <button
                  type="submit"
                  className="interactive-btn inline-flex items-center justify-center gap-2 cursor-pointer border-none font-mono"
                  style={{
                    height: 36,
                    padding: '0 14px',
                    background: T.accentSoft,
                    color: T.accentPrimary,
                    borderRadius: 999,
                    fontSize: 11,
                    fontWeight: 700,
                    border: `1px solid ${T.accentPrimary}`,
                  }}
                >
                  <Mail size={14} /> Compose Email
                </button>
              </form>
            </AppSurfaceCard>
          )}

        </PageShell>
      </div>
      <PublicFooter />
    </div>
  )
}
