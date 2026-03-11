import { describe, expect, it } from 'vitest'

import {
  getWorthReconsideringSubscriptions,
  hasReviewedBadge,
  isSubscriptionCountedInSpend,
  shouldSurfaceReview,
} from '../lib/reviewState'

describe('reviewState', () => {
  const categoryMap = {
    ent: 'Entertainment',
    prod: 'Productivity',
    util: 'Utilities',
  }
  const getCategoryName = (categoryId) => categoryMap[categoryId] || 'Other'

  it('keeps scheduled cancellations in spend until the end date passes', () => {
    expect(isSubscriptionCountedInSpend({
      status: 'active',
      cancelledAt: '2026-03-10',
      endsAt: '2026-03-28',
    }, new Date('2026-03-12T12:00:00Z'))).toBe(true)

    expect(isSubscriptionCountedInSpend({
      status: 'active',
      cancelledAt: '2026-03-10',
      endsAt: '2026-03-28',
    }, new Date('2026-03-29T12:00:00Z'))).toBe(false)
  })

  it('suppresses reviewed and snoozed reconsideration picks from resurfacing', () => {
    const subscriptions = [
      {
        id: 'reviewed',
        status: 'active',
        amount: 20,
        cycle: 'monthly',
        categoryId: 'ent',
        reviewedAt: '2026-03-01',
      },
      {
        id: 'snoozed',
        status: 'active',
        amount: 18,
        cycle: 'monthly',
        categoryId: 'ent',
        snoozedUntil: '2026-03-25',
      },
      {
        id: 'eligible',
        status: 'active',
        amount: 14,
        cycle: 'monthly',
        categoryId: 'ent',
      },
    ]

    expect(shouldSurfaceReview({
      id: 'reviewed',
      status: 'active',
      amount: 20,
      cycle: 'monthly',
      categoryId: 'ent',
      reviewedAt: '2026-03-01',
    }, getCategoryName, subscriptions, new Date('2026-03-10T12:00:00Z'))).toBe(false)

    expect(shouldSurfaceReview({
      id: 'snoozed',
      status: 'active',
      amount: 20,
      cycle: 'monthly',
      categoryId: 'ent',
      snoozedUntil: '2026-03-25',
    }, getCategoryName, subscriptions, new Date('2026-03-10T12:00:00Z'))).toBe(false)
  })

  it('flags the top 30 percent by monthly cost instead of a fixed threshold', () => {
    const subscriptions = [
      { id: 'netflix', status: 'active', amount: 24.99, cycle: 'monthly', categoryId: 'ent' },
      { id: 'youtube', status: 'active', amount: 13.99, cycle: 'monthly', categoryId: 'ent' },
      { id: 'disney', status: 'active', amount: 13.99, cycle: 'monthly', categoryId: 'ent' },
      { id: 'spotify', status: 'active', amount: 10.99, cycle: 'monthly', categoryId: 'ent' },
    ]

    const worthReconsidering = getWorthReconsideringSubscriptions(
      subscriptions,
      getCategoryName,
      new Date('2026-03-10T12:00:00Z'),
    )

    expect(worthReconsidering.map((subscription) => subscription.id)).toEqual([
      'netflix',
      'youtube',
    ])
  })

  it('excludes essential categories from review candidates', () => {
    const subscriptions = [
      { id: 'power', status: 'active', amount: 120, cycle: 'monthly', categoryId: 'util' },
      { id: 'netflix', status: 'active', amount: 24.99, cycle: 'monthly', categoryId: 'ent' },
      { id: 'spotify', status: 'active', amount: 10.99, cycle: 'monthly', categoryId: 'ent' },
    ]

    const worthReconsidering = getWorthReconsideringSubscriptions(
      subscriptions,
      getCategoryName,
      new Date('2026-03-10T12:00:00Z'),
    )

    expect(worthReconsidering.map((subscription) => subscription.id)).toEqual(['netflix'])
  })

  it('flags older unreviewed subscriptions and duplicate vendors even below the top cost cutoff', () => {
    const subscriptions = [
      { id: 'netflix', status: 'active', name: 'Netflix', amount: 24.99, cycle: 'monthly', categoryId: 'ent' },
      { id: 'spotify-a', status: 'active', name: 'Spotify', amount: 10.99, cycle: 'monthly', categoryId: 'prod' },
      { id: 'spotify-b', status: 'active', name: 'Spotify', amount: 10.99, cycle: 'monthly', categoryId: 'prod' },
      { id: 'old-sub', status: 'active', name: 'Headspace', amount: 8.99, cycle: 'monthly', categoryId: 'prod', createdAt: '2025-10-01T00:00:00Z' },
    ]

    const worthReconsidering = getWorthReconsideringSubscriptions(
      subscriptions,
      getCategoryName,
      new Date('2026-03-10T12:00:00Z'),
    )

    expect(worthReconsidering.map((subscription) => subscription.id)).toEqual([
      'netflix',
      'spotify-a',
      'spotify-b',
      'old-sub',
    ])
  })

  it('shows reviewed badge when a subscription has been kept', () => {
    expect(hasReviewedBadge({ reviewedAt: '2026-03-10' })).toBe(true)
    expect(hasReviewedBadge({ reviewedAt: null })).toBe(false)
  })
})
