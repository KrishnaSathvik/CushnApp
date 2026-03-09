import { createClient } from '@supabase/supabase-js'

const env = typeof import.meta !== 'undefined' && import.meta.env
    ? import.meta.env
    : {}

const supabaseUrl = env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || ''

export function getSupabasePublicConfig() {
    return {
        url: supabaseUrl,
        anonKey: supabaseAnonKey,
    }
}

export function getSupabaseAuthStorageKey() {
    if (!supabaseUrl) return null
    try {
        const projectRef = new URL(supabaseUrl).hostname.split('.')[0]
        return projectRef ? `sb-${projectRef}-auth-token` : null
    } catch {
        return null
    }
}

// Only create client if credentials are configured
export const supabase = supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null

export const isSupabaseConfigured = () => !!(supabaseUrl && supabaseAnonKey)
