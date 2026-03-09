import { enrichSubscriptionCandidate } from './vendorEnrichment'

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

/**
 * Parse subscriptions via Claude API
 */
export async function parseWithClaude(text, currentDate = new Date().toISOString().slice(0, 10)) {
    if (!PARSE_API_URL) {
        console.warn('No parse endpoint configured, falling back to local parser')
        return localParse(text)
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
            }),
        })

        if (!response.ok) {
            const err = await response.text().catch(() => '')
            console.error('Parse API error:', err || response.statusText)
            return localParse(text)
        }

        const payload = await response.json()
        const parsed = extractSubscriptions(payload)
        if (!parsed.length) return localParse(text)
        return parsed.map(normalizeSubscription)
    } catch (err) {
        console.error('Parse API failed:', err)
        return localParse(text)
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
export function localParse(text) {
    const items = text
        .split(/[,\n;]+/)
        .map((s) => s.trim())
        .filter(Boolean)

    return items.map((item) => {
        const sub = { name: '', amount: 0, cycle: 'monthly', category: 'Other', renewalDate: '' }

        // Extract amount: "$15.99", "15.99", "15", "20$", "-19.99"
        const amountMatch = item.match(/(?:^|\s|-)\$?(\d+(?:\.\d{1,2})?)\$?(?=\s|$|\/|[A-Za-z])/);
        if (amountMatch) {
            sub.amount = parseFloat(amountMatch[1])
        }

        // Extract cycle
        const lower = item.toLowerCase();
        if (lower.includes('annual') || lower.includes('year')) sub.cycle = 'annual';
        else if (lower.includes('week')) sub.cycle = 'weekly';
        else if (lower.includes('quarter')) sub.cycle = 'quarterly';
        else sub.cycle = 'monthly';

        // Extract category
        sub.category = inferCategory(item);

        // Determine next renewal date
        const today = new Date();
        const isMonthEnd = lower.includes('month end') || lower.includes('end of month');
        const dayMatch = item.match(/\b([1-9]|[12][0-9]|3[01])(?:st|nd|rd|th)\b/i) || item.match(/\bevery\s+([1-9]|[12][0-9]|3[01])\b/i);

        if (isMonthEnd) {
            // Set to last day of current month
            const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
            sub.renewalDate = lastDay.toISOString().slice(0, 10);
        } else if (dayMatch) {
            const day = parseInt(dayMatch[1], 10);
            const thisMonthDate = new Date(today.getFullYear(), today.getMonth(), day);
            if (thisMonthDate < today) {
                // If the day has already passed this month, the next one is next month
                thisMonthDate.setMonth(thisMonthDate.getMonth() + 1);
            }
            sub.renewalDate = thisMonthDate.toISOString().slice(0, 10);
        } else {
            sub.renewalDate = today.toISOString().slice(0, 10);
        }

        // Extract name: remove the price, the cycle, the date, and known categories
        let cleanedName = item
            .replace(/\$?\b\d+(?:\.\d{1,2})?\b\$?/g, '') // remove numbers/prices
            .replace(/(monthly|annual|yearly|weekly|quarterly|\/mo|every|month(?! end)|end of month|month end)/gi, '') // remove cycle words and 'month end'
            .replace(/\b([1-9]|[12][0-9]|3[01])(?:st|nd|rd|th)?\b/gi, '') // remove ordinal days
            .replace(/(subscription|plan|account|app|fee|\bfor\b|\bof\b)/gi, '') // remove conversational fillers
            .replace(/(entertainment|dev\s*tools?|health|productivity|cloud|news|other)/gi, '') // remove category hints
            .replace(/\s+/g, ' ')
            .trim();

        // Remove trailing hyphens or symbols
        cleanedName = cleanedName.replace(/^[^\w]+|[^\w]+$/g, '').trim();

        if (cleanedName) {
            sub.name = cleanedName
                .split(' ')
                .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                .join(' ');
        } else {
            sub.name = 'Unknown Subscription';
        }

        return enrichSubscriptionCandidate(sub);
    }).filter(s => s.name && s.amount > 0);
}

// Category inference from service name
const CATEGORY_MAP = {
    Entertainment: ['netflix', 'spotify', 'hulu', 'disney', 'hbo', 'peacock', 'paramount', 'crunchyroll', 'twitch', 'youtube', 'apple tv', 'music', 'streaming', 'entertainment', 'film', 'movie', 'tv'],
    'Dev Tools': ['github', 'figma', 'vercel', 'netlify', 'linear', 'jira', 'postman', 'sentry', 'datadog', 'aws', 'azure', 'digital ocean', 'heroku', 'dev', 'code', 'tools', 'hosting', 'design'],
    Health: ['headspace', 'calm', 'myfitnesspal', 'peloton', 'whoop', 'health', 'fitness', 'gym', 'workout', 'meditation'],
    Productivity: ['claude', 'chatgpt', 'perplexity', 'slack', 'zoom', 'loom', 'todoist', 'obsidian', 'notion', 'craft', 'openai', 'ai', 'productivity'],
    Cloud: ['icloud', 'dropbox', 'google one', 'onedrive', 'box', 'apple one', 'storage', 'cloud', 'backup'],
    'News & Media': ['nytimes', 'new york times', 'medium', 'substack', 'athletic', 'economist', 'news', 'media'],
    Utilities: ['rent', 'mortgage', 'electric', 'water', 'gas', 'internet', 'phone', 'cell', 'wifi', 'utility', 'trash', 'sewer', 'pg&e', 'comcast', 'verizon', 'att'],
    Loans: ['loan', 'student', 'mortgage', 'car payment', 'auto', 'debt', 'credit card'],
    Insurance: ['insurance', 'geico', 'state farm', 'progressive', 'health insurance', 'car insurance', 'renters', 'homeowners'],
}

export function inferCategory(text) {
    const lower = text.toLowerCase()
    for (const [cat, keywords] of Object.entries(CATEGORY_MAP)) {
        if (keywords.some((k) => lower.includes(k))) return cat
    }
    return 'Other'
}

function normalizeSubscription(sub) {
    let renewalDate = sub.renewalDate;
    if (renewalDate) {
        // basic format check: YYYY-MM-DD
        if (!/^\d{4}-\d{2}-\d{2}$/.test(renewalDate)) {
            renewalDate = new Date().toISOString().slice(0, 10);
        }
    } else {
        const nextMonth = new Date();
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        renewalDate = nextMonth.toISOString().slice(0, 10);
    }

    return enrichSubscriptionCandidate({
        name: sub.name || 'Unknown',
        amount: typeof sub.amount === 'number' ? sub.amount : parseFloat(sub.amount) || 0,
        cycle: ['monthly', 'annual', 'weekly', 'quarterly'].includes(sub.cycle) ? sub.cycle : 'monthly',
        category: sub.category === 'News' ? 'News & Media' : (sub.category || 'Other'),
        renewalDate: renewalDate,
    })
}
