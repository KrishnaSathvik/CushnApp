import { useContext } from 'react'
import { SubscriptionsContext } from '../context/SubscriptionsContext'

export default function useSubscriptions() {
    const context = useContext(SubscriptionsContext)
    if (!context) {
        throw new Error('useSubscriptions must be used within a SubscriptionsProvider')
    }
    return context
}
