import { DEFAULT_CURRENCY } from './constants'
import { supabase, isSupabaseConfigured } from './supabase'

export const LOCAL_CURRENCY_KEY = 'subtrackr_currency'
export const LOCAL_BILL_TYPE_MAPPING_KEY = 'subtrackr_bill_type_mapping'
export const LOCAL_THEME_PREFERENCE_KEY = 'cushn_theme'
export const LEGACY_THEME_PREFERENCE_KEY = 'subtrackr_theme'

const DEFAULT_SETTINGS = {
    currency: DEFAULT_CURRENCY,
    billTypeByCategory: {},
    themePreference: 'system',
}

function hasWindow() {
    return typeof window !== 'undefined'
}

export function normalizeThemePreference(value) {
    return ['light', 'dark', 'system'].includes(value) ? value : 'system'
}

export function normalizeCurrency(value) {
    return typeof value === 'string' && value.trim() ? value : DEFAULT_CURRENCY
}

export function normalizeBillTypeByCategory(value) {
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {}
}

export function getLocalUserSettings() {
    if (!hasWindow()) return { ...DEFAULT_SETTINGS }

    let billTypeByCategory = {}
    try {
        const raw = localStorage.getItem(LOCAL_BILL_TYPE_MAPPING_KEY)
        if (raw) {
            billTypeByCategory = normalizeBillTypeByCategory(JSON.parse(raw))
        }
    } catch {
        billTypeByCategory = {}
    }

    return {
        currency: normalizeCurrency(localStorage.getItem(LOCAL_CURRENCY_KEY)),
        billTypeByCategory,
        themePreference: normalizeThemePreference(
            localStorage.getItem(LOCAL_THEME_PREFERENCE_KEY)
            || localStorage.getItem(LEGACY_THEME_PREFERENCE_KEY)
            || 'system'
        ),
    }
}

export function saveLocalUserSettings(next) {
    if (!hasWindow()) return

    if (next.currency !== undefined) {
        localStorage.setItem(LOCAL_CURRENCY_KEY, normalizeCurrency(next.currency))
    }
    if (next.billTypeByCategory !== undefined) {
        localStorage.setItem(
            LOCAL_BILL_TYPE_MAPPING_KEY,
            JSON.stringify(normalizeBillTypeByCategory(next.billTypeByCategory))
        )
    }
    if (next.themePreference !== undefined) {
        localStorage.setItem(
            LOCAL_THEME_PREFERENCE_KEY,
            normalizeThemePreference(next.themePreference)
        )
    }
}

function isMissingUserSettingsTable(error) {
    const message = `${error?.message || ''} ${error?.details || ''}`.toLowerCase()
    return error?.code === '42P01' || message.includes('user_settings')
}

function normalizeCloudRow(row) {
    return {
        currency: normalizeCurrency(row?.currency),
        billTypeByCategory: normalizeBillTypeByCategory(row?.bill_type_by_category),
        themePreference: normalizeThemePreference(row?.theme_preference),
    }
}

export async function getCloudUserSettings(userId) {
    if (!userId || !isSupabaseConfigured() || !supabase) return null

    const { data, error } = await supabase
        .from('user_settings')
        .select('currency,bill_type_by_category,theme_preference')
        .eq('user_id', userId)
        .maybeSingle()

    if (error) {
        if (isMissingUserSettingsTable(error)) return null
        throw error
    }

    return data ? normalizeCloudRow(data) : null
}

export async function saveCloudUserSettings(userId, patch) {
    if (!userId || !isSupabaseConfigured() || !supabase) return null

    const payload = {
        user_id: userId,
        updated_at: new Date().toISOString(),
    }
    if (patch.currency !== undefined) payload.currency = normalizeCurrency(patch.currency)
    if (patch.billTypeByCategory !== undefined) payload.bill_type_by_category = normalizeBillTypeByCategory(patch.billTypeByCategory)
    if (patch.themePreference !== undefined) payload.theme_preference = normalizeThemePreference(patch.themePreference)

    const { data, error } = await supabase
        .from('user_settings')
        .upsert(payload, { onConflict: 'user_id' })
        .select('currency,bill_type_by_category,theme_preference')
        .single()

    if (error) {
        if (isMissingUserSettingsTable(error)) return null
        throw error
    }

    return normalizeCloudRow(data)
}

export function subscribeToCloudUserSettings(userId, onChange) {
    if (!userId || !isSupabaseConfigured() || !supabase) {
        return { unsubscribe: () => {} }
    }

    const channel = supabase
        .channel(`user-settings-${userId}`)
        .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'user_settings', filter: `user_id=eq.${userId}` },
            onChange
        )
        .subscribe()

    return {
        unsubscribe: () => {
            supabase.removeChannel(channel)
        },
    }
}
