import { useMemo, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import useSubscriptions from '../hooks/useSubscriptions'
import { useTheme } from '../context/ThemeContext'
import { useSettings } from '../context/SettingsContext'
import { formatCurrency } from '../lib/formatCurrency'
import { normalizeToMonthly } from '../lib/normalizeAmount'
import { buildBudgetScenario } from '../lib/dashboardInsights'
import { buildMonthlyProjection } from '../lib/projections'
import { useReviewSheet } from '../context/ReviewSheetContext'
import { isSubscriptionCountedInSpend, shouldSurfaceReview } from '../lib/reviewState'

export default function AnalyticsScreen() {
    const { T } = useTheme()
    const { currency } = useSettings()
    const { openReviewSheet } = useReviewSheet()
    const { subscriptions, categories, monthlyTotal, annualTotal } = useSubscriptions()
    const [period, setPeriod] = useState('monthly')
    const [simulatedCuts, setSimulatedCuts] = useState([])

    const multiplier = period === 'monthly' ? 1 : 12
    const periodSuffix = period === 'monthly' ? '/mo' : '/yr'
    const displayTotal = period === 'monthly' ? monthlyTotal : annualTotal
    const activeSubscriptions = useMemo(
        () => subscriptions.filter((sub) => isSubscriptionCountedInSpend(sub)),
        [subscriptions],
    )

    const enrichedActive = useMemo(
        () => activeSubscriptions.map((sub) => {
            const monthlyValue = normalizeToMonthly(sub.amount, sub.cycle)
            return {
                ...sub,
                monthlyValue,
                annualValue: monthlyValue * 12,
                displayValue: monthlyValue * multiplier,
                categoryName: categories.find((category) => category.id === sub.categoryId)?.name || 'Other',
            }
        }),
        [activeSubscriptions, categories, multiplier],
    )

    const worthReconsidering = useMemo(
        () => enrichedActive
            .filter((sub) => shouldSurfaceReview(sub, (categoryId) => categories.find((category) => category.id === categoryId)?.name || 'Other', enrichedActive))
            .sort((a, b) => b.monthlyValue - a.monthlyValue),
        [categories, enrichedActive],
    )

    const reconsideringMonthly = worthReconsidering.reduce((sum, sub) => sum + sub.monthlyValue, 0)
    const reconsideringAnnual = reconsideringMonthly * 12
    const rankedSubscriptions = [...enrichedActive].sort((a, b) => b.displayValue - a.displayValue)
    const maxRankedValue = rankedSubscriptions[0]?.displayValue || 1

    const categorySpend = useMemo(
        () => categories
            .map((category, index) => {
                const subs = enrichedActive.filter((sub) => sub.categoryId === category.id)
                const value = subs.reduce((sum, sub) => sum + sub.displayValue, 0)
                return {
                    name: category.name,
                    value,
                    color: [T.finChart1, T.finChart2, T.finChart3, T.finChart4, T.accentPrimary][index % 5],
                }
            })
            .filter((item) => item.value > 0)
            .sort((a, b) => b.value - a.value),
        [T.accentPrimary, T.finChart1, T.finChart2, T.finChart3, T.finChart4, categories, enrichedActive],
    )

    const trendData = useMemo(
        () => buildMonthlyProjection(activeSubscriptions, new Date(), 6).map((point) => ({
            label: point.label,
            value: point.totalDue * multiplier,
        })),
        [activeSubscriptions, multiplier],
    )
    const currentProjected = trendData[0]?.value ?? 0
    const nextProjected = trendData[1]?.value ?? currentProjected
    const projectedDeltaValue = nextProjected - currentProjected
    const projectedDeltaPct = currentProjected > 0 ? (projectedDeltaValue / currentProjected) * 100 : 0
    const projectedDeltaColor = projectedDeltaValue > 0 ? T.semDanger : T.semSuccess
    const projectedDeltaText = `${projectedDeltaValue >= 0 ? '+' : ''}${Math.round(projectedDeltaPct)}%`
    const highestCategory = categorySpend[0] || null
    const averagePerSubscription = enrichedActive.length > 0 ? displayTotal / enrichedActive.length : 0

    const simulatorItems = useMemo(
        () => (worthReconsidering.length > 0 ? worthReconsidering : rankedSubscriptions.slice(0, 4)),
        [rankedSubscriptions, worthReconsidering],
    )
    const {
        simulatedSavings,
        simulatedSpend,
        simulatedAnnualSavings,
    } = useMemo(
        () => buildBudgetScenario(monthlyTotal, monthlyTotal, simulatorItems, simulatedCuts),
        [monthlyTotal, simulatedCuts, simulatorItems],
    )
    const simulatorSavedDisplay = period === 'monthly' ? simulatedSavings : simulatedAnnualSavings
    const simulatorProjectedDisplay = period === 'monthly' ? simulatedSpend : simulatedSpend * 12
    const simulatorBaseDisplay = period === 'monthly' ? monthlyTotal : annualTotal
    const simulatorBarPercent = simulatorBaseDisplay > 0 ? (simulatorProjectedDisplay / simulatorBaseDisplay) * 100 : 100
    const activeCutCount = simulatedCuts.length

    const toggleCut = (subscriptionId) => {
        setSimulatedCuts((prev) => {
            const nextSelected = !prev.includes(subscriptionId)
            return nextSelected
                ? [...prev, subscriptionId]
                : prev.filter((id) => id !== subscriptionId)
        })
    }

    return (
        <div className="dashboard-page" style={{ background: T.bgBase }}>
            <div className="dashboard-container dashboard-stack" style={{ paddingTop: 18, paddingBottom: 32 }}>
                <section
                    className="hero-card"
                    style={{
                        padding: 22,
                        background: T.bgSurface,
                        border: `1px solid ${T.border}`,
                    }}
                >
                    <div className="flex items-end justify-between gap-3 flex-wrap">
                        <div>
                            <p className="page-eyebrow">Insights</p>
                            <h1 className="page-title">Analytics</h1>
                            <p className="page-subtitle" style={{ marginTop: 6, maxWidth: 560 }}>
                                See where your subscription budget is concentrated, what is trending up, and what is worth cutting next.
                            </p>
                            <div className="font-mono" style={{ fontSize: 10, color: T.fgTertiary, marginTop: 18, letterSpacing: 1 }}>
                                Total recurring spend
                            </div>
                            <div className="page-title" style={{ fontSize: 'clamp(1.8rem, 5vw, 2.8rem)', lineHeight: 1.02, marginTop: 6 }}>
                                {formatCurrency(displayTotal, currency).replace('.00', '')}
                                <span style={{ fontSize: 'clamp(1rem, 3vw, 1.25rem)', color: T.fgTertiary, fontWeight: 600 }}>
                                    {periodSuffix}
                                </span>
                            </div>
                            <p className="page-subtitle" style={{ marginTop: 10, maxWidth: 560 }}>
                                {worthReconsidering.length > 0
                                    ? `We found ${formatCurrency(period === 'monthly' ? reconsideringMonthly : reconsideringAnnual, currency).replace('.00', '')}${periodSuffix} worth reconsidering. That's ${formatCurrency(reconsideringAnnual, currency).replace('.00', '')}/year you could save.`
                                    : 'Your recurring spend looks clean right now. Review your most expensive subscriptions to stay ahead of drift.'}
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: 8, alignSelf: 'flex-start', flexShrink: 0 }}>
                            {['monthly', 'annual'].map((value) => (
                                <button
                                    key={value}
                                    onClick={() => setPeriod(value)}
                                    className="interactive-btn cursor-pointer capitalize"
                                    style={{
                                        height: 34,
                                        minWidth: 78,
                                        padding: '0 14px',
                                        borderRadius: 12,
                                        background: period === value ? T.accentPrimary : T.bgMuted,
                                        border: `1px solid ${period === value ? T.accentPrimary : T.border}`,
                                        color: period === value ? T.fgOnAccent : T.fgSecondary,
                                        fontSize: 11,
                                        fontWeight: 700,
                                    }}
                                >
                                    {value}
                                </button>
                            ))}
                        </div>
                    </div>

                </section>

                <section
                    className="surface-card"
                    style={{
                        padding: 18,
                        background: T.bgSurface,
                    }}
                >
                    <div className="section-label">Where it goes</div>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2" style={{ marginTop: 16, alignItems: 'start' }}>
                        <div className="surface-card-muted" style={{ padding: 18, background: T.bgElevated }}>
                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-[auto_1fr] sm:items-center">
                                <div
                                    style={{
                                        position: 'relative',
                                        width: 240,
                                        height: 240,
                                        maxWidth: '100%',
                                        margin: '0 auto',
                                        flexShrink: 0,
                                    }}
                                >
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={categorySpend}
                                                dataKey="value"
                                                innerRadius={68}
                                                outerRadius={103}
                                                paddingAngle={3}
                                                strokeWidth={0}
                                            >
                                                {categorySpend.map((item) => (
                                                    <Cell key={item.name} fill={item.color} />
                                                ))}
                                            </Pie>
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div
                                        style={{
                                            position: 'absolute',
                                            inset: 0,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexDirection: 'column',
                                            pointerEvents: 'none',
                                        }}
                                    >
                                        <div
                                            className="font-mono"
                                            style={{
                                                fontSize: 'clamp(1.15rem, 4.8vw, 1.6rem)',
                                                lineHeight: 1,
                                                color: T.fgPrimary,
                                                fontWeight: 800,
                                                letterSpacing: '-0.04em',
                                                textAlign: 'center',
                                                maxWidth: '78%',
                                            }}
                                        >
                                            {formatCurrency(displayTotal, currency).replace('.00', '')}
                                        </div>
                                        <div
                                            style={{
                                                fontSize: 'clamp(0.7rem, 2.8vw, 0.78rem)',
                                                color: T.fgTertiary,
                                                textAlign: 'center',
                                                lineHeight: 1.3,
                                                marginTop: 8,
                                                maxWidth: '70%',
                                            }}
                                        >
                                            total {period === 'monthly' ? 'monthly' : 'annual'} spend
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gap: 10 }}>
                                    {categorySpend.map((category) => (
                                        <div key={category.name} className="flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-2">
                                                <span style={{ width: 10, height: 10, borderRadius: 3, background: category.color, flexShrink: 0 }} />
                                                <span style={{ fontSize: 13, color: T.fgPrimary, fontWeight: 600 }}>{category.name}</span>
                                            </div>
                                            <div className="font-mono" style={{ fontSize: 12, color: T.fgSecondary, flexShrink: 0 }}>
                                                {formatCurrency(category.value, currency).replace('.00', '')}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="surface-card-muted" style={{ padding: 10, background: T.bgElevated }}>
                            <div style={{ display: 'grid' }}>
                                {rankedSubscriptions.map((subscription, index) => (
                                    <button
                                        key={subscription.id}
                                        onClick={() => openReviewSheet(subscription)}
                                        className="interactive-btn cursor-pointer"
                                        style={{
                                            border: 'none',
                                            borderBottom: index < rankedSubscriptions.length - 1 ? `1px solid ${T.border}` : 'none',
                                            background: 'transparent',
                                            textAlign: 'left',
                                            padding: '14px 10px',
                                        }}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="font-mono"
                                                style={{
                                                    width: 24,
                                                    height: 24,
                                                    borderRadius: 7,
                                                    background: index === 0 ? `${T.semDanger}16` : T.bgMuted,
                                                    color: index === 0 ? T.semDanger : T.fgTertiary,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: 11,
                                                    fontWeight: 700,
                                                    flexShrink: 0,
                                                }}
                                            >
                                                {index + 1}
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div className="flex items-center justify-between gap-3">
                                                    <div style={{ fontSize: 14, color: T.fgPrimary, fontWeight: 700 }}>{subscription.name}</div>
                                                    <div className="font-mono" style={{ fontSize: 13, color: index === 0 ? T.semDanger : T.fgPrimary, fontWeight: 700 }}>
                                                        {formatCurrency(subscription.displayValue, currency).replace('.00', '')}
                                                    </div>
                                                </div>
                                                <div style={{ marginTop: 6, height: 5, borderRadius: 999, overflow: 'hidden', background: T.bgMuted }}>
                                                    <div
                                                        style={{
                                                            width: `${(subscription.displayValue / maxRankedValue) * 100}%`,
                                                            height: '100%',
                                                            borderRadius: 999,
                                                            background: index === 0 ? T.semDanger : T.accentPrimary,
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                <section
                    id="review-scenario"
                    className="surface-card"
                    style={{
                        padding: 18,
                        background: T.bgSurface,
                    }}
                >
                    <div className="section-label">Simulator</div>
                    <h2 className="section-title" style={{ marginTop: 6 }}>What if you cut a few?</h2>
                    <p style={{ fontSize: 13, color: T.fgSecondary, marginTop: 8 }}>
                        Toggle off subscriptions to see the impact in real time.
                    </p>

                    <div className="surface-card-muted" style={{ padding: 18, background: T.bgElevated, marginTop: 16 }}>
                        <div className="flex items-center justify-between gap-3" style={{ marginBottom: 8 }}>
                            <div className="font-mono" style={{ fontSize: 13, color: T.fgPrimary, fontWeight: 700 }}>
                                {formatCurrency(simulatorProjectedDisplay, currency).replace('.00', '')}{periodSuffix}
                            </div>
                            {simulatorSavedDisplay > 0 && (
                                <div className="font-mono" style={{ fontSize: 12, color: T.finGain, fontWeight: 700 }}>
                                    saving {formatCurrency(simulatorSavedDisplay, currency).replace('.00', '')}{periodSuffix}
                                </div>
                            )}
                        </div>

                        <div style={{ height: 12, borderRadius: 999, background: T.bgMuted, overflow: 'hidden', position: 'relative' }}>
                            <div
                                style={{
                                    width: `${simulatorBarPercent}%`,
                                    height: '100%',
                                    background: T.accentPrimary,
                                    borderRadius: 999,
                                    transition: 'width 220ms ease',
                                }}
                            />
                            {simulatorSavedDisplay > 0 && (
                                <div
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        right: 0,
                                        height: '100%',
                                        width: `${100 - simulatorBarPercent}%`,
                                        background: `repeating-linear-gradient(-45deg, ${T.finGain}12, ${T.finGain}12 4px, ${T.finGain}22 4px, ${T.finGain}22 8px)`,
                                        transition: 'width 220ms ease',
                                    }}
                                />
                            )}
                        </div>

                        {activeCutCount > 0 && (
                            <div
                                style={{
                                    marginTop: 14,
                                    borderRadius: 14,
                                    border: `1px solid ${T.finGain}33`,
                                    background: `${T.finGain}12`,
                                    padding: '12px 14px',
                                }}
                            >
                                <div style={{ fontSize: 14, color: T.finGain, fontWeight: 800 }}>
                                    {formatCurrency(simulatedAnnualSavings, currency).replace('.00', '')}/year saved
                                </div>
                                <div style={{ fontSize: 12, color: T.fgSecondary, marginTop: 4 }}>
                                    by cutting {activeCutCount} subscription{activeCutCount === 1 ? '' : 's'}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="surface-card-muted" style={{ padding: '4px 16px', background: T.bgElevated, marginTop: 14 }}>
                        {simulatorItems.map((subscription, index) => {
                            const isCut = simulatedCuts.includes(subscription.id)
                            return (
                                <div
                                    key={subscription.id}
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'minmax(0, 1fr) auto',
                                        gap: 12,
                                        alignItems: 'center',
                                        padding: '14px 0',
                                        borderBottom: index < simulatorItems.length - 1 ? `1px solid ${T.border}` : 'none',
                                        opacity: isCut ? 0.5 : 1,
                                    }}
                                >
                                    <button
                                        onClick={() => openReviewSheet(subscription)}
                                        className="interactive-btn cursor-pointer"
                                        style={{
                                            border: 'none',
                                            background: 'transparent',
                                            textAlign: 'left',
                                            padding: 0,
                                            minWidth: 0,
                                        }}
                                    >
                                        <div style={{ fontSize: 14, color: T.fgPrimary, fontWeight: 700, textDecoration: isCut ? 'line-through' : 'none' }}>
                                            {subscription.name}
                                        </div>
                                        <div className="flex items-center justify-between gap-2 flex-wrap" style={{ marginTop: 2 }}>
                                            <div style={{ fontSize: 12, color: T.fgTertiary }}>
                                                {subscription.categoryName}
                                            </div>
                                            <div className="font-mono sm:hidden" style={{ fontSize: 12, color: T.fgPrimary, fontWeight: 700, textDecoration: isCut ? 'line-through' : 'none' }}>
                                                {formatCurrency(period === 'monthly' ? subscription.monthlyValue : subscription.annualValue, currency).replace('.00', '')}{periodSuffix}
                                            </div>
                                        </div>
                                    </button>
                                    <div className="font-mono hidden sm:block" style={{ fontSize: 13, color: T.fgPrimary, fontWeight: 700, textDecoration: isCut ? 'line-through' : 'none' }}>
                                        {formatCurrency(period === 'monthly' ? subscription.monthlyValue : subscription.annualValue, currency).replace('.00', '')}{periodSuffix}
                                    </div>
                                    <button
                                        onClick={() => toggleCut(subscription.id)}
                                        aria-pressed={isCut}
                                        className="interactive-btn cursor-pointer"
                                        style={{
                                            width: 44,
                                            height: 24,
                                            border: 'none',
                                            borderRadius: 999,
                                            background: isCut ? T.fgDivider : T.accentPrimary,
                                            position: 'relative',
                                            padding: 0,
                                        }}
                                    >
                                        <span
                                            style={{
                                                position: 'absolute',
                                                top: 2,
                                                left: isCut ? 2 : 22,
                                                width: 20,
                                                height: 20,
                                                borderRadius: 999,
                                                background: '#fff',
                                                transition: 'left 180ms ease',
                                                boxShadow: '0 1px 3px rgba(0,0,0,0.18)',
                                            }}
                                        />
                                    </button>
                                </div>
                            )
                        })}
                    </div>
                </section>

                <section className="surface-card" style={{ padding: 18, background: T.bgSurface }}>
                    <div className="flex items-center justify-between gap-3" style={{ marginBottom: 14 }}>
                        <div>
                            <div className="section-label">6-month trend</div>
                            <div className="section-title" style={{ marginTop: 6 }}>Projected spend</div>
                        </div>
                        <div
                            className="font-mono"
                            style={{
                                fontSize: 12,
                                color: projectedDeltaColor,
                                background: `${projectedDeltaColor}18`,
                                border: `1px solid ${projectedDeltaColor}33`,
                                borderRadius: 10,
                                padding: '4px 10px',
                                fontWeight: 700,
                            }}
                        >
                            {projectedDeltaText}
                        </div>
                    </div>

                    <div className="surface-card-muted" style={{ padding: 14, background: T.bgElevated }}>
                        <div style={{ height: 150 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={trendData} margin={{ top: 6, right: 6, left: -18, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="analyticsTrendFill" x1="0" x2="0" y1="0" y2="1">
                                            <stop offset="0%" stopColor={T.accentPrimary} stopOpacity={0.22} />
                                            <stop offset="100%" stopColor={T.accentPrimary} stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid stroke={T.finChartGrid} strokeDasharray="4 4" vertical={false} />
                                    <XAxis dataKey="label" tick={{ fill: T.fgTertiary, fontSize: 10 }} axisLine={false} tickLine={false} />
                                    <YAxis
                                        tick={{ fill: T.fgTertiary, fontSize: 10 }}
                                        axisLine={false}
                                        tickLine={false}
                                        width={48}
                                        tickFormatter={(value) => formatCurrency(value, currency).replace('.00', '')}
                                    />
                                    <Tooltip
                                        formatter={(value) => formatCurrency(value, currency)}
                                        contentStyle={{
                                            background: T.bgGlassStrong,
                                            border: `1px solid ${T.border}`,
                                            borderRadius: 14,
                                            color: T.fgPrimary,
                                            fontSize: 11,
                                        }}
                                        labelStyle={{ color: T.fgSecondary, fontSize: 10 }}
                                    />
                                    <Area type="monotone" dataKey="value" stroke="none" fill="url(#analyticsTrendFill)" />
                                    <Line type="monotone" dataKey="value" stroke={T.accentPrimary} strokeWidth={2.5} dot={{ r: 3, fill: T.accentPrimary }} activeDot={{ r: 5 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between" style={{ marginTop: 10, fontSize: 13, color: T.fgSecondary }}>
                            <span>
                                Top category:{' '}
                                <span style={{ color: T.fgPrimary, fontWeight: 700 }}>
                                    {highestCategory ? `${highestCategory.name} (${formatCurrency(highestCategory.value, currency).replace('.00', '')}${periodSuffix})` : 'None'}
                                </span>
                            </span>
                            <span>
                                Avg/sub:{' '}
                                <span style={{ color: T.fgPrimary, fontWeight: 700 }}>
                                    {formatCurrency(averagePerSubscription, currency).replace('.00', '')}{periodSuffix}
                                </span>
                            </span>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    )
}
