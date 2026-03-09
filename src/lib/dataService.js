// ─── Data Service ─────────────────────────────────────────────────────────────
// Abstraction layer: Supabase for authenticated users, Dexie for guests.
// Every function accepts a `userId` parameter. If null → guest (Dexie).

import { supabase, isSupabaseConfigured, getSupabasePublicConfig } from './supabase'
import {
    getAllSubscriptions as dexieGetAll,
    getSubscriptionById as dexieGetById,
    addSubscription as dexieAdd,
    addSubscriptionsBulk as dexieAddBulk,
    updateSubscription as dexieUpdate,
    deleteSubscription as dexieDelete,
    clearAllSubscriptions as dexieClearSubs,
    pauseSubscription as dexiePause,
    getAllCategories as dexieGetCategories,
    addCategory as dexieAddCategory,
    updateCategory as dexieUpdateCategory,
    deleteCategory as dexieDeleteCategory,
    getBudget as dexieGetBudget,
    updateBudget as dexieUpdateBudget,
    getMonthlyTotal as dexieGetMonthlyTotal,
    seedDefaults as dexieSeedDefaults,
} from '../db'
import { DEFAULT_CATEGORIES, DEFAULT_BUDGET, DEFAULT_CURRENCY } from './constants'
import { normalizeToMonthly } from './normalizeAmount'

// ─── Helper: map Supabase snake_case → JS camelCase ─────────────────────────

function mapSubFromSupabase(row) {
    if (!row) return null
    return {
        id: row.id,
        name: row.name,
        amount: parseFloat(row.amount),
        currency: row.currency,
        cycle: row.cycle,
        categoryId: row.category_id,
        startDate: row.start_date,
        renewalDate: row.renewal_date,
        status: row.status,
        notes: row.notes,
        icon: row.icon,
        rawInput: row.raw_input,
        vendorDomain: row.vendor_domain,
        vendorConfidence: row.vendor_confidence != null ? Number(row.vendor_confidence) : null,
        vendorMatchType: row.vendor_match_type,
        createdAt: row.created_at,
    }
}

function mapSubToSupabase(data, userId) {
    const mapped = {}
    if (userId !== undefined) mapped.user_id = userId
    if (data.name !== undefined) mapped.name = data.name
    if (data.amount !== undefined) mapped.amount = data.amount
    if (data.currency !== undefined) mapped.currency = data.currency
    if (data.cycle !== undefined) mapped.cycle = data.cycle
    if (data.categoryId !== undefined) mapped.category_id = data.categoryId
    if (data.startDate !== undefined) mapped.start_date = data.startDate
    if (data.renewalDate !== undefined) mapped.renewal_date = data.renewalDate
    if (data.status !== undefined) mapped.status = data.status
    if (data.notes !== undefined) mapped.notes = data.notes
    if (data.icon !== undefined) mapped.icon = data.icon
    if (data.rawInput !== undefined) mapped.raw_input = data.rawInput
    if (data.vendorDomain !== undefined) mapped.vendor_domain = data.vendorDomain
    if (data.vendorConfidence !== undefined) mapped.vendor_confidence = data.vendorConfidence
    if (data.vendorMatchType !== undefined) mapped.vendor_match_type = data.vendorMatchType
    return mapped
}

function mapCatFromSupabase(row) {
    if (!row) return null
    return {
        id: row.id,
        name: row.name,
        color: row.color,
        icon: row.icon,
        isDefault: row.is_default,
    }
}

function mapBudgetFromSupabase(row) {
    if (!row) return null
    return {
        id: row.id,
        monthlyGoal: parseFloat(row.monthly_goal),
        currency: row.currency,
        categoryLimits: row.category_limits || {},
        updatedAt: row.updated_at,
    }
}

async function fetchBudgetForUser(userId) {
    return supabase
        .from('budgets')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle()
}

async function fetchBudgetViaRest(userId, accessToken) {
    const { url, anonKey } = getSupabasePublicConfig()
    if (!url || !anonKey || !accessToken) return { data: null, error: null }

    const endpoint = `${url}/rest/v1/budgets?select=*&user_id=eq.${encodeURIComponent(userId)}`
    try {
        const response = await fetch(endpoint, {
            headers: {
                apikey: anonKey,
                Authorization: `Bearer ${accessToken}`,
            },
        })

        if (!response.ok) {
            const message = await response.text()
            return {
                data: null,
                error: new Error(message || `REST budget fetch failed: ${response.status}`),
            }
        }

        const rows = await response.json()
        return {
            data: Array.isArray(rows) ? rows[0] || null : null,
            error: null,
        }
    } catch (error) {
        return {
            data: null,
            error,
        }
    }
}

