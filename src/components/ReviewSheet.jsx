import { useEffect, useMemo, useState } from 'react'
import { ExternalLink, CheckCircle2, BellOff, CircleSlash, CalendarClock, X } from 'lucide-react'
import BottomSheet from './BottomSheet'
import ServiceLogo from './ServiceLogo'
import { useTheme } from '../context/ThemeContext'
import { useSettings } from '../context/SettingsContext'
import { formatCurrency } from '../lib/formatCurrency'
import { buildSystemHistoryLine, splitNotesPayload } from '../lib/subscriptionHistory'
import { addDays, getSubscriptionAnnualValue, getSubscriptionMonthlyValue, getTodayDate } from '../lib/reviewState'
import { getCancellationLink } from '../lib/cancellationLinks'

function formatDaysAgo(value) {
    if (!value) return 'Added recently'
    const created = new Date(value)
    if (Number.isNaN(created.getTime())) return 'Added recently'
    const today = new Date()
    const diff = Math.max(0, Math.floor((today - created) / (1000 * 60 * 60 * 24)))
    if (diff === 0) return 'Added today'
    if (diff === 1) return 'Added 1 day ago'
    return `Added ${diff} days ago`
}

function formatLongDate(value) {
    if (!value) return 'Not set'
    const date = new Date(`${value}T00:00:00`)
    if (Number.isNaN(date.getTime())) return value
    return date.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })
}

