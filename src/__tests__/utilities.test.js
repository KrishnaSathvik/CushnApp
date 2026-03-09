import { describe, it, expect, beforeEach } from 'vitest'
import { formatCurrency, getCurrencySymbol } from '../lib/formatCurrency'
import { normalizeToMonthly, normalizeToAnnual } from '../lib/normalizeAmount'
import { getServiceDomain, getServiceMetadata, SERVICE_DOMAINS } from '../lib/serviceDomains'
import { BILLING_CYCLES, DEFAULT_CURRENCY, DEFAULT_CATEGORIES, EXAMPLE_INPUTS } from '../lib/constants'
import { buildCSV, buildJSON } from '../lib/exportData'
import { parseCSV } from '../lib/importData'
import {
    hasPendingGuestMigration,
    markGuestMigrationPending,
    clearPendingGuestMigration,
    shouldMigrateGuestData,
} from '../lib/guestMigrationState'
import { enrichSubscriptionCandidate, findPotentialDuplicate } from '../lib/vendorEnrichment'

// ─── formatCurrency ──────────────────────────────────────────────────────────

describe('formatCurrency', () => {
    it('formats USD amounts correctly', () => {
        expect(formatCurrency(15.99)).toBe('$15.99')
        expect(formatCurrency(0)).toBe('$0.00')
        expect(formatCurrency(1000)).toBe('$1,000.00')
        expect(formatCurrency(9.9)).toBe('$9.90')
    })

    it('formats other currencies', () => {
        const eur = formatCurrency(15.99, 'EUR')
        expect(eur).toContain('15.99')
        const gbp = formatCurrency(15.99, 'GBP')
        expect(gbp).toContain('15.99')
    })

    it('defaults to USD', () => {
        expect(formatCurrency(10)).toBe('$10.00')
    })
})

describe('getCurrencySymbol', () => {
    it('returns $ for USD', () => {
        expect(getCurrencySymbol('USD')).toBe('$')
    })

    it('returns symbols for other currencies', () => {
        expect(getCurrencySymbol('EUR')).toContain('€')
        expect(getCurrencySymbol('GBP')).toContain('£')
    })
})

// ─── normalizeToMonthly ──────────────────────────────────────────────────────

describe('normalizeToMonthly', () => {
    it('passes monthly amounts through unchanged', () => {
        expect(normalizeToMonthly(10, 'monthly')).toBe(10)
    })

    it('divides annual by 12', () => {
        expect(normalizeToMonthly(120, 'annual')).toBeCloseTo(10)
        expect(normalizeToMonthly(120, 'yearly')).toBeCloseTo(10)
    })

    it('multiplies weekly by 4.33', () => {
        expect(normalizeToMonthly(10, 'weekly')).toBeCloseTo(43.3)
    })

    it('divides quarterly by 3', () => {
        expect(normalizeToMonthly(30, 'quarterly')).toBeCloseTo(10)
    })

    it('multiplies biweekly by 2.17', () => {
        expect(normalizeToMonthly(100, 'biweekly')).toBeCloseTo(217)
    })

    it('defaults unknown cycles to monthly', () => {
        expect(normalizeToMonthly(10, 'unknown')).toBe(10)
        expect(normalizeToMonthly(10, undefined)).toBe(10)
    })
})

describe('normalizeToAnnual', () => {
    it('converts monthly to annual correctly', () => {
        expect(normalizeToAnnual(10, 'monthly')).toBeCloseTo(120)
    })

    it('passes annual through correctly', () => {
        expect(normalizeToAnnual(120, 'annual')).toBeCloseTo(120)
    })
})

// ─── serviceDomains ──────────────────────────────────────────────────────────

describe('getServiceDomain', () => {
    it('returns exact match for known services', () => {
        expect(getServiceDomain('Netflix')).toBe('netflix.com')
        expect(getServiceDomain('GitHub')).toBe('github.com')
        expect(getServiceDomain('Claude Pro')).toBe('claude.ai')
    })

    it('is case-insensitive', () => {
        expect(getServiceDomain('netflix')).toBe('netflix.com')
        expect(getServiceDomain('GITHUB')).toBe('github.com')
    })

    it('falls back to name.com for unknown services', () => {
        expect(getServiceDomain('Acme')).toBe('acme.com')
        expect(getServiceDomain('MyService')).toBe('myservice.com')
    })

    it('returns null for empty/missing names', () => {
        expect(getServiceDomain('')).toBeNull()
        expect(getServiceDomain(null)).toBeNull()
        expect(getServiceDomain(undefined)).toBeNull()
    })
})

describe('SERVICE_DOMAINS', () => {
    it('contains expected entries', () => {
        expect(SERVICE_DOMAINS['Netflix']).toBe('netflix.com')
        expect(SERVICE_DOMAINS['Spotify']).toBe('spotify.com')
    })

    it('has a reasonable number of entries', () => {
        expect(Object.keys(SERVICE_DOMAINS).length).toBeGreaterThanOrEqual(50)
    })
})

