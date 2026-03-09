import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocked = vi.hoisted(() => ({
  isConfigured: false,
  from: vi.fn(),
  channel: vi.fn(() => ({ on: vi.fn().mockReturnThis(), subscribe: vi.fn() })),
  removeChannel: vi.fn(),
  dexieGetAll: vi.fn(),
  dexieGetById: vi.fn(),
  dexieAdd: vi.fn(),
  dexieUpdate: vi.fn(),
  dexieDelete: vi.fn(),
  dexiePause: vi.fn(),
  dexieGetCategories: vi.fn(),
  dexieAddCategory: vi.fn(),
  dexieUpdateCategory: vi.fn(),
  dexieDeleteCategory: vi.fn(),
  dexieGetBudget: vi.fn(),
  dexieUpdateBudget: vi.fn(),
  dexieGetMonthlyTotal: vi.fn(),
  dexieSeedDefaults: vi.fn(),
}))

vi.mock('../lib/supabase', () => ({
  supabase: {
    from: mocked.from,
    channel: mocked.channel,
    removeChannel: mocked.removeChannel,
  },
  isSupabaseConfigured: () => mocked.isConfigured,
}))

vi.mock('../db', () => ({
  getAllSubscriptions: mocked.dexieGetAll,
  getSubscriptionById: mocked.dexieGetById,
  addSubscription: mocked.dexieAdd,
  updateSubscription: mocked.dexieUpdate,
  deleteSubscription: mocked.dexieDelete,
  pauseSubscription: mocked.dexiePause,
  getAllCategories: mocked.dexieGetCategories,
  addCategory: mocked.dexieAddCategory,
  updateCategory: mocked.dexieUpdateCategory,
  deleteCategory: mocked.dexieDeleteCategory,
  getBudget: mocked.dexieGetBudget,
  updateBudget: mocked.dexieUpdateBudget,
  getMonthlyTotal: mocked.dexieGetMonthlyTotal,
  seedDefaults: mocked.dexieSeedDefaults,
}))

import {
  getSubscriptions,
  saveBudget,
  addCategory,
  getNotificationPreferences,
  getInAppNotificationEvents,
  markNotificationEventHandled,
} from '../lib/dataService'

function makeQuery(result, method = 'single') {
  const query = {
    select: vi.fn(() => query),
    eq: vi.fn(() => query),
    lte: vi.fn(() => query),
    order: vi.fn(() => query),
    limit: vi.fn(() => query),
    update: vi.fn(() => query),
    upsert: vi.fn(() => query),
    insert: vi.fn(() => query),
    single: vi.fn(),
    maybeSingle: vi.fn(),
  }
  query[method] = vi.fn().mockResolvedValue(result)
  return query
}

