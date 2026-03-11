import { createContext, useContext, useMemo, useState } from 'react'
import ReviewSheet from '../components/ReviewSheet'
import useSubscriptions from '../hooks/useSubscriptions'

const noop = () => {}

const ReviewSheetContext = createContext({
    openReviewSheet: noop,
    closeReviewSheet: noop,
})

export function ReviewSheetProvider({ children }) {
    const { subscriptions, updateSubscription } = useSubscriptions()
    const [sheetState, setSheetState] = useState({
        open: false,
        subscriptionId: null,
        initialStep: 'default',
    })

    const subscription = useMemo(
        () => subscriptions.find((item) => item.id === sheetState.subscriptionId) || null,
        [sheetState.subscriptionId, subscriptions],
    )

    const closeReviewSheet = () => {
        setSheetState({
            open: false,
            subscriptionId: null,
            initialStep: 'default',
        })
    }

    const openReviewSheet = (subscriptionOrId, options = {}) => {
        const subscriptionId = typeof subscriptionOrId === 'object' ? subscriptionOrId?.id : subscriptionOrId
        if (!subscriptionId) return
        setSheetState({
            open: true,
            subscriptionId,
            initialStep: options.initialStep || 'default',
        })
    }

    const value = {
        openReviewSheet,
        closeReviewSheet,
    }

    return (
        <ReviewSheetContext.Provider value={value}>
            {children}
            <ReviewSheet
                open={sheetState.open}
                subscription={subscription}
                initialStep={sheetState.initialStep}
                onClose={closeReviewSheet}
                onKeep={(item) => updateSubscription(item.id, {
                    reviewedAt: new Date().toISOString().slice(0, 10),
                    snoozedUntil: null,
                })}
                onRemindLater={(item) => updateSubscription(item.id, {
                    snoozedUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
                })}
                onCancel={(item, payload) => updateSubscription(item.id, {
                    cancelledAt: payload.cancelledAt,
                    endsAt: payload.endsAt,
                    renewalDate: payload.endsAt,
                    notes: payload.notes,
                    status: payload.endsAt <= new Date().toISOString().slice(0, 10) ? 'cancelled' : item.status,
                })}
            />
        </ReviewSheetContext.Provider>
    )
}

export function useReviewSheet() {
    return useContext(ReviewSheetContext)
}
