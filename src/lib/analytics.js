import { track } from '@vercel/analytics/react'

function isClient() {
    return typeof window !== 'undefined'
}

export function trackEvent(name, properties = {}) {
    if (!isClient()) return

    try {
        track(name, properties)
    } catch {
        // Ignore analytics failures. Product flows should not depend on tracking.
    }
}
