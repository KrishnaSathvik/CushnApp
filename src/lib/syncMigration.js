// ─── Guest → Auth Migration ──────────────────────────────────────────────────
// When a guest signs up, migrate all their Dexie data to Supabase and clear local.

import { db } from '../db'
import { supabase, isSupabaseConfigured } from './supabase'
import { seedDefaultCategories } from './dataService'
import { getLocalUserSettings, saveCloudUserSettings } from './userSettings'

const ONBOARDED_KEY = 'cushn_onboarded'
const LEGACY_ONBOARDED_KEY = 'subtrackr_onboarded'
const GUEST_NOTIFICATION_PREFERENCES_KEY = 'subtrackr_notify_pref'
const DEFAULT_NOTIFICATION_PREFERENCES = {
    inAppEnabled: true,
    emailEnabled: true,
    daysBefore: [1, 3],
    timezone: 'UTC',
}

const logDev = (...args) => {
    if (import.meta.env.DEV) console.log(...args)
}

const warnDev = (...args) => {
    if (import.meta.env.DEV) console.warn(...args)
}

const errorDev = (...args) => {
    if (import.meta.env.DEV) console.error(...args)
}

/**
 * Migrates all local Dexie data to Supabase for a newly authenticated user.
 * Steps:
 *   1. Seed default categories in Supabase (if needed)
 *   2. Read local categories → create in Supabase → build ID mapping
 *   3. Read local subscriptions → remap categoryId → insert to Supabase
 *   4. Read local budget → upsert to Supabase
 *   5. Clear Dexie
 *
 * @param {string} userId - The authenticated user's UUID
 * @returns {Object} { migratedSubs: number, migratedCategories: number }
 */
export async function migrateLocalToSupabase(userId) {
    if (!userId || !isSupabaseConfigured() || !supabase) {
        warnDev('Migration skipped — no userId or Supabase not configured')
        return { migratedSubs: 0, migratedCategories: 0 }
    }

    try {
        // 1. Seed default categories first
        await seedDefaultCategories(userId)

        // 2. Get local categories and create non-default ones in Supabase
        const localCategories = await db.categories.toArray()
        const categoryIdMap = {} // localId → supabaseId

        // Get the newly seeded Supabase categories
        const { data: supabaseCats, error: supabaseCatsErr } = await supabase
            .from('categories')
            .select('*')
            .eq('user_id', userId)
        if (supabaseCatsErr) throw supabaseCatsErr

        // Map local default categories to their Supabase counterparts by name
        for (const localCat of localCategories) {
            const match = supabaseCats?.find(
                sc => sc.name.toLowerCase() === localCat.name.toLowerCase()
            )
            if (match) {
                categoryIdMap[localCat.id] = match.id
            }
        }

        // Insert any non-default local categories that weren't matched
        const unmapped = localCategories.filter(c => !categoryIdMap[c.id])
        if (unmapped.length > 0) {
            const rows = unmapped.map(c => ({
                user_id: userId,
                name: c.name,
                color: c.color,
                icon: c.icon || '',
                is_default: false,
            }))

            const { data: inserted, error } = await supabase
                .from('categories')
                .insert(rows)
                .select()

            if (error) {
                throw error
            } else if (inserted) {
                // Map the newly inserted categories
                for (let i = 0; i < unmapped.length; i++) {
                    categoryIdMap[unmapped[i].id] = inserted[i].id
                }
            }
        }

        // 3. Migrate subscriptions
        const localSubs = await db.subscriptions.toArray()
        let migratedSubs = 0

        if (localSubs.length > 0) {
            const rows = localSubs.map(s => ({
                user_id: userId,
                name: s.name,
                amount: s.amount,
                currency: s.currency || 'USD',
                cycle: s.cycle || 'monthly',
                category_id: categoryIdMap[s.categoryId] || null,
                start_date: s.startDate || null,
                renewal_date: s.renewalDate || null,
                status: s.status || 'active',
                notes: s.notes || '',
                icon: s.icon || '',
                raw_input: s.rawInput || '',
                vendor_domain: s.vendorDomain || null,
                vendor_confidence: s.vendorConfidence ?? null,
                vendor_match_type: s.vendorMatchType || null,
            }))

            const { error } = await supabase
                .from('subscriptions')
                .insert(rows)

            if (error) {
                throw error
            } else {
                migratedSubs = rows.length
            }
        }

        // 4. Migrate budget
        const localBudget = await db.budget.toCollection().first()
        if (localBudget) {
            const { error } = await supabase
                .from('budgets')
                .upsert({
                    user_id: userId,
                    monthly_goal: localBudget.monthlyGoal || 200,
                    currency: localBudget.currency || 'USD',
                    updated_at: new Date().toISOString(),
                }, { onConflict: 'user_id' })

            if (error) {
                throw error
            }
        }

        // 5. Migrate guest notification preferences
        try {
            const rawNotificationPrefs = localStorage.getItem(GUEST_NOTIFICATION_PREFERENCES_KEY)
            if (rawNotificationPrefs) {
                const parsed = JSON.parse(rawNotificationPrefs)
                const notificationPreferences = {
                    ...DEFAULT_NOTIFICATION_PREFERENCES,
                    ...parsed,
                }

                const { error } = await supabase
                    .from('notification_preferences')
                    .upsert({
                        user_id: userId,
                        in_app_enabled: notificationPreferences.inAppEnabled,
                        email_enabled: notificationPreferences.emailEnabled,
                        days_before: notificationPreferences.daysBefore,
                        timezone: notificationPreferences.timezone,
                        updated_at: new Date().toISOString(),
                    }, { onConflict: 'user_id' })

                if (error) throw error
            }
        } catch (err) {
            throw new Error(`Notification preferences migration failed: ${err.message}`)
        }

        // 6. Migrate guest settings into cloud user_settings
        try {
            const localSettings = getLocalUserSettings()
            await saveCloudUserSettings(userId, {
                currency: localSettings.currency,
                billTypeByCategory: localSettings.billTypeByCategory,
                themePreference: localSettings.themePreference,
            })
        } catch (err) {
            throw new Error(`User settings migration failed: ${err.message}`)
        }

        // 7. Promote guest onboarding completion to remote auth metadata
        try {
            const hasCompletedOnboarding = !!(
                localStorage.getItem(ONBOARDED_KEY) ||
                localStorage.getItem(LEGACY_ONBOARDED_KEY)
            )

            if (hasCompletedOnboarding) {
                const { error } = await supabase.auth.updateUser({
                    data: { cushn_onboarded: true },
                })
                if (error) throw error
            }
        } catch (err) {
            throw new Error(`Onboarding state migration failed: ${err.message}`)
        }

        // 8. Clear local Dexie data
        await db.subscriptions.clear()
        await db.categories.clear()
        await db.budget.clear()

        logDev(`Migration complete: ${migratedSubs} subs, ${Object.keys(categoryIdMap).length} categories`)

        return {
            migratedSubs,
            migratedCategories: Object.keys(categoryIdMap).length,
        }
    } catch (err) {
        errorDev('Migration failed:', err)
        // Don't clear Dexie on failure — keep data safe
        return { migratedSubs: 0, migratedCategories: 0, error: err.message }
    }
}