export default function ReviewSheet({
    open,
    subscription,
    initialStep = 'default',
    onClose,
    onKeep,
    onRemindLater,
    onCancel,
}) {
    const { T } = useTheme()
    const { currency } = useSettings()
    const [step, setStep] = useState(initialStep)
    const [endsAt, setEndsAt] = useState(subscription?.endsAt || subscription?.renewalDate || getTodayDate())
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        if (!open) return
        setStep(initialStep)
        setEndsAt(subscription?.endsAt || subscription?.renewalDate || getTodayDate())
    }, [initialStep, open, subscription?.endsAt, subscription?.renewalDate])

    const monthlyValue = useMemo(() => getSubscriptionMonthlyValue(subscription), [subscription])
    const annualValue = useMemo(() => getSubscriptionAnnualValue(subscription), [subscription])
    const cancellationLink = useMemo(() => getCancellationLink(subscription), [subscription])

    if (!subscription) return null

    const handleKeep = async () => {
        setSaving(true)
        try {
            await onKeep?.(subscription)
            onClose?.()
        } finally {
            setSaving(false)
        }
    }

    const handleRemindLater = async () => {
        setSaving(true)
        try {
            await onRemindLater?.(subscription)
            onClose?.()
        } finally {
            setSaving(false)
        }
    }

    const handleMarkCancelled = async () => {
        setSaving(true)
        try {
            const parsedNotes = splitNotesPayload(subscription.notes)
            const nextNotes = [
                parsedNotes.userNotes.trim(),
                ...parsedNotes.history.map((entry) => buildSystemHistoryLine(entry.text, entry.date || getTodayDate())),
                buildSystemHistoryLine(`Marked cancelled effective ${formatLongDate(endsAt)}`),
            ].filter(Boolean).join('\n')

            await onCancel?.(subscription, {
                cancelledAt: getTodayDate(),
                endsAt,
                notes: nextNotes,
            })
            onClose?.()
        } finally {
            setSaving(false)
        }
    }

    return (
        <BottomSheet open={open} onClose={onClose} height="78%">
            <div style={{ padding: '4px 18px 28px' }}>
                <div className="flex items-start justify-between gap-3" style={{ marginTop: 6 }}>
                    <div className="flex items-start gap-3" style={{ flex: 1 }}>
                    <ServiceLogo
                        name={subscription.name}
                        domain={subscription.vendorDomain}
                        size={44}
                        catColor={T.accentPrimary}
                        radius={14}
                    />
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 22, color: T.fgPrimary, fontWeight: 700 }}>{subscription.name}</div>
                        <div className="font-mono" style={{ fontSize: 12, color: T.fgSecondary, marginTop: 6 }}>
                            {formatCurrency(monthlyValue, currency).replace('.00', '')}/mo • {formatCurrency(annualValue, currency).replace('.00', '')}/yr
                        </div>
                        <div style={{ fontSize: 12, color: T.fgTertiary, marginTop: 6 }}>
                            {formatDaysAgo(subscription.createdAt)}
                        </div>
                    </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="interactive-btn cursor-pointer"
                        aria-label="Close review"
                        style={{
                            border: `1px solid ${T.border}`,
                            background: T.bgMuted,
                            color: T.fgSecondary,
                            borderRadius: 999,
                            width: 34,
                            height: 34,
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                        }}
                    >
                        <X size={16} />
                    </button>
                </div>

                <div className="surface-card-muted" style={{ marginTop: 18, padding: '14px 16px' }}>
                    <div className="section-label">Review</div>
                    <div style={{ fontSize: 14, color: T.fgPrimary, lineHeight: 1.6, marginTop: 8 }}>
                        Decide whether this subscription stays, gets cancelled externally, or should come back later.
                    </div>
                </div>

                <div style={{ display: 'grid', gap: 10, marginTop: 16 }}>
                    <button
                        onClick={handleKeep}
                        disabled={saving}
                        className="interactive-btn cursor-pointer"
                        style={{
                            border: `1px solid ${T.semSuccess}44`,
                            background: `${T.semSuccess}16`,
                            color: T.semSuccess,
                            borderRadius: 16,
                            padding: '14px 16px',
                            textAlign: 'left',
                        }}
                    >
                        <div className="flex items-center gap-2">
                            <CheckCircle2 size={16} />
                            <span style={{ fontSize: 14, fontWeight: 700 }}>Keep it</span>
                        </div>
                        <div style={{ fontSize: 12, lineHeight: 1.6, marginTop: 6 }}>
                            Dismiss this review for 90 days and add a Reviewed badge in your library.
                        </div>
                    </button>

                    <button
                        onClick={() => setStep('cancel')}
                        disabled={saving}
                        className="interactive-btn cursor-pointer"
                        style={{
                            border: `1px solid ${T.semDanger}33`,
                            background: `${T.semDanger}12`,
                            color: T.semDanger,
                            borderRadius: 16,
                            padding: '14px 16px',
                            textAlign: 'left',
                        }}
                    >
                        <div className="flex items-center gap-2">
                            <CircleSlash size={16} />
                            <span style={{ fontSize: 14, fontWeight: 700 }}>Cancel it</span>
                        </div>
                        <div style={{ fontSize: 12, lineHeight: 1.6, marginTop: 6 }}>
                            Get the vendor cancellation link, set when it ends, and remove it from spend when that date arrives.
                        </div>
                    </button>

                    <button
                        onClick={handleRemindLater}
                        disabled={saving}
                        className="interactive-btn cursor-pointer"
                        style={{
                            border: `1px solid ${T.border}`,
                            background: T.bgMuted,
                            color: T.fgPrimary,
                            borderRadius: 16,
                            padding: '14px 16px',
                            textAlign: 'left',
                        }}
                    >
                        <div className="flex items-center gap-2">
                            <BellOff size={16} />
                            <span style={{ fontSize: 14, fontWeight: 700 }}>Remind me later</span>
                        </div>
                        <div style={{ fontSize: 12, lineHeight: 1.6, marginTop: 6 }}>
                            Hide this candidate for 30 days, then surface it again.
                        </div>
                    </button>
                </div>

                {step === 'cancel' && (
                    <div className="surface-card" style={{ marginTop: 18, padding: 16, border: `1px solid ${T.semDanger}22` }}>
                        <div className="section-label">Cancellation</div>
                        <button
                            onClick={() => window.open(cancellationLink.href, '_blank', 'noopener,noreferrer')}
                            className="interactive-btn cursor-pointer"
                            style={{
                                marginTop: 10,
                                border: `1px solid ${T.accentPrimary}33`,
                                background: `${T.accentPrimary}12`,
                                color: T.accentPrimary,
                                borderRadius: 12,
                                padding: '10px 12px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 8,
                                fontSize: 12,
                                fontWeight: 700,
                            }}
                        >
                            {cancellationLink.label}
                            <ExternalLink size={14} />
                        </button>
                        <div style={{ fontSize: 12, color: T.fgSecondary, marginTop: 8, lineHeight: 1.6 }}>
                            {cancellationLink.fallback ? 'No saved cancellation URL yet, so this opens a search.' : 'This opens the vendor account or cancellation page in a new tab.'}
                        </div>

                        <label style={{ display: 'block', marginTop: 16 }}>
                            <div className="flex items-center gap-2" style={{ fontSize: 12, color: T.fgPrimary, fontWeight: 700, marginBottom: 8 }}>
                                <CalendarClock size={14} />
                                When does it end?
                            </div>
                            <input
                                type="date"
                                value={endsAt}
                                onChange={(event) => setEndsAt(event.target.value)}
                                min={addDays(getTodayDate(), -365)}
                                className="w-full font-mono"
                                style={{
                                    background: T.bgMuted,
                                    border: `1px solid ${T.border}`,
                                    borderRadius: 12,
                                    padding: '12px 14px',
                                    color: T.fgPrimary,
                                }}
                            />
                        </label>

                        <button
                            onClick={handleMarkCancelled}
                            disabled={saving || !endsAt}
                            className="interactive-btn cursor-pointer"
                            style={{
                                marginTop: 16,
                                width: '100%',
                                border: 'none',
                                background: T.semDanger,
                                color: '#fff',
                                borderRadius: 14,
                                padding: '12px 14px',
                                fontSize: 13,
                                fontWeight: 700,
                            }}
                        >
                            Mark as cancelled
                        </button>
                    </div>
                )}
            </div>
        </BottomSheet>
    )
}
