import { enrichSubscriptionCandidate } from './vendorEnrichment'

// ─── CSV Import Utility ──────────────────────────────────────────────────────
// Parses a CSV string into subscription objects with validation.

const REQUIRED_COLUMNS = ['name', 'amount']
const HEADER_ALIASES = {
    name: 'name',
    service: 'name',
    subscription: 'name',
    product: 'name',
    plan: 'name',
    item: 'name',
    amount: 'amount',
    price: 'amount',
    cost: 'amount',
    charge: 'amount',
    total: 'amount',
    currency: 'currency',
    'currency code': 'currency',
    cycle: 'cycle',
    billing: 'cycle',
    frequency: 'cycle',
    interval: 'cycle',
    period: 'cycle',
    status: 'status',
    state: 'status',
    category: 'category',
    type: 'category',
    group: 'category',
    'renewal date': 'renewal date',
    renewal: 'renewal date',
    'next billing date': 'renewal date',
    'next charge date': 'renewal date',
    'billing date': 'renewal date',
    'charge date': 'renewal date',
    'next payment date': 'renewal date',
    notes: 'notes',
    note: 'notes',
    description: 'notes',
    details: 'notes',
    memo: 'notes',
}

/**
 * Parse a CSV string into subscription objects.
 * Expects a header row with at least Name and Amount columns.
 *
 * @param {string} text - Raw CSV text
 * @returns {{ subscriptions: Object[], errors: string[] }}
 */
export function parseCSV(text) {
    const lines = text.trim().split(/\r?\n/)
    if (lines.length < 2) {
        return { subscriptions: [], errors: ['CSV must have a header row and at least one data row.'] }
    }

    const headerLine = lines[0]
    const headers = parseCSVLine(headerLine).map(normalizeHeader)

    // Validate required columns
    const missing = REQUIRED_COLUMNS.filter(col => !headers.includes(col))
    if (missing.length > 0) {
        return { subscriptions: [], errors: [`Missing required column(s): ${missing.join(', ')}`] }
    }

    const subscriptions = []
    const errors = []

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim()
        if (!line) continue

        const values = parseCSVLine(line)
        const row = {}
        headers.forEach((h, idx) => {
            row[h] = (values[idx] || '').trim()
        })

        // Validate row
        if (!row.name) {
            errors.push(`Row ${i + 1}: Missing name`)
            continue
        }

        const amount = parseFloat(row.amount)
        if (isNaN(amount) || amount < 0) {
            errors.push(`Row ${i + 1}: Invalid amount "${row.amount}"`)
            continue
        }

        subscriptions.push(enrichSubscriptionCandidate({
            name: row.name,
            amount,
            currency: row.currency || 'USD',
            cycle: normalizeCycle(row.cycle || 'monthly'),
            status: normalizeStatus(row.status || 'active'),
            category: row.category || '',
            renewalDate: row['renewal date'] || '',
            notes: row.notes || '',
        }))
    }

    return { subscriptions, errors }
}

/**
 * Parse a single CSV line handling quoted fields.
 * @param {string} line
 * @returns {string[]}
 */
function parseCSVLine(line) {
    const fields = []
    let current = ''
    let inQuotes = false

    for (let i = 0; i < line.length; i++) {
        const ch = line[i]
        if (inQuotes) {
            if (ch === '"') {
                if (i + 1 < line.length && line[i + 1] === '"') {
                    current += '"'
                    i++ // skip escaped quote
                } else {
                    inQuotes = false
                }
            } else {
                current += ch
            }
        } else {
            if (ch === '"') {
                inQuotes = true
            } else if (ch === ',') {
                fields.push(current)
                current = ''
            } else {
                current += ch
            }
        }
    }
    fields.push(current)
    return fields
}

function normalizeHeader(header) {
    const key = String(header || '')
        .trim()
        .toLowerCase()
        .replace(/[_-]+/g, ' ')
        .replace(/\s+/g, ' ')
    return HEADER_ALIASES[key] || key
}

/**
 * Normalize cycle string to a known value.
 * @param {string} raw
 * @returns {string}
 */
function normalizeCycle(raw) {
    const lower = raw.toLowerCase().trim()
    const map = {
        monthly: 'monthly',
        annual: 'annual',
        yearly: 'annual',
        weekly: 'weekly',
        quarterly: 'quarterly',
        biweekly: 'biweekly',
    }
    return map[lower] || 'monthly'
}

function normalizeStatus(raw) {
    const lower = raw.toLowerCase().trim()
    if (lower === 'paused') return 'paused'
    return 'active'
}
