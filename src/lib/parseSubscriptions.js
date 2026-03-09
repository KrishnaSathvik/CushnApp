import { enrichSubscriptionCandidate } from './vendorEnrichment'
import { coerceFutureRenewalDate, getBaseDate, normalizeCategory, normalizeCycle } from '../../shared/parseNormalization.ts'

const STOP_WORDS = new Set([
    'subscription',
    'subscriptions',
    'plan',
    'account',
    'membership',
    'payment',
    'billing',
    'monthly',
    'annual',
    'weekly',
    'quarterly',
    'the',
    'and',
    'for',
    'with',
    'from',
    'inc',
    'llc',
    'co',
    'app',
    'services',
    'service',
    'bucks',
    'buck',
    'lol',
    'forgot',
    'forget',
    'still',
    'charging',
    'charge',
    'charged',
    'on',
])

function normalizeEvidenceText(text) {
    return String(text || '')
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
}

function getMeaningfulTokens(value) {
    return normalizeEvidenceText(value)
        .split(' ')
        .filter((token) => token.length >= 3 && !STOP_WORDS.has(token))
}

function normalizeMerchantText(text) {
    return normalizeEvidenceText(text)
        .replace(/\bapple com bill\b/g, 'apple')
        .replace(/\bgoogle\b\s+\*/g, 'google ')
        .replace(/\bgoogle services\b/g, 'google')
        .replace(/\bamzn\b/g, 'amazon')
        .replace(/\bamex\b/g, 'american express')
        .replace(/\btmobile\b/g, 't mobile')
        .replace(/\batt\b/g, 'at t')
        .replace(/\s+/g, ' ')
        .trim()
}

function splitSourceSegments(text) {
    return String(text || '')
        .split(/\n+/)
        .map((segment) => segment.trim())
        .filter(Boolean)
}

function getEvidenceScore(sourceText, subscription) {
    const haystack = ` ${normalizeMerchantText(sourceText)} `
    if (!haystack.trim()) return 0

    const nameTokens = getMeaningfulTokens(subscription?.name)
    const rawNameTokens = getMeaningfulTokens(subscription?.rawName)
    const canonicalTokens = getMeaningfulTokens(subscription?.vendorCanonicalName)
    const domainTokens = getMeaningfulTokens(subscription?.vendorDomain?.split('.')[0] || '')
    const tokens = [...new Set([...nameTokens, ...rawNameTokens, ...canonicalTokens, ...domainTokens])]

    if (tokens.length === 0) return 0

    let score = 0
    const exactCandidates = [
        normalizeMerchantText(subscription?.name),
        normalizeMerchantText(subscription?.rawName),
        normalizeMerchantText(subscription?.vendorCanonicalName),
    ].filter(Boolean)

    if (exactCandidates.some((candidate) => haystack.includes(` ${candidate} `))) {
        score += 3
    }

    const matchedTokens = tokens.filter((token) => haystack.includes(` ${token} `))
    score += matchedTokens.length

    if (subscription?.vendorDomain) {
        const domainStem = normalizeMerchantText(subscription.vendorDomain.split('.')[0] || '')
        if (domainStem && haystack.includes(` ${domainStem} `)) {
            score += 1
        }
    }

    return score
}

export function hasSourceEvidence(sourceText, subscription) {
    const tokenCount = [...new Set([
        ...getMeaningfulTokens(subscription?.name),
        ...getMeaningfulTokens(subscription?.rawName),
        ...getMeaningfulTokens(subscription?.vendorCanonicalName),
        ...getMeaningfulTokens(subscription?.vendorDomain?.split('.')[0] || ''),
    ])].length

    const score = getEvidenceScore(sourceText, subscription)
    if (tokenCount <= 1) return score >= 1
    if (tokenCount === 2) return score >= 2
    return score >= 3
}

function filterParsedBySourceEvidence(sourceText, subscriptions) {
    return subscriptions.filter((subscription) => hasSourceEvidence(sourceText, subscription))
}

