import Dexie from 'dexie'
import { DEFAULT_CATEGORIES, DEFAULT_BUDGET as DEFAULT_BUDGET_AMOUNT, DEFAULT_CURRENCY } from '../lib/constants'
import { normalizeToMonthly } from '../lib/normalizeAmount'

const db = new Dexie('SubTrackrDB')

db.version(1).stores({
  subscriptions:
    '++id, name, amount, currency, cycle, categoryId, startDate, renewalDate, status, notes, icon, createdAt, rawInput',
  categories: '++id, name, color, icon, isDefault',
  budget: '++id, monthlyGoal, currency, updatedAt',
})

db.version(2).stores({
  subscriptions:
    '++id, name, amount, currency, cycle, categoryId, startDate, renewalDate, status, notes, icon, createdAt, rawInput, endsAt, cancelledAt, reviewedAt, snoozedUntil, cancelUrl',
  categories: '++id, name, color, icon, isDefault',
  budget: '++id, monthlyGoal, currency, updatedAt',
})



export async function seedDefaults() {
  const existingRecords = await db.categories.toArray()
  if (existingRecords.length === 0) {
    await db.categories.bulkAdd(DEFAULT_CATEGORIES)
  } else {
    const existingNames = new Set(existingRecords.map(c => c.name))
    const missing = DEFAULT_CATEGORIES.filter(c => !existingNames.has(c.name))
    if (missing.length > 0) {
      await db.categories.bulkAdd(missing)
    }
  }
}

// --- Subscriptions ---

export async function getAllSubscriptions() {
  return db.subscriptions.orderBy('renewalDate').toArray()
}

export async function getSubscriptionById(id) {
  return db.subscriptions.get(id)
}

export async function addSubscription(data) {
  const record = {
    status: 'active',
    createdAt: new Date().toISOString(),
    ...data,
  }
  const id = await db.subscriptions.add(record)
  return db.subscriptions.get(id)
}

export async function addSubscriptionsBulk(items) {
  if (!Array.isArray(items) || items.length === 0) return []
  const nowIso = new Date().toISOString()
  const records = items.map((data) => ({
    status: 'active',
    createdAt: nowIso,
    ...data,
  }))
  const ids = await db.subscriptions.bulkAdd(records, { allKeys: true })
  return db.subscriptions.bulkGet(ids)
}

export async function updateSubscription(id, data) {
  await db.subscriptions.update(id, data)
  return db.subscriptions.get(id)
}

export async function deleteSubscription(id) {
  return db.subscriptions.delete(id)
}

export async function clearAllSubscriptions() {
  await db.subscriptions.clear()
}

export async function pauseSubscription(id) {
  await db.subscriptions.update(id, { status: 'paused' })
  return db.subscriptions.get(id)
}

// --- Categories ---

export async function getAllCategories() {
  return db.categories.toArray()
}

export async function getCategoryById(id) {
  return db.categories.get(id)
}

export async function addCategory(data) {
  const id = await db.categories.add({
    icon: 'tag',
    isDefault: false,
    ...data,
  })
  return db.categories.get(id)
}

export async function updateCategory(id, data) {
  await db.categories.update(id, data)
  return db.categories.get(id)
}

export async function deleteCategory(id, fallbackCategoryId = null) {
  await db.transaction('rw', db.subscriptions, db.categories, async () => {
    if (fallbackCategoryId !== null && fallbackCategoryId !== undefined) {
      await db.subscriptions
        .where('categoryId')
        .equals(id)
        .modify({ categoryId: fallbackCategoryId })
    }
    await db.categories.delete(id)
  })
}

// --- Budget ---

const DEFAULT_BUDGET_OBJ = { monthlyGoal: DEFAULT_BUDGET_AMOUNT, currency: DEFAULT_CURRENCY, categoryLimits: {} }

export async function getBudget() {
  const first = await db.budget.toCollection().first()
  if (!first) return { ...DEFAULT_BUDGET_OBJ }
  return { ...DEFAULT_BUDGET_OBJ, ...first, categoryLimits: first.categoryLimits || {} }
}

export async function updateBudget(data) {
  const existing = await db.budget.toCollection().first()
  const record = { ...data, updatedAt: new Date().toISOString() }
  if (existing) {
    await db.budget.update(existing.id, record)
  } else {
    await db.budget.add({ ...DEFAULT_BUDGET_OBJ, ...record })
  }
  return getBudget()
}



export async function getMonthlyTotal() {
  const active = await db.subscriptions
    .where('status')
    .equals('active')
    .toArray()
  return active.reduce(
    (sum, sub) => sum + normalizeToMonthly(sub.amount, sub.cycle),
    0,
  )
}

export async function getUpcomingRenewals(days = 7) {
  const now = new Date()
  const cutoff = new Date()
  cutoff.setDate(now.getDate() + days)

  const nowStr = now.toISOString().slice(0, 10)
  const cutoffStr = cutoff.toISOString().slice(0, 10)

  return db.subscriptions
    .where('renewalDate')
    .between(nowStr, cutoffStr, true, true)
    .and((sub) => sub.status === 'active')
    .toArray()
}

export { db }
