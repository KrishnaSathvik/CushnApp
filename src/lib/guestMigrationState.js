const GUEST_MIGRATION_PENDING_KEY = 'cushn_guest_migration_pending'

export function hasPendingGuestMigration() {
    if (typeof window === 'undefined') return false
    return localStorage.getItem(GUEST_MIGRATION_PENDING_KEY) === 'true'
}

export function markGuestMigrationPending() {
    if (typeof window === 'undefined') return
    localStorage.setItem(GUEST_MIGRATION_PENDING_KEY, 'true')
}

export function clearPendingGuestMigration() {
    if (typeof window === 'undefined') return
    localStorage.removeItem(GUEST_MIGRATION_PENDING_KEY)
}

export function shouldMigrateGuestData(hasGuestSession) {
    return Boolean(hasGuestSession || hasPendingGuestMigration())
}
