import { describe, expect, it } from 'vitest'

import {
  buildSystemHistoryLine,
  deriveSavingsHistory,
  splitNotesPayload,
} from '../lib/subscriptionHistory'

describe('subscriptionHistory', () => {
  it('separates user notes from system history lines', () => {
    const payload = splitNotesPayload([
      'Family plan',
      buildSystemHistoryLine('Amount updated to $19.99', '2026-03-01'),
      buildSystemHistoryLine('Marked cancelled effective March 15, 2026', '2026-03-10'),
    ].join('\n'))

    expect(payload.userNotes).toBe('Family plan')
    expect(payload.history).toEqual([
      { date: '2026-03-01', text: 'Amount updated to $19.99' },
      { date: '2026-03-10', text: 'Marked cancelled effective March 15, 2026' },
    ])
  })

  it('derives savings events and totals from cancellation history', () => {
    const result = deriveSavingsHistory([
      {
        id: 'sub-1',
        name: 'Netflix',
        amount: 15,
        cycle: 'monthly',
        categoryId: 'entertainment',
        status: 'cancelled',
        notes: buildSystemHistoryLine('Marked cancelled effective March 15, 2026', '2026-03-10'),
      },
      {
        id: 'sub-2',
        name: 'Dropbox',
        amount: 120,
        cycle: 'annual',
        categoryId: 'productivity',
        status: 'active',
        notes: buildSystemHistoryLine('Marked cancelled effective April 1, 2026', '2026-04-01'),
      },
    ], new Date('2026-04-14T12:00:00.000Z'))

    expect(result.events).toHaveLength(2)
    expect(result.events[0]).toMatchObject({
      subscriptionId: 'sub-2',
      monthlyValue: 10,
      annualValue: 120,
      effectiveDate: '2026-04-01',
      elapsedDays: 13,
    })
    expect(result.events[1]).toMatchObject({
      subscriptionId: 'sub-1',
      monthlyValue: 15,
      annualValue: 180,
      effectiveDate: '2026-03-15',
      elapsedDays: 30,
    })
    expect(result.totalSavedToDate).toBeCloseTo(19.05, 2)
    expect(result.activeMonthlySavings).toBe(25)
    expect(result.activeAnnualSavings).toBe(300)
  })
})