const isCloud = (userId) => userId && isSupabaseConfigured() && supabase
const DEFAULT_NOTIFICATION_PREFERENCES = {
    inAppEnabled: true,
    emailEnabled: false,
    daysBefore: [1, 3],
    timezone: 'UTC',
}

function addDays(dateString, days) {
    const date = new Date(`${dateString}T00:00:00Z`)
    date.setUTCDate(date.getUTCDate() + days)
    return date.toISOString().slice(0, 10)
}

function buildReminderEventsForSubscription(userId, subscription, preferences) {
    if (!subscription?.id || subscription.status !== 'active' || !subscription.renewalDate) {
        return []
    }

    const uniqueDaysBefore = [...new Set(
        (preferences?.daysBefore || DEFAULT_NOTIFICATION_PREFERENCES.daysBefore)
            .map((value) => Number(value))
            .filter((value) => Number.isInteger(value) && value >= 0),
    )]

    const channels = []
    if (preferences?.inAppEnabled ?? DEFAULT_NOTIFICATION_PREFERENCES.inAppEnabled) {
        channels.push('in_app')
    }
    if (preferences?.emailEnabled ?? DEFAULT_NOTIFICATION_PREFERENCES.emailEnabled) {
        channels.push('email')
    }

    if (channels.length === 0 || uniqueDaysBefore.length === 0) {
        return []
    }

    const events = []
    for (const daysBefore of uniqueDaysBefore) {
        const reminderDate = addDays(subscription.renewalDate, -daysBefore)
        for (const channel of channels) {
            events.push({
                user_id: userId,
                subscription_id: subscription.id,
                renewal_date: subscription.renewalDate,
                reminder_date: reminderDate,
                channel,
                status: 'queued',
                error_text: '',
                sent_at: null,
            })
        }
    }

    return events
}

async function clearQueuedReminderEventsForSubscriptions(userId, subscriptionIds) {
    const ids = (subscriptionIds || []).filter(Boolean)
    if (!ids.length) return

    const { error } = await supabase
        .from('notification_events')
        .delete()
        .eq('user_id', userId)
        .eq('status', 'queued')
        .in('subscription_id', ids)

    if (error) throw error
}

async function syncReminderEventsForSubscriptions(userId, subscriptions, preferences) {
    if (!isCloud(userId)) return

    const items = (subscriptions || []).filter(Boolean)
    const subscriptionIds = items.map((item) => item.id).filter(Boolean)
    await clearQueuedReminderEventsForSubscriptions(userId, subscriptionIds)

    const events = items.flatMap((item) => buildReminderEventsForSubscription(userId, item, preferences))
    if (!events.length) return

    const { error } = await supabase
        .from('notification_events')
        .upsert(events, {
            onConflict: 'user_id,subscription_id,renewal_date,reminder_date,channel',
        })

    if (error) throw error
}

function mapNotificationEventFromSupabase(row) {
    if (!row) return null
    return {
        id: row.id,
        userId: row.user_id,
        subscriptionId: row.subscription_id,
        renewalDate: row.renewal_date,
        reminderDate: row.reminder_date,
        channel: row.channel,
        status: row.status,
        errorText: row.error_text || '',
        sentAt: row.sent_at,
        createdAt: row.created_at,
    }
}

// ─── Subscriptions ───────────────────────────────────────────────────────────

async function fetchSubscriptionsForUser(userId) {
    return supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .order('renewal_date', { ascending: true })
}

async function fetchSubscriptionsViaRest(userId, accessToken) {
    const { url, anonKey } = getSupabasePublicConfig()
    if (!url || !anonKey || !accessToken) return { data: null, error: null }

    const endpoint = `${url}/rest/v1/subscriptions?select=*&user_id=eq.${encodeURIComponent(userId)}&order=renewal_date.asc`
    try {
        const response = await fetch(endpoint, {
            headers: {
                apikey: anonKey,
                Authorization: `Bearer ${accessToken}`,
            },
        })

        if (!response.ok) {
            const message = await response.text()
            return {
                data: null,
                error: new Error(message || `REST subscriptions fetch failed: ${response.status}`),
            }
        }

        return {
            data: await response.json(),
            error: null,
        }
    } catch (error) {
        return {
            data: null,
            error,
        }
    }
}

