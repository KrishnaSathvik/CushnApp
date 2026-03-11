import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import {
    Pencil,
    Wallet,
    RefreshCw,
    Tag,
    Calendar,
    FileText,
    ChevronRight,
    PauseCircle,
    Trash2,
    Play,
    CheckCircle2,
    Clock3,
} from 'lucide-react'
import { getSubscriptionById } from '../lib/dataService'
import useSubscriptions from '../hooks/useSubscriptions'
import { useAuth } from '../context/AuthContext'
import BottomSheet from '../components/BottomSheet'
import Chip from '../components/Chip'
import ServiceLogo from '../components/ServiceLogo'
import { useTheme } from '../context/ThemeContext'
import { useSettings } from '../context/SettingsContext'
import { BILLING_CYCLES } from '../lib/constants'
import { formatCurrency } from '../lib/formatCurrency'
import { normalizeToMonthly } from '../lib/normalizeAmount'
import { trackEvent } from '../lib/analytics'
import { enrichSubscriptionCandidate } from '../lib/vendorEnrichment'
import { buildSystemHistoryLine, splitNotesPayload } from '../lib/subscriptionHistory'
import { getTodayDate, isTrimCandidate } from '../lib/reviewState'

function formatLongDate(value) {
    if (!value) return 'Not set'
    const date = new Date(`${value}T00:00:00`)
    if (Number.isNaN(date.getTime())) return value
    return date.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })
}

