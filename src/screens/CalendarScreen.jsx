import { useState, useMemo, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Settings, Plus } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import useSubscriptions from '../hooks/useSubscriptions'
import SubscriptionRow from '../components/SubscriptionRow'
import { useTheme } from '../context/ThemeContext'
import { useSettings } from '../context/SettingsContext'
import { summarizeRenewalMaps } from '../lib/dashboardInsights'
import { trackEvent } from '../lib/analytics'
import { formatCurrency } from '../lib/formatCurrency'
import { BILL_TYPE_LIST, getBillTypeInfo, resolveBillTypeKey } from '../lib/billTypes'
import { projectedRenewalDayMap } from '../lib/projections'
import { useReviewSheet } from '../context/ReviewSheetContext'
import { isSubscriptionCountedInSpend } from '../lib/reviewState'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
]

function getDaysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year, month) {
    return new Date(year, month, 1).getDay()
}

function getShapeForBillType(typeKey = '') {
    if (typeKey === 'utility') return 'diamond'
    if (typeKey === 'loan') return 'square'
    if (typeKey === 'insurance') return 'pill'
    return 'circle'
}

function getShapeStyle(shape, color, size = 7) {
    const base = {
        background: color,
        display: 'inline-block',
    }
    if (shape === 'square') return { ...base, width: size, height: size, borderRadius: 1 }
    if (shape === 'diamond') return { ...base, width: size, height: size, borderRadius: 1, transform: 'rotate(45deg)' }
    if (shape === 'pill') return { ...base, width: size + 2, height: Math.max(3, size - 2), borderRadius: 999 }
    return { ...base, width: size, height: size, borderRadius: '50%' }
}

function addCycleToDate(dateString, cycle) {
    const base = dateString ? new Date(`${dateString}T00:00:00`) : new Date()
    if (Number.isNaN(base.getTime())) return dateString
    const next = new Date(base)
    if (cycle === 'annual' || cycle === 'yearly') next.setFullYear(next.getFullYear() + 1)
    else if (cycle === 'weekly') next.setDate(next.getDate() + 7)
    else if (cycle === 'quarterly') next.setMonth(next.getMonth() + 3)
    else next.setMonth(next.getMonth() + 1)
    return next.toISOString().slice(0, 10)
}

function appendSystemNote(existingNotes, message) {
    const stamp = new Date().toISOString().slice(0, 10)
    const line = `[system] ${stamp} | ${message}`
    return existingNotes ? `${existingNotes}\n${line}` : line
}