export async function getSubscriptions(userId) {
    if (!isCloud(userId)) return dexieGetAll()

    let { data, error } = await fetchSubscriptionsForUser(userId)
    if (error) throw error

    // On hard refresh, the cached auth session can appear before the first
    // database request is fully authenticated. In that case RLS yields an
    // empty result even though the correct user is signed in. Validate the
    // current auth user once and retry the read for the same account.
    if ((data || []).length === 0) {
        const { data: authData, error: authError } = await supabase.auth.getUser()
        if (!authError && authData?.user?.id === userId) {
            const retry = await fetchSubscriptionsForUser(userId)
            data = retry.data
            error = retry.error

            if (!error && (data || []).length === 0) {
                const { data: sessionData } = await supabase.auth.getSession()
                const accessToken = sessionData?.session?.access_token
                const restRetry = await fetchSubscriptionsViaRest(userId, accessToken)
                if (!restRetry.error && Array.isArray(restRetry.data)) {
                    data = restRetry.data
                } else if (restRetry.error) {
                    error = restRetry.error
                }
            }
        }
    }

    if (error) throw error
    return (data || []).map(mapSubFromSupabase)
}

export async function getSubscriptionById(userId, id) {
    if (!isCloud(userId)) return dexieGetById(Number(id))

    const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .maybeSingle()

    if (error) throw error
    return mapSubFromSupabase(data)
}

export async function addSubscription(userId, data) {
    if (!isCloud(userId)) return dexieAdd(data)

    const record = mapSubToSupabase({
        status: 'active',
        ...data,
    }, userId)

    const { data: inserted, error } = await supabase
        .from('subscriptions')
        .insert(record)
        .select()
        .single()

    if (error) throw error
    const subscription = mapSubFromSupabase(inserted)
    const preferences = await getNotificationPreferences(userId)
    await syncReminderEventsForSubscriptions(userId, [subscription], preferences)
    return subscription
}

export async function addSubscriptionsBulk(userId, items) {
    if (!Array.isArray(items) || items.length === 0) return []
    if (!isCloud(userId)) return dexieAddBulk(items)

    const records = items.map((item) => mapSubToSupabase({
        status: 'active',
        ...item,
    }, userId))
    const { data, error } = await supabase
        .from('subscriptions')
        .insert(records)
        .select()

    if (error) throw error
    const subscriptions = (data || []).map(mapSubFromSupabase)
    const preferences = await getNotificationPreferences(userId)
    await syncReminderEventsForSubscriptions(userId, subscriptions, preferences)
    return subscriptions
}

export async function updateSubscription(userId, id, data) {
    if (!isCloud(userId)) return dexieUpdate(Number(id), data)

    const record = mapSubToSupabase(data)
    const { data: updated, error } = await supabase
        .from('subscriptions')
        .update(record)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single()

    if (error) throw error
    const subscription = mapSubFromSupabase(updated)
    const preferences = await getNotificationPreferences(userId)
    await syncReminderEventsForSubscriptions(userId, [subscription], preferences)
    return subscription
}

export async function deleteSubscription(userId, id) {
    if (!isCloud(userId)) return dexieDelete(Number(id))

    await clearQueuedReminderEventsForSubscriptions(userId, [id])

    const { error } = await supabase
        .from('subscriptions')
        .delete()
        .eq('id', id)
        .eq('user_id', userId)

    if (error) throw error
}

export async function clearAllSubscriptions(userId) {
    if (!isCloud(userId)) return dexieClearSubs()

    const { error } = await supabase
        .from('subscriptions')
        .delete()
        .eq('user_id', userId)
    if (error) throw error
}

export async function pauseSubscription(userId, id) {
    if (!isCloud(userId)) return dexiePause(Number(id))

    await clearQueuedReminderEventsForSubscriptions(userId, [id])
    return updateSubscription(userId, id, { status: 'paused' })
}

// ─── Categories ──────────────────────────────────────────────────────────────

export async function getCategories(userId) {
    if (!isCloud(userId)) return dexieGetCategories()

    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', userId)
        .order('name')

    if (error) throw error
    return (data || []).map(mapCatFromSupabase)
}

