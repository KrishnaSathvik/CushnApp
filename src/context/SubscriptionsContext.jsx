import { createContext, useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from './AuthContext'
import {
    getSubscriptions,
    addSubscription as dsAdd,
    addSubscriptionsBulk as dsAddBulk,
    updateSubscription as dsUpdate,
    deleteSubscription as dsDelete,
    clearAllSubscriptions as dsClearAll,
    pauseSubscription as dsPause,
    getCategories,
    addCategory as dsAddCategory,
    updateCategory as dsUpdateCategory,
    deleteCategory as dsDeleteCategory,
    subscribeToChanges,
} from '../lib/dataService'
import { normalizeToMonthly } from '../lib/normalizeAmount'

export const SubscriptionsContext = createContext(null)
const DASHBOARD_CACHE_PREFIX = 'cushn_dashboard_cache'

function getDashboardCache(userId) {
    if (!userId || typeof window === 'undefined') return null
    try {
        const raw = localStorage.getItem(`${DASHBOARD_CACHE_PREFIX}:${userId}`)
        return raw ? JSON.parse(raw) : null
    } catch {
        return null
    }
}

function saveDashboardCache(userId, payload) {
    if (!userId || typeof window === 'undefined') return
    try {
        localStorage.setItem(`${DASHBOARD_CACHE_PREFIX}:${userId}`, JSON.stringify(payload))
    } catch {
        // Ignore storage write failures.
    }
}

function sortSubscriptionsByRenewalDate(items) {
    return [...items].sort((a, b) => {
        const left = a?.renewalDate ? new Date(a.renewalDate).getTime() : Number.MAX_SAFE_INTEGER
        const right = b?.renewalDate ? new Date(b.renewalDate).getTime() : Number.MAX_SAFE_INTEGER
        return left - right
    })
}

export function SubscriptionsProvider({ children }) {
    const { session, isAuthenticated, isLoading: isAuthLoading } = useAuth()
    const userId = isAuthenticated ? session?.user?.id : null
    const refreshTokenRef = useRef(0)

    const [subscriptions, setSubscriptions] = useState([])
    const [categories, setCategories] = useState([])
    const [monthlyTotal, setMonthlyTotal] = useState(0)
    const [loading, setLoading] = useState(true)

    const refresh = useCallback(async ({ soft = false } = {}) => {
        const refreshToken = ++refreshTokenRef.current
        if (!soft) {
            setLoading(true)
        }
        try {
            const subs = await getSubscriptions(userId)
            if (refreshToken !== refreshTokenRef.current) return
            const total = subs
                .filter((sub) => sub.status === 'active')
                .reduce((sum, sub) => sum + normalizeToMonthly(sub.amount, sub.cycle), 0)
            const cached = getDashboardCache(userId)
            setSubscriptions(subs)
            setMonthlyTotal(total)
            setLoading(false)
            saveDashboardCache(userId, {
                subscriptions: subs,
                categories: Array.isArray(cached?.categories) ? cached.categories : [],
                monthlyTotal: total,
            })

            void getCategories(userId)
                .then((cats) => {
                    if (refreshToken !== refreshTokenRef.current) return
                    setCategories(cats)
                    saveDashboardCache(userId, {
                        subscriptions: subs,
                        categories: cats,
                        monthlyTotal: total,
                    })
                })
                .catch((err) => {
                    if (refreshToken !== refreshTokenRef.current) return
                    console.error('Failed to load categories:', err)
                })
        } catch (err) {
            if (refreshToken !== refreshTokenRef.current) return
            console.error('Failed to load subscriptions:', err)
            setLoading(false)
        }
    }, [userId])

    useEffect(() => {
        if (isAuthLoading) return
        const cached = getDashboardCache(userId)
        if (cached) {
            const timer = setTimeout(() => {
                setSubscriptions(Array.isArray(cached.subscriptions) ? cached.subscriptions : [])
                setCategories(Array.isArray(cached.categories) ? cached.categories : [])
                setMonthlyTotal(Number(cached.monthlyTotal) || 0)
                setLoading(false)
                void refresh({ soft: true })
            }, 0)
            return () => clearTimeout(timer)
        }
        const timer = setTimeout(() => {
            void refresh()
        }, 0)
        return () => clearTimeout(timer)
    }, [isAuthLoading, userId, refresh])

    // ─── Realtime sync (Supabase only) ──────────────────────────────────
    useEffect(() => {
        if (isAuthLoading || !userId) return

        const sub = subscribeToChanges(userId, {
            onSubscriptionChange: () => refresh(),
            onCategoryChange: () => refresh(),
            onBudgetChange: () => { }, // handled by useBudget
        })

        return () => sub.unsubscribe()
    }, [isAuthLoading, userId, refresh])

    // Group subscriptions by cycle
    const grouped = {
        monthly: subscriptions.filter(s => s.status === 'active' && s.cycle === 'monthly'),
        annual: subscriptions.filter(s => s.status === 'active' && (s.cycle === 'annual' || s.cycle === 'yearly')),
        other: subscriptions.filter(s => s.status === 'active' && !['monthly', 'annual', 'yearly'].includes(s.cycle)),
        paused: subscriptions.filter(s => s.status === 'paused'),
    }

    // Get category by id
    const getCategoryName = (catId) => {
        const cat = categories.find(c => c.id === catId)
        return cat ? cat.name : 'Other'
    }

    const getCategoryColorById = (catId) => {
        const cat = categories.find(c => c.id === catId)
        return cat ? cat.color : '#6B7280'
    }

    // Days until renewal
    const daysUntilRenewal = (renewalDate) => {
        if (!renewalDate) return null
        const now = new Date()
        const renewal = new Date(renewalDate)
        const diff = Math.ceil((renewal - now) / (1000 * 60 * 60 * 24))
        return diff
    }

    // Annual total projection
    const annualTotal = subscriptions
        .filter(s => s.status === 'active')
        .reduce((sum, sub) => {
            return sum + normalizeToMonthly(sub.amount, sub.cycle) * 12
        }, 0)

    // Next renewal
    const nextRenewal = subscriptions
        .filter(s => s.status === 'active' && s.renewalDate)
        .sort((a, b) => new Date(a.renewalDate) - new Date(b.renewalDate))
        .find(s => daysUntilRenewal(s.renewalDate) >= 0)

    const value = {
        subscriptions,
        categories,
        grouped,
        monthlyTotal,
        annualTotal,
        nextRenewal,
        loading,
        getCategoryName,
        getCategoryColorById,
        daysUntilRenewal,
        addSubscription: async (data) => {
            await dsAdd(userId, data)
            await refresh()
        },
        addSubscriptionsBulk: async (items) => {
            const inserted = await dsAddBulk(userId, items)
            setSubscriptions((prev) => {
                const next = sortSubscriptionsByRenewalDate([...prev, ...inserted])
                const nextTotal = next
                    .filter((sub) => sub.status === 'active')
                    .reduce((sum, sub) => sum + normalizeToMonthly(sub.amount, sub.cycle), 0)
                setMonthlyTotal(nextTotal)
                saveDashboardCache(userId, {
                    subscriptions: next,
                    categories,
                    monthlyTotal: nextTotal,
                })
                return next
            })
            void refresh({ soft: true })
            return inserted
        },
        updateSubscription: async (id, data) => {
            await dsUpdate(userId, id, data)
            await refresh()
        },
        deleteSubscription: async (id) => {
            await dsDelete(userId, id)
            await refresh()
        },
        clearAllSubscriptions: async () => {
            await dsClearAll(userId)
            await refresh()
        },
        pauseSubscription: async (id) => {
            await dsPause(userId, id)
            await refresh()
        },
        addCategory: async (data) => {
            const added = await dsAddCategory(userId, data)
            await refresh()
            return added
        },
        updateCategory: async (id, data) => {
            await dsUpdateCategory(userId, id, data)
            await refresh()
        },
        deleteCategory: async (id, fallbackCategoryId) => {
            await dsDeleteCategory(userId, id, fallbackCategoryId)
            await refresh()
        },
        refresh,
    }

    return (
        <SubscriptionsContext.Provider value={value}>
            {children}
        </SubscriptionsContext.Provider>
    )
}
