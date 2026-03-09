import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Analytics } from '@vercel/analytics/react'
import './index.css'
import App from './App'
import { seedDefaults, db } from './db'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    <Analytics />
  </StrictMode>,
)

void seedDefaults()

// Keep non-critical local data cleanup off the initial render path.
void (async function cleanupSeededDemoData() {
  if (localStorage.getItem('cushn_demo_cleaned_v2')) return

  try {
    const subs = await db.subscriptions.toArray()
    const DEMO_SIGS = [
      { name: 'Netflix', notes: 'Standard plan' },
      { name: 'Spotify', notes: 'Premium individual' },
      { name: 'Claude Pro', notes: '' },
      { name: 'GitHub', notes: 'Pro plan' },
    ]
    const demoIds = subs
      .filter(s => DEMO_SIGS.some(d => d.name === s.name && d.notes === (s.notes || '')))
      .map(s => s.id)
    if (demoIds.length > 0) {
      await db.subscriptions.bulkDelete(demoIds)
    }

    // Only mark as cleaned if the DB query actually succeeded without throwing
    localStorage.setItem('cushn_demo_cleaned_v2', 'true')
  } catch (err) {
    console.error('Failed to clean up demo data, will retry next load:', err)
  }
}())