function formatTimestamp(value) {
    if (!value) return null
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return null
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function SubscriptionDetail() {
    const { id } = useParams()
    const navigate = useNavigate()
    const location = useLocation()
    const { T, theme } = useTheme()
    const { currency } = useSettings()
    const { session, isAuthenticated } = useAuth()
    const userId = isAuthenticated ? session?.user?.id : null
    const { categories, getCategoryName, getCategoryColorById, updateSubscription, deleteSubscription, pauseSubscription, subscriptions } = useSubscriptions()
    const [sub, setSub] = useState(null)
    const [editing, setEditing] = useState(false)
    const [cancelDate, setCancelDate] = useState('')
    const [form, setForm] = useState({})
    const returnPath = location.state?.from || '/'
    const returnState = location.state?.calendarState ? { calendarState: location.state.calendarState } : undefined

    const parseCategoryValue = (rawValue) => {
        const sampleId = categories[0]?.id
        return typeof sampleId === 'number' ? Number(rawValue) : rawValue
    }

    useEffect(() => {
        if (id) {
            getSubscriptionById(userId, id).then((data) => {
                if (data) {
                    const parsedNotes = splitNotesPayload(data.notes)
                    setSub(data)
                    setForm({
                        name: data.name || '',
                        amount: data.amount?.toString() || '',
                        cycle: data.cycle || 'monthly',
                        categoryId: data.categoryId || categories[0]?.id || 1,
                        renewalDate: data.renewalDate || '',
                        notes: parsedNotes.userNotes,
                    })
                    setCancelDate(data.renewalDate || new Date().toISOString().slice(0, 10))
                }
            })
        }
    }, [id, userId, categories])

    const daysUntilRenewal = useMemo(() => {
        if (!sub?.renewalDate) return null
        const now = new Date()
        const renewal = new Date(`${sub?.renewalDate}T00:00:00`)
        return Math.ceil((renewal - now) / (1000 * 60 * 60 * 24))
    }, [sub?.renewalDate])

    if (!sub) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="font-mono" style={{ color: T.fgSecondary }}>Loading...</div>
            </div>
        )
    }

    const catColor = getCategoryColorById(sub.categoryId)
    const catName = getCategoryName(sub.categoryId)
    const vendor = enrichSubscriptionCandidate(sub)
    const duplicate = subscriptions.find((item) => item.id !== sub.id && enrichSubscriptionCandidate(item).vendorDomain && enrichSubscriptionCandidate(item).vendorDomain === vendor.vendorDomain)
    const trimCandidate = isTrimCandidate(sub, getCategoryName, subscriptions)
    const monthlyValue = normalizeToMonthly(Number(sub.amount || 0), sub.cycle)
    const annualValue = monthlyValue * 12
    const countdownLabel = daysUntilRenewal === null
        ? 'No renewal scheduled'
        : daysUntilRenewal > 1
            ? `${daysUntilRenewal} days until renewal`
            : daysUntilRenewal === 1
                ? 'Renews tomorrow'
                : daysUntilRenewal === 0
                    ? 'Renews today'
                    : `${Math.abs(daysUntilRenewal)} days past due`
    const parsedExistingNotes = splitNotesPayload(sub.notes)
    const historyEntries = [
        ...(sub.createdAt ? [{ date: formatTimestamp(sub.createdAt), text: 'Added to Cushn' }] : []),
        ...parsedExistingNotes.history.map((entry) => ({
            date: entry.date,
            text: entry.text,
        })),
    ]

    const handleSave = async () => {
        const enriched = enrichSubscriptionCandidate({ name: form.name })
        const nextHistory = []
        if (form.amount !== String(sub.amount ?? '')) {
            nextHistory.push(buildSystemHistoryLine(`Amount updated to ${formatCurrency(parseFloat(form.amount) || 0, currency)}`))
        }
        if (form.categoryId !== sub.categoryId) {
            const nextCategory = categories.find((item) => item.id === form.categoryId)?.name || 'Other'
            nextHistory.push(buildSystemHistoryLine(`Category changed to ${nextCategory}`))
        }
        if (form.renewalDate !== sub.renewalDate) {
            nextHistory.push(buildSystemHistoryLine(`Renewal date changed to ${formatLongDate(form.renewalDate)}`))
        }
        if (form.cycle !== sub.cycle) {
            nextHistory.push(buildSystemHistoryLine(`Billing cycle changed to ${form.cycle}`))
        }

        const noteSections = [
            form.notes.trim(),
            ...parsedExistingNotes.history.map((entry) => buildSystemHistoryLine(entry.text, entry.date || new Date().toISOString().slice(0, 10))),
            ...nextHistory,
        ].filter(Boolean)

        await updateSubscription(sub.id, {
            name: enriched.name,
            amount: parseFloat(form.amount) || 0,
            cycle: form.cycle,
            categoryId: form.categoryId,
            renewalDate: form.renewalDate,
            notes: noteSections.join('\n'),
            vendorDomain: enriched.vendorDomain,
            vendorConfidence: enriched.vendorConfidence,
            vendorMatchType: enriched.vendorMatchType,
        })
        navigate(returnPath, { state: returnState })
    }

    const handleDelete = async () => {
        trackEvent('detail_delete_clicked', { subscription_id: sub.id })
        await deleteSubscription(sub.id)
        navigate(returnPath, { state: returnState })
    }

    const handlePause = async () => {
        trackEvent('detail_pause_clicked', {
            subscription_id: sub.id,
            next_status: sub.status === 'paused' ? 'active' : 'paused',
        })
        if (sub.status === 'paused') {
            await updateSubscription(sub.id, { status: 'active' })
        } else {
            await pauseSubscription(sub.id)
        }
        navigate(returnPath, { state: returnState })
    }

    const handleCancel = async () => {
        trackEvent('detail_cancel_clicked', { subscription_id: sub.id })
        const finalDate = cancelDate || sub.endsAt || sub.renewalDate || getTodayDate()
        const noteSections = [
            form.notes.trim(),
            ...parsedExistingNotes.history.map((entry) => buildSystemHistoryLine(entry.text, entry.date || new Date().toISOString().slice(0, 10))),
            buildSystemHistoryLine(`Marked cancelled effective ${formatLongDate(finalDate)}`),
        ].filter(Boolean)

        await updateSubscription(sub.id, {
            status: finalDate <= getTodayDate() ? 'cancelled' : sub.status,
            renewalDate: finalDate,
            endsAt: finalDate,
            cancelledAt: getTodayDate(),
            notes: noteSections.join('\n'),
        })
        navigate(returnPath, { state: returnState })
    }

    const fields = [
        { icon: Pencil, label: 'Name', key: 'name', value: form.name },
        { icon: Wallet, label: 'Amount', key: 'amount', value: formatCurrency(parseFloat(form.amount) || 0, currency), mono: true },
        { icon: RefreshCw, label: 'Billing Cycle', key: 'cycle', value: form.cycle },
        { icon: Tag, label: 'Category', key: 'categoryId', value: catName, isCat: true },
        { icon: Tag, label: 'Vendor Domain', key: 'vendorDomain', value: vendor.vendorDomain || 'Not matched' },
        { icon: Calendar, label: 'Renewal Date', key: 'renewalDate', value: formatLongDate(form.renewalDate) },
        { icon: Clock3, label: 'Date Added', key: 'createdAt', value: formatTimestamp(sub.createdAt) || 'Unknown' },
        { icon: FileText, label: 'Notes', key: 'notes', value: form.notes || 'No notes' },
    ]

    return (
        <BottomSheet open={true} onClose={() => navigate(returnPath, { state: returnState })} height="88%">
            {/* Header */}
            <div
                className="flex justify-between items-center"
                style={{
                    padding: '10px 16px 12px',
                    borderBottom: `1px solid ${T.border}`,
                }}
            >
                <span
                    onClick={() => navigate(returnPath, { state: returnState })}
                    className="interactive-btn cursor-pointer"
                    style={{ fontSize: 12, color: T.fgSecondary, fontWeight: 600 }}
                >
                    Cancel
                </span>
                <div className="flex items-center gap-2">
                    <ServiceLogo name={sub.name} domain={vendor.vendorDomain} size={30} catColor={catColor} radius={10} />
                    <span style={{ fontSize: 15, color: T.fgPrimary, fontWeight: 700 }}>
                        {sub.name}
                    </span>
                </div>
                <span
                    onClick={handleSave}
                    className="interactive-btn cursor-pointer"
                    style={{ fontSize: 12, color: T.accentPrimary, fontWeight: 700 }}
                >
                    Save
                </span>
            </div>

            {/* Fields */}
            {editing ? (
                <div style={{ padding: '14px 16px 16px' }}>
                    {/* Name */}
                    <div className="glass-panel support-panel" style={{ padding: '14px 14px 12px', marginBottom: 12 }}>
                    <label className="block mb-4">
                        <span style={{ fontSize: 11, color: T.fgSecondary, marginBottom: 4, display: 'block' }}>Name</span>
                        <input
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            className="w-full outline-none"
                            style={{
                                height: 44,
                                background: T.bgGlassStrong,
                                border: `1px solid ${T.border}`,
                                borderRadius: 14,
                                color: T.fgPrimary,
                                fontSize: 14,
                                padding: '0 14px',
                                boxSizing: 'border-box',
                            }}
                        />
                    </label>

                    {/* Amount */}
                    <label className="block">
                        <span style={{ fontSize: 11, color: T.fgSecondary, marginBottom: 4, display: 'block' }}>Amount</span>
                        <input
                            type="number"
                            step="0.01"
                            value={form.amount}
                            onChange={(e) => setForm({ ...form, amount: e.target.value })}
                            className="w-full outline-none font-mono"
                            style={{
                                height: 44,
                                background: T.bgGlassStrong,
                                border: `1px solid ${T.border}`,
                                borderRadius: 14,
                                color: T.fgPrimary,
                                fontSize: 14,
                                padding: '0 14px',
                                boxSizing: 'border-box',
                            }}
                        />
                    </label>
                    </div>

                    {/* Cycle */}
                    <div className="glass-panel support-panel" style={{ padding: '14px 14px 12px', marginBottom: 12 }}>
                    <label className="block mb-4">
                        <span style={{ fontSize: 11, color: T.fgSecondary, marginBottom: 4, display: 'block' }}>Billing Cycle</span>
                        <select
                            value={form.cycle}
                            onChange={(e) => setForm({ ...form, cycle: e.target.value })}
                            className="w-full outline-none"
                            style={{
                                height: 44,
                                background: T.bgGlassStrong,
                                border: `1px solid ${T.border}`,
                                borderRadius: 14,
                                color: T.fgPrimary,
                                fontSize: 14,
                                padding: '0 14px',
                                boxSizing: 'border-box',
                                appearance: 'none',
                            }}
                        >
                            {BILLING_CYCLES.map((c) => (
                                <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                            ))}
                        </select>
                    </label>

                    {/* Category */}
                    <label className="block">
                        <span style={{ fontSize: 11, color: T.fgSecondary, marginBottom: 4, display: 'block' }}>Category</span>
                        <select
                            value={form.categoryId}
                            onChange={(e) => setForm({ ...form, categoryId: parseCategoryValue(e.target.value) })}
                            className="w-full outline-none"
                            style={{
                                height: 44,
                                background: T.bgGlassStrong,
                                border: `1px solid ${T.border}`,
                                borderRadius: 14,
                                color: T.fgPrimary,
                                fontSize: 14,
                                padding: '0 14px',
                                boxSizing: 'border-box',
                                appearance: 'none',
                            }}
                        >
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </label>
                    </div>

                    {/* Renewal Date */}
                    <div className="glass-panel support-panel" style={{ padding: '14px 14px 12px', marginBottom: 12 }}>
                    <label className="block mb-4">
                        <span style={{ fontSize: 11, color: T.fgSecondary, marginBottom: 4, display: 'block' }}>Renewal Date</span>
                        <input
                            type="date"
                            value={form.renewalDate}
                            onChange={(e) => setForm({ ...form, renewalDate: e.target.value })}
                            className="w-full outline-none"
                            style={{
                                height: 44,
                                background: T.bgGlassStrong,
                                border: `1px solid ${T.border}`,
                                borderRadius: 14,
                                color: T.fgPrimary,
                                fontSize: 14,
                                padding: '0 14px',
                                boxSizing: 'border-box',
                                colorScheme: theme === 'light' ? 'light' : 'dark',
                            }}
                        />
                    </label>

                    {/* Notes */}
                    <label className="block">
                        <span style={{ fontSize: 11, color: T.fgSecondary, marginBottom: 4, display: 'block' }}>Notes</span>
                        <textarea
                            value={form.notes}
                            onChange={(e) => setForm({ ...form, notes: e.target.value })}
                            rows={3}
                            className="w-full outline-none resize-none"
                            style={{
                                background: T.bgGlassStrong,
                                border: `1px solid ${T.border}`,
                                borderRadius: 14,
                                color: T.fgPrimary,
                                fontSize: 14,
                                padding: '10px 14px',
                                boxSizing: 'border-box',
                            }}
                        />
                    </label>
                    </div>
                </div>
            ) : (
                <div className="glass-panel support-panel" style={{ margin: '14px 16px 0', overflow: 'hidden' }}>
                    <div style={{ padding: '12px 16px 0' }}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2" style={{ marginBottom: 12 }}>
                            <div className="surface-card-muted" style={{ padding: '12px 14px' }}>
                                <div className="section-label">Monthly impact</div>
                                <div className="metric-value font-mono font-bold" style={{ fontSize: 18, color: T.fgPrimary, marginTop: 8 }}>
                                    {formatCurrency(monthlyValue, currency)}
                                </div>
                                <div style={{ fontSize: 12, color: T.fgSecondary, marginTop: 6 }}>
                                    {formatCurrency(annualValue, currency)} / year
                                </div>
                            </div>
                            <div className="surface-card-muted" style={{ padding: '12px 14px' }}>
                                <div className="section-label">Next renewal</div>
                                <div style={{ fontSize: 14, color: T.fgPrimary, fontWeight: 700, marginTop: 8 }}>
                                    {formatLongDate(sub.renewalDate)}
                                </div>
                                <div style={{ fontSize: 12, color: T.fgSecondary, marginTop: 6, lineHeight: 1.6 }}>
                                    {countdownLabel}
                                </div>
                            </div>
                            <div className="surface-card-muted" style={{ padding: '12px 14px' }}>
                                <div className="section-label">Review status</div>
                                <div style={{ fontSize: 14, color: T.fgPrimary, fontWeight: 700, marginTop: 8 }}>
                                    {duplicate ? 'Duplicate to review' : trimCandidate ? 'Worth keeping?' : 'Healthy entry'}
                                </div>
                                <div style={{ fontSize: 12, color: T.fgSecondary, marginTop: 6, lineHeight: 1.6 }}>
                                    {duplicate
                                        ? `Looks similar to ${duplicate.name}. Review both before the next renewal.`
                                        : trimCandidate
                                            ? 'This category often produces non-essential recurring spend.'
                                            : 'No duplicate or review warning detected right now.'}
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                            {vendor.vendorDomain && (
                                <Chip color={T.semInfo}>{vendor.vendorDomain}</Chip>
                            )}
                            <Chip color={sub.status === 'active' ? T.semSuccess : sub.status === 'paused' ? T.semWarning : T.semDanger}>
                                {sub.status}
                            </Chip>
                            <Chip color={vendor.vendorConfidence >= 0.9 ? T.semSuccess : T.semWarning}>
                                {vendor.vendorConfidence >= 0.9 ? 'High confidence vendor match' : 'Review vendor match'}
                            </Chip>
                            {trimCandidate && (
                                <Chip color={T.semWarning}>Worth keeping?</Chip>
                            )}
                            {duplicate && (
                                <Chip color={T.accentPrimary}>Duplicate detected</Chip>
                            )}
                        </div>
                        {(trimCandidate || duplicate) && (
                            <div style={{ fontSize: 12, color: T.fgSecondary, lineHeight: 1.6, marginTop: 10 }}>
                                {duplicate
                                    ? `Possible duplicate with ${duplicate.name}. Review both before the next renewal.`
                                    : `${sub.name} is in a category that often deserves a second look. Review whether it is still worth the recurring cost.`}
                            </div>
                        )}
                        {(duplicate || trimCandidate) && (
                            <div className="flex flex-wrap gap-2" style={{ marginTop: 10 }}>
                                {duplicate && (
                                    <button
                                        onClick={() => {
                                            trackEvent('detail_duplicate_review_clicked', {
                                                subscription_id: sub.id,
                                                duplicate_id: duplicate.id,
                                            })
                                            navigate(`/detail/${duplicate.id}`, { state: { from: `/detail/${sub.id}` } })
                                        }}
                                        className="interactive-btn cursor-pointer font-mono"
                                        style={{
                                            border: `1px solid ${T.accentPrimary}44`,
                                            background: `${T.accentPrimary}14`,
                                            color: T.accentPrimary,
                                            borderRadius: 10,
                                            fontSize: 11,
                                            padding: '6px 10px',
                                        }}
                                    >
                                        Review duplicate
                                    </button>
                                )}
                                {isTrimCandidate && (
                                    <button
                                        onClick={() => setEditing(true)}
                                        className="interactive-btn cursor-pointer font-mono"
                                        style={{
                                            border: `1px solid ${T.semWarning}44`,
                                            background: `${T.semWarning}14`,
                                            color: T.semWarning,
                                            borderRadius: 10,
                                            fontSize: 11,
                                            padding: '6px 10px',
                                        }}
                                    >
                                        Change amount or category
                                    </button>
                                )}
                            </div>
                        )}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2" style={{ marginTop: 12, marginBottom: 12 }}>
                            <div className="surface-card-muted" style={{ padding: '12px 14px' }}>
                                <div className="section-label">Date added</div>
                                <div style={{ fontSize: 14, color: T.fgPrimary, fontWeight: 700, marginTop: 8 }}>
                                    {formatTimestamp(sub.createdAt) || 'Unknown'}
                                </div>
                            </div>
                            <div className="surface-card-muted" style={{ padding: '12px 14px' }}>
                                <div className="section-label">Cancel timing</div>
                                <input
                                    type="date"
                                    value={cancelDate}
                                    onChange={(e) => setCancelDate(e.target.value)}
                                    className="w-full outline-none"
                                    style={{
                                        marginTop: 8,
                                        height: 40,
                                        background: T.bgGlassStrong,
                                        border: `1px solid ${T.border}`,
                                        borderRadius: 12,
                                        color: T.fgPrimary,
                                        fontSize: 13,
                                        padding: '0 12px',
                                        boxSizing: 'border-box',
                                        colorScheme: theme === 'light' ? 'light' : 'dark',
                                    }}
                                />
                                <div style={{ fontSize: 11, color: T.fgTertiary, marginTop: 6 }}>
                                    Pick the date this subscription should stop counting.
                                </div>
                            </div>
                        </div>
                    </div>
                    {fields.map((f, i) => {
                        const Icon = f.icon
                        return (
                            <div
                                key={i}
                                className="interactive-btn flex items-center gap-3 cursor-pointer"
                                style={{
                                    padding: '14px 16px',
                                    borderBottom: `1px solid ${T.border}`,
                                }}
                                onClick={() => setEditing(true)}
                            >
                                <Icon size={16} color={T.fgTertiary} />
                                <span className="flex-1" style={{ fontSize: 13, color: T.fgPrimary }}>
                                    {f.label}
                                </span>
                                {f.isCat ? (
                                    <Chip color={catColor}>{f.value}</Chip>
                                ) : (
                                    <span
                                        style={{
                                            fontSize: 12,
                                            color: T.accentPrimary,
                                            fontFamily: f.mono ? "var(--font-mono)" : 'inherit',
                                            fontWeight: 600,
                                        }}
                                    >
                                        {f.value}
                                    </span>
                                )}
                                <ChevronRight size={14} color={T.fgDivider} />
                            </div>
                        )
                    })}
                    <div style={{ padding: '16px 16px 18px' }}>
                        <div className="section-label">History</div>
                        <div style={{ display: 'grid', gap: 10, marginTop: 12 }}>
                            {historyEntries.length > 0 ? historyEntries.map((entry, index) => (
                                <div
                                    key={`${entry.date || 'unknown'}-${index}`}
                                    className="surface-card-muted"
                                    style={{ padding: '12px 14px' }}
                                >
                                    <div className="font-mono" style={{ fontSize: 10, color: T.fgTertiary }}>
                                        {entry.date || 'Unknown date'}
                                    </div>
                                    <div style={{ fontSize: 13, color: T.fgPrimary, marginTop: 6 }}>
                                        {entry.text}
                                    </div>
                                </div>
                            )) : (
                                <div className="surface-card-muted" style={{ padding: '12px 14px', color: T.fgSecondary, fontSize: 12 }}>
                                    No change history yet. Future edits and cancellations will appear here.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Danger zone */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2" style={{ padding: '14px 16px 18px' }}>
                <button
                    onClick={handleCancel}
                    className="interactive-btn flex-1 flex items-center justify-center gap-1.5 cursor-pointer"
                    style={{
                        background: T.semSuccess + '22',
                        border: `1px solid ${T.semSuccess}44`,
                        borderRadius: 14,
                        padding: 11,
                        fontSize: 12,
                        color: T.semSuccess,
                        fontWeight: 700,
                    }}
                >
                    <CheckCircle2 size={14} />
                    Mark cancelled
                </button>
                <button
                    onClick={handlePause}
                    className="interactive-btn flex-1 flex items-center justify-center gap-1.5 cursor-pointer"
                    style={{
                        background: sub.status === 'paused' ? T.semSuccess + '22' : T.semWarning + '22',
                        border: `1px solid ${sub.status === 'paused' ? T.semSuccess : T.semWarning}44`,
                        borderRadius: 14,
                        padding: 11,
                        fontSize: 12,
                        color: sub.status === 'paused' ? T.semSuccess : T.semWarning,
                        fontWeight: 700,
                    }}
                >
                    {sub.status === 'paused' ? <Play size={14} /> : <PauseCircle size={14} />}
                    {sub.status === 'paused' ? 'Resume' : 'Pause'}
                </button>
                <button
                    onClick={handleDelete}
                    className="interactive-btn flex-1 flex items-center justify-center gap-1.5 cursor-pointer"
                    style={{
                        background: T.semDanger + '22',
                        border: `1px solid ${T.semDanger}44`,
                        borderRadius: 14,
                        padding: 11,
                        fontSize: 12,
                        color: T.semDanger,
                        fontWeight: 700,
                    }}
                >
                    <Trash2 size={14} />
                    Delete
                </button>
            </div>
        </BottomSheet>
    )
}
