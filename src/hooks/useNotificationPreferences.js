import { useCallback, useEffect, useRef, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { getNotificationPreferences, saveNotificationPreferences } from '../lib/dataService'

const GUEST_PREF_KEY = 'subtrackr_notify_pref'
const DEFAULT_PREFS = {
    inAppEnabled: true,
    emailEnabled: true,
    daysBefore: [1, 3],
    timezone: 'UTC',
}

export default function useNotificationPreferences() {
    const { session, isAuthenticated } = useAuth()
    const userId = isAuthenticated ? session?.user?.id : null

    const [preferences, setPreferences] = useState(DEFAULT_PREFS)
    const [loading, setLoading] = useState(true)
    const preferencesRef = useRef(DEFAULT_PREFS)

    useEffect(() => {
        preferencesRef.current = preferences
    }, [preferences])

    const refresh = useCallback(async () => {
        try {
            if (!userId) {
                const raw = localStorage.getItem(GUEST_PREF_KEY)
                if (raw) {
                    const parsed = JSON.parse(raw)
                    const merged = { ...DEFAULT_PREFS, ...parsed }
                    preferencesRef.current = merged
                    setPreferences(merged)
                } else {
                    preferencesRef.current = DEFAULT_PREFS
                    setPreferences(DEFAULT_PREFS)
                }
                return
            }

            const data = await getNotificationPreferences(userId)
            preferencesRef.current = data
            setPreferences(data)
        } catch (err) {
            console.error('Failed to load notification preferences:', err)
        } finally {
            setLoading(false)
        }
    }, [userId])

    useEffect(() => {
        refresh()
    }, [refresh])

    const savePreferences = useCallback(async (next) => {
        const merged = { ...DEFAULT_PREFS, ...preferencesRef.current, ...next }

        if (!userId) {
            localStorage.setItem(GUEST_PREF_KEY, JSON.stringify(merged))
            preferencesRef.current = merged
            setPreferences(merged)
            return merged
        }

        const updated = await saveNotificationPreferences(userId, merged)
        preferencesRef.current = updated
        setPreferences(updated)
        return updated
    }, [userId])

    return {
        preferences,
        loading,
        refresh,
        savePreferences,
    }
}
