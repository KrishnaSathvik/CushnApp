import { useState, useMemo, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Settings, Plus } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import useSubscriptions from '../hooks/useSubscriptions'
import SubscriptionRow from '../components/SubscriptionRow'
import { useTheme } from '../context/ThemeContext'
import { useSettings } from '../context/SettingsContext'
import { formatCurrency } from '../lib/formatCurrency'
import { BILL_TYPE_LIST, getBillTypeInfo, resolveBillTypeKey } from '../lib/billTypes'
import { projectedRenewalDayMap } from '../lib/projections'

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

export default function CalendarScreen() {
    const navigate = useNavigate()
    const location = useLocation()
    const { T } = useTheme()
    const { currency, billTypeByCategory } = useSettings()
    const { subscriptions, categories, getCategoryName, getCategoryColorById, deleteSubscription, pauseSubscription } = useSubscriptions()
    const now = new Date()
    const restoredState = location.state?.calendarState
    const [year, setYear] = useState(restoredState?.year ?? now.getFullYear())
    const [month, setMonth] = useState(restoredState?.month ?? now.getMonth())
    const [selectedDay, setSelectedDay] = useState(restoredState?.selectedDay ?? null)
    const [viewMode, setViewMode] = useState(restoredState?.viewMode ?? 'calendar')
    const [statusFilter, setStatusFilter] = useState(restoredState?.statusFilter ?? 'active')
    const [typeFilter, setTypeFilter] = useState(restoredState?.typeFilter ?? 'all')
    const [categoryFilter, setCategoryFilter] = useState(restoredState?.categoryFilter ?? 'all')
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(restoredState?.showAdvancedFilters ?? false)
    const selectedDaySectionRef = useRef(null)
    const shouldScrollToSelectedRef = useRef(false)

    const today = now.getDate()
    const isCurrentMonth = year === now.getFullYear() && month === now.getMonth()
    const hasActiveFilters = statusFilter !== 'active' || typeFilter !== 'all' || categoryFilter !== 'all'

    const filteredSubscriptions = useMemo(() => {
        return subscriptions.filter((s) => {
            if (!s.renewalDate) return false
            if (statusFilter !== 'all' && s.status !== statusFilter) return false
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
        setSelectedDay(day)
    }

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
                            <ChevronLeft size={16} color={T.fgHigh} />
                        </button>
                        <span className="font-bold" style={{ fontSize: 18, color: T.fgHigh }}>
                            {MONTHS[month]} {year}
                        </span>
                        <button
                            onClick={nextMonth}
                            className="interactive-btn flex items-center justify-center cursor-pointer"
                            style={{ width: 36, height: 36, background: T.bgMuted, border: `1px solid ${T.border}`, borderRadius: 12 }}
                        >
                            <ChevronRight size={16} color={T.fgHigh} />
                        </button>
                    </div>

                    <div className="segmented-control" style={{ marginTop: 12, gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', width: '100%' }}>
                        <div
                            style={{
                                position: 'absolute',
                                top: 4,
                                bottom: 4,
                                left: viewMode === 'calendar' ? 4 : 'calc(50% + 2px)',
                                width: 'calc(50% - 6px)',
                                borderRadius: 999,
                                background: T.accentPrimary,
                                transition: 'left var(--duration-normal) var(--ease-out)',
                            }}
                        />
                        {['calendar', 'list'].map((m) => (
                            <button
                                key={m}
                                onClick={() => {
                                    setViewMode(m)
                                    setSelectedDay(null)
                                }}
                                className="interactive-btn flex-1 cursor-pointer font-semibold capitalize"
                                style={{
                                    height: 40,
                                    border: 'none',
                                    background: 'transparent',
                                    color: viewMode === m ? T.fgOnAccent : T.fgMedium,
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
                                        color: statusFilter === opt.key ? T.accentPrimary : T.fgMedium,
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
                                    color: T.fgHigh,
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
                                    color: T.fgHigh,
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
                                    color: T.fgHigh,
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
                                    <div className="font-mono" style={{ fontSize: 10, color: T.fgMedium, marginBottom: 4 }}>
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
                                                    style={{ fontSize: 10, color: T.fgMedium }}
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
                                        <div key={d} className="font-mono" style={{ fontSize: 10, color: T.fgSubtle, padding: '4px 0' }}>
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

                                        return (
                                            <button
                                                key={day}
                                                onClick={() => handleDaySelect(day)}
                                                className="interactive-btn flex flex-col items-center justify-center cursor-pointer"
                                                style={{
                                                    minHeight: 58,
                                                    background: isSelected ? `${T.accentPrimary}18` : renewals.length > 0 ? T.bgMuted : 'transparent',
                                                    border: isToday ? `1px solid ${T.accentPrimary}` : isSelected ? `1px solid ${T.accentPrimary}44` : `1px solid ${renewals.length > 0 ? T.border : 'transparent'}`,
                                                    borderRadius: 14,
                                                    opacity: isPast ? 0.45 : 1,
                                                    transition: 'all 0.15s ease',
                                                    boxShadow: isToday ? `0 0 0 2px ${T.accentPrimary}22 inset` : isSelected ? `0 12px 24px ${T.accentPrimary}16` : 'none',
                                                }}
                                            >
                                                <span
                                                    className="font-mono"
                                                    style={{
                                                        fontSize: 13,
                                                        color: isToday ? T.accentPrimary : T.fgHigh,
                                                        fontWeight: isToday ? 700 : 500,
                                                    }}
                                                >
                                                    {day}
                                                </span>
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
                                                            <span className="font-mono" style={{ fontSize: 7, color: T.fgSubtle, marginLeft: 1 }}>
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
                                        <div style={{ fontSize: 14, color: T.fgHigh, fontWeight: 600, marginBottom: 4 }}>
                                            No renewals this month
                                        </div>
                                        <div className="font-mono" style={{ fontSize: 11, color: T.fgSubtle, marginBottom: 10 }}>
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
                                                        color: T.fgHigh,
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
                                <div className="font-mono uppercase tracking-wider" style={{ fontSize: 10, color: T.fgSubtle }}>
                                    {MONTHS[month]} {selectedDay}
                                </div>
                                <div className="flex items-center justify-between" style={{ marginTop: 4 }}>
                                    <div style={{ fontSize: 14, color: T.fgHigh, fontWeight: 600 }}>
                                        {selectedSubs.length} renewal{selectedSubs.length !== 1 ? 's' : ''}
                                    </div>
                                    <div className="font-mono font-bold" style={{ fontSize: 12, color: T.accentPrimary }}>
                                        {formatCurrency(selectedSubs.reduce((sum, s) => sum + s.amount, 0), currency)}
                                    </div>
                                </div>
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
                                    <div className="font-mono" style={{ fontSize: 12, color: T.fgSubtle }}>
                                        No renewals on this day
                                    </div>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    {selectedSubs.map(s => (
                                        <SubscriptionRow
                                            key={s.id}
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
                                style={{ fontSize: 10, color: T.fgSubtle, padding: '4px 4px 8px' }}
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
                                    <div className="font-mono" style={{ fontSize: 12, color: T.fgSubtle }}>
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
                                                color: T.fgHigh,
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
                                                style={{ fontSize: 10, color: T.fgSubtle, padding: '8px 10px 6px', borderBottom: `1px solid ${T.border}` }}
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
            </div>
        </div>
    )
}
