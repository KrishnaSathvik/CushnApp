import cancellationUrls from '../data/cancellationUrls.json'

function normalizeVendorName(value) {
    return String(value || '').trim().toLowerCase()
}

const normalizedEntries = Object.entries(cancellationUrls).map(([name, url]) => [normalizeVendorName(name), url])

export function getCancellationLink(subscription) {
    const explicitUrl = subscription?.cancelUrl
    if (explicitUrl) {
        return {
            href: explicitUrl,
            label: 'How to cancel',
            fallback: false,
        }
    }

    const subscriptionName = normalizeVendorName(subscription?.name)
    const exactMatch = normalizedEntries.find(([name]) => name === subscriptionName)
    if (exactMatch) {
        return {
            href: exactMatch[1],
            label: 'How to cancel',
            fallback: false,
        }
    }

    const partialMatch = normalizedEntries.find(([name]) => subscriptionName.includes(name) || name.includes(subscriptionName))
    if (partialMatch) {
        return {
            href: partialMatch[1],
            label: 'How to cancel',
            fallback: false,
        }
    }

    const query = encodeURIComponent(`how to cancel ${subscription?.name || 'subscription'}`)
    return {
        href: `https://www.google.com/search?q=${query}`,
        label: `Search how to cancel ${subscription?.name || 'this subscription'}`,
        fallback: true,
    }
}
