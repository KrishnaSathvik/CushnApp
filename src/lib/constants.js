// ─── App Constants ────────────────────────────────────────────────────────────
// Single source of truth for all shared values used across the app.

/** All supported billing cycles */
export const BILLING_CYCLES = ['monthly', 'annual', 'weekly', 'quarterly', 'biweekly']

/** Default currency for new subscriptions */
export const DEFAULT_CURRENCY = 'USD'

/** Default monthly budget goal for new users */
export const DEFAULT_BUDGET = 200

/** Routes where the bottom tab bar should be hidden */
export const HIDDEN_TAB_ROUTES = ['/landing', '/login', '/signup', '/forgot-password', '/reset-password', '/auth/callback', '/guest', '/onboarding']

/** Example input strings shown as tap-to-add chips on the AI input screen */
export const EXAMPLE_INPUTS = [
    'Netflix 15.99 monthly',
    'Spotify 9.99 entertainment',
    'GitHub 4 monthly dev tools',
    'Claude Pro 20/mo productivity',
]

/** Default category definitions (name, color, icon) */
export const DEFAULT_CATEGORIES = [
    { name: 'Entertainment', color: '#F87171', icon: 'film', isDefault: true },
    { name: 'Dev Tools', color: '#60A5FA', icon: 'code', isDefault: true },
    { name: 'Health', color: '#34D399', icon: 'heart-pulse', isDefault: true },
    { name: 'Productivity', color: '#0D9488', icon: 'lightbulb', isDefault: true },
    { name: 'Cloud', color: '#A78BFA', icon: 'cloud', isDefault: true },
    { name: 'News & Media', color: '#FBBF24', icon: 'newspaper', isDefault: true },
    { name: 'Utilities', color: '#F97316', icon: 'zap', isDefault: true },
    { name: 'Loans & Cards', color: '#A78BFA', icon: 'landmark', isDefault: true },
    { name: 'Insurance', color: '#60A5FA', icon: 'shield', isDefault: true },
    { name: 'Other', color: '#6B7280', icon: 'tag', isDefault: true },
]

/** Bill Types derived implicitly from categories */
export const BILL_TYPES = {
    subscription: { id: 'subscription', label: 'Subscription', color: '#0D9488', icon: 'plus-circle', shape: 'circle' },
    utility: { id: 'utility', label: 'Utility', color: '#F97316', icon: 'zap', shape: 'diamond' },
    loan: { id: 'loan', label: 'Loans & Cards', color: '#A78BFA', icon: 'landmark', shape: 'square' },
    insurance: { id: 'insurance', label: 'Insurance', color: '#60A5FA', icon: 'shield', shape: 'shield' },
}

/** Helper to implicitly get bill type from category name */
export function getBillTypeFromCategoryName(categoryName) {
    const name = (categoryName || '').toLowerCase()
    if (name.includes('utilit')) return BILL_TYPES.utility
    if (name.includes('loan') || name.includes('card')) return BILL_TYPES.loan
    if (name.includes('insurance')) return BILL_TYPES.insurance
    return BILL_TYPES.subscription
}