/**
 * Parse natural language subscription text through a server endpoint.
 * Falls back to a local regex parser if no endpoint is configured.
 */
function getDefaultParseApiUrl() {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
    if (!supabaseUrl) return ''
    try {
        const url = new URL(supabaseUrl)
        const host = url.hostname.replace('.supabase.co', '.functions.supabase.co')
        return `https://${host}/parse-subscriptions`
    } catch {
        return ''
    }
}

const PARSE_API_URL = import.meta.env.VITE_PARSE_API_URL || getDefaultParseApiUrl()

function hasImageAttachments(attachments = []) {
    return attachments.some((item) => item?.type === 'image')
}

function getDateFromRelativeHint(sourceText, currentDate) {
    const normalizedText = String(sourceText || '').toLowerCase()
    const baseDate = /^\d{4}-\d{2}-\d{2}$/.test(currentDate || '')
        ? new Date(`${currentDate}T00:00:00Z`)
        : new Date()

    if (normalizedText.includes('due tomorrow') || /\btomorrow\b/.test(normalizedText)) {
        const date = new Date(baseDate)
        date.setUTCDate(date.getUTCDate() + 1)
        return date.toISOString().slice(0, 10)
    }

    if (normalizedText.includes('due today') || /\btoday\b/.test(normalizedText)) {
        return baseDate.toISOString().slice(0, 10)
    }

    return null
}

function getRelativeHintForSubscription(sourceText, subscription, currentDate) {
    const segments = splitSourceSegments(sourceText)
    for (const segment of segments) {
        const hint = getDateFromRelativeHint(segment, currentDate)
        if (!hint) continue
        if (getEvidenceScore(segment, subscription) >= 1) {
            return hint
        }
    }
    return null
}

/**
 * Parse subscriptions via Claude API
 */
export async function parseWithClaude(text, currentDate = new Date().toISOString().slice(0, 10), options = {}) {
    const attachments = Array.isArray(options.attachments) ? options.attachments : []

    if (!PARSE_API_URL) {
        console.warn('No parse endpoint configured, falling back to local parser')
        return hasImageAttachments(attachments) ? [] : localParse(text, currentDate)
    }

    try {
        const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''
        const headers = { 'Content-Type': 'application/json' }
        if (anonKey) {
            headers['Authorization'] = `Bearer ${anonKey}`
        }

        const response = await fetch(PARSE_API_URL, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
                text,
                currentDate,
                attachments,
            }),
        })

        if (!response.ok) {
            const err = await response.text().catch(() => '')
            console.error('Parse API error:', err || response.statusText)
            return localParse(text, currentDate)
        }

        const payload = await response.json()
        const parsed = extractSubscriptions(payload)
        if (!parsed.length) return hasImageAttachments(attachments) ? [] : localParse(text, currentDate)

        const normalized = parsed
            .map((item) => normalizeSubscription(item, currentDate, text, parsed.length))
            .filter(Boolean)
        if (hasImageAttachments(attachments)) {
            return normalized
        }

        const evidenced = filterParsedBySourceEvidence(text, normalized)
        if (!evidenced.length) return []
        return evidenced
    } catch (err) {
        console.error('Parse API failed:', err)
        return hasImageAttachments(attachments) ? [] : localParse(text, currentDate)
    }
}

function extractSubscriptions(payload) {
    if (Array.isArray(payload)) return payload
    if (Array.isArray(payload?.subscriptions)) return payload.subscriptions
    if (typeof payload?.result === 'string') {
        const jsonMatch = payload.result.match(/\[[\s\S]*\]/)
        if (jsonMatch) {
            try {
                return JSON.parse(jsonMatch[0])
            } catch {
                return []
            }
        }
    }
    return []
}

/**
 * Local regex-based parser as fallback when no API key is set.
 * Handles common patterns like: "Netflix 15.99 monthly", "Spotify 9.99/mo entertainment"
 */
