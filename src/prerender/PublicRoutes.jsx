import React from 'react'
import { StaticRouter } from 'react-router'
import LandingPage from '../screens/LandingPage'
import LegalPage from '../screens/LegalPage'
import { ThemeProvider } from '../context/ThemeContext'

function PublicRouteContent({ pathname }) {
  switch (pathname) {
    case '/':
    case '/landing':
      return <LandingPage />
    case '/privacy':
    case '/terms':
    case '/contact':
      return <LegalPage />
    default:
      throw new Error(`Unsupported prerender route: ${pathname}`)
  }
}

export function PublicRoutes({ pathname }) {
  return (
    <StaticRouter location={pathname}>
      <ThemeProvider>
        <PublicRouteContent pathname={pathname} />
      </ThemeProvider>
    </StaticRouter>
  )
}
