function toLocalDate(dateStr) {
  const d = new Date(dateStr)
  d.setMinutes(d.getMinutes() + d.getTimezoneOffset())
  return d
}

function monthDiff(from, to) {
  return (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth())
}

function clampDay(year, month, day) {
  const lastDay = new Date(year, month + 1, 0).getDate()
  return Math.min(day, lastDay)
}

function occursInMonth(sub, year, month) {
  if (!sub?.renewalDate || sub.status !== 'active') return 0
  const base = toLocalDate(sub.renewalDate)
  const monthStart = new Date(year, month, 1)
  const monthEnd = new Date(year, month + 1, 0)
  const cycle = sub.cycle || 'monthly'
  const amount = Number(sub.amount) || 0
  if (amount <= 0) return 0

  if (cycle === 'monthly') {
    if (monthDiff(base, monthStart) < 0) return 0
    return amount
  }

  if (cycle === 'quarterly') {
    const diff = monthDiff(base, monthStart)
    if (diff < 0 || diff % 3 !== 0) return 0
    return amount
  }

  if (cycle === 'annual' || cycle === 'yearly') {
    const diff = monthDiff(base, monthStart)
    if (diff < 0 || diff % 12 !== 0) return 0
    return amount
  }

  if (cycle === 'weekly' || cycle === 'biweekly') {
    const intervalDays = cycle === 'weekly' ? 7 : 14
    let cursor = new Date(base)
    if (cursor > monthEnd) return 0
    while (cursor < monthStart) {
      cursor.setDate(cursor.getDate() + intervalDays)
    }
    let total = 0
    while (cursor <= monthEnd) {
      total += amount
      cursor.setDate(cursor.getDate() + intervalDays)
    }
    return total
  }

  // Fallback for unknown cycles: count in base month only.
  return base.getFullYear() === year && base.getMonth() === month ? amount : 0
}

export function buildMonthlyProjection(subscriptions, startDate = new Date(), count = 6) {
  const start = new Date(startDate.getFullYear(), startDate.getMonth(), 1)
  const out = []
  for (let i = 0; i < count; i += 1) {
    const d = new Date(start.getFullYear(), start.getMonth() + i, 1)
    const year = d.getFullYear()
    const month = d.getMonth()
    const label = d.toLocaleString('default', { month: 'short' })
    const totalDue = subscriptions.reduce((sum, sub) => sum + occursInMonth(sub, year, month), 0)
    out.push({ year, month, label, totalDue: Math.round(totalDue * 100) / 100 })
  }
  return out
}

export function projectedRenewalDayMap(subscriptions, year, month) {
  const map = {}
  const monthStart = new Date(year, month, 1)
  const monthEnd = new Date(year, month + 1, 0)

  subscriptions
    .filter((s) => s.renewalDate)
    .forEach((s) => {
      const base = toLocalDate(s.renewalDate)
      const cycle = s.cycle || 'monthly'

      const pushDay = (day) => {
        if (!map[day]) map[day] = []
        map[day].push(s)
      }

      if (cycle === 'weekly' || cycle === 'biweekly') {
        const intervalDays = cycle === 'weekly' ? 7 : 14
        let cursor = new Date(base)
        if (cursor > monthEnd) return
        while (cursor < monthStart) cursor.setDate(cursor.getDate() + intervalDays)
        while (cursor <= monthEnd) {
          pushDay(cursor.getDate())
          cursor.setDate(cursor.getDate() + intervalDays)
        }
        return
      }

      if (cycle === 'monthly') {
        const diff = monthDiff(base, monthStart)
        if (diff < 0) return
        pushDay(clampDay(year, month, base.getDate()))
        return
      }

      if (cycle === 'quarterly') {
        const diff = monthDiff(base, monthStart)
        if (diff < 0 || diff % 3 !== 0) return
        pushDay(clampDay(year, month, base.getDate()))
        return
      }

      if (cycle === 'annual' || cycle === 'yearly') {
        const diff = monthDiff(base, monthStart)
        if (diff < 0 || diff % 12 !== 0) return
        pushDay(clampDay(year, month, base.getDate()))
        return
      }

      if (base.getFullYear() === year && base.getMonth() === month) {
        pushDay(base.getDate())
      }
    })

  return map
}
