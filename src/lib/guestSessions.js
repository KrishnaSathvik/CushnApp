import { isSupabaseConfigured, supabase } from './supabase'

function isClient() {
    return typeof window !== 'undefined'
}

function buildGuestMetadata() {
    if (!isClient()) return {}

    const timezone = (() => {
        try {
            return Intl.DateTimeFormat().resolvedOptions().timeZone || null
        } catch {
            return null
        }
    })()

    return {
        language: navigator.language || null,
        platform: navigator.platform || null,
        userAgent: navigator.userAgent || null,
        timezone,
        pathname: window.location?.pathname || null,
        origin: window.location?.origin || null,
    }
}

export async function createGuestSession(displayName) {
    if (!displayName || !isSupabaseConfigured() || !supabase) return null

    const now = new Date().toISOString()
    const { data, error } = await supabase
        .from('guest_sessions')
        .insert({
            display_name: displayName,
            source: 'web',
            last_seen_at: now,
            metadata: buildGuestMetadata(),
        })
        .select('id')
        .single()

    if (error) return null
    return data?.id || null
}

export async function touchGuestSession(guestSessionId, displayName) {
    if (!guestSessionId || !isSupabaseConfigured() || !supabase) return false

    const payload = {
        last_seen_at: new Date().toISOString(),
        metadata: buildGuestMetadata(),
    }

    if (displayName) {
        payload.display_name = displayName
    }

    const { error } = await supabase
        .from('guest_sessions')
        .update(payload)
        .eq('id', guestSessionId)

    return !error
}

export async function ensureGuestSession(guestSessionId, displayName) {
    if (guestSessionId) {
        await touchGuestSession(guestSessionId, displayName)
        return guestSessionId
    }

    return createGuestSession(displayName)
}

export async function convertGuestSessionToUser(guestSessionId, userId) {
    if (!guestSessionId || !userId || !isSupabaseConfigured() || !supabase) return false

    const { error } = await supabase
        .from('guest_sessions')
        .update({
            converted_to_user_id: userId,
            converted_at: new Date().toISOString(),
            last_seen_at: new Date().toISOString(),
        })
        .eq('id', guestSessionId)

    return !error
}
