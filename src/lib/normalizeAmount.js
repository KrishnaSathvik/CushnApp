// ─── Cycle Normalization ──────────────────────────────────────────────────────
// Single function to convert any billing cycle amount to its monthly equivalent.
// Replaces the duplicated if/else logic in 4+ files.

/**
 * Converts an amount from its billing cycle to the monthly equivalent.
 * @param {number} amount - The subscription amount
 * @param {string} cycle  - Billing cycle: 'monthly', 'annual', 'weekly', 'quarterly', 'biweekly'
 * @returns {number} Monthly equivalent amount
 */
export function normalizeToMonthly(amount, cycle) {
    switch (cycle) {
        case 'annual':
        case 'yearly':
            return amount / 12
        case 'weekly':
            return amount * 4.33
        case 'quarterly':
            return amount / 3
        case 'biweekly':
            return amount * 2.17
        default: // 'monthly' or unknown
            return amount
    }
}

/**
 * Converts an amount from its billing cycle to the annual equivalent.
 * @param {number} amount
 * @param {string} cycle
 * @returns {number}
 */
export function normalizeToAnnual(amount, cycle) {
    return normalizeToMonthly(amount, cycle) * 12
}
