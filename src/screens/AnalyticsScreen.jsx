import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import { Settings } from 'lucide-react'
import useSubscriptions from '../hooks/useSubscriptions'
import { useTheme } from '../context/ThemeContext'
import { useSettings } from '../context/SettingsContext'
import { useState } from 'react'
import { normalizeToMonthly } from '../lib/normalizeAmount'
import { formatCurrency } from '../lib/formatCurrency'
import { buildMonthlyProjection } from '../lib/projections'
import { buildVendorFingerprint, enrichSubscriptionCandidate } from '../lib/vendorEnrichment'

export default function AnalyticsScreen() {
    const { T } = useTheme()
    const { currency } = useSettings()
    const { subscriptions, categories, monthlyTotal, annualTotal } = useSubscriptions()
    const [period, setPeriod] = useState('monthly')

    const active = subscriptions.filter(s => s.status === 'active')
    const multiplier = period === 'monthly' ? 1 : 12
    const projection = buildMonthlyProjection(active, new Date(), 6)
    const chartPalette = [T.finChart1, T.finChart2, T.finChart3, T.finChart4]

    // Spending by category
    const categorySpend = categories.map(cat => {
        const subs = active.filter(s => s.categoryId === cat.id)
        const total = subs.reduce((sum, s) => {
            return sum + normalizeToMonthly(s.amount, s.cycle) * multiplier
        }, 0)
        return {
            name: cat.name,
            value: Math.round(total * 100) / 100,
            count: subs.length,
        }
    }).filter(c => c.value > 0).map((item, index) => ({ ...item, color: chartPalette[index % chartPalette.length] }))

    const displayTotal = period === 'monthly' ? monthlyTotal : annualTotal
    const rankedCategories = [...categorySpend].sort((a, b) => b.value - a.value)
    const highestCat = rankedCategories[0]
    const avgCost = active.length > 0 ? displayTotal / active.length : 0
    const periodSuffix = period === 'monthly' ? '/mo' : '/yr'
    const trendData = projection.map((point) => ({
        label: point.label,
        value: point.totalDue,
    }))
    const currentProjected = trendData[0]?.value ?? 0
    const nextProjected = trendData[1]?.value ?? 0
    const projectedDeltaValue = nextProjected - currentProjected
    const projectedDeltaPct = currentProjected > 0 ? (projectedDeltaValue / currentProjected) * 100 : 0
    const projectedDeltaColor = projectedDeltaValue > 0 ? T.semDanger : projectedDeltaValue < 0 ? T.semSuccess : T.fgMedium
    const projectedDeltaText = `${projectedDeltaValue >= 0 ? '+' : ''}${Math.round(projectedDeltaPct)}%`
    const enrichedActive = active.map((sub) => ({
        ...sub,
        projectedValue: normalizeToMonthly(sub.amount, sub.cycle) * multiplier,
    }))
    const vendorBuckets = new Map()
    enrichedActive.forEach((sub) => {
        const enrichedVendor = enrichSubscriptionCandidate(sub)
        const key = buildVendorFingerprint({
            name: enrichedVendor.name,
            vendorDomain: enrichedVendor.vendorDomain,
        })
        if (!vendorBuckets.has(key)) {
            vendorBuckets.set(key, {
                label: enrichedVendor.name,
                vendorDomain: enrichedVendor.vendorDomain,
                subscriptions: [],
                total: 0,
            })
        }
        const bucket = vendorBuckets.get(key)
        bucket.subscriptions.push(sub)
        bucket.total += sub.projectedValue
    })
    const duplicateVendorGroups = [...vendorBuckets.values()]
        .filter((bucket) => bucket.subscriptions.length > 1)
        .sort((a, b) => b.total - a.total)
    const duplicateVendorSavings = duplicateVendorGroups.reduce((sum, bucket) => {
        const sorted = [...bucket.subscriptions].sort((a, b) => b.projectedValue - a.projectedValue)
        const allButLargest = sorted.slice(1).reduce((subtotal, sub) => subtotal + sub.projectedValue, 0)
        return sum + allButLargest
    }, 0)
    const topSavingsOpportunities = [...enrichedActive]
        .sort((a, b) => b.projectedValue - a.projectedValue)
        .slice(0, 3)
    const mostExpensiveSub = [...enrichedActive].sort((a, b) => b.projectedValue - a.projectedValue)[0]
    const savingsTopTwo = [...enrichedActive]
        .sort((a, b) => b.projectedValue - a.projectedValue)
        .slice(0, 2)
        .reduce((sum, sub) => sum + sub.projectedValue, 0)
    const heaviestMonth = [...trendData].sort((a, b) => b.value - a.value)[0]
    const growthSignalText = projectedDeltaValue > 0
        ? `Projected ${Math.round(projectedDeltaPct)}% increase`
        : projectedDeltaValue < 0
            ? `Projected ${Math.abs(Math.round(projectedDeltaPct))}% decrease`
            : 'Projected steady month'
    const trendValueSuffix = '/mo'

    return (
        <div className="dashboard-page" style={{ background: T.bgSubtle }}>
            <div className="dashboard-container dashboard-stack" style={{ paddingTop: 18, gap: 14 }}>
                <section
                    className="surface-card"
                    style={{
                        padding: '18px 18px 16px',
                        background: T.bgSurface,
                    }}
                >
                    <div className="flex items-start justify-between gap-3" style={{ marginBottom: 10 }}>
                        <div>
                            <p className="page-eyebrow">Insights</p>
                            <h1 className="page-title" style={{ fontSize: 'clamp(1.8rem, 5vw, 2.6rem)' }}>Analytics</h1>
                            <p className="page-subtitle" style={{ marginTop: 6 }}>
                                Category mix and forward trend for your active subscriptions.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center justify-end gap-2" style={{ marginBottom: 0 }}>
                        <div className="segmented-control" style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
                            <div
                                style={{
                                    position: 'absolute',
                                    top: 4,
                                    bottom: 4,
                                    left: period === 'monthly' ? 4 : 'calc(50% + 2px)',
                                    width: 'calc(50% - 6px)',
                                    borderRadius: 999,
                                    background: T.accentPrimary,
                                    transition: 'left var(--duration-normal) var(--ease-out)',
                                }}
                            />
                            {['monthly', 'annual'].map((p) => (
                                <button
                                    key={p}
                                    onClick={() => setPeriod(p)}
                                    className="interactive-btn cursor-pointer capitalize"
                                    style={{
                                        height: 30,
                                        padding: '0 12px',
                                        borderRadius: 12,
                                        background: 'transparent',
                                        border: 'none',
                                        color: period === p ? T.fgOnAccent : T.fgMedium,
                                        fontSize: 11,
                                        fontWeight: 700,
                                        position: 'relative',
                                        zIndex: 1,
                                    }}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="split-grid">
                    {categorySpend.length > 0 && (
                        <div className="surface-card" style={{ padding: 16, background: T.bgSurface }}>
                            <div className="font-mono uppercase tracking-wider mb-2" style={{ fontSize: 9, color: T.fgSubtle }}>
                                Category Share
                            </div>
                            <div className="flex justify-center" style={{ position: 'relative' }}>
                                <ResponsiveContainer width={220} height={220}>
                                    <PieChart>
                                        <Pie
                                            data={categorySpend}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={95}
                                            paddingAngle={3}
                                            dataKey="value"
                                            strokeWidth={0}
                                            isAnimationActive={true}
                                            animationDuration={600}
                                            animationEasing="ease-out"
                                        >
                                            {categorySpend.map((entry, i) => (
                                                <Cell key={i} fill={entry.color} />
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
                                        pointerEvents: 'none',
                                        flexDirection: 'column',
                                    }}
                                >
                                    <div className="section-label">Total</div>
                                    <div className="metric-value font-mono font-bold" style={{ fontSize: 20, color: T.fgHigh, marginTop: 6 }}>
                                        {formatCurrency(displayTotal, currency).replace('.00', '')}
                                    </div>
                                </div>
                            </div>
                            <div style={{ marginTop: 6 }}>
                                {rankedCategories.slice(0, 5).map((cat, i) => {
                                    const pct = displayTotal > 0 ? Math.round((cat.value / displayTotal) * 100) : 0
                                    return (
                                        <div
                                            key={`legend-${i}`}
                                            className="flex items-center justify-between"
                                            style={{ padding: '5px 0', borderTop: i === 0 ? 'none' : `1px solid ${T.border}` }}
                                        >
                                            <div className="flex items-center gap-2">
                                                <span className="rounded-full" style={{ width: 8, height: 8, background: cat.color }} />
                                                <span style={{ fontSize: 12, color: T.fgHigh }}>{cat.name}</span>
                                            </div>
                                            <div className="font-mono" style={{ fontSize: 11, color: T.fgMedium }}>
                                                {pct}% · {formatCurrency(cat.value, currency).replace('.00', '')}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                </section>

                <section className="split-grid">
                    {highestCat && (
                        <div className="surface-card" style={{ padding: 14, background: T.bgSurface, borderLeft: `3px solid ${highestCat.color}` }}>
                            <div className="font-mono uppercase mb-1" style={{ fontSize: 9, color: T.fgSubtle, letterSpacing: 1 }}>
                                Top Category
                            </div>
                            <div style={{ fontSize: 14, color: T.fgHigh, fontWeight: 600 }}>{highestCat.name}</div>
                            <div className="font-mono font-bold" style={{ fontSize: 16, color: highestCat.color }}>
                                {formatCurrency(highestCat.value, currency)}{periodSuffix}
                            </div>
                        </div>
                    )}
                    <div className="surface-card" style={{ padding: 14, background: T.bgSurface, borderLeft: `3px solid ${T.finChart2}` }}>
                        <div className="font-mono uppercase mb-1" style={{ fontSize: 9, color: T.fgSubtle, letterSpacing: 1 }}>
                            Avg Per Sub
                        </div>
                        <div style={{ fontSize: 14, color: T.fgHigh, fontWeight: 600 }}>{active.length} active</div>
                        <div className="font-mono font-bold" style={{ fontSize: 16, color: T.accentPrimary }}>
                            {formatCurrency(avgCost, currency)}{periodSuffix}
                        </div>
                    </div>
                </section>

                <section className="surface-card" style={{ padding: 16, background: T.bgSurface }}>
                    <div className="font-mono uppercase tracking-wider mb-2" style={{ fontSize: 10, color: T.fgSubtle }}>
                        Actionable Insights
                    </div>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {[
                            {
                                label: 'Most Expensive Sub',
                                title: mostExpensiveSub?.name || 'N/A',
                                value: `${mostExpensiveSub ? formatCurrency(mostExpensiveSub.projectedValue, currency) : formatCurrency(0, currency)}${periodSuffix}`,
                                color: T.accentPrimary,
                            },
                            {
                                label: 'Potential Savings',
                                title: duplicateVendorGroups.length > 0 ? 'Consolidate duplicate vendors' : 'Pause top 2 services',
                                value: `${formatCurrency(duplicateVendorGroups.length > 0 ? duplicateVendorSavings : savingsTopTwo, currency)}${periodSuffix}`,
                                color: T.semSuccess,
                            },
                            {
                                label: 'Monthly Growth Signal',
                                title: highestCat ? `${highestCat.name} leads spend` : 'No category data',
                                value: growthSignalText,
                                color: projectedDeltaColor,
                            },
                            {
                                label: 'Heaviest Projected Month',
                                title: heaviestMonth?.label || 'N/A',
                                value: `${heaviestMonth ? formatCurrency(heaviestMonth.value, currency) : formatCurrency(0, currency)}${trendValueSuffix}`,
                                color: T.semWarning,
                            },
                        ].map((item) => (
                            <div key={item.label} className="surface-card-muted" style={{ padding: 12, borderLeft: `3px solid ${item.color}`, background: `${item.color}10` }}>
                                <div className="font-mono uppercase mb-1" style={{ fontSize: 9, color: T.fgSubtle, letterSpacing: 1 }}>{item.label}</div>
                                <div style={{ fontSize: 14, color: T.fgHigh, fontWeight: 600 }}>{item.title}</div>
                                <div className="font-mono font-bold" style={{ fontSize: 14, color: item.color }}>{item.value}</div>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="split-grid">
                    <div className="surface-card" style={{ padding: 16, background: T.bgSurface }}>
                        <div className="font-mono uppercase tracking-wider mb-2" style={{ fontSize: 10, color: T.fgSubtle }}>
                            Duplicate Vendor Watch
                        </div>
                        {duplicateVendorGroups.length === 0 ? (
                            <div style={{ fontSize: 13, color: T.fgMedium, lineHeight: 1.6 }}>
                                No overlapping vendors detected in active subscriptions.
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {duplicateVendorGroups.slice(0, 3).map((bucket) => (
                                    <div key={bucket.label} className="surface-card-muted" style={{ padding: 12, borderLeft: `3px solid ${T.semWarning}` }}>
                                        <div style={{ fontSize: 14, fontWeight: 700, color: T.fgHigh }}>{bucket.label}</div>
                                        <div className="font-mono" style={{ fontSize: 10, color: T.fgSubtle, marginTop: 4 }}>
                                            {bucket.subscriptions.length} active subscriptions{bucket.vendorDomain ? ` · ${bucket.vendorDomain}` : ''}
                                        </div>
                                        <div className="font-mono font-bold" style={{ fontSize: 13, color: T.semWarning, marginTop: 8 }}>
                                            {formatCurrency(bucket.total, currency)}{periodSuffix}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="surface-card" style={{ padding: 16, background: T.bgSurface }}>
                        <div className="font-mono uppercase tracking-wider mb-2" style={{ fontSize: 10, color: T.fgSubtle }}>
                            Trim Candidates
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {topSavingsOpportunities.map((sub) => (
                                <div key={sub.id} className="surface-card-muted" style={{ padding: 12, borderLeft: `3px solid ${T.accentPrimary}` }}>
                                    <div style={{ fontSize: 14, fontWeight: 700, color: T.fgHigh }}>{sub.name}</div>
                                    <div className="font-mono" style={{ fontSize: 10, color: T.fgSubtle, marginTop: 4 }}>
                                        {sub.cycle} · {sub.status}
                                    </div>
                                    <div className="font-mono font-bold" style={{ fontSize: 13, color: T.accentPrimary, marginTop: 8 }}>
                                        {formatCurrency(sub.projectedValue, currency)}{periodSuffix}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="surface-card" style={{ padding: 14, background: T.bgSurface }}>
                    <div className="flex items-center justify-between gap-2" style={{ marginBottom: 8 }}>
                        <div className="font-mono uppercase tracking-wider" style={{ fontSize: 9, color: T.fgSubtle }}>
                            Projected trend (next 6 months)
                        </div>
                        <div
                            className="font-mono"
                            style={{
                                fontSize: 10,
                                color: projectedDeltaColor,
                                background: `${projectedDeltaColor}22`,
                                border: `1px solid ${projectedDeltaColor}44`,
                                borderRadius: 999,
                                padding: '2px 6px',
                            }}
                        >
                            {projectedDeltaText}
                        </div>
                    </div>
                    <div style={{ height: 160 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={trendData} margin={{ top: 6, right: 6, left: -12, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="analyticsAreaFill" x1="0" x2="0" y1="0" y2="1">
                                        <stop offset="0%" stopColor={T.finChart1} stopOpacity={0.22} />
                                        <stop offset="100%" stopColor={T.finChart1} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid stroke={T.finChartGrid} strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="label" tick={{ fill: T.fgSubtle, fontSize: 10 }} axisLine={false} tickLine={false} />
                                <YAxis
                                    tick={{ fill: T.fgSubtle, fontSize: 10 }}
                                    axisLine={false}
                                    tickLine={false}
                                    width={44}
                                    tickFormatter={(value) => formatCurrency(value, currency).replace('.00', '')}
                                />
                                <Tooltip
                                    formatter={(value) => formatCurrency(value, currency)}
                                    contentStyle={{
                                        background: T.bgGlassStrong,
                                        border: `1px solid ${T.border}`,
                                        borderRadius: 14,
                                        color: T.fgHigh,
                                        fontSize: 11,
                                    }}
                                    labelStyle={{ color: T.fgMedium, fontSize: 10 }}
                                />
                                <Area type="monotone" dataKey="value" stroke="none" fill="url(#analyticsAreaFill)" />
                                <Line
                                    type="monotone"
                                    dataKey="value"
                                    stroke={T.finChart1}
                                    strokeWidth={2.5}
                                    dot={{ r: 3, fill: T.finChart1 }}
                                    activeDot={{ r: 5 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </section>
            </div>
        </div>
    )
}
