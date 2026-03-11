import { CATEGORY_DEFINITIONS, getBillTypeForCategoryName } from '../../shared/categoryModel.ts'

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
export const DEFAULT_CATEGORIES = [...CATEGORY_DEFINITIONS]

/** Bill Types derived implicitly from categories */
export const BILL_TYPES = {
    subscription: { id: 'subscription', label: 'Subscription', color: '#0D9488', icon: 'plus-circle', shape: 'circle' },
    utility: { id: 'utility', label: 'Utility', color: '#F97316', icon: 'zap', shape: 'diamond' },
    loan: { id: 'loan', label: 'Debt & Loans', color: '#8B5CF6', icon: 'landmark', shape: 'square' },
    insurance: { id: 'insurance', label: 'Insurance', color: '#60A5FA', icon: 'shield', shape: 'shield' },
}

/** Helper to implicitly get bill type from category name */
export function getBillTypeFromCategoryName(categoryName) {
    return BILL_TYPES[getBillTypeForCategoryName(categoryName)] || BILL_TYPES.subscription
}
