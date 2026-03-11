import { normalizeToMonthly } from './normalizeAmount'
import { buildVendorFingerprint, enrichSubscriptionCandidate } from './vendorEnrichment'

const REVIEW_SUPPRESSION_DAYS = 90
const REMIND_LATER_DAYS = 30
const REVIEW_AGE_DAYS = 90
const TOP_REVIEW_PERCENT = 0.3
const ESSENTIAL_CATEGORY_KEYWORDS = ['utility', 'utilities', 'insurance', 'debt', 'loan', 'auto', 'transport']

function startOfDay(value) {
    if (!value) return null
    const date = typeof value === 'string'
        ? new Date(value.includes('T') ? value : `${value}T00:00:00`)
        : new Date(value)
    if (Number.isNaN(date.getTime())) return null
    date.setHours(0, 0, 0, 0)
    return date
}

export function getTodayDate() {
    return new Date().toISOString().slice(0, 10)
}

export function addDays(value, days) {
    const date = startOfDay(value || new Date())
    if (!date) return null
    date.setDate(date.getDate() + days)
    return date.toISOString().slice(0, 10)
}

export function isFutureDate(value, asOf = new Date()) {
    const date = startOfDay(value)
    const compare = startOfDay(asOf)
    if (!date || !compare) return false
    return date.getTime() >= compare.getTime()
}

export function hasCancellationEnded(subscription, asOf = new Date()) {
    if (!subscription?.endsAt) return subscription?.status === 'cancelled'
    return !isFutureDate(subscription.endsAt, asOf)
}

export function isSubscriptionCountedInSpend(subscription, asOf = new Date()) {
    if (!subscription) return false
    if (subscription.status === 'paused') return false
    if (subscription.status === 'cancelled') {
        return Boolean(subscription.endsAt) && isFutureDate(subscription.endsAt, asOf)
    }
    if (subscription.cancelledAt && subscription.endsAt) {
        return isFutureDate(subscription.endsAt, asOf)
    }
    return subscription.status === 'active'
}

export function getSubscriptionMonthlyValue(subscription) {
    return normalizeToMonthly(Number(subscription?.amount || 0), subscription?.cycle)
}

export function getSubscriptionAnnualValue(subscription) {
    return getSubscriptionMonthlyValue(subscription) * 12
}

function getCategoryLabel(subscription, getCategoryName) {
    return String(getCategoryName?.(subscription?.categoryId) || subscription?.category || 'Other')
}

function isEssentialCategory(subscription, getCategoryName) {
    const category = getCategoryLabel(subscription, getCategoryName).toLowerCase()
    return ESSENTIAL_CATEGORY_KEYWORDS.some((keyword) => category.includes(keyword))
}

function hasDuplicateVendor(subscription, subscriptions) {
    if (!subscription || !Array.isArray(subscriptions) || subscriptions.length === 0) return false
    const enriched = enrichSubscriptionCandidate(subscription)
    if (!String(enriched?.name || '').trim() && !enriched?.vendorDomain) return false
    const fingerprint = buildVendorFingerprint({
        name: enriched.name,
        vendorDomain: enriched.vendorDomain,
    })

    return subscriptions.some((candidate) => {
        if (!candidate || candidate.id === subscription.id) return false
        const enrichedCandidate = enrichSubscriptionCandidate(candidate)
        const candidateFingerprint = buildVendorFingerprint({
            name: enrichedCandidate.name,
            vendorDomain: enrichedCandidate.vendorDomain,
        })
        return candidateFingerprint === fingerprint
    })
}

function isOlderThanDays(value, days, asOf = new Date()) {
    const date = startOfDay(value)
    const compare = startOfDay(asOf)
    if (!date || !compare) return false
    const threshold = new Date(compare)
    threshold.setDate(threshold.getDate() - days)
    return date.getTime() <= threshold.getTime()
}

export function getWorthReconsideringSubscriptions(subscriptions, getCategoryName, asOf = new Date()) {
    const active = (subscriptions || []).filter((subscription) => (
        isSubscriptionCountedInSpend(subscription, asOf)
        && !isReviewSuppressed(subscription, asOf)
        && !isEssentialCategory(subscription, getCategoryName)
    ))

    if (active.length === 0) return []

    const sortedByCost = [...active].sort((left, right) => (
        getSubscriptionMonthlyValue(right) - getSubscriptionMonthlyValue(left)
    ))
    const topCount = Math.max(1, Math.ceil(sortedByCost.length * TOP_REVIEW_PERCENT))
    const selected = new Map(sortedByCost.slice(0, topCount).map((subscription) => [subscription.id, subscription]))

    active.forEach((subscription) => {
        if (!subscription?.reviewedAt && isOlderThanDays(subscription?.createdAt, REVIEW_AGE_DAYS, asOf)) {
            selected.set(subscription.id, subscription)
        }
        if (hasDuplicateVendor(subscription, active)) {
            selected.set(subscription.id, subscription)
        }
    })

    return [...selected.values()].sort((left, right) => (
        getSubscriptionMonthlyValue(right) - getSubscriptionMonthlyValue(left)
    ))
}

export function isTrimCandidate(subscription, getCategoryName, subscriptions = [], asOf = new Date()) {
    return getWorthReconsideringSubscriptions(subscriptions, getCategoryName, asOf)
        .some((candidate) => candidate.id === subscription?.id)
}

export function isReviewSuppressed(subscription, asOf = new Date()) {
    if (!subscription) return true
    if (subscription.snoozedUntil && isFutureDate(subscription.snoozedUntil, asOf)) return true
    if (subscription.reviewedAt && isFutureDate(addDays(subscription.reviewedAt, REVIEW_SUPPRESSION_DAYS), asOf)) return true
    return false
}

export function shouldSurfaceReview(subscription, getCategoryName, subscriptions = [], asOf = new Date()) {
    return isTrimCandidate(subscription, getCategoryName, subscriptions, asOf)
}

export function hasReviewedBadge(subscription) {
    return Boolean(subscription?.reviewedAt)
}

export function getReviewSuppressionDate(type, fromDate = new Date()) {
    return addDays(fromDate, type === 'keep' ? REVIEW_SUPPRESSION_DAYS : REMIND_LATER_DAYS)
}
