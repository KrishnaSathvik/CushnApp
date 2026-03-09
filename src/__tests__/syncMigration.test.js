import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocked = vi.hoisted(() => {
  const state = {
    categories: [],
    subscriptions: [],
    budget: null,
  }

  const categoriesTable = {
    toArray: vi.fn(async () => state.categories),
    clear: vi.fn(async () => {
      state.categories = []
    }),
  }

  const subscriptionsTable = {
    toArray: vi.fn(async () => state.subscriptions),
    clear: vi.fn(async () => {
      state.subscriptions = []
    }),
  }

  const budgetTable = {
    toCollection: vi.fn(() => ({
      first: vi.fn(async () => state.budget),
    })),
    clear: vi.fn(async () => {
      state.budget = null
    }),
  }

  return {
    state,
    isConfigured: true,
    seedDefaultCategories: vi.fn(async () => {}),
    saveCloudUserSettings: vi.fn(async (_userId, patch) => patch),
    updateUser: vi.fn(async () => ({ error: null })),
    categoriesTable,
    subscriptionsTable,
    budgetTable,
    from: vi.fn(),
  }
})

vi.mock('../db', () => ({
  db: {
    categories: mocked.categoriesTable,
    subscriptions: mocked.subscriptionsTable,
    budget: mocked.budgetTable,
  },
}))

vi.mock('../lib/supabase', () => ({
  isSupabaseConfigured: () => mocked.isConfigured,
  supabase: {
    from: mocked.from,
    auth: {
      updateUser: mocked.updateUser,
    },
  },
}))

vi.mock('../lib/dataService', () => ({
  seedDefaultCategories: mocked.seedDefaultCategories,
}))

vi.mock('../lib/userSettings', () => ({
  getLocalUserSettings: () => ({
    currency: 'INR',
    billTypeByCategory: { '1': 'utility' },
    themePreference: 'light',
  }),
  saveCloudUserSettings: mocked.saveCloudUserSettings,
}))

import { migrateLocalToSupabase } from '../lib/syncMigration'

describe('migrateLocalToSupabase', () => {
  beforeEach(() => {
    mocked.state.categories = [
      { id: 1, name: 'Entertainment', color: '#f00', icon: 'film' },
      { id: 2, name: 'Custom', color: '#0f0', icon: 'tag' },
    ]
    mocked.state.subscriptions = [
      {
        id: 10,
        name: 'Netflix',
        amount: 15.99,
        currency: 'USD',
        cycle: 'monthly',
        categoryId: 1,
        startDate: '2026-03-01',
        renewalDate: '2026-04-01',
        status: 'active',
        notes: 'Standard',
        icon: '',
        rawInput: 'netflix 15.99',
        vendorDomain: 'netflix.com',
        vendorConfidence: 1,
        vendorMatchType: 'exact',
      },
    ]
    mocked.state.budget = {
      id: 1,
      monthlyGoal: 400,
      currency: 'USD',
    }
    mocked.from.mockReset()
    mocked.seedDefaultCategories.mockClear()
    mocked.saveCloudUserSettings.mockClear()
    mocked.updateUser.mockClear()

    const categoriesSelect = {
      select: vi.fn(() => categoriesSelect),
      eq: vi.fn(() => categoriesSelect),
    }
    categoriesSelect.eq.mockResolvedValue({
      data: [{ id: 'cat-ent', name: 'Entertainment' }],
      error: null,
    })

    const categoriesInsert = {
      insert: vi.fn(() => categoriesInsert),
      select: vi.fn(async () => ({
        data: [{ id: 'cat-custom', name: 'Custom' }],
        error: null,
      })),
    }

    const subscriptionsInsert = {
      insert: vi.fn(async (rows) => {
        expect(rows[0]).toMatchObject({
          vendor_domain: 'netflix.com',
          vendor_confidence: 1,
          vendor_match_type: 'exact',
        })
        return { error: null }
      }),
    }

    const budgetsUpsert = {
      upsert: vi.fn(async () => ({ error: null })),
    }

    const notificationPrefsUpsert = {
      upsert: vi.fn(async () => ({ error: null })),
    }

    mocked.from.mockImplementation((table) => {
      if (table === 'categories') {
        if (mocked.from.mock.calls.filter(([name]) => name === 'categories').length === 1) {
          return categoriesSelect
        }
        return categoriesInsert
      }
      if (table === 'subscriptions') return subscriptionsInsert
      if (table === 'budgets') return budgetsUpsert
      if (table === 'notification_preferences') return notificationPrefsUpsert
      throw new Error(`Unexpected table ${table}`)
    })

    const storage = {
      subtrackr_notify_pref: JSON.stringify({
        inAppEnabled: false,
        emailEnabled: true,
        daysBefore: [5],
        timezone: 'America/Chicago',
      }),
      cushn_onboarded: 'true',
    }

    Object.defineProperty(globalThis, 'window', {
      value: globalThis,
      configurable: true,
    })
    Object.defineProperty(globalThis, 'localStorage', {
      value: {
        getItem: (key) => (key in storage ? storage[key] : null),
        setItem: (key, value) => {
          storage[key] = String(value)
        },
        removeItem: (key) => {
          delete storage[key]
        },
      },
      configurable: true,
    })
  })

  it('migrates guest core data, settings, notification preferences, and onboarding state', async () => {
    const result = await migrateLocalToSupabase('user-1')

    expect(result).toMatchObject({
      migratedSubs: 1,
      migratedCategories: 2,
    })
    expect(mocked.seedDefaultCategories).toHaveBeenCalledWith('user-1')
    expect(mocked.from).toHaveBeenCalledWith('notification_preferences')
    expect(mocked.saveCloudUserSettings).toHaveBeenCalledWith('user-1', {
      currency: 'INR',
      billTypeByCategory: { '1': 'utility' },
      themePreference: 'light',
    })
    expect(mocked.updateUser).toHaveBeenCalledWith({
      data: { cushn_onboarded: true },
    })
    expect(mocked.subscriptionsTable.clear).toHaveBeenCalled()
    expect(mocked.categoriesTable.clear).toHaveBeenCalled()
    expect(mocked.budgetTable.clear).toHaveBeenCalled()
  })
})
