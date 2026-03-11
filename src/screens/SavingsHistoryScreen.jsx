import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import useSubscriptions from '../hooks/useSubscriptions'
import { useTheme } from '../context/ThemeContext'
import { useSettings } from '../context/SettingsContext'
import { formatCurrency } from '../lib/formatCurrency'
import { deriveSavingsHistory } from '../lib/subscriptionHistory'

function formatEventDate(value) {
    if (!value) return 'Unknown date'
    const date = new Date(`${value}T00:00:00`)
    if (Number.isNaN(date.getTime())) return value
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function SavingsHistoryScreen() {
    const navigate = useNavigate()
    const { T } = useTheme()
    const { currency } = useSettings()
    const { subscriptions, getCategoryName } = useSubscriptions()
    const savings = useMemo(() => deriveSavingsHistory(subscriptions), [subscriptions])

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
                    <p className="page-eyebrow">Retention</p>
                    <h1 className="page-title">Savings History</h1>
                    <p className="page-subtitle" style={{ marginTop: 8, maxWidth: 560 }}>
                        Actual savings from subscriptions you have already cancelled, plus the current recurring amount you have taken off your plate.
                    </p>
                </section>

                <section className="split-grid">
                    <div className="surface-card" style={{ padding: 16, background: T.bgSurface, borderLeft: `3px solid ${T.finGain}` }}>
                        <div className="section-label">Saved so far</div>
                        <div className="metric-value font-mono font-bold" style={{ fontSize: 24, color: T.finGain, marginTop: 8 }}>
                            {formatCurrency(savings.totalSavedToDate, currency).replace('.00', '')}
                        </div>
                        <div style={{ fontSize: 12, color: T.fgSecondary, marginTop: 6 }}>
                            Cumulative savings estimated from cancellation effective dates.
                        </div>
                    </div>
                    <div className="surface-card" style={{ padding: 16, background: T.bgSurface, borderLeft: `3px solid ${T.accentPrimary}` }}>
                        <div className="section-label">Recurring savings live now</div>
                        <div className="metric-value font-mono font-bold" style={{ fontSize: 24, color: T.accentPrimary, marginTop: 8 }}>
                            {formatCurrency(savings.activeMonthlySavings, currency).replace('.00', '')}/mo
                        </div>
                        <div style={{ fontSize: 12, color: T.fgSecondary, marginTop: 6 }}>
                            {formatCurrency(savings.activeAnnualSavings, currency).replace('.00', '')}/year removed from active spend.
                        </div>
                    </div>
                </section>

                <section className="surface-card" style={{ padding: 16, background: T.bgSurface }}>
                    <div className="section-header" style={{ marginBottom: 12 }}>
                        <div>
                            <div className="section-label">Timeline</div>
                            <h2 className="section-title">Cancellation events</h2>
                        </div>
                    </div>
                    {savings.events.length === 0 ? (
                        <div className="surface-card-muted" style={{ padding: '16px 18px', fontSize: 13, color: T.fgSecondary }}>
                            No cancellation savings recorded yet. Mark a subscription cancelled and it will appear here.
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gap: 10 }}>
                            {savings.events.map((event) => (
                                <div
                                    key={event.id}
                                    className="surface-card-muted"
                                    style={{
                                        padding: '14px 16px',
                                        borderLeft: `3px solid ${event.isLive ? T.finGain : T.semWarning}`,
                                    }}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <div style={{ fontSize: 15, color: T.fgPrimary, fontWeight: 700 }}>{event.name}</div>
                                            <div className="font-mono" style={{ fontSize: 10, color: T.fgTertiary, marginTop: 4 }}>
                                                {getCategoryName(event.categoryId)} • effective {formatEventDate(event.effectiveDate || event.loggedAt)}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-mono font-bold" style={{ fontSize: 13, color: T.finGain }}>
                                                {formatCurrency(event.savedToDate, currency).replace('.00', '')}
                                            </div>
                                            <div className="font-mono" style={{ fontSize: 10, color: T.fgTertiary, marginTop: 4 }}>
                                                {event.elapsedDays}d saved
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2" style={{ marginTop: 10 }}>
                                        <div className="font-mono" style={{ fontSize: 11, color: T.fgSecondary }}>
                                            Removed recurring spend: {formatCurrency(event.monthlyValue, currency).replace('.00', '')}/mo
                                        </div>
                                        <div className="font-mono" style={{ fontSize: 11, color: T.fgSecondary }}>
                                            Annualized impact: {formatCurrency(event.annualValue, currency).replace('.00', '')}/year
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => navigate(`/detail/${event.subscriptionId}`)}
                                        className="interactive-btn cursor-pointer"
                                        style={{
                                            marginTop: 10,
                                            border: `1px solid ${T.border}`,
                                            background: T.bgSurface,
                                            color: T.accentPrimary,
                                            borderRadius: 12,
                                            padding: '8px 10px',
                                            fontSize: 11,
                                            fontWeight: 700,
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: 6,
                                        }}
                                    >
                                        Open subscription
                                        <ArrowRight size={13} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    )
}
