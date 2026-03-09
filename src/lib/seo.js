const SITE_NAME = 'Cushn'
const DEFAULT_DESCRIPTION = 'Your financial cushion against subscription creep with AI-powered tracking, reminders, budgets, and analytics.'
const DEFAULT_IMAGE = '/og-image.png'

const PUBLIC_ROUTE_META = {
  '/': {
    title: `${SITE_NAME} | Your spending cushion`,
    description: 'Paste messy subscription notes, upload statements, or talk naturally. Cushn uses AI to extract vendors, amounts, billing cadence, reminders, budgets, and analytics.',
    robots: 'index,follow',
  },
  '/landing': {
    title: `${SITE_NAME} | Your spending cushion`,
    description: 'Stop bleeding money on forgotten subscriptions with AI-powered tracking, renewal reminders, budget monitoring, and spending analytics.',
    robots: 'index,follow',
  },
  '/privacy': {
    title: `Privacy Policy | ${SITE_NAME}`,
    description: `Read the ${SITE_NAME} privacy policy and how subscription data is handled.`,
    robots: 'index,follow',
  },
  '/terms': {
    title: `Terms of Service | ${SITE_NAME}`,
    description: `Review the ${SITE_NAME} terms of service for using the app and website.`,
    robots: 'index,follow',
  },
  '/contact': {
    title: `Contact | ${SITE_NAME}`,
    description: `Contact ${SITE_NAME} for support, privacy, or subscription tracking questions.`,
    robots: 'index,follow',
  },
  '/login': {
    title: `Log In | ${SITE_NAME}`,
    description: `Log in to ${SITE_NAME} to manage subscriptions, budgets, and renewal reminders.`,
    robots: 'noindex,nofollow',
  },
  '/signup': {
    title: `Create Account | ${SITE_NAME}`,
    description: `Create a ${SITE_NAME} account to sync subscriptions and manage recurring spending.`,
    robots: 'noindex,nofollow',
  },
  '/forgot-password': {
    title: `Reset Password | ${SITE_NAME}`,
    description: `Reset your ${SITE_NAME} password and regain access to your subscription dashboard.`,
    robots: 'noindex,nofollow',
  },
  '/reset-password': {
    title: `Create New Password | ${SITE_NAME}`,
    description: `Create a new ${SITE_NAME} password and regain access to your subscription dashboard.`,
    robots: 'noindex,nofollow',
  },
  '/auth/callback': {
    title: `Authenticating | ${SITE_NAME}`,
    description: `Finish authentication and open your ${SITE_NAME} dashboard.`,
    robots: 'noindex,nofollow',
  },
  '/guest': {
    title: `Try ${SITE_NAME} as Guest`,
    description: `Try ${SITE_NAME} in guest mode before creating an account.`,
    robots: 'noindex,nofollow',
  },
}

function upsertMeta(selector, attributes) {
  let element = document.head.querySelector(selector)
  if (!element) {
    element = document.createElement('meta')
    document.head.appendChild(element)
  }

  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value)
  })
}

function upsertLink(rel, href) {
  let element = document.head.querySelector(`link[rel="${rel}"]`)
  if (!element) {
    element = document.createElement('link')
    element.setAttribute('rel', rel)
    document.head.appendChild(element)
  }

  element.setAttribute('href', href)
}

export function getRouteSeo(pathname, origin) {
  const routeMeta = PUBLIC_ROUTE_META[pathname] || {
    title: `${SITE_NAME} App`,
    description: DEFAULT_DESCRIPTION,
    robots: 'noindex,nofollow',
  }

  const baseUrl = origin.replace(/\/$/, '')
  const canonicalUrl = `${baseUrl}${pathname === '/' ? '' : pathname}`
  const imageUrl = `${baseUrl}${DEFAULT_IMAGE}`

  return {
    ...routeMeta,
    canonicalUrl,
    imageUrl,
  }
}

export function applyRouteSeo(pathname) {
  const origin = import.meta.env.VITE_SITE_URL || window.location.origin
  const routeMeta = getRouteSeo(pathname, origin)

  document.title = routeMeta.title
  upsertMeta('meta[name="description"]', { name: 'description', content: routeMeta.description })
  upsertMeta('meta[name="robots"]', { name: 'robots', content: routeMeta.robots })
  upsertMeta('meta[property="og:title"]', { property: 'og:title', content: routeMeta.title })
  upsertMeta('meta[property="og:description"]', { property: 'og:description', content: routeMeta.description })
  upsertMeta('meta[property="og:type"]', { property: 'og:type', content: 'website' })
  upsertMeta('meta[property="og:url"]', { property: 'og:url', content: routeMeta.canonicalUrl })
  upsertMeta('meta[property="og:image"]', { property: 'og:image', content: routeMeta.imageUrl })
  upsertMeta('meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary_large_image' })
  upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: routeMeta.title })
  upsertMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: routeMeta.description })
  upsertMeta('meta[name="twitter:image"]', { name: 'twitter:image', content: routeMeta.imageUrl })
  upsertLink('canonical', routeMeta.canonicalUrl)
}
