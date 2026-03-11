import { normalizeToMonthly } from './normalizeAmount'

const SYSTEM_NOTE_PREFIX = '[system]'
const CANCELLED_PREFIX = 'Marked cancelled effective'

export function splitNotesPayload(notes) {
    const lines = String(notes || '')
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)

    const history = []
    const userLines = []

    lines.forEach((line) => {
        if (!line.startsWith(SYSTEM_NOTE_PREFIX)) {
            userLines.push(line)
            return
        }

        const raw = line.replace(SYSTEM_NOTE_PREFIX, '').trim()
        const [date, ...parts] = raw.split('|')
        history.push({
            date: date?.trim() || null,
            text: parts.join('|').trim() || raw,
        })
    })

    return {
        userNotes: userLines.join('\n'),
        history,
    }
}

export function buildSystemHistoryLine(text, date = new Date().toISOString().slice(0, 10)) {
    return `${SYSTEM_NOTE_PREFIX} ${date} | ${text}`
}

function parseEffectiveDate(text, fallbackDate) {
    if (!text?.startsWith(CANCELLED_PREFIX)) return fallbackDate || null
    const rawDate = text.replace(CANCELLED_PREFIX, '').trim()
    const parsed = rawDate ? new Date(rawDate) : null
    if (parsed && !Number.isNaN(parsed.getTime())) {
        return parsed.toISOString().slice(0, 10)
    }
    return fallbackDate || null
}

function diffDays(start, end) {
    const startDate = new Date(`${start}T00:00:00`)
    const endDate = new Date(`${end}T00:00:00`)
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) return 0
    return Math.max(0, Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24)))
}

function roundCurrency(value) {
    return Math.round(value * 100) / 100
}

export function deriveSavingsHistory(subscriptions, nowDate = new Date()) {
    const todayIso = nowDate.toISOString().slice(0, 10)
    const events = (subscriptions || [])
        .flatMap((subscription) => {
            const { history } = splitNotesPayload(subscription.notes)
            const monthlyValue = normalizeToMonthly(Number(subscription.amount || 0), subscription.cycle)

            return history
                .filter((entry) => entry.text.startsWith(CANCELLED_PREFIX))
                .map((entry) => {
                    const effectiveDate = parseEffectiveDate(entry.text, entry.date || subscription.renewalDate)
                    const elapsedDays = effectiveDate ? diffDays(effectiveDate, todayIso) : 0
                    const savedToDate = roundCurrency((monthlyValue / 30.4375) * elapsedDays)
                    const isLive = Boolean(effectiveDate) && diffDays(effectiveDate, todayIso) > 0
                    return {
                        id: `${subscription.id}-${effectiveDate || entry.date || 'unknown'}`,
                        subscriptionId: subscription.id,
                        name: subscription.name,
                        categoryId: subscription.categoryId,
                        cycle: subscription.cycle,
                        monthlyValue: roundCurrency(monthlyValue),
                        annualValue: roundCurrency(monthlyValue * 12),
                        effectiveDate,
                        loggedAt: entry.date || effectiveDate,
                        savedToDate,
                        elapsedDays,
                        status: subscription.status,
                        isLive,
                        text: entry.text,
                    }
                })
        })
        .sort((left, right) => new Date(`${right.effectiveDate || right.loggedAt || todayIso}T00:00:00`) - new Date(`${left.effectiveDate || left.loggedAt || todayIso}T00:00:00`))

    return {
        events,
        totalSavedToDate: roundCurrency(events.reduce((sum, event) => sum + event.savedToDate, 0)),
        activeAnnualSavings: roundCurrency(events
            .filter((event) => event.isLive)
            .reduce((sum, event) => sum + event.annualValue, 0)),
        activeMonthlySavings: roundCurrency(events
            .filter((event) => event.isLive)
            .reduce((sum, event) => sum + event.monthlyValue, 0)),
    }
}
