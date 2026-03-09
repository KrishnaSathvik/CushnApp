import { db } from './index'
import { DEFAULT_CURRENCY } from '../lib/constants'

function daysFromNow(n) {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
}

/**
 * Seeds sample subscriptions for first-run demo.
 * Uses dynamic category lookups instead of hardcoded IDs.
 */
export async function seedSampleSubscriptions() {
  const count = await db.subscriptions.count()
  if (count > 0) return

  // Dynamically look up category IDs by name
  const cats = await db.categories.toArray()
  const catId = (name) => {
    const match = cats.find(c => c.name.toLowerCase() === name.toLowerCase())
    return match?.id || cats[0]?.id || 1
  }

  const SAMPLE_SUBSCRIPTIONS = [
    {
      name: 'Netflix',
      amount: 15.99,
      currency: DEFAULT_CURRENCY,
      cycle: 'monthly',
      categoryId: catId('Entertainment'),
      startDate: '2024-01-15',
      renewalDate: daysFromNow(3),
      status: 'active',
      notes: 'Standard plan',
      icon: 'film',
      createdAt: new Date().toISOString(),
    },
    {
      name: 'Spotify',
      amount: 9.99,
      currency: DEFAULT_CURRENCY,
      cycle: 'monthly',
      categoryId: catId('Entertainment'),
      startDate: '2024-03-01',
      renewalDate: daysFromNow(12),
      status: 'active',
      notes: 'Premium individual',
      icon: 'music',
      createdAt: new Date().toISOString(),
    },
    {
      name: 'Claude Pro',
      amount: 20,
      currency: DEFAULT_CURRENCY,
      cycle: 'monthly',
      categoryId: catId('Productivity'),
      startDate: '2024-06-01',
      renewalDate: daysFromNow(8),
      status: 'active',
      notes: '',
      icon: 'zap',
      createdAt: new Date().toISOString(),
    },
    {
      name: 'GitHub',
      amount: 4,
      currency: DEFAULT_CURRENCY,
      cycle: 'monthly',
      categoryId: catId('Dev Tools'),
      startDate: '2023-09-01',
      renewalDate: daysFromNow(18),
      status: 'active',
      notes: 'Pro plan',
      icon: 'code',
      createdAt: new Date().toISOString(),
    },
  ]

  await db.subscriptions.bulkAdd(SAMPLE_SUBSCRIPTIONS)
}
