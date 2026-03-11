import React, { createContext, useContext, useState, useEffect } from 'react'
import { DARK, LIGHT } from '../lib/tokens'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import {
    getLocalUserSettings,
    saveLocalUserSettings,
    getCloudUserSettings,
    saveCloudUserSettings,
    subscribeToCloudUserSettings,
} from '../lib/userSettings'

const defaultThemeContextValue = {
    T: DARK,
    theme: 'dark',
    themePreference: 'dark',
    setThemePreference: () => {},
    isDark: true,
}

const ThemeContext = createContext(defaultThemeContextValue)
const SYSTEM_THEME_QUERY = '(prefers-color-scheme: dark)'

function getStoredThemePreference() {
    return getLocalUserSettings().themePreference
}

function getSystemTheme() {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
        return 'dark'
    }

    return window.matchMedia(SYSTEM_THEME_QUERY).matches ? 'dark' : 'light'
}

export function ThemeProvider({ children }) {
    const [themePreference, setThemePreference] = useState(getStoredThemePreference)
    const [systemTheme, setSystemTheme] = useState(getSystemTheme)
    const [userId, setUserId] = useState(null)

    useEffect(() => {
        if (themePreference !== 'system') return undefined
        if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return undefined

        const mediaQuery = window.matchMedia(SYSTEM_THEME_QUERY)
        const handleChange = (e) => {
            setSystemTheme(e.matches ? 'dark' : 'light')
        }

        mediaQuery.addEventListener('change', handleChange)

        return () => mediaQuery.removeEventListener('change', handleChange)
    }, [themePreference])

    const activeTheme = themePreference === 'system' ? systemTheme : themePreference

    const T = activeTheme === 'light' ? LIGHT : DARK

    useEffect(() => {
        if (!isSupabaseConfigured() || !supabase) return undefined

        let cancelled = false

        async function loadAuthTheme() {
            const { data } = await supabase.auth.getSession()
            const nextUserId = data.session?.user?.id || null
            if (!cancelled) {
                setUserId(nextUserId)
            }
            if (nextUserId) {
                try {
                    const cloud = await getCloudUserSettings(nextUserId)
                    if (!cancelled && cloud?.themePreference) {
                        setThemePreference(cloud.themePreference)
                    }
                } catch (err) {
                    console.error('Failed to load theme preference:', err)
                }
            }
        }

        loadAuthTheme()

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            const nextUserId = session?.user?.id || null
            setUserId(nextUserId)
            if (!nextUserId) {
                setThemePreference(getStoredThemePreference())
                return
            }

            try {
                const cloud = await getCloudUserSettings(nextUserId)
                if (cloud?.themePreference) {
                    setThemePreference(cloud.themePreference)
                }
            } catch (err) {
                console.error('Failed to sync auth theme preference:', err)
            }
        })

        return () => {
            cancelled = true
            subscription.unsubscribe()
        }
    }, [])

    useEffect(() => {
        if (!userId) return undefined

        const subscription = subscribeToCloudUserSettings(userId, async () => {
            try {
                const cloud = await getCloudUserSettings(userId)
                if (cloud?.themePreference) {
                    setThemePreference(cloud.themePreference)
                }
            } catch (err) {
                console.error('Failed to sync cloud theme preference:', err)
            }
        })

        return () => subscription.unsubscribe()
    }, [userId])

    useEffect(() => {
        // Apply data-theme attribute for CSS variable overrides
        document.documentElement.setAttribute('data-theme', activeTheme)
        document.documentElement.style.backgroundColor = T.bgBase
        document.documentElement.style.color = T.fgPrimary
        if (document.body) {
            document.body.style.backgroundColor = T.bgBase
            document.body.style.color = T.fgPrimary
        }
        const themeColor = document.querySelector('meta[name="theme-color"]')
        if (themeColor) themeColor.setAttribute('content', T.bgBase)
        saveLocalUserSettings({ themePreference })
    }, [activeTheme, themePreference, T.bgBase, T.fgPrimary])

    const updateThemePreference = (nextPreference) => {
        setThemePreference(nextPreference)
        saveLocalUserSettings({ themePreference: nextPreference })
        if (!userId) return
        void saveCloudUserSettings(userId, { themePreference: nextPreference }).catch((err) => {
            console.error('Failed to save theme preference:', err)
        })
    }

    return (
        <ThemeContext.Provider value={{ T, theme: activeTheme, themePreference, setThemePreference: updateThemePreference, isDark: activeTheme === 'dark' }}>
            {children}
        </ThemeContext.Provider>
    )
}

export function useTheme() {
    const ctx = useContext(ThemeContext)
    return ctx
}
