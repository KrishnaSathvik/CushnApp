// ─── Design Tokens ────────────────────────────────────────────────────────────

export const DARK = {
    bgBase: '#0A0D14',
    bgSubtle: '#0F1420',
    bgMuted: 'rgba(15, 21, 31, 0.72)',
    bgSurface: 'rgba(19, 24, 34, 0.94)',
    bgElevated: 'rgba(27, 34, 47, 0.98)',
    bgOverlay: 'rgba(8, 12, 19, 0.88)',
    bgHover: 'rgba(37, 46, 62, 1)',
    border: 'rgba(255, 255, 255, 0.1)',
    bgGlass: 'rgba(16, 18, 27, 0.72)',
    bgGlassStrong: 'rgba(18, 22, 31, 0.88)',

    accentPrimary: '#14B8A6',
    accentSoft: 'rgba(20, 184, 166, 0.18)',
    accentStrong: '#99F6E4',

    accentWarm: '#F97316',
    accentWarmSoft: '#431407',
    accentWarmStrong: '#FED7AA',

    fgHigh: '#F5F7FB',
    fgMedium: '#A6AFBD',
    fgSubtle: '#6B7380',
    fgDivider: 'rgba(255, 255, 255, 0.06)',
    fgPrimary: '#F5F7FB',
    fgSecondary: '#C2CAD5',
    fgTertiary: '#8792A2',
    fgDisabled: '#56606D',
    fgInverse: '#081018',
    fgOnAccent: '#F8FEFD',

    gray1: '#E5E7EB',

    semDanger: '#EF4444',
    semWarning: '#F59E0B',
    semSuccess: '#18B26B',
    semInfo: '#3B82F6',
    semCloud: '#A78BFA',
    finGain: '#22C55E',
    finLoss: '#F97316',
    finNeutral: '#94A3B8',
    finChart1: '#14B8A6',
    finChart2: '#38BDF8',
    finChart3: '#F59E0B',
    finChart4: '#A78BFA',
    finChartGrid: 'rgba(148, 163, 184, 0.18)',
    statusErrorBg: 'rgba(239, 68, 68, 0.14)',
    statusWarningBg: 'rgba(245, 158, 11, 0.14)',
    statusSuccessBg: 'rgba(34, 197, 94, 0.14)',

    shadowLg: '0 28px 72px rgba(0, 0, 0, 0.36)',
    shadowMd: '0 18px 44px rgba(0, 0, 0, 0.22)',
    shadowSm: '0 4px 12px rgba(0, 0, 0, 0.12)',
    shadowCard: '0 20px 48px rgba(0, 0, 0, 0.24), 0 1px 0 rgba(255, 255, 255, 0.04)',
    shadowFloat: '0 30px 90px rgba(0, 0, 0, 0.42), 0 0 0 1px rgba(255, 255, 255, 0.04)',

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
    bgSubtle: '#F5F7FA',
    bgMuted: 'rgba(241, 245, 249, 0.9)',
    bgSurface: 'rgba(255, 255, 255, 1)',
    bgElevated: 'rgba(247, 249, 252, 1)',
    bgOverlay: 'rgba(255, 255, 255, 0.9)',
    bgHover: 'rgba(243, 247, 250, 1)',
    border: 'rgba(15, 23, 42, 0.08)',
    bgGlass: 'rgba(255, 255, 255, 0.78)',
    bgGlassStrong: 'rgba(255, 255, 255, 0.94)',

    accentPrimary: '#14B8A6',
    accentSoft: 'rgba(20, 184, 166, 0.12)',
    accentStrong: '#0F766E',

    accentWarm: '#EA580C',
    accentWarmSoft: '#FFF7ED',
    accentWarmStrong: '#C2410C',

    fgHigh: '#1F2937',
    fgMedium: '#5D5A56',
    fgSubtle: '#90877C',
    fgDivider: 'rgba(69, 58, 45, 0.08)',
    fgPrimary: '#111827',
    fgSecondary: '#4B5563',
    fgTertiary: '#6B7280',
    fgDisabled: '#9CA3AF',
    fgInverse: '#FFFFFF',
    fgOnAccent: '#FFFFFF',

    gray1: '#273142',

    semDanger: '#EF4444',
    semWarning: '#D97706',
    semSuccess: '#18B26B',
    semInfo: '#3B82F6',
    semCloud: '#7C3AED',
    finGain: '#16A34A',
    finLoss: '#EA580C',
    finNeutral: '#64748B',
    finChart1: '#0F766E',
    finChart2: '#2563EB',
    finChart3: '#D97706',
    finChart4: '#7C3AED',
    finChartGrid: 'rgba(100, 116, 139, 0.18)',
    statusErrorBg: 'rgba(239, 68, 68, 0.12)',
    statusWarningBg: 'rgba(217, 119, 6, 0.12)',
    statusSuccessBg: 'rgba(22, 163, 74, 0.12)',

    shadowLg: '0 28px 72px rgba(15, 23, 42, 0.12)',
    shadowMd: '0 18px 44px rgba(15, 23, 42, 0.08)',
    shadowSm: '0 4px 12px rgba(15, 23, 42, 0.04)',
    shadowCard: '0 18px 40px rgba(15, 23, 42, 0.1), 0 1px 0 rgba(255, 255, 255, 0.8)',
    shadowFloat: '0 28px 72px rgba(15, 23, 42, 0.16), 0 2px 12px rgba(15, 23, 42, 0.08)',

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