describe('dataService cloud/guest behavior', () => {
  beforeEach(() => {
    mocked.isConfigured = false
    mocked.from.mockReset()
    mocked.dexieGetAll.mockReset()
    mocked.dexieAddCategory.mockReset()
    mocked.dexieUpdateBudget.mockReset()
  })

  it('uses Dexie for guest subscriptions', async () => {
    mocked.dexieGetAll.mockResolvedValue([{ id: 1, name: 'Netflix' }])

    const result = await getSubscriptions(null)

    expect(mocked.dexieGetAll).toHaveBeenCalledTimes(1)
    expect(result).toEqual([{ id: 1, name: 'Netflix' }])
  })

  it('uses Supabase for authenticated subscriptions', async () => {
    mocked.isConfigured = true
    const query = makeQuery({
      data: [{
        id: 'sub-1',
        name: 'GitHub',
        amount: '4.00',
        currency: 'USD',
        cycle: 'monthly',
        category_id: 'cat-1',
        start_date: null,
        renewal_date: '2026-03-20',
        status: 'active',
        notes: '',
        icon: '',
        raw_input: '',
        vendor_domain: 'github.com',
        vendor_confidence: '0.98',
        vendor_match_type: 'exact',
        created_at: '2026-03-01T00:00:00.000Z',
      }],
      error: null,
    }, 'order')
    mocked.from.mockReturnValue(query)

    const result = await getSubscriptions('user-1')

    expect(mocked.from).toHaveBeenCalledWith('subscriptions')
    expect(result[0]).toMatchObject({
      id: 'sub-1',
      amount: 4,
      categoryId: 'cat-1',
      renewalDate: '2026-03-20',
      vendorDomain: 'github.com',
      vendorConfidence: 0.98,
      vendorMatchType: 'exact',
    })
  })

  it('preserves existing cloud budget fields on partial save', async () => {
    mocked.isConfigured = true
    const selectQuery = makeQuery({
      data: {
        id: 'budget-1',
        monthly_goal: 300,
        currency: 'USD',
        category_limits: { entertainment: 100 },
      },
      error: null,
    }, 'maybeSingle')
    const updateQuery = makeQuery({
      data: {
        id: 'budget-1',
        monthly_goal: 250,
        currency: 'USD',
        category_limits: { entertainment: 100 },
        updated_at: '2026-03-04T10:00:00.000Z',
      },
      error: null,
    })
    mocked.from
      .mockReturnValueOnce(selectQuery)
      .mockReturnValueOnce(updateQuery)

    const result = await saveBudget('user-1', { monthlyGoal: 250 })

    expect(updateQuery.upsert).toHaveBeenCalledWith(expect.objectContaining({
      monthly_goal: 250,
      currency: 'USD',
      category_limits: { entertainment: 100 },
    }), { onConflict: 'user_id' })
    expect(result.monthlyGoal).toBe(250)
    expect(result.currency).toBe('USD')
  })

  it('uses Dexie for guest addCategory', async () => {
    mocked.dexieAddCategory.mockResolvedValue({ id: 5, name: 'Travel', color: '#0D9488' })

    const result = await addCategory(null, { name: 'Travel', color: '#0D9488' })

    expect(mocked.dexieAddCategory).toHaveBeenCalledWith({ name: 'Travel', color: '#0D9488' })
    expect(result).toEqual({ id: 5, name: 'Travel', color: '#0D9488' })
  })

  it('returns default notification preferences for guest mode', async () => {
    const result = await getNotificationPreferences(null)
    expect(result).toMatchObject({
      inAppEnabled: true,
      emailEnabled: false,
      daysBefore: [1, 3],
      timezone: 'UTC',
    })
  })

  it('loads queued in-app reminders for authenticated users', async () => {
    mocked.isConfigured = true
    const query = makeQuery({
      data: [{
        id: 'evt-1',
        user_id: 'user-1',
        subscription_id: 'sub-1',
        renewal_date: '2026-03-08',
        reminder_date: '2026-03-07',
        channel: 'in_app',
        status: 'queued',
        error_text: '',
        sent_at: null,
        created_at: '2026-03-06T12:00:00.000Z',
      }],
      error: null,
    }, 'limit')
    mocked.from.mockReturnValue(query)

    const result = await getInAppNotificationEvents('user-1')

    expect(mocked.from).toHaveBeenCalledWith('notification_events')
    expect(result).toEqual([
      expect.objectContaining({
        id: 'evt-1',
        subscriptionId: 'sub-1',
        channel: 'in_app',
        status: 'queued',
      }),
    ])
  })

  it('marks an in-app reminder as handled', async () => {
    mocked.isConfigured = true
    const query = makeQuery({
      data: {
        id: 'evt-1',
        user_id: 'user-1',
        subscription_id: 'sub-1',
        renewal_date: '2026-03-08',
        reminder_date: '2026-03-07',
        channel: 'in_app',
        status: 'sent',
        error_text: '',
        sent_at: '2026-03-06T13:00:00.000Z',
        created_at: '2026-03-06T12:00:00.000Z',
      },
      error: null,
    })
    mocked.from.mockReturnValue(query)

    const result = await markNotificationEventHandled('user-1', 'evt-1')

    expect(query.update).toHaveBeenCalledWith(expect.objectContaining({
      status: 'sent',
      error_text: '',
    }))
    expect(result).toEqual(expect.objectContaining({
      id: 'evt-1',
      status: 'sent',
    }))
  })
})
