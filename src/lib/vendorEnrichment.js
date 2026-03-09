import { getServiceMetadata } from './serviceDomains'

const COMPANY_SUFFIX_RE = /\b(inc|llc|ltd|corp|co|company|digital|services|service|subscription|subscr|payment|payments|online|web|app|usa)\b/gi

function toTitleCase(value) {
    return value
        .split(/\s+/)
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
        .join(' ')
}

export function cleanServiceName(name) {
    return String(name || '')
        .replace(/[_*#]+/g, ' ')
        .replace(/[|]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
}

export function enrichVendorName(name) {
    const cleaned = cleanServiceName(name)
    const metadata = getServiceMetadata(cleaned)

    if (metadata) {
        return {
            normalizedName: metadata.canonicalName,
            vendorDomain: metadata.domain,
            vendorConfidence: metadata.confidence,
            vendorMatchType: metadata.matchType,
            logoUrl: metadata.domain
                ? `https://www.google.com/s2/favicons?domain=${metadata.domain}&sz=64`
                : null,
        }
    }

    const normalizedName = toTitleCase(
        cleaned
            .replace(COMPANY_SUFFIX_RE, ' ')
            .replace(/\b\d+\b/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
    ) || cleaned

    return {
        normalizedName,
        vendorDomain: null,
        vendorConfidence: 0.35,
        vendorMatchType: 'fallback',
        logoUrl: null,
    }
}

export function buildVendorFingerprint({ name = '', vendorDomain = null }) {
    if (vendorDomain) return `domain:${vendorDomain.toLowerCase()}`
    return `name:${cleanServiceName(name).toLowerCase()}`
}

export function findPotentialDuplicate(candidate, existing = []) {
    const candidateMeta = enrichVendorName(candidate?.name || '')
    const candidateFingerprint = buildVendorFingerprint({
        name: candidateMeta.normalizedName,
        vendorDomain: candidateMeta.vendorDomain,
    })

    return existing.find((item) => {
        const existingMeta = enrichVendorName(item?.name || '')
        const existingFingerprint = buildVendorFingerprint({
            name: existingMeta.normalizedName,
            vendorDomain: existingMeta.vendorDomain,
        })
        return candidateFingerprint === existingFingerprint
    }) || null
}

export function enrichSubscriptionCandidate(item) {
    const vendor = enrichVendorName(item?.name || '')
    return {
        ...item,
        name: vendor.normalizedName || item?.name || '',
        vendorDomain: vendor.vendorDomain,
        vendorConfidence: vendor.vendorConfidence,
        vendorMatchType: vendor.vendorMatchType,
        logoUrl: vendor.logoUrl,
    }
}