function formatIsoDate(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export default function CalendarScreen() {
    const navigate = useNavigate()
    const location = useLocation()
    const { T } = useTheme()
    const { currency, billTypeByCategory } = useSettings()
    const { openReviewSheet } = useReviewSheet()
    const { subscriptions, categories, getCategoryName, getCategoryColorById, deleteSubscription, pauseSubscription, updateSubscription } = useSubscriptions()
    const now = useMemo(() => new Date(), [])
    const restoredState = location.state?.calendarState
    const [year, setYear] = useState(restoredState?.year ?? now.getFullYear())
    const [month, setMonth] = useState(restoredState?.month ?? now.getMonth())
    const [selectedDay, setSelectedDay] = useState(restoredState?.selectedDay ?? null)
    const [viewMode, setViewMode] = useState(restoredState?.viewMode ?? 'calendar')
    const [statusFilter, setStatusFilter] = useState(restoredState?.statusFilter ?? 'active')
    const [typeFilter, setTypeFilter] = useState(restoredState?.typeFilter ?? 'all')
    const [categoryFilter, setCategoryFilter] = useState(restoredState?.categoryFilter ?? 'all')
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(restoredState?.showAdvancedFilters ?? false)
    const [actioningId, setActioningId] = useState(null)
    const selectedDaySectionRef = useRef(null)
    const shouldScrollToSelectedRef = useRef(false)

    const today = now.getDate()
    const isCurrentMonth = year === now.getFullYear() && month === now.getMonth()
    const hasActiveFilters = statusFilter !== 'active' || typeFilter !== 'all' || categoryFilter !== 'all'

    const filteredSubscriptions = useMemo(() => {
        return subscriptions.filter((s) => {
            if (!s.renewalDate) return false
            if (statusFilter === 'active' && !isSubscriptionCountedInSpend(s)) return false
            if (statusFilter !== 'all' && statusFilter !== 'active' && s.status !== statusFilter) return false
            const catName = getCategoryName(s.categoryId)
            if (categoryFilter !== 'all' && catName !== categoryFilter) return false
            const billType = resolveBillTypeKey({
                categoryId: s.categoryId,
                categoryName: catName,
                billTypeByCategory,
            })
            if (typeFilter !== 'all' && billType !== typeFilter) return false
            return true
        })
    }, [subscriptions, statusFilter, typeFilter, categoryFilter, getCategoryName, billTypeByCategory])

    // Map renewal dates to subscriptions
    const renewalMap = useMemo(() => {
        return projectedRenewalDayMap(filteredSubscriptions, year, month)
    }, [filteredSubscriptions, year, month])
    const currentMonthRenewals = useMemo(() => Object.values(renewalMap).flat(), [renewalMap])
    const currentMonthTotal = useMemo(
        () => currentMonthRenewals.reduce((sum, sub) => sum + Number(sub.amount || 0), 0),
        [currentMonthRenewals],
    )
    const previousMonthProjection = useMemo(() => {
        const date = new Date(year, month - 1, 1)
        return projectedRenewalDayMap(filteredSubscriptions, date.getFullYear(), date.getMonth())
    }, [filteredSubscriptions, month, year])
    const {
        previousMonthTotal,
        previousMonthCount,
        currentMonthCount,
        monthTotalDelta,
        heaviestDay,
    } = useMemo(
        () => summarizeRenewalMaps(renewalMap, previousMonthProjection),
        [renewalMap, previousMonthProjection],
    )

    const daysInMonth = getDaysInMonth(year, month)
    const firstDay = getFirstDayOfMonth(year, month)

    const prevMonth = () => {
        if (month === 0) { setMonth(11); setYear(y => y - 1) }
        else setMonth(m => m - 1)
        setSelectedDay(null)
    }

    const nextMonth = () => {
        if (month === 11) { setMonth(0); setYear(y => y + 1) }
        else setMonth(m => m + 1)
        setSelectedDay(null)
    }

    const selectedSubs = selectedDay ? (renewalMap[selectedDay] || []) : []
    const weekAnchorDate = useMemo(() => {
        if (selectedDay) return new Date(year, month, selectedDay)
        if (isCurrentMonth) return new Date(year, month, today)
        return new Date(year, month, 1)
    }, [isCurrentMonth, month, selectedDay, today, year])
    const weekStartDate = useMemo(() => {
        const start = new Date(weekAnchorDate)
        start.setDate(weekAnchorDate.getDate() - weekAnchorDate.getDay())
        return start
    }, [weekAnchorDate])
    const weekDays = useMemo(() => {
        return Array.from({ length: 7 }).map((_, index) => {
            const date = new Date(weekStartDate)
            date.setDate(weekStartDate.getDate() + index)
            const isInCurrentMonth = date.getMonth() === month && date.getFullYear() === year
            const subs = isInCurrentMonth ? (renewalMap[date.getDate()] || []) : []
            return {
                key: formatIsoDate(date),
                date,
                dayNumber: date.getDate(),
                label: DAYS[date.getDay()],
                isToday: date.toDateString() === now.toDateString(),
                isInCurrentMonth,
                subs,
                total: subs.reduce((sum, sub) => sum + Number(sub.amount || 0), 0),
            }
        })
    }, [month, now, renewalMap, weekStartDate, year])

    const calendarMotionKey = `${year}-${month}-${viewMode}`
    const detailNavigationState = {
        from: '/calendar',
        calendarState: {
            year,
            month,
            selectedDay,
            viewMode,
            statusFilter,
            typeFilter,
            categoryFilter,
            showAdvancedFilters,
        },
    }

    const handleDaySelect = (day) => {
        shouldScrollToSelectedRef.current = true
        trackEvent('calendar_day_selected', {
            year,
            month: month + 1,
            day,
            renewal_count: (renewalMap[day] || []).length,
        })
        setSelectedDay(day)
    }

    const handleMarkPaid = async (subscription) => {
        setActioningId(subscription.id)
        try {
            await updateSubscription(subscription.id, {
                renewalDate: addCycleToDate(subscription.renewalDate, subscription.cycle),
                notes: appendSystemNote(subscription.notes, 'Marked paid from calendar quick action.'),
            })
        } finally {
            setActioningId(null)
        }
    }

    const handleSnoozeReminder = async (subscription) => {
        setActioningId(subscription.id)
        try {
            await updateSubscription(subscription.id, {
                notes: appendSystemNote(subscription.notes, 'Reminder snoozed for 3 days from calendar quick action.'),
            })
        } finally {
            setActioningId(null)
        }
    }

    const handleCancel = (subscription) => {
        openReviewSheet(subscription, { initialStep: 'cancel' })
    }

    const renderSubscriptionActionBar = (subscription) => (
        <div className="flex flex-wrap gap-2" style={{ padding: '0 14px 14px' }}>
            <button
                onClick={() => void handleMarkPaid(subscription)}
                disabled={actioningId === subscription.id}
                className="interactive-btn cursor-pointer font-mono"
                style={{
                    border: `1px solid ${T.accentPrimary}44`,
                    background: `${T.accentPrimary}14`,
                    color: T.accentPrimary,
                    borderRadius: 12,
                    fontSize: 10,
                    padding: '6px 8px',
                    opacity: actioningId === subscription.id ? 0.6 : 1,
                }}
            >
                Mark paid
            </button>
            <button
                onClick={() => void handleSnoozeReminder(subscription)}
                disabled={actioningId === subscription.id}
                className="interactive-btn cursor-pointer font-mono"
                style={{
                    border: `1px solid ${T.border}`,
                    background: T.bgMuted,
                    color: T.fgPrimary,
                    borderRadius: 12,
                    fontSize: 10,
                    padding: '6px 8px',
                    opacity: actioningId === subscription.id ? 0.6 : 1,
                }}
            >
                Snooze 3d
            </button>
            <button
                onClick={() => handleCancel(subscription)}
                disabled={actioningId === subscription.id}
                className="interactive-btn cursor-pointer font-mono"
                style={{
                    border: `1px solid ${T.semDanger}33`,
                    background: `${T.semDanger}12`,
                    color: T.semDanger,
                    borderRadius: 12,
                    fontSize: 10,
                    padding: '6px 8px',
                    opacity: actioningId === subscription.id ? 0.6 : 1,
                }}
            >
                Cancel
            </button>
            <button
                onClick={() => navigate(`/detail/${subscription.id}`, { state: detailNavigationState })}
                className="interactive-btn cursor-pointer font-mono"
                style={{
                    border: `1px solid ${T.border}`,
                    background: 'transparent',
                    color: T.fgSecondary,
                    borderRadius: 12,
                    fontSize: 10,
                    padding: '6px 8px',
                }}
            >
                Edit
            </button>
        </div>
    )

    const renderSubscriptionCard = (subscription) => (
        <div key={subscription.id} className="surface-card" style={{ marginBottom: 8, overflow: 'hidden', background: T.bgSurface }}>
            <SubscriptionRow
                subscription={subscription}
                categoryName={getCategoryName(subscription.categoryId)}
                categoryColor={getCategoryColorById(subscription.categoryId)}
                daysLeft={null}
                onClick={() => navigate(`/detail/${subscription.id}`, { state: detailNavigationState })}
                onDelete={deleteSubscription}
                onPause={pauseSubscription}
                variant="grouped"
                groupBy="type"
            />
            {renderSubscriptionActionBar(subscription)}
        </div>
    )

    useEffect(() => {
        if (viewMode !== 'calendar' || !selectedDay || !shouldScrollToSelectedRef.current) return

        const timer = window.setTimeout(() => {
            selectedDaySectionRef.current?.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
            })
            shouldScrollToSelectedRef.current = false
        }, 140)

        return () => {
            window.clearTimeout(timer)
        }
    }, [selectedDay, viewMode, year, month])

    return (
        <div className="dashboard-page" style={{ background: T.bgBase }}>
            <div className="dashboard-container dashboard-stack" style={{ paddingTop: 18, gap: 14 }}>
                <section
                    className="hero-card"
                    style={{
                        padding: 22,
                        background: T.bgSurface,
                        border: `1px solid ${T.border}`,
                    }}
                >
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <p className="page-eyebrow">Timeline</p>
                            <h1 className="page-title">Calendar</h1>
                            <p className="page-subtitle" style={{ maxWidth: 520 }}>
                                Renewal timeline and due dates{hasActiveFilters ? ' (filtered)' : ''}.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Month summary and navigation */}
                <motion.div
                    key={`${year}-${month}-summary`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className="surface-card"
                    style={{
                        padding: '16px 16px 14px',
                        background: T.bgSurface,
                    }}
                >
                    <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
                        <button
                            onClick={prevMonth}
                            className="interactive-btn flex items-center justify-center cursor-pointer"
                            style={{ width: 36, height: 36, background: T.bgMuted, border: `1px solid ${T.border}`, borderRadius: 12 }}
                        >
                            <ChevronLeft size={16} color={T.fgPrimary} />
                        </button>
                        <span className="font-bold" style={{ fontSize: 18, color: T.fgPrimary }}>
                            {MONTHS[month]} {year}
                        </span>
                        <button
                            onClick={nextMonth}
                            className="interactive-btn flex items-center justify-center cursor-pointer"
                            style={{ width: 36, height: 36, background: T.bgMuted, border: `1px solid ${T.border}`, borderRadius: 12 }}
                        >
                            <ChevronRight size={16} color={T.fgPrimary} />
                        </button>
                    </div>

                    <div
                        className="surface-card-muted"
                        style={{
                            padding: '12px 14px',
                            border: `1px solid ${T.border}`,
                            background: `linear-gradient(180deg, ${T.bgMuted}, ${T.bgSurface})`,
                            fontSize: 13,
                            color: T.fgSecondary,
                            lineHeight: 1.7,
                        }}
                    >
                        <span style={{ color: T.fgPrimary, fontWeight: 700 }}>
                            {MONTHS[month]} {year}
                        </span>
                        {`: ${formatCurrency(currentMonthTotal, currency).replace('.00', '')} across ${currentMonthCount} renewal${currentMonthCount !== 1 ? 's' : ''}. `}
                        {heaviestDay
                            ? `Heaviest day: ${MONTHS[month].slice(0, 3)} ${heaviestDay.day} (${formatCurrency(heaviestDay.total, currency).replace('.00', '')}). `
                            : 'Heaviest day: none. '}
                        {previousMonthCount === 0
                            ? 'No prior month comparison yet.'
                            : `${monthTotalDelta >= 0 ? 'Up' : 'Down'} ${formatCurrency(Math.abs(monthTotalDelta), currency).replace('.00', '')} from last month.`}
                    </div>

                    <div className="segmented-control" style={{ marginTop: 12, gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', width: '100%' }}>
                        <div
                            style={{
                                position: 'absolute',
                                top: 4,
                                bottom: 4,
                                left: viewMode === 'calendar' ? 4 : viewMode === 'week' ? 'calc(33.333% + 1px)' : 'calc(66.666% - 2px)',
                                width: 'calc(33.333% - 6px)',
                                borderRadius: 999,
                                background: T.accentPrimary,
                                transition: 'left var(--duration-normal) var(--ease-out)',
                            }}
                        />
                        {['calendar', 'week', 'list'].map((m) => (
                            <button
                                key={m}
                                onClick={() => {
                                    setViewMode(m)
                                    if (m !== 'calendar') setSelectedDay(null)
                                }}
                                className="interactive-btn flex-1 cursor-pointer font-semibold capitalize"
                                style={{
                                    height: 40,
                                    border: 'none',
                                    background: 'transparent',
                                    color: viewMode === m ? T.fgOnAccent : T.fgSecondary,
                                    fontSize: 13,
                                    fontWeight: 700,
                                    position: 'relative',
                                    zIndex: 1,
                                    borderRadius: 999,
                                }}
                            >
                                {m}
                            </button>
                        ))}
                    </div>
                </motion.div>

                {/* Filters */}
                <div className="surface-card" style={{ padding: 12, background: T.bgSurface }}>
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex gap-1">
                            {[
                                { key: 'active', label: 'Active' },
                                { key: 'all', label: 'All' },
                            ].map((opt) => (
                                <button
                                    key={opt.key}
                                    onClick={() => {
                                        setStatusFilter(opt.key)
                                        setSelectedDay(null)
                                    }}
                                    className="interactive-btn cursor-pointer font-mono"
                                    style={{
                                        height: 30,
                                        borderRadius: 12,
                                        padding: '0 10px',
                                        border: 'none',
                                        background: statusFilter === opt.key ? T.accentSoft : T.bgMuted,
                                        color: statusFilter === opt.key ? T.accentPrimary : T.fgSecondary,
                                        fontSize: 10,
                                        fontWeight: 700,
                                        boxShadow: statusFilter === opt.key ? `inset 0 0 0 1px ${T.accentPrimary}33` : `inset 0 0 0 1px ${T.border}`,
                                    }}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                        <div className="flex items-center gap-1.5">
                            <button
                                onClick={() => setShowAdvancedFilters((v) => !v)}
                                className="interactive-btn cursor-pointer font-mono"
                                style={{
                                    height: 30,
                                    borderRadius: 12,
                                    padding: '0 10px',
                                    border: `1px solid ${T.border}`,
                                    background: T.bgMuted,
                                    color: T.fgPrimary,
                                    fontSize: 10,
                                }}
                            >
                                {showAdvancedFilters ? 'Hide filters' : `Filters${hasActiveFilters ? ` (${Number(statusFilter !== 'active') + Number(typeFilter !== 'all') + Number(categoryFilter !== 'all')})` : ''}`}
                            </button>
                            {hasActiveFilters && (
                                <button
                                    onClick={() => {
                                        setStatusFilter('active')
                                        setTypeFilter('all')
                                        setCategoryFilter('all')
                                        setSelectedDay(null)
                                    }}
                                    className="interactive-btn cursor-pointer font-mono"
                                    style={{
                                        height: 30,
                                        borderRadius: 12,
                                        padding: '0 10px',
                                        border: `1px solid ${T.semDanger}44`,
                                        background: `${T.semDanger}14`,
                                        color: T.semDanger,
                                        fontSize: 10,
                                    }}
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                    </div>

                    {showAdvancedFilters && (
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2" style={{ marginTop: 8 }}>
                            <select
                                value={typeFilter}
                                onChange={(e) => {
                                    setTypeFilter(e.target.value)
                                    setSelectedDay(null)
                                }}
                                className="w-full outline-none font-mono"
                                style={{
                                    height: 36,
                                    background: T.bgMuted,
                                    border: `1px solid ${T.border}`,
                                    borderRadius: 12,
                                    color: T.fgPrimary,
                                    fontSize: 10,
                                    padding: '0 10px',
                                    appearance: 'none',
                                }}
                            >
                                <option value="all">All types</option>
                                {BILL_TYPE_LIST.map((t) => (
                                    <option key={t.value} value={t.value}>{t.label}</option>
                                ))}
                            </select>

                            <select
                                value={categoryFilter}
                                onChange={(e) => {
                                    setCategoryFilter(e.target.value)
                                    setSelectedDay(null)
                                }}
                                className="w-full outline-none font-mono"
                                style={{
                                    height: 36,
                                    background: T.bgMuted,
                                    border: `1px solid ${T.border}`,
                                    borderRadius: 12,
                                    color: T.fgPrimary,
                                    fontSize: 10,
                                    padding: '0 10px',
                                    appearance: 'none',
                                }}
                            >
                                <option value="all">All categories</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.name}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                <AnimatePresence initial={false}>
                    {viewMode === 'calendar' && (
                        <motion.div
                            key={calendarMotionKey}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.2, ease: 'easeOut' }}
                            style={{ paddingTop: 16 }}
                        >
                            <div className="surface-card" style={{ padding: '10px 12px', background: T.bgSurface }}>
                                <div
                                    style={{}}
                                >
                                    <div className="font-mono" style={{ fontSize: 10, color: T.fgSecondary, marginBottom: 4 }}>
                                        Shape guide
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {BILL_TYPE_LIST.map((t) => {
                                            const tKey = t.value
                                            const info = getBillTypeInfo(tKey)
                                            const shape = getShapeForBillType(tKey)
                                            return (
                                                <div
                                                    key={`shape-guide-${tKey}`}
                                                    className="flex items-center gap-1.5"
                                                    style={{ fontSize: 10, color: T.fgSecondary }}
                                                >
                                                    <span
                                                        title={info.label}
                                                        style={getShapeStyle(shape, info.color, 7)}
                                                    />
                                                    <span className="font-mono">{info.label}</span>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            </div>

                            <div className="surface-card" style={{ marginTop: 10, padding: '10px 12px 12px', background: T.bgSurface }}>
                                {/* Day headers */}
                                <div
                                    className="grid grid-cols-7 text-center"
                                    style={{ padding: '4px 0 8px' }}
                                >
                                    {DAYS.map(d => (
                                        <div key={d} className="font-mono" style={{ fontSize: 10, color: T.fgTertiary, padding: '4px 0' }}>
                                            {d}
                                        </div>
                                    ))}
                                </div>

                                {/* Calendar grid */}
                                <div className="grid grid-cols-7" style={{ gap: 4 }}>
                                    {Array.from({ length: firstDay }).map((_, i) => (
                                        <div key={`empty-${i}`} style={{ height: 58 }} />
                                    ))}

                                    {Array.from({ length: daysInMonth }).map((_, i) => {
                                        const day = i + 1
                                        const isPast = isCurrentMonth && day < today
                                        const isToday = isCurrentMonth && day === today
                                        const isSelected = selectedDay === day
                                        const renewals = renewalMap[day] || []
                                        const isHeaviestDay = heaviestDay?.day === day && heaviestDay.total > 0

                                        return (
                                            <button
                                                key={day}
                                                onClick={() => handleDaySelect(day)}
                                                className="interactive-btn flex flex-col items-center justify-center cursor-pointer"
                                                style={{
                                                    minHeight: 58,
                                                    background: isSelected ? `${T.accentPrimary}18` : isHeaviestDay ? `${T.semWarning}16` : renewals.length > 0 ? T.bgMuted : 'transparent',
                                                    border: isHeaviestDay ? `1px solid ${T.semWarning}` : isToday ? `1px solid ${T.accentPrimary}` : isSelected ? `1px solid ${T.accentPrimary}44` : `1px solid ${renewals.length > 0 ? T.border : 'transparent'}`,
                                                    borderRadius: 14,
                                                    opacity: isPast ? 0.45 : 1,
                                                    transition: 'all 0.15s ease',
                                                    boxShadow: isHeaviestDay ? `0 0 0 2px ${T.semWarning}22 inset` : isToday ? `0 0 0 2px ${T.accentPrimary}22 inset` : isSelected ? `0 12px 24px ${T.accentPrimary}16` : 'none',
                                                }}
                                            >
                                                <span
                                                    className="font-mono"
                                                    style={{
                                                        fontSize: 13,
                                                        color: isToday ? T.accentPrimary : T.fgPrimary,
                                                        fontWeight: isToday ? 700 : 500,
                                                    }}
                                                >
                                                    {day}
                                                </span>
                                                {isHeaviestDay && (
                                                    <span className="font-mono" style={{ fontSize: 8, color: T.semWarning, marginTop: 2 }}>
                                                        HIGH
                                                    </span>
                                                )}
                                                {renewals.length > 0 && (
                                                    <div className="flex gap-1" style={{ marginTop: 4 }}>
                                                        {renewals.slice(0, 3).map((s, j) => {
                                                            const categoryName = getCategoryName(s.categoryId)
                                                            const tKey = resolveBillTypeKey({
                                                                categoryId: s.categoryId,
                                                                categoryName,
                                                                billTypeByCategory,
                                                            })
                                                            const info = getBillTypeInfo(tKey)
                                                            const shape = getShapeForBillType(tKey)

                                                            return (
                                                                <span
                                                                    key={j}
                                                                    title={info.label}
                                                                    aria-label={info.label}
                                                                    style={getShapeStyle(shape, info.color, 8)}
                                                                />
                                                            )
                                                        })}
                                                        {renewals.length > 3 && (
                                                            <span className="font-mono" style={{ fontSize: 7, color: T.fgTertiary, marginLeft: 1 }}>
                                                                +{renewals.length - 3}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>

                            {Object.keys(renewalMap).length === 0 && (
                                <div>
                                    <div
                                        className="surface-card"
                                        style={{
                                            padding: '18px 14px',
                                            textAlign: 'center',
                                            background: T.bgSurface,
                                        }}
                                    >
                                        <div style={{ fontSize: 14, color: T.fgPrimary, fontWeight: 600, marginBottom: 4 }}>
                                            No renewals this month
                                        </div>
                                        <div className="font-mono" style={{ fontSize: 11, color: T.fgTertiary, marginBottom: 10 }}>
                                            {hasActiveFilters ? 'Try clearing filters or switching month.' : 'Add subscriptions to start seeing renewals here.'}
                                        </div>
                                        <div className="flex items-center justify-center gap-2">
                                            {hasActiveFilters && (
                                                <button
                                                    onClick={() => {
                                                        setStatusFilter('active')
                                                        setTypeFilter('all')
                                                        setCategoryFilter('all')
                                                        setSelectedDay(null)
                                                    }}
                                                    className="interactive-btn cursor-pointer font-mono"
                                                    style={{
                                                        border: `1px solid ${T.border}`,
                                                        background: T.bgGlassStrong,
                                                        color: T.fgPrimary,
                                                        borderRadius: 12,
                                                        fontSize: 11,
                                                        padding: '6px 10px',
                                                    }}
                                                >
                                                    Clear filters
                                                </button>
                                            )}
                                            <button
                                                onClick={() => navigate('/add')}
                                                className="interactive-btn cursor-pointer border-none flex items-center gap-1.5"
                                                style={{
                                                    background: T.accentPrimary,
                                                    color: '#fff',
                                                    borderRadius: 12,
                                                    fontSize: 11,
                                                    fontWeight: 700,
                                                    padding: '6px 10px',
                                                }}
                                            >
                                                <Plus size={13} />
                                                Add
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {viewMode === 'week' && (
                        <motion.div
                            key={calendarMotionKey}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.2, ease: 'easeOut' }}
                            style={{ paddingTop: 16, paddingBottom: 12 }}
                        >
                            <div className="surface-card" style={{ padding: 14, background: T.bgSurface }}>
                                <div className="section-label">Week view</div>
                                <div style={{ fontSize: 13, color: T.fgSecondary, marginTop: 6 }}>
                                    {weekStartDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} to {weekDays[6].date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                </div>
                            </div>
                            <div className="grid grid-cols-1 gap-3" style={{ marginTop: 10 }}>
                                {weekDays.map((day) => (
                                    <div
                                        key={day.key}
                                        className="surface-card"
                                        style={{
                                            padding: 12,
                                            background: T.bgSurface,
                                            border: `1px solid ${day.isToday ? T.accentPrimary : T.border}`,
                                        }}
                                    >
                                        <div className="flex items-center justify-between gap-2" style={{ marginBottom: 8 }}>
                                            <div>
                                                <div className="font-mono uppercase" style={{ fontSize: 10, color: day.isToday ? T.accentPrimary : T.fgTertiary }}>
                                                    {day.label}
                                                </div>
                                                <div style={{ fontSize: 15, color: T.fgPrimary, fontWeight: 700, marginTop: 4 }}>
                                                    {day.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-mono font-bold" style={{ fontSize: 12, color: day.subs.length > 0 ? T.accentPrimary : T.fgTertiary }}>
                                                    {day.subs.length} renewal{day.subs.length === 1 ? '' : 's'}
                                                </div>
                                                <div className="font-mono" style={{ fontSize: 10, color: T.fgSecondary, marginTop: 4 }}>
                                                    {formatCurrency(day.total, currency).replace('.00', '')}
                                                </div>
                                            </div>
                                        </div>
                                        {!day.isInCurrentMonth ? (
                                            <div className="surface-card-muted" style={{ padding: '12px 14px', fontSize: 12, color: T.fgTertiary }}>
                                                Outside the current month view.
                                            </div>
                                        ) : day.subs.length === 0 ? (
                                            <div className="surface-card-muted" style={{ padding: '12px 14px', fontSize: 12, color: T.fgTertiary }}>
                                                No renewals scheduled.
                                            </div>
                                        ) : (
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                {day.subs.map((subscription) => renderSubscriptionCard(subscription))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Selected day detail */}
                    {viewMode === 'calendar' && selectedDay && (
                        <motion.div
                            ref={selectedDaySectionRef}
                            key="selected-day-panel"
                            initial={{ opacity: 1, y: 0 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.12, ease: 'easeOut' }}
                            style={{ paddingTop: 10 }}
                        >
                            <div
                                className="surface-card"
                                style={{
                                    padding: '10px 12px',
                                    marginBottom: 8,
                                    background: T.bgSurface,
                                }}
                            >
                                <div className="font-mono uppercase tracking-wider" style={{ fontSize: 10, color: T.fgTertiary }}>
                                    {MONTHS[month]} {selectedDay}
                                </div>
                                <div className="flex items-center justify-between" style={{ marginTop: 4 }}>
                                    <div style={{ fontSize: 14, color: T.fgPrimary, fontWeight: 600 }}>
                                        {selectedSubs.length} renewal{selectedSubs.length !== 1 ? 's' : ''}
                                    </div>
                                    <div className="font-mono font-bold" style={{ fontSize: 12, color: T.accentPrimary }}>
                                        {formatCurrency(selectedSubs.reduce((sum, s) => sum + s.amount, 0), currency)}
                                    </div>
                                </div>
                                {selectedSubs.length > 0 && (
                                    <div className="flex flex-wrap gap-2" style={{ marginTop: 10 }}>
                                        <button
                                            onClick={() => {
                                                trackEvent('calendar_day_review_clicked', {
                                                    year,
                                                    month: month + 1,
                                                    day: selectedDay,
                                                    subscription_id: selectedSubs[0].id,
                                                })
                                                openReviewSheet(selectedSubs[0], { initialStep: 'cancel' })
                                            }}
                                            className="interactive-btn cursor-pointer font-mono"
                                            style={{
                                                border: `1px solid ${T.border}`,
                                                background: T.bgMuted,
                                                color: T.fgPrimary,
                                                borderRadius: 12,
                                                fontSize: 11,
                                                padding: '6px 10px',
                                            }}
                                        >
                                            Review first renewal
                                        </button>
                                        <button
                                            onClick={() => navigate('/add')}
                                            className="interactive-btn cursor-pointer border-none flex items-center gap-1.5"
                                            style={{
                                                background: T.accentPrimary,
                                                color: '#fff',
                                                borderRadius: 12,
                                                fontSize: 11,
                                                fontWeight: 700,
                                                padding: '6px 10px',
                                            }}
                                        >
                                            <Plus size={13} />
                                            Add another
                                        </button>
                                    </div>
                                )}
                            </div>

                            {selectedSubs.length === 0 ? (
                                <div
                                    className="surface-card"
                                    style={{
                                        padding: '20px',
                                        textAlign: 'center',
                                        background: T.bgSurface,
                                    }}
                                >
                                    <div className="font-mono" style={{ fontSize: 12, color: T.fgTertiary }}>
                                        No renewals on this day
                                    </div>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    {selectedSubs.map((subscription) => renderSubscriptionCard(subscription))}
                                </div>
                            )}
                        </motion.div>
                    )}

                    {viewMode === 'list' && (
                        <motion.div
                            key={calendarMotionKey}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.2, ease: 'easeOut' }}
                            style={{ paddingTop: 16, paddingBottom: 12 }}
                        >
                            <div
                                className="font-mono uppercase tracking-wider"
                                style={{ fontSize: 10, color: T.fgTertiary, padding: '4px 4px 8px' }}
                            >
                                List for {MONTHS[month]} {year}
                            </div>
                            {Object.keys(renewalMap).length === 0 ? (
                                <div
                                    className="surface-card"
                                    style={{
                                        padding: '18px 14px',
                                        textAlign: 'center',
                                        background: T.bgSurface,
                                    }}
                                >
                                    <div className="font-mono" style={{ fontSize: 12, color: T.fgTertiary }}>
                                        No renewals for these filters.
                                    </div>
                                    <div className="flex items-center justify-center gap-2" style={{ marginTop: 10 }}>
                                        <button
                                            onClick={() => {
                                                setStatusFilter('active')
                                                setTypeFilter('all')
                                                setCategoryFilter('all')
                                                setSelectedDay(null)
                                            }}
                                            className="interactive-btn cursor-pointer font-mono"
                                            style={{
                                                border: `1px solid ${T.border}`,
                                                background: T.bgGlassStrong,
                                                color: T.fgPrimary,
                                                borderRadius: 12,
                                                fontSize: 11,
                                                padding: '6px 10px',
                                            }}
                                        >
                                            Reset filters
                                        </button>
                                        <button
                                            onClick={() => navigate('/add')}
                                            className="interactive-btn cursor-pointer border-none flex items-center gap-1.5"
                                            style={{
                                                background: T.accentPrimary,
                                                color: '#fff',
                                                borderRadius: 12,
                                                fontSize: 11,
                                                fontWeight: 700,
                                                padding: '6px 10px',
                                            }}
                                        >
                                            <Plus size={13} />
                                            Add
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                Object.entries(renewalMap)
                                    .sort(([a], [b]) => Number(a) - Number(b))
                                    .map(([day, subs]) => (
                                        <div key={day} className="surface-card" style={{ marginBottom: 8, overflow: 'hidden', background: T.bgSurface, borderRadius: 12 }}>
                                            <div
                                                className="font-mono uppercase tracking-wider flex items-center justify-between"
                                                style={{ fontSize: 10, color: T.fgTertiary, padding: '8px 10px 6px', borderBottom: `1px solid ${T.border}` }}
                                            >
                                                <span>{MONTHS[month]} {day}</span>
                                                <span style={{ color: T.accentPrimary }}>
                                                    {formatCurrency(subs.reduce((sum, s) => sum + s.amount, 0), currency).replace('.00', '')}
                                                </span>
                                            </div>
                                            {subs.map((s, idx) => (
                                                <SubscriptionRow
                                                    key={`${day}-${s.id}-${idx}`}
                                                    subscription={s}
                                                    categoryName={getCategoryName(s.categoryId)}
                                                    categoryColor={getCategoryColorById(s.categoryId)}
                                                    daysLeft={null}
                                                    onClick={() => navigate(`/detail/${s.id}`, { state: detailNavigationState })}
                                                    onDelete={deleteSubscription}
                                                    onPause={pauseSubscription}
                                                    variant="grouped"
                                                    groupBy="type"
                                                />
                                            ))}
                                        </div>
                                    ))
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Upcoming summary kept lightweight in month card to reduce noise */}
                <section className="surface-card" style={{ padding: 14, background: T.bgSurface }}>
                    <div className="section-label">Month-over-month</div>
                    <div style={{ fontSize: 13, color: T.fgSecondary, marginTop: 6, lineHeight: 1.6 }}>
                        {previousMonthCount === 0
                            ? 'No prior month comparison available yet.'
                            : `${MONTHS[(month + 11) % 12]}: ${formatCurrency(previousMonthTotal, currency).replace('.00', '')} across ${previousMonthCount} renewals. ${currentMonthTotal >= previousMonthTotal ? '+' : ''}${formatCurrency(currentMonthTotal - previousMonthTotal, currency).replace('.00', '')} versus last month.`}
                    </div>
                </section>
            </div>
        </div>
    )
}
