import { createContext, useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from './AuthContext'
import {
    getBudget as dsGetBudget,
    saveBudget as dsSaveBudget,
    subscribeToChanges,
} from '../lib/dataService'
import { DEFAULT_BUDGET, DEFAULT_CURRENCY } from '../lib/constants'

export const BudgetContext = createContext(null)

export function BudgetProvider({ children }) {
    const { session, isAuthenticated, isLoading: isAuthLoading } = useAuth()
    const userId = isAuthenticated ? session?.user?.id : null
    const refreshTokenRef = useRef(0)

    const [budget, setBudget] = useState({ monthlyGoal: DEFAULT_BUDGET, currency: DEFAULT_CURRENCY })
    const [loading, setLoading] = useState(true)

    const refresh = useCallback(async () => {
        const refreshToken = ++refreshTokenRef.current
        try {
            const data = await dsGetBudget(userId)
            if (refreshToken !== refreshTokenRef.current) return
            setBudget(data)
        } catch (err) {
            if (refreshToken !== refreshTokenRef.current) return
            console.error('Failed to load budget:', err)
        } finally {
            if (refreshToken === refreshTokenRef.current) {
                setLoading(false)
            }
        }
    }, [userId])

    useEffect(() => {
        if (isAuthLoading) return
        setLoading(true)
        refresh()
    }, [isAuthLoading, refresh])

    // ─── Realtime sync (Supabase only) ──────────────────────────────────
    useEffect(() => {
        if (isAuthLoading || !userId) return

        const sub = subscribeToChanges(userId, {
            onSubscriptionChange: () => { },
            onCategoryChange: () => { },
            onBudgetChange: () => refresh(),
        })

        return () => sub.unsubscribe()
    }, [isAuthLoading, userId, refresh])

    const saveBudget = useCallback(async (data) => {
        const mutationToken = ++refreshTokenRef.current
        const updated = await dsSaveBudget(userId, data)
        if (mutationToken !== refreshTokenRef.current) return updated
        setBudget(updated)
        setLoading(false)
        return updated
    }, [userId])

    const value = {
        budget,
        loading,
        saveBudget,
        refresh,
    }

    return (
        <BudgetContext.Provider value={value}>
            {children}
        </BudgetContext.Provider>
    )
}