describe('getServiceMetadata', () => {
    it('returns canonical metadata for fuzzy matches', () => {
        expect(getServiceMetadata('spotify usa')).toMatchObject({
            canonicalName: 'Spotify',
            domain: 'spotify.com',
        })
    })

    it('returns a fallback guess for unknown services', () => {
        expect(getServiceMetadata('Acme Billing')).toMatchObject({
            domain: 'acme.com',
            matchType: 'fallback',
        })
    })
})

// ─── constants ───────────────────────────────────────────────────────────────

describe('constants', () => {
    it('BILLING_CYCLES includes expected values', () => {
        expect(BILLING_CYCLES).toContain('monthly')
        expect(BILLING_CYCLES).toContain('annual')
        expect(BILLING_CYCLES).toContain('weekly')
        expect(BILLING_CYCLES).toContain('quarterly')
        expect(BILLING_CYCLES).toContain('biweekly')
    })

    it('DEFAULT_CURRENCY is USD', () => {
        expect(DEFAULT_CURRENCY).toBe('USD')
    })

    it('DEFAULT_CATEGORIES includes required categories', () => {
        const names = DEFAULT_CATEGORIES.map(c => c.name)
        expect(names).toContain('Entertainment')
        expect(names).toContain('Dev Tools')
        expect(names).toContain('Health')
        expect(names).toContain('Productivity')
        expect(names).toContain('Cloud')
        expect(names).toContain('News & Media')
        expect(names).toContain('Other')
    })

    it('each category has color and icon', () => {
        for (const cat of DEFAULT_CATEGORIES) {
            expect(cat.color).toBeTruthy()
            expect(cat.icon).toBeTruthy()
            expect(cat.isDefault).toBe(true)
        }
    })

    it('EXAMPLE_INPUTS are non-empty strings', () => {
        expect(EXAMPLE_INPUTS.length).toBeGreaterThan(0)
        for (const ex of EXAMPLE_INPUTS) {
            expect(typeof ex).toBe('string')
            expect(ex.trim().length).toBeGreaterThan(0)
        }
    })
})

// ─── exportData ──────────────────────────────────────────────────────────────

describe('buildCSV', () => {
    const subs = [
        { name: 'Netflix', amount: 15.99, currency: 'USD', cycle: 'monthly', status: 'active', renewalDate: '2026-04-01', notes: '' },
        { name: 'The "Best" Service', amount: 9.99, currency: 'USD', cycle: 'annual', status: 'active', renewalDate: '', notes: 'has, commas' },
    ]

    it('includes header row', () => {
        const csv = buildCSV(subs)
        expect(csv.startsWith('Name,Amount,Currency,Cycle,Status,Renewal Date,Notes')).toBe(true)
    })

    it('has correct number of rows', () => {
        const csv = buildCSV(subs)
        const lines = csv.split('\n')
        expect(lines.length).toBe(3) // header + 2 rows
    })

    it('escapes commas and quotes in fields', () => {
        const csv = buildCSV(subs)
        // "has, commas" should be quoted
        expect(csv).toContain('"has, commas"')
        // Quotes in name should be double-escaped
        expect(csv).toContain('"The ""Best"" Service"')
    })

    it('returns just header for empty array', () => {
        const csv = buildCSV([])
        expect(csv).toBe('Name,Amount,Currency,Cycle,Status,Renewal Date,Notes')
    })
})

describe('buildJSON', () => {
    it('returns valid JSON with expected keys', () => {
        const data = { subscriptions: [{ name: 'Netflix' }], categories: [], budget: { monthlyGoal: 200 } }
        const json = buildJSON(data)
        const parsed = JSON.parse(json)
        expect(parsed.subscriptions).toHaveLength(1)
        expect(parsed.budget.monthlyGoal).toBe(200)
    })
})

// ─── importData ──────────────────────────────────────────────────────────────

