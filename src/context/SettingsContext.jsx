import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from './AuthContext'
import {
    getLocalUserSettings,
    saveLocalUserSettings,
    getCloudUserSettings,
    saveCloudUserSettings,
    subscribeToCloudUserSettings,
} from '../lib/userSettings'

const SettingsContext = createContext(null)

// Standard list of supported currencies
export const SUPPORTED_CURRENCIES = [
    { code: 'USD', label: 'US Dollar', symbol: '$' },
    { code: 'EUR', label: 'Euro', symbol: '€' },
    { code: 'GBP', label: 'British Pound', symbol: '£' },
    { code: 'INR', label: 'Indian Rupee', symbol: '₹' },
    { code: 'JPY', label: 'Japanese Yen', symbol: '¥' },
    { code: 'CAD', label: 'Canadian Dollar', symbol: 'CA$' },
    { code: 'AUD', label: 'Australian Dollar', symbol: 'A$' },
    { code: 'CHF', label: 'Swiss Franc', symbol: 'CHF' },
    { code: 'CNY', label: 'Chinese Yuan', symbol: 'CN¥' },
    { code: 'BRL', label: 'Brazilian Real', symbol: 'R$' },
]

export function SettingsProvider({ children }) {
    const { session, isAuthenticated, isLoading: isAuthLoading } = useAuth()
    const userId = isAuthenticated ? session?.user?.id : null
    const localDefaults = getLocalUserSettings()
    const loadTokenRef = useRef(0)

    const [currency, setCurrencyState] = useState(localDefaults.currency)
    const [billTypeByCategory, setBillTypeByCategoryState] = useState(localDefaults.billTypeByCategory)
    const settingsRef = useRef({
        currency: localDefaults.currency,
        billTypeByCategory: localDefaults.billTypeByCategory,
    })

    const applySettings = useCallback((next) => {
        const merged = {
            ...settingsRef.current,
            ...next,
        }
        settingsRef.current = merged
        if (next.currency !== undefined) {
            setCurrencyState(merged.currency)
        }
        if (next.billTypeByCategory !== undefined) {
            setBillTypeByCategoryState(merged.billTypeByCategory)
        }
        saveLocalUserSettings(merged)
        return merged
    }, [])

    useEffect(() => {
        let cancelled = false

        async function loadSettings() {
            const loadToken = ++loadTokenRef.current
            if (isAuthLoading) return
            if (!userId) {
                const local = getLocalUserSettings()
                if (!cancelled && loadToken === loadTokenRef.current) {
                    applySettings(local)
                }
                return
            }

            try {
                const cloud = await getCloudUserSettings(userId)
                if (!cancelled && loadToken === loadTokenRef.current && cloud) {
                    applySettings(cloud)
                }
            } catch (err) {
                console.error('Failed to load cloud settings:', err)
            }
        }

        loadSettings()

        return () => {
            cancelled = true
        }
    }, [isAuthLoading, userId, applySettings])

    useEffect(() => {
        if (isAuthLoading || !userId) return undefined

        const subscription = subscribeToCloudUserSettings(userId, async () => {
            try {
                const cloud = await getCloudUserSettings(userId)
                if (cloud) {
                    applySettings(cloud)
                }
            } catch (err) {
                console.error('Failed to sync cloud settings:', err)
            }
        })

        return () => subscription.unsubscribe()
    }, [isAuthLoading, userId, applySettings])

    const persistSettings = useCallback(async (patch) => {
        const merged = applySettings(patch)
        if (!userId) return merged

        try {
            const saved = await saveCloudUserSettings(userId, patch)
            if (saved) {
                applySettings(saved)
                return saved
            }
        } catch (err) {
            console.error('Failed to save cloud settings:', err)
        }

        return merged
    }, [userId, applySettings])

    const setCurrency = (nextCurrency) => {
        void persistSettings({ currency: nextCurrency })
    }

    const setCategoryBillType = (categoryId, billType) => {
        if (categoryId == null) return
        const key = String(categoryId)
        void persistSettings({
            billTypeByCategory: {
                ...settingsRef.current.billTypeByCategory,
                [key]: billType,
            },
        })
    }

    const clearCategoryBillType = (categoryId) => {
        if (categoryId == null) return
        const key = String(categoryId)
        if (!(key in settingsRef.current.billTypeByCategory)) return
        const next = { ...settingsRef.current.billTypeByCategory }
        delete next[key]
        void persistSettings({ billTypeByCategory: next })
    }

    const resetBillTypeMapping = () => {
        void persistSettings({ billTypeByCategory: {} })
    }

    const getCurrencyDetails = () => {
        return SUPPORTED_CURRENCIES.find(c => c.code === currency) || SUPPORTED_CURRENCIES[0]
    }

    return (
        <SettingsContext.Provider
            value={{
                currency,
                setCurrency,
                getCurrencyDetails,
                billTypeByCategory,
                setCategoryBillType,
                clearCategoryBillType,
                resetBillTypeMapping,
            }}
        >
            {children}
        </SettingsContext.Provider>
    )
}

export function useSettings() {
    const ctx = useContext(SettingsContext)
    if (!ctx) throw new Error('useSettings must be used within SettingsProvider')
    return ctx
}