export async function addCategory(userId, data) {
    if (!isCloud(userId)) return dexieAddCategory(data)

    const { data: inserted, error } = await supabase
        .from('categories')
        .insert({
            user_id: userId,
            name: data.name,
            color: data.color,
            icon: data.icon || 'tag',
            is_default: !!data.isDefault,
        })
        .select()
        .single()

    if (error) throw error
    return mapCatFromSupabase(inserted)
}

export async function updateCategory(userId, id, data) {
    if (!isCloud(userId)) return dexieUpdateCategory(Number(id), data)

    const payload = {}
    if (data.name !== undefined) payload.name = data.name
    if (data.color !== undefined) payload.color = data.color
    if (data.icon !== undefined) payload.icon = data.icon
    if (data.isDefault !== undefined) payload.is_default = data.isDefault

    const { data: updated, error } = await supabase
        .from('categories')
        .update(payload)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single()

    if (error) throw error
    return mapCatFromSupabase(updated)
}

export async function deleteCategory(userId, id, fallbackCategoryId = null) {
    if (!isCloud(userId)) return dexieDeleteCategory(Number(id), fallbackCategoryId ? Number(fallbackCategoryId) : null)

    if (fallbackCategoryId) {
        const { error: reassignError } = await supabase
            .from('subscriptions')
            .update({ category_id: fallbackCategoryId })
            .eq('user_id', userId)
            .eq('category_id', id)
        if (reassignError) throw reassignError
    }

    const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)
        .eq('user_id', userId)

    if (error) throw error
}

/**
 * Seeds default categories for a new authenticated user in Supabase.
 */
export async function seedDefaultCategories(userId) {
    if (!isCloud(userId)) {
        return dexieSeedDefaults()
    }

    // Check if user already has categories
    const { count, error: countErr } = await supabase
        .from('categories')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)

    if (countErr) throw countErr
    if (count > 0) return // Already seeded

    const rows = DEFAULT_CATEGORIES.map(cat => ({
        user_id: userId,
        name: cat.name,
        color: cat.color,
        icon: cat.icon,
        is_default: cat.isDefault,
    }))

    const { error } = await supabase
        .from('categories')
        .insert(rows)

    if (error) throw error
}

// ─── Budget ──────────────────────────────────────────────────────────────────

export async function getBudget(userId) {
    if (!isCloud(userId)) return dexieGetBudget()

    let { data, error } = await fetchBudgetForUser(userId)
    if (error) throw error

    if (!data) {
        const { data: authData, error: authError } = await supabase.auth.getUser()
        if (!authError && authData?.user?.id === userId) {
            const retry = await fetchBudgetForUser(userId)
            data = retry.data
            error = retry.error

            if (!error && !data) {
                const { data: sessionData } = await supabase.auth.getSession()
                const accessToken = sessionData?.session?.access_token
                const restRetry = await fetchBudgetViaRest(userId, accessToken)
                if (!restRetry.error) {
                    data = restRetry.data
                } else {
                    error = restRetry.error
                }
            }
        }
    }

    if (error) throw error
    if (!data) return { monthlyGoal: DEFAULT_BUDGET, currency: DEFAULT_CURRENCY }
    return mapBudgetFromSupabase(data)
}

export async function saveBudget(userId, data) {
    if (!isCloud(userId)) return dexieUpdateBudget(data)

    const existing = await getBudget(userId)

    const record = {
        user_id: userId,
        monthly_goal: data.monthlyGoal ?? existing?.monthlyGoal ?? DEFAULT_BUDGET,
        currency: data.currency ?? existing?.currency ?? DEFAULT_CURRENCY,
        category_limits: data.categoryLimits ?? existing?.categoryLimits ?? {},
        updated_at: new Date().toISOString(),
    }

    const { data: saved, error } = await supabase
        .from('budgets')
        .upsert(record, { onConflict: 'user_id' })
        .select()
        .single()

    if (error) throw error
    return mapBudgetFromSupabase(saved)
}

// ─── Notification Preferences ────────────────────────────────────────────────

function mapNotificationPrefsFromSupabase(row) {
    if (!row) return { ...DEFAULT_NOTIFICATION_PREFERENCES }
    return {
        inAppEnabled: row.in_app_enabled ?? true,
        emailEnabled: row.email_enabled ?? false,
        daysBefore: row.days_before || [1, 3],
        timezone: row.timezone || 'UTC',
    }
}