function detectCycleFromText(lower) {
    if (/\bbi[-\s]?weekly\b/.test(lower) || lower.includes('every other week')) return 'biweekly'
    if (/\bsemi[-\s]?annual(?:ly)?\b/.test(lower) || lower.includes('twice a year') || /\bevery\s+6\s+months?\b/.test(lower)) return 'annual'
    if (lower.includes('annual') || lower.includes('yearly') || /\bper\s+year\b/.test(lower) || /\/\s*yr\b/.test(lower) || /\/\s*year\b/.test(lower)) return 'annual'
    if (/\bevery\s+3\s+months?\b/.test(lower) || lower.includes('quarter')) return 'quarterly'
    if (/\bevery\s+week\b/.test(lower) || lower.includes('weekly')) return 'weekly'
    return 'monthly'
}

function getNextWeekdayDate(baseDate, weekdayIndex) {
    const date = new Date(baseDate)
    const currentDay = date.getUTCDay()
    let delta = (weekdayIndex - currentDay + 7) % 7
    if (delta === 0) delta = 7
    date.setUTCDate(date.getUTCDate() + delta)
    return date.toISOString().slice(0, 10)
}

function detectRenewalDateFromText(lower, currentDate) {
    const baseDate = getBaseDate(currentDate)

    if (lower.includes('due tomorrow') || /\btomorrow\b/.test(lower)) {
        const date = new Date(baseDate)
        date.setUTCDate(date.getUTCDate() + 1)
        return date.toISOString().slice(0, 10)
    }

    if (lower.includes('due today') || /\btoday\b/.test(lower)) {
        return baseDate.toISOString().slice(0, 10)
    }

    const weekdayMatch = lower.match(/\bnext\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/)
    if (weekdayMatch) {
        const weekdays = {
            sunday: 0,
            monday: 1,
            tuesday: 2,
            wednesday: 3,
            thursday: 4,
            friday: 5,
            saturday: 6,
        }
        return getNextWeekdayDate(baseDate, weekdays[weekdayMatch[1]])
    }

    const isMonthEnd = lower.includes('month end') || lower.includes('end of month')
    const dayMatch = lower.match(/\b([1-9]|[12][0-9]|3[01])(?:st|nd|rd|th)\b/i) || lower.match(/\bevery\s+([1-9]|[12][0-9]|3[01])\b/i)

    if (isMonthEnd) {
        const lastDay = new Date(Date.UTC(baseDate.getUTCFullYear(), baseDate.getUTCMonth() + 1, 0))
        return lastDay.toISOString().slice(0, 10)
    }

    if (dayMatch) {
        const day = parseInt(dayMatch[1], 10)
        const thisMonthDate = new Date(Date.UTC(baseDate.getUTCFullYear(), baseDate.getUTCMonth(), day))
        if (thisMonthDate < baseDate) {
            thisMonthDate.setUTCMonth(thisMonthDate.getUTCMonth() + 1)
        }
        return thisMonthDate.toISOString().slice(0, 10)
    }

    return baseDate.toISOString().slice(0, 10)
}

function extractAmountFromText(item) {
    const parenAmountMatch = item.match(/\(\s*\$?\s*(\d+(?:\.\d{1,2})?)\s*\$\s*\)/i)
        || item.match(/\(\s*\$?\s*(\d+(?:\.\d{1,2})?)\s*\)/i)
    if (parenAmountMatch) {
        return parseFloat(parenAmountMatch[1])
    }

    const trailingAmountMatch = item.match(/[:\s]\$?(\d+(?:\.\d{1,2})?)\$?(?=\s*$)/)
    if (trailingAmountMatch) {
        return parseFloat(trailingAmountMatch[1])
    }

    const amountMatch = item.match(/(?:^|\s|-)\$?(\d+(?:\.\d{1,2})?)\$?(?=\s|$|\/|[A-Za-z])/)
    if (amountMatch) {
        return parseFloat(amountMatch[1])
    }

    return 0
}

