import { normalizeToMonthly } from './normalizeAmount'
import { buildVendorFingerprint, enrichSubscriptionCandidate } from './vendorEnrichment'

function roundCurrency(value) {
    return Math.round(value * 100) / 100
}

export function buildDuplicateVendorInsights(subscriptions) {
    const enrichedActive = subscriptions.map((sub) => {
        const monthlyValue = normalizeToMonthly(sub.amount, sub.cycle)
        return {
            ...sub,
            monthlyValue,
            annualValue: monthlyValue * 12,
        }
    })

    const vendorBuckets = new Map()
    enrichedActive.forEach((sub) => {
        const enrichedVendor = enrichSubscriptionCandidate(sub)
        const key = buildVendorFingerprint({
            name: enrichedVendor.name,
            vendorDomain: enrichedVendor.vendorDomain,
        })

        if (!vendorBuckets.has(key)) {
            vendorBuckets.set(key, {
                label: enrichedVendor.name,
                vendorDomain: enrichedVendor.vendorDomain,
                subscriptions: [],
                totalMonthly: 0,
                totalAnnual: 0,
                recoverableAnnual: 0,
            })
        }

        const bucket = vendorBuckets.get(key)
        bucket.subscriptions.push(sub)
        bucket.totalMonthly = roundCurrency(bucket.totalMonthly + sub.monthlyValue)
        bucket.totalAnnual = roundCurrency(bucket.totalAnnual + sub.annualValue)
    })

    const groups = [...vendorBuckets.values()]
        .filter((bucket) => bucket.subscriptions.length > 1)
        .sort((a, b) => b.totalMonthly - a.totalMonthly)
        .map((bucket) => {
            const sorted = [...bucket.subscriptions].sort((a, b) => b.monthlyValue - a.monthlyValue)
            const recoverableMonthly = roundCurrency(sorted.slice(1).reduce((sum, sub) => sum + sub.monthlyValue, 0))
            return {
                ...bucket,
                recoverableMonthly,
                recoverableAnnual: roundCurrency(recoverableMonthly * 12),
            }
        })

    return {
        groups,
        duplicateVendorSavingsMonthly: roundCurrency(groups.reduce((sum, bucket) => sum + bucket.recoverableMonthly, 0)),
    }
}

export function buildBudgetScenario(monthlyTotal, goal, candidates, selectedIds) {
    const selectedSet = new Set(selectedIds)
    const simulatedSavings = candidates
        .filter((sub) => selectedSet.has(sub.id))
        .reduce((sum, sub) => sum + sub.monthlyValue, 0)
    const simulatedSpend = roundCurrency(Math.max(monthlyTotal - simulatedSavings, 0))
    const simulatedRemaining = roundCurrency(Math.max(goal - simulatedSpend, 0))
    const simulatedAnnualSavings = roundCurrency(simulatedSavings * 12)
    const overBy = Math.max(monthlyTotal - goal, 0)

    return {
        simulatedSavings: roundCurrency(simulatedSavings),
        simulatedSpend,
        simulatedRemaining,
        simulatedAnnualSavings,
        savingsOpportunity: roundCurrency(overBy > 0 ? Math.min(simulatedSavings, overBy) : simulatedSavings),
    }
}

export function summarizeRenewalMaps(renewalMap, previousRenewalMap) {
    const currentRenewals = Object.values(renewalMap).flat()
    const previousRenewals = Object.values(previousRenewalMap).flat()
    const currentMonthTotal = roundCurrency(currentRenewals.reduce((sum, sub) => sum + Number(sub.amount || 0), 0))
    const previousMonthTotal = roundCurrency(previousRenewals.reduce((sum, sub) => sum + Number(sub.amount || 0), 0))
    const currentMonthCount = currentRenewals.length
    const previousMonthCount = previousRenewals.length
    const dayTotals = Object.entries(renewalMap).map(([day, subs]) => ({
        day: Number(day),
        total: subs.reduce((sum, sub) => sum + Number(sub.amount || 0), 0),
    }))
    const heaviestDay = [...dayTotals].sort((a, b) => b.total - a.total)[0] || null

    return {
        currentRenewals,
        previousRenewals,
        currentMonthTotal,
        previousMonthTotal,
        currentMonthCount,
        previousMonthCount,
        monthTotalDelta: roundCurrency(currentMonthTotal - previousMonthTotal),
        monthCountDelta: currentMonthCount - previousMonthCount,
        dayTotals,
        heaviestDay,
    }
}
