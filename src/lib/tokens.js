// ─── Design Tokens ────────────────────────────────────────────────────────────

export const DARK = {
    bgBase: '#000000',
    bgSubtle: '#0A0A0A',
    bgMuted: '#111111',
    bgSurface: '#141414',
    bgElevated: '#1A1A1A',
    bgOverlay: 'rgba(0, 0, 0, 0.80)',
    bgHover: '#1F1F1F',
    border: 'rgba(255, 255, 255, 0.08)',
    bgGlass: 'rgba(10, 10, 10, 0.80)',
    bgGlassStrong: 'rgba(14, 14, 14, 0.92)',

    accentPrimary: '#14B8A6',
    accentSoft: 'rgba(20, 184, 166, 0.15)',
    accentStrong: '#5EEAD4',

    accentWarm: '#F97316',
    accentWarmSoft: 'rgba(249, 115, 22, 0.12)',
    accentWarmStrong: '#FB923C',

    fgDivider: 'rgba(255, 255, 255, 0.06)',
    fgPrimary: 'rgba(255, 255, 255, 0.92)',
    fgSecondary: 'rgba(255, 255, 255, 0.56)',
    fgTertiary: 'rgba(255, 255, 255, 0.34)',
    fgInverse: '#000000',
    fgOnAccent: '#FFFFFF',

    semDanger: '#F87171',
    semWarning: '#FBBF24',
    semSuccess: '#34D399',
    semInfo: '#60A5FA',
    semCloud: '#A78BFA',
    finGain: '#34D399',
    finLoss: '#F87171',
    finNeutral: '#A1A1A1',
    finChart1: '#14B8A6',
    finChart2: '#60A5FA',
    finChart3: '#FBBF24',
    finChart4: '#A78BFA',
    finChartGrid: 'rgba(255, 255, 255, 0.06)',
    statusErrorBg: 'rgba(248, 113, 113, 0.10)',
    statusWarningBg: 'rgba(251, 191, 36, 0.10)',
    statusSuccessBg: 'rgba(52, 211, 153, 0.10)',

    shadowLg: '0 28px 72px rgba(0, 0, 0, 0.50)',
    shadowMd: '0 18px 44px rgba(0, 0, 0, 0.35)',
    shadowSm: '0 4px 12px rgba(0, 0, 0, 0.20)',
    shadowCard: '0 0 0 1px rgba(255, 255, 255, 0.06)',
    shadowFloat: '0 24px 64px rgba(0, 0, 0, 0.50), 0 0 0 1px rgba(255, 255, 255, 0.06)',

    radiusXs: 4,
    radiusSm: 8,
    radiusMd: 12,
    radiusLg: 16,
    radiusXl: 20,
    radius2xl: 24,
    radiusFull: 9999,
}

// Balanced Light — orange accent layer only, neutral slate text for legibility
export const LIGHT = {
    bgBase: '#FFFFFF',
    bgSubtle: '#FAFAFA',
    bgMuted: '#F5F5F5',
    bgSurface: '#FFFFFF',
    bgElevated: '#FAFAFA',
    bgOverlay: 'rgba(255, 255, 255, 0.85)',
    bgHover: '#F0F0F0',
    border: 'rgba(0, 0, 0, 0.08)',
    bgGlass: 'rgba(255, 255, 255, 0.82)',
    bgGlassStrong: 'rgba(255, 255, 255, 0.95)',

    accentPrimary: '#0D9488',
    accentSoft: 'rgba(13, 148, 136, 0.08)',
    accentStrong: '#0F766E',

    accentWarm: '#EA580C',
    accentWarmSoft: 'rgba(234, 88, 12, 0.06)',
    accentWarmStrong: '#C2410C',

    fgDivider: 'rgba(0, 0, 0, 0.06)',
    fgPrimary: 'rgba(0, 0, 0, 0.88)',
    fgSecondary: 'rgba(0, 0, 0, 0.55)',
    fgTertiary: 'rgba(0, 0, 0, 0.34)',
    fgInverse: '#FFFFFF',
    fgOnAccent: '#FFFFFF',

    semDanger: '#EF4444',
    semWarning: '#D97706',
    semSuccess: '#059669',
    semInfo: '#2563EB',
    semCloud: '#7C3AED',
    finGain: '#059669',
    finLoss: '#EF4444',
    finNeutral: '#666666',
    finChart1: '#0D9488',
    finChart2: '#2563EB',
    finChart3: '#D97706',
    finChart4: '#7C3AED',
    finChartGrid: 'rgba(0, 0, 0, 0.06)',
    statusErrorBg: 'rgba(239, 68, 68, 0.06)',
    statusWarningBg: 'rgba(217, 119, 6, 0.06)',
    statusSuccessBg: 'rgba(5, 150, 105, 0.06)',

    shadowLg: '0 28px 72px rgba(0, 0, 0, 0.08)',
    shadowMd: '0 18px 44px rgba(0, 0, 0, 0.05)',
    shadowSm: '0 2px 8px rgba(0, 0, 0, 0.04)',
    shadowCard: '0 0 0 1px rgba(0, 0, 0, 0.06)',
    shadowFloat: '0 24px 64px rgba(0, 0, 0, 0.10), 0 0 0 1px rgba(0, 0, 0, 0.06)',

    radiusXs: 4,
    radiusSm: 8,
    radiusMd: 12,
    radiusLg: 16,
    radiusXl: 20,
    radius2xl: 24,
    radiusFull: 9999,
}

// Default export — resolved at import time from localStorage
// Components that need reactive theme should use useTheme() instead
export const T = DARK

export const CATEGORY_COLORS = {
    entertainment: '#F87171',
    devtools: '#60A5FA',
    health: '#34D399',
    productivity: '#0D9488',
    news: '#FBBF24',
    cloud: '#A78BFA',
    other: '#6B7280',
}

export const CATEGORY_COLORS_LIGHT = {
    entertainment: '#E11D48', // Vibrant Rose
    devtools: '#2563EB',      // Solid Blue
    health: '#059669',        // Deep Emerald
    productivity: '#0F766E',  // Deep Teal
    news: '#EA580C',          // Burnt Orange
    cloud: '#7C3AED',         // Vivid Violet
    other: '#52525B',         // Zinc 600 for contrast
}

// Category name → color mapping (case-insensitive)
export function getCategoryColor(name, isDark = true) {
    const colors = isDark ? CATEGORY_COLORS : CATEGORY_COLORS_LIGHT
    if (!name) return colors.other
    const key = name.toLowerCase().replace(/\s+/g, '')
    if (key.includes('entertain')) return colors.entertainment
    if (key.includes('dev') || key.includes('tool')) return colors.devtools
    if (key.includes('health') || key.includes('fitness')) return colors.health
    if (key.includes('product')) return colors.productivity
    if (key.includes('news') || key.includes('media')) return colors.news
    if (key.includes('cloud') || key.includes('storage')) return colors.cloud
    return colors.other
}
