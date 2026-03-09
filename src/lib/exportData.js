// ─── Data Export Utilities ────────────────────────────────────────────────────
// Standalone, testable export helpers for CSV and JSON.

/**
 * Build a CSV string from an array of subscription objects.
 * @param {Object[]} subscriptions
 * @returns {string} CSV content with headers
 */
export function buildCSV(subscriptions) {
    const headers = ['Name', 'Amount', 'Currency', 'Cycle', 'Status', 'Renewal Date', 'Notes']
    const escape = (v) => {
        const s = String(v ?? '')
        return s.includes(',') || s.includes('"') || s.includes('\n')
            ? `"${s.replace(/"/g, '""')}"`
            : s
    }
    const rows = subscriptions.map(s => [
        escape(s.name),
        s.amount,
        escape(s.currency || 'USD'),
        escape(s.cycle),
        escape(s.status),
        escape(s.renewalDate || ''),
        escape(s.notes || ''),
    ].join(','))

    return [headers.join(','), ...rows].join('\n')
}

/**
 * Build a JSON string from app data.
 * @param {{ subscriptions: Object[], categories: Object[], budget: Object }} data
 * @returns {string} Pretty-printed JSON
 */
export function buildJSON(data) {
    return JSON.stringify(data, null, 2)
}

/**
 * Trigger a browser file download.
 * @param {string} content - File content
 * @param {string} filename - Download filename
 * @param {string} mimeType - MIME type
 */
export function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
}

/**
 * Export subscriptions as CSV and trigger download.
 */
export function exportCSV(subscriptions) {
    if (!subscriptions.length) throw new Error('No subscriptions to export')
    const csv = buildCSV(subscriptions)
    const date = new Date().toISOString().slice(0, 10)
    downloadFile(csv, `subtrackr-export-${date}.csv`, 'text/csv;charset=utf-8;')
}

/**
 * Export full app data as JSON and trigger download.
 */
export function exportJSON({
    subscriptions,
    categories,
    budget,
    settings = {},
    notificationPreferences = {},
    themePreference = 'system',
}) {
    const exportedAt = new Date().toISOString()
    const payload = {
        brand: 'Cushn',
        type: 'full-backup',
        version: 2,
        exportedAt,
        data: {
            subscriptions,
            categories,
            budget,
            settings: {
                ...settings,
                themePreference,
            },
            notificationPreferences,
        },
    }
    const json = buildJSON(payload)
    const date = exportedAt.slice(0, 10)
    downloadFile(json, `Cushn-Backup-${date}.json`, 'application/json;charset=utf-8;')
}
