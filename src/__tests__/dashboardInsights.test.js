import { describe, expect, it } from 'vitest'

import {
  buildBudgetScenario,
  buildDuplicateVendorInsights,
  summarizeRenewalMaps,
} from '../lib/dashboardInsights'

describe('dashboardInsights', () => {
  it('groups duplicate vendors and computes recoverable savings', () => {
    const { groups, duplicateVendorSavingsMonthly } = buildDuplicateVendorInsights([
      { id: 1, name: 'Spotify Premium', amount: 11.99, cycle: 'monthly' },
      { id: 2, name: 'Spotify Family', amount: 16.99, cycle: 'monthly' },
      { id: 3, name: 'Netflix', amount: 15.49, cycle: 'monthly' },
    ])

    expect(groups).toHaveLength(1)
    expect(groups[0]).toMatchObject({
      label: 'Spotify Premium',
      totalMonthly: 28.98,
      recoverableMonthly: 11.99,
      recoverableAnnual: 143.88,
    })
    expect(duplicateVendorSavingsMonthly).toBe(11.99)
  })

  it('computes budget scenario values from selected cuts', () => {
    const scenario = buildBudgetScenario(
      120,
      100,
      [
        { id: 'a', monthlyValue: 15 },
        { id: 'b', monthlyValue: 22 },
      ],
      ['b'],
    )

    expect(scenario).toMatchObject({
      simulatedSavings: 22,
      simulatedSpend: 98,
      simulatedRemaining: 2,
      simulatedAnnualSavings: 264,
      savingsOpportunity: 20,
    })
  })

  it('summarizes renewal maps and finds the heaviest day', () => {
    const summary = summarizeRenewalMaps(
      {
        5: [{ amount: 12 }, { amount: 8 }],
        12: [{ amount: 30 }],
      },
      {
        3: [{ amount: 10 }],
      },
    )

    expect(summary).toMatchObject({
      currentMonthTotal: 50,
      previousMonthTotal: 10,
      currentMonthCount: 3,
      previousMonthCount: 1,
      monthTotalDelta: 40,
      monthCountDelta: 2,
      heaviestDay: { day: 12, total: 30 },
    })
  })
})