describe('parseCSV', () => {
    it('parses a valid CSV', () => {
        const csv = 'Name,Amount,Cycle\nNetflix,15.99,monthly\nSpotify,9.99,annual'
        const { subscriptions, errors } = parseCSV(csv)
        expect(subscriptions).toHaveLength(2)
        expect(errors).toHaveLength(0)
        expect(subscriptions[0].name).toBe('Netflix')
        expect(subscriptions[0].amount).toBe(15.99)
        expect(subscriptions[1].cycle).toBe('annual')
    })

    it('accepts common header aliases', () => {
        const csv = 'Service,Price,Frequency,Type,Next Billing Date,Description\nNetflix,15.99,monthly,Entertainment,2026-04-01,Standard plan'
        const { subscriptions, errors } = parseCSV(csv)
        expect(errors).toHaveLength(0)
        expect(subscriptions).toHaveLength(1)
        expect(subscriptions[0]).toMatchObject({
            name: 'Netflix',
            amount: 15.99,
            cycle: 'monthly',
            category: 'Entertainment',
            renewalDate: '2026-04-01',
            notes: 'Standard plan',
        })
    })

    it('accepts underscored and dashed header aliases', () => {
        const csv = 'subscription,cost,billing,next_charge_date,memo\nClaude Pro,20,monthly,2026-04-15,Team plan'
        const { subscriptions, errors } = parseCSV(csv)
        expect(errors).toHaveLength(0)
        expect(subscriptions).toHaveLength(1)
        expect(subscriptions[0].name).toBe('Claude Pro')
        expect(subscriptions[0].amount).toBe(20)
        expect(subscriptions[0].renewalDate).toBe('2026-04-15')
        expect(subscriptions[0].notes).toBe('Team plan')
    })

    it('returns error for missing required columns', () => {
        const csv = 'Cycle,Notes\nmonthly,test'
        const { subscriptions, errors } = parseCSV(csv)
        expect(subscriptions).toHaveLength(0)
        expect(errors[0]).toContain('Missing required column')
    })

    it('skips rows with invalid amount', () => {
        const csv = 'Name,Amount\nNetflix,abc\nSpotify,9.99'
        const { subscriptions, errors } = parseCSV(csv)
        expect(subscriptions).toHaveLength(1)
        expect(errors).toHaveLength(1)
        expect(errors[0]).toContain('Invalid amount')
    })

    it('returns error for empty CSV', () => {
        const { subscriptions, errors } = parseCSV('Name,Amount')
        expect(subscriptions).toHaveLength(0)
        expect(errors).toHaveLength(1)
    })

    it('handles quoted fields with commas', () => {
        const csv = 'Name,Amount,Notes\n"My Service, Inc",10,"has, commas"'
        const { subscriptions } = parseCSV(csv)
        expect(subscriptions[0].name).toBe('My Service, Inc')
        expect(subscriptions[0].notes).toBe('has, commas')
    })

    it('normalizes cycle values', () => {
        const csv = 'Name,Amount,Cycle\nTest,10,yearly'
        const { subscriptions } = parseCSV(csv)
        expect(subscriptions[0].cycle).toBe('annual')
    })

    it('defaults missing optional fields', () => {
        const csv = 'Name,Amount\nTest,10'
        const { subscriptions } = parseCSV(csv)
        expect(subscriptions[0].currency).toBe('USD')
        expect(subscriptions[0].cycle).toBe('monthly')
        expect(subscriptions[0].status).toBe('active')
    })

    it('parses category column when present', () => {
        const csv = 'Name,Amount,Category\nNetflix,15.99,Entertainment'
        const { subscriptions } = parseCSV(csv)
        expect(subscriptions[0].category).toBe('Entertainment')
    })

    it('normalizes unsupported statuses to active', () => {
        const csv = 'Name,Amount,Status\nTest,10,canceled'
        const { subscriptions } = parseCSV(csv)
        expect(subscriptions[0].status).toBe('active')
    })

    it('enriches parsed vendor names', () => {
        const csv = 'Name,Amount\nspotify usa,9.99'
        const { subscriptions } = parseCSV(csv)
        expect(subscriptions[0]).toMatchObject({
            name: 'Spotify',
            vendorDomain: 'spotify.com',
        })
    })
})

describe('guestMigrationState', () => {
    let storage

    beforeEach(() => {
        storage = {}
        Object.defineProperty(globalThis, 'window', {
            value: globalThis,
            configurable: true,
        })
        Object.defineProperty(globalThis, 'localStorage', {
            value: {
                getItem: (key) => (key in storage ? storage[key] : null),
                setItem: (key, value) => {
                    storage[key] = String(value)
                },
                removeItem: (key) => {
                    delete storage[key]
                },
            },
            configurable: true,
        })
    })

    it('tracks pending guest migration explicitly', () => {
        expect(hasPendingGuestMigration()).toBe(false)
        markGuestMigrationPending()
        expect(hasPendingGuestMigration()).toBe(true)
        clearPendingGuestMigration()
        expect(hasPendingGuestMigration()).toBe(false)
    })

    it('returns true when guest data or a pending flag exists', () => {
        expect(shouldMigrateGuestData(false)).toBe(false)
        expect(shouldMigrateGuestData(true)).toBe(true)

        markGuestMigrationPending()
        expect(shouldMigrateGuestData(false)).toBe(true)
    })
})

describe('vendorEnrichment', () => {
    it('normalizes vendor names and domains', () => {
        expect(enrichSubscriptionCandidate({ name: 'Netflix digital usa' })).toMatchObject({
            name: 'Netflix',
            vendorDomain: 'netflix.com',
        })
    })

    it('detects duplicates across normalized vendor names', () => {
        const duplicate = findPotentialDuplicate(
            { name: 'spotify usa' },
            [{ name: 'Spotify' }]
        )
        expect(duplicate).toMatchObject({ name: 'Spotify' })
    })
})