export async function getNotificationPreferences(userId) {
    if (!isCloud(userId)) return { ...DEFAULT_NOTIFICATION_PREFERENCES }

    const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', userId)
        .single()

    if (error && error.code !== 'PGRST116') throw error
    if (!data) return { ...DEFAULT_NOTIFICATION_PREFERENCES }
    return mapNotificationPrefsFromSupabase(data)
}

export async function saveNotificationPreferences(userId, data) {
    if (!isCloud(userId)) {
        return { ...DEFAULT_NOTIFICATION_PREFERENCES, ...data }
    }

    const payload = {
        user_id: userId,
        in_app_enabled: data.inAppEnabled ?? true,
        email_enabled: data.emailEnabled ?? false,
        days_before: data.daysBefore || [1, 3],
        timezone: data.timezone || 'UTC',
        updated_at: new Date().toISOString(),
    }

    const { data: updated, error } = await supabase
        .from('notification_preferences')
        .upsert(payload, { onConflict: 'user_id' })
        .select()
        .single()

    if (error) throw error
    const preferences = mapNotificationPrefsFromSupabase(updated)
    const subscriptions = await getSubscriptions(userId)
    await syncReminderEventsForSubscriptions(userId, subscriptions, preferences)
    return preferences
}

export async function getInAppNotificationEvents(userId) {
    if (!isCloud(userId)) return []

    const today = new Date().toISOString().slice(0, 10)
    const { data, error } = await supabase
        .from('notification_events')
        .select('*')
        .eq('user_id', userId)
        .eq('channel', 'in_app')
        .eq('status', 'queued')
        .lte('reminder_date', today)
        .order('reminder_date', { ascending: true })
        .order('created_at', { ascending: false })
        .limit(12)

    if (error) throw error
    return (data || []).map(mapNotificationEventFromSupabase)
}

export async function markNotificationEventHandled(userId, eventId) {
    if (!isCloud(userId)) return null

    const { data, error } = await supabase
        .from('notification_events')
        .update({
            status: 'sent',
            sent_at: new Date().toISOString(),
            error_text: '',
        })
        .eq('id', eventId)
        .eq('user_id', userId)
        .select()
        .single()

    if (error) throw error
    return mapNotificationEventFromSupabase(data)
}

// ─── Computed helpers ────────────────────────────────────────────────────────

export async function getMonthlyTotal(userId) {
    if (!isCloud(userId)) return dexieGetMonthlyTotal()

    const subs = await getSubscriptions(userId)
    return subs
        .filter(s => s.status === 'active')
        .reduce((sum, s) => sum + normalizeToMonthly(s.amount, s.cycle), 0)
}

// ─── Realtime subscription helpers ──────────────────────────────────────────

const realtimeRegistry = new Map()

/**
 * Subscribes to realtime changes for a user's data.
 * Returns an object with an `unsubscribe()` method.
 */
export function subscribeToChanges(userId, { onSubscriptionChange, onCategoryChange, onBudgetChange, onNotificationChange }) {
    if (!isCloud(userId)) return { unsubscribe: () => { } }

    const listener = { onSubscriptionChange, onCategoryChange, onBudgetChange, onNotificationChange }
    let entry = realtimeRegistry.get(userId)

    if (!entry) {
        const listeners = new Set()

        const notify = (key) => {
            for (const item of listeners) {
                item[key]?.()
            }
        }

        const channel = supabase
            .channel(`user-data-${userId}`)
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'subscriptions', filter: `user_id=eq.${userId}` },
                () => notify('onSubscriptionChange')
            )
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'categories', filter: `user_id=eq.${userId}` },
                () => notify('onCategoryChange')
            )
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'budgets', filter: `user_id=eq.${userId}` },
                () => notify('onBudgetChange')
            )
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'notification_events', filter: `user_id=eq.${userId}` },
                () => notify('onNotificationChange')
            )
            .subscribe()

        entry = { channel, listeners }
        realtimeRegistry.set(userId, entry)
    }

    entry.listeners.add(listener)

    return {
        unsubscribe: () => {
            const current = realtimeRegistry.get(userId)
            if (!current) return

            current.listeners.delete(listener)

            if (current.listeners.size === 0) {
                supabase.removeChannel(current.channel)
                realtimeRegistry.delete(userId)
            }
        },
    }
}
