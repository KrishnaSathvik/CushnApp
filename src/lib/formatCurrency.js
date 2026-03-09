// ─── Currency Formatting ──────────────────────────────────────────────────────
// Locale-aware currency formatter. Replaces all hardcoded `$` prefixes.

/**
 * Formats a numeric amount as a currency string.
 * @param {number} amount
 * @param {string} currency - ISO 4217 code, e.g. 'USD', 'EUR', 'GBP'
 * @returns {string} e.g. "$15.99", "€12.00"
 */
export function formatCurrency(amount, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount)
}

/**
 * Returns just the currency symbol for a given currency code.
 * @param {string} currency
 * @returns {string} e.g. "$", "€", "£"
 */
export function getCurrencySymbol(currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(0).replace(/[\d.,\s]/g, '')
}
