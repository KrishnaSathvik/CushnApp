import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { getInAppNotificationEvents, markNotificationEventHandled, subscribeToChanges } from '../lib/dataService'

export default function useInAppReminders() {
    const { session, isAuthenticated } = useAuth()
    const userId = isAuthenticated ? session?.user?.id : null

    const [reminders, setReminders] = useState([])
    const [loading, setLoading] = useState(true)
    const [dismissingId, setDismissingId] = useState(null)

    const refresh = useCallback(async () => {
        if (!userId) {
            setReminders([])
            setLoading(false)
            return
        }

        try {
            const data = await getInAppNotificationEvents(userId)
            setReminders(data)
        } catch (err) {
            console.error('Failed to load in-app reminders:', err)
        } finally {
            setLoading(false)
        }
    }, [userId])

    useEffect(() => {
        setLoading(true)
        refresh()
    }, [refresh])

    useEffect(() => {
        if (!userId) return undefined

        const subscription = subscribeToChanges(userId, {
            onNotificationChange: refresh,
        })

        return () => subscription.unsubscribe()
    }, [userId, refresh])

    const dismissReminder = useCallback(async (eventId) => {
        if (!userId || !eventId) return

        try {
            setDismissingId(eventId)
            await markNotificationEventHandled(userId, eventId)
            setReminders((current) => current.filter((item) => item.id !== eventId))
        } finally {
            setDismissingId(null)
        }
    }, [userId])

    return {
        reminders,
        loading,
        dismissReminder,
        dismissingId,
    }
}