export function localParse(text, currentDate = new Date().toISOString().slice(0, 10)) {
    const baseItems = String(text || '')
        .split(/[,\n;]+/)
        .map((s) => s.trim())
        .filter(Boolean)

    const items = baseItems.flatMap((item) => {
        const normalized = item.replace(/\s+/g, ' ').trim()
        const andParts = normalized
            .split(/\s+\band\b\s+/i)
            .map((part) => part.trim())
            .filter(Boolean)

        const looksLikeMultipleSubscriptions = andParts.length > 1
            && andParts.filter((part) => /\d/.test(part)).length >= 2

        return looksLikeMultipleSubscriptions ? andParts : [normalized]
    })

    return items.map((item) => {
        const sub = { name: '', rawName: '', amount: 0, cycle: 'monthly', category: 'Other', renewalDate: '' }
        const isCreditAccountLine = /\bcredit\s+card\b/i.test(item)
        const preservePaymentInName = /\bcar\s+payment\b/i.test(item)

        sub.amount = extractAmountFromText(item)

        // Extract cycle
        const lower = item.toLowerCase();
        sub.cycle = detectCycleFromText(lower)

        // Extract category
        sub.category = inferCategory(item);

        sub.renewalDate = detectRenewalDateFromText(lower, currentDate)

        // Extract name: remove the price, the cycle, the date, and known categories
        let cleanedName = item
            .replace(/\(\s*\$?\s*\d+(?:\.\d{1,2})?\s*\$?\s*\)/g, '') // remove parenthesized amounts
            .replace(/\$?\b\d+(?:\.\d{1,2})?\b\$?/g, '') // remove numbers/prices
            .replace(/\b(jan|january|feb|february|mar|march|apr|april|may|jun|june|jul|july|aug|august|sep|sept|september|oct|october|nov|november|dec|december)\b/gi, '') // remove month names
            .replace(/(monthly|annual|yearly|weekly|quarterly|\/mo|every|month(?! end)|end of month|month end)/gi, '') // remove cycle words and 'month end'
            .replace(/\b([1-9]|[12][0-9]|3[01])(?:st|nd|rd|th)?\b/gi, '') // remove ordinal days
            .replace(/\b(subscription|plan|account|app|fee|for|of|on|bucks?|lol|forgot|forget|still|charging|charged)\b/gi, '') // remove conversational fillers
            .replace(
                isCreditAccountLine
                    ? /\b(autopay|auto pay|autopmt|autopayment|payment|debit|visa|mastercard|mc|discover|ach|withdrawal|purchase|pos|checkcard)\b/gi
                    : preservePaymentInName
                        ? /\b(autopay|auto pay|autopmt|autopayment|debit|credit|card|visa|mastercard|mc|amex|discover|ach|withdrawal|purchase|pos|checkcard)\b/gi
                    : /\b(autopay|auto pay|autopmt|autopayment|payment|debit|credit|card|visa|mastercard|mc|amex|discover|ach|withdrawal|purchase|pos|checkcard)\b/gi,
                '',
            )
            .replace(/(entertainment|dev\s*tools?|health|productivity|cloud|news|other)/gi, '') // remove category hints
            .replace(/[:•.-]+/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();

        // Remove trailing hyphens or symbols
        cleanedName = cleanedName.replace(/^[^\w]+|[^\w]+$/g, '').trim();

        if (cleanedName) {
            sub.rawName = cleanedName
            sub.name = cleanedName
                .split(' ')
                .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                .join(' ');
        } else {
            sub.name = 'Unknown Subscription';
            sub.rawName = 'Unknown Subscription';
        }

        const enriched = enrichSubscriptionCandidate(sub)

        return {
            ...enriched,
            amountMissing: !(Number.isFinite(enriched.amount) && enriched.amount > 0),
        }
    }).filter((s) => s.name && (
        s.amount > 0
        || (
            s.amountMissing
            && s.name !== 'Unknown Subscription'
            && (
                s.vendorConfidence >= 0.75
                || (s.vendorMatchType && s.vendorMatchType !== 'fallback')
            )
        )
    ));
}

// Category inference from service name
const CATEGORY_MAP = {
    Entertainment: ['netflix', 'spotify', 'hulu', 'disney', 'hbo', 'peacock', 'paramount', 'crunchyroll', 'twitch', 'youtube', 'apple tv', 'music', 'streaming', 'entertainment', 'film', 'movie', 'tv', 'amc'],
    'Dev Tools': ['github', 'figma', 'vercel', 'netlify', 'linear', 'jira', 'postman', 'sentry', 'datadog', 'aws', 'azure', 'digital ocean', 'heroku', 'dev', 'code', 'tools', 'hosting', 'design', 'cursor'],
    Health: ['headspace', 'calm', 'myfitnesspal', 'peloton', 'whoop', 'health', 'fitness', 'gym', 'workout', 'meditation'],
    Productivity: ['claude', 'chatgpt', 'chat gpt', 'perplexity', 'slack', 'zoom', 'loom', 'todoist', 'obsidian', 'notion', 'craft', 'openai', 'ai', 'productivity', 'grok', 'linkedin premium', 'adobe'],
    Cloud: ['icloud', 'dropbox', 'google one', 'onedrive', 'box', 'apple one', 'storage', 'cloud', 'backup', 'google drive'],
    'News & Media': ['nytimes', 'new york times', 'medium', 'substack', 'athletic', 'economist', 'news', 'media', 'linkedin'],
    Insurance: ['insurance', 'geico', 'state farm', 'progressive', 'health insurance', 'car insurance', 'renters', 'homeowners'],
    Utilities: ['rent', 'mortgage', 'electric', 'water', 'gas', 'internet', 'phone', 'cell', 'wifi', 'utility', 'trash', 'sewer', 'sewage', 'pg&e', 'comcast', 'verizon', 'att', 't-mobile'],
    'Loans & Cards': ['loan', 'student', 'car payment', 'auto', 'debt', 'credit card', 'card payment', 'upstart', 'affirm', 'klarna', 'afterpay'],
}

export function inferCategory(text) {
    const lower = text.toLowerCase()
    for (const [cat, keywords] of Object.entries(CATEGORY_MAP)) {
        if (keywords.some((k) => lower.includes(k))) return cat
    }
    return 'Other'
}

function normalizeSubscription(sub, currentDate, sourceText, totalParsedCount = 1) {
    const cycle = normalizeCycle(sub.cycle)
    const rawName = sub.rawName || sub.name || 'Unknown'
    const relativeHintDate = totalParsedCount === 1
        ? getDateFromRelativeHint(sourceText, currentDate)
        : getRelativeHintForSubscription(sourceText, { ...sub, rawName }, currentDate)
    const normalizedRenewalDate = coerceFutureRenewalDate(sub.renewalDate, cycle, currentDate)
    const renewalDate = (
        relativeHintDate
        && relativeHintDate
    )
        ? relativeHintDate
        : normalizedRenewalDate || (() => {
            const nextMonth = new Date(getBaseDate(currentDate))
            nextMonth.setUTCMonth(nextMonth.getUTCMonth() + 1)
            return nextMonth.toISOString().slice(0, 10)
        })()

    const amount = typeof sub.amount === 'number' ? sub.amount : parseFloat(sub.amount)
    if (!Number.isFinite(amount) || amount <= 0) {
        return null
    }

    return enrichSubscriptionCandidate({
        name: sub.name || 'Unknown',
        rawName,
        amount,
        cycle,
        category: normalizeCategory(sub.category),
        renewalDate: renewalDate,
    })
}
