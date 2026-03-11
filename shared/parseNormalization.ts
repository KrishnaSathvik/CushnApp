import { CATEGORY_NAMES, normalizeCategoryName } from './categoryModel.ts'

export const ALLOWED_CYCLES = new Set(['monthly', 'annual', 'weekly', 'quarterly', 'biweekly'])

export const ALLOWED_CATEGORIES = new Set(CATEGORY_NAMES)

export function getBaseDate(currentDate?: string | null) {
  if (currentDate && /^\d{4}-\d{2}-\d{2}$/.test(currentDate)) {
    return new Date(`${currentDate}T00:00:00Z`)
  }

  const now = new Date()
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
}

export function normalizeCycle(value: unknown) {
  const lower = String(value || '').toLowerCase().trim()
  if (ALLOWED_CYCLES.has(lower)) return lower
  if (lower === 'yearly') return 'annual'
  if (lower === 'biweekly') return 'biweekly'
  if (lower.includes('quarter')) return 'quarterly'
  if (lower.includes('week')) return 'weekly'
  if (lower.includes('year') || lower.includes('annual')) return 'annual'
  return 'monthly'
}

export function normalizeCategory(value: unknown) {
  const category = normalizeCategoryName(value)
  if (ALLOWED_CATEGORIES.has(category)) return category
  return 'Other'
}

export function coerceFutureRenewalDate(value: unknown, cycle: string, currentDate?: string | null) {
  const baseDate = getBaseDate(currentDate)
  const raw = String(value || '').trim()
  if (!raw || !/^\d{4}-\d{2}-\d{2}$/.test(raw)) return null

  const parsed = new Date(`${raw}T00:00:00Z`)
  if (Number.isNaN(parsed.getTime())) return null

  while (parsed < baseDate) {
    if (cycle === 'annual') {
      parsed.setUTCFullYear(parsed.getUTCFullYear() + 1)
    } else if (cycle === 'biweekly') {
      parsed.setUTCDate(parsed.getUTCDate() + 14)
    } else if (cycle === 'weekly') {
      parsed.setUTCDate(parsed.getUTCDate() + 7)
    } else if (cycle === 'quarterly') {
      parsed.setUTCMonth(parsed.getUTCMonth() + 3)
    } else {
      parsed.setUTCMonth(parsed.getUTCMonth() + 1)
    }
  }

  return parsed.toISOString().slice(0, 10)
}
