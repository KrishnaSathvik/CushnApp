import { useContext, useEffect, useMemo, useState } from 'react'
import { AlertCircle, Settings } from 'lucide-react'
import { UNSAFE_NavigationContext, useBeforeUnload, useNavigate } from 'react-router-dom'
import useBudget from '../hooks/useBudget'
import useSubscriptions from '../hooks/useSubscriptions'
import { useTheme } from '../context/ThemeContext'
import { useSettings } from '../context/SettingsContext'
import { normalizeToMonthly } from '../lib/normalizeAmount'
import { formatCurrency } from '../lib/formatCurrency'
import { DEFAULT_BUDGET } from '../lib/constants'

function useBrowserRouterBlocker(when, message) {
    const { navigator } = useContext(UNSAFE_NavigationContext)

    useEffect(() => {
        if (!when || !navigator?.block) return

        const unblock = navigator.block((tx) => {
            const shouldLeave = window.confirm(message)
            if (!shouldLeave) return
            unblock()
            tx.retry()
        })

        return unblock
    }, [navigator, when, message])
}

export default function BudgetScreen() {
    const navigate = useNavigate()
    const { T } = useTheme()
    const { currency } = useSettings()
    const { budget, saveBudget } = useBudget()
    const { subscriptions, categories, monthlyTotal } = useSubscriptions()

    const [goalOverride, setGoalOverride] = useState(null)
    const [showAllCategories, setShowAllCategories] = useState(false)
    const [saved, setSaved] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [saveError, setSaveError] = useState(null)
    const goal = goalOverride ?? budget.monthlyGoal

    const active = subscriptions.filter((s) => s.status === 'active')
    const categorySpend = useMemo(
        () =>
            categories
                .map((cat) => {
                    const subs = active.filter((s) => s.categoryId === cat.id)
                    const total = subs.reduce((sum, s) => sum + normalizeToMonthly(s.amount, s.cycle), 0)
                    return {
                        id: cat.id,
                        name: cat.name,
                        value: Math.round(total * 100) / 100,
                        color: cat.color,
                        count: subs.length,
                    }
                })
                .filter((c) => c.value > 0)
                .sort((a, b) => b.value - a.value),
        [categories, active],
    )
    const visibleCategorySpend = showAllCategories ? categorySpend : categorySpend.slice(0, 3)

    const numericGoal = Number(goal) || 0
    const rawPct = numericGoal > 0 ? monthlyTotal / numericGoal : 0
    const pct = numericGoal > 0 ? Math.min(rawPct, 1) : 0
    const statusColor = rawPct < 0.7 ? T.finGain : rawPct < 0.9 ? T.semWarning : T.finLoss
    const remaining = Math.max(numericGoal - monthlyTotal, 0)
    const overBy = Math.max(monthlyTotal - numericGoal, 0)
    const hasUnsavedBudgetEdits = (Number(goal) || 0) !== (Number(budget.monthlyGoal) || 0)

    useBrowserRouterBlocker(hasUnsavedBudgetEdits, 'You have unsaved changes on Budget. Leave this page?')

    useBeforeUnload((event) => {
        if (!hasUnsavedBudgetEdits) return
        event.preventDefault()
        event.returnValue = ''
    })

    useEffect(() => {
        if (!saved) return
        const timer = setTimeout(() => setSaved(false), 1800)
        return () => clearTimeout(timer)
    }, [saved])

    useEffect(() => {
        if (goalOverride === null || goalOverride === '') return
        if ((Number(goalOverride) || 0) !== (Number(budget.monthlyGoal) || 0)) return
        setGoalOverride(null)
    }, [goalOverride, budget.monthlyGoal])

    useEffect(() => {
        if (!hasUnsavedBudgetEdits) return
        if (goal === '') return

        const timer = setTimeout(async () => {
            setIsSaving(true)
            setSaveError(null)
            setSaved(false)
            try {
                const updated = await saveBudget({
                    monthlyGoal: Number(goal) || 0,
                    currency: budget.currency || currency,
                })
                setGoalOverride(updated?.monthlyGoal ?? null)
                setSaved(true)
            } catch (err) {
                console.error('Failed to auto-save budget:', err)
                setSaveError('Auto-save failed. Please keep this page open and try again.')
            } finally {
                setIsSaving(false)
            }
        }, 700)

        return () => clearTimeout(timer)
    }, [hasUnsavedBudgetEdits, goal, saveBudget, budget.currency, currency])

    const thresholdMessage = rawPct >= 1
        ? `Over budget by ${formatCurrency(overBy, currency)}`
        : rawPct >= 0.8
            ? `Warning: ${Math.round(rawPct * 100)}% of budget used`
            : null
    const budgetTone = rawPct < 0.7 ? 'On track' : rawPct < 0.9 ? 'Approaching limit' : 'Budget pressure'
    const saveChipColor = isSaving ? T.fgMedium : saved ? T.finGain : T.fgSubtle

    return (
        <div className="dashboard-page" style={{ background: T.bgBase }}>
            <div className="dashboard-container dashboard-stack" style={{ paddingTop: 18 }}>
                <section
                    className="hero-card"
                    style={{
                        padding: 22,
                        background: T.bgSurface,
                        border: `1px solid ${statusColor}44`,
                    }}
                >
                    <div className="flex items-start justify-between gap-3 mb-3" style={{ position: 'relative', zIndex: 1 }}>
                        <div>
                            <p className="page-eyebrow">Planning</p>
                            <h1 className="page-title" style={{ fontSize: 'clamp(1.8rem, 5vw, 2.6rem)' }}>Budget</h1>
                        </div>
                    </div>
                    <div className="hero-grid" style={{ position: 'relative', zIndex: 1 }}>
                        <div>
                            <p className="page-subtitle">Adjust your monthly goal here and review how current spend is pacing against it.</p>

                            <div className="flex items-center gap-2 flex-wrap" style={{ marginTop: 18 }}>
                                <div
                                    className="font-mono"
                                    style={{
                                        fontSize: 10,
                                        color: saveChipColor,
                                        background: `${saveChipColor}14`,
                                        border: `1px solid ${saveChipColor}24`,
                                        borderRadius: 999,
                                        padding: '4px 8px',
                                    }}
                                >
                                    {isSaving ? 'Saving changes...' : saved ? 'All changes saved' : 'Changes auto-save'}
                                </div>
                                <div
                                    className="font-mono"
                                    style={{
                                        fontSize: 10,
                                        color: statusColor,
                                        background: `${statusColor}14`,
                                        border: `1px solid ${statusColor}24`,
                                        borderRadius: 999,
                                        padding: '4px 8px',
                                    }}
                                >
                                    {budgetTone}
                                </div>
                            </div>

                            <div style={{ marginTop: 20, position: 'relative' }}>
                                <div className="text-center">
                                    <input
                                        type="number"
                                        value={goal === 0 ? '0' : goal}
                                        onChange={(e) => {
                                            const val = e.target.value
                                            setGoalOverride(val === '' ? '' : Math.max(0, Number(val)))
                                        }}
                                        className="text-center outline-none font-mono font-bold budget-input-hero"
                                        style={{
                                            width: '100%',
                                            fontSize: 'clamp(4rem, 14vw, 5.5rem)',
                                            color: T.fgHigh,
                                            background: 'transparent',
                                            border: 'none',
                                            lineHeight: 1,
                                            letterSpacing: -2,
                                            appearance: 'textfield',
                                            MozAppearance: 'textfield',
                                            padding: 0,
                                            margin: 0,
                                        }}
                                    />
                                    <div className="font-mono" style={{ fontSize: 12, color: T.fgSubtle, marginTop: 8, textTransform: 'uppercase', letterSpacing: 1.2 }}>
                                        per month
                                    </div>
                                    <div className="font-mono" style={{ fontSize: 10, color: T.fgSubtle, marginTop: 4, opacity: 0.6 }}>
                                        (Tap to edit goal)
                                    </div>
                                </div>


                            </div>

                            <div className="pill-group" style={{ marginTop: 18 }}>
                                {[100, 200, 300, 500].map((preset) => (
                                    <button
                                        key={preset}
                                        onClick={() => setGoalOverride(preset)}
                                        className="interactive-btn cursor-pointer font-mono border-none"
                                        style={{
                                            height: 32,
                                            padding: '0 12px',
                                            borderRadius: 999,
                                            background: Number(goal) === preset ? `${statusColor}1f` : T.bgMuted,
                                            color: T.fgHigh,
                                            boxShadow: Number(goal) === preset ? `inset 0 0 0 1px ${statusColor}55` : 'none',
                                            fontSize: 10,
                                            border: `1px solid ${Number(goal) === preset ? statusColor + '55' : T.border}`,
                                        }}
                                    >
                                        {formatCurrency(preset, currency).replace('.00', '')}
                                    </button>
                                ))}
                                <button
                                    onClick={() => setGoalOverride(DEFAULT_BUDGET)}
                                    className="interactive-btn cursor-pointer font-mono border-none"
                                    style={{
                                        height: 32,
                                        padding: '0 12px',
                                        borderRadius: 999,
                                        background: T.bgMuted,
                                        color: T.fgHigh,
                                        fontSize: 10,
                                        border: `1px solid ${T.border}`,
                                    }}
                                >
                                    Reset default
                                </button>
                            </div>
                        </div>

                        <div className="surface-card" style={{ padding: '18px 18px 16px', background: T.bgSurface }}>
                            <div className="flex items-start justify-between gap-3 mb-2">
                                <div>
                                    <div className="section-label">
                                        Spend progress
                                    </div>
                                    <div style={{ fontSize: 13, color: T.fgMedium, marginTop: 6 }}>
                                        {budgetTone}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="metric-value font-mono font-bold" style={{ fontSize: 18, color: statusColor }}>
                                        {Math.round(rawPct * 100)}%
                                    </div>
                                    <div className="font-mono" style={{ fontSize: 10, color: T.fgSubtle, marginTop: 4 }}>
                                        used this month
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-between items-center mb-1.5">
                                <span className="font-mono" style={{ fontSize: 11, color: T.fgMedium }}>
                                    {formatCurrency(monthlyTotal, currency)} spent
                                </span>
                                <span className="font-mono" style={{ fontSize: 11, color: T.fgSubtle }}>
                                    goal {formatCurrency(numericGoal, currency)}
                                </span>
                            </div>
                            <div
                                className="rounded-full overflow-hidden"
                                style={{
                                    height: 12,
                                    background: T.fgDivider,
                                    boxShadow: `0 0 40px ${statusColor}18`,
                                }}
                            >
                                <div
                                    className="rounded-full h-full"
                                    style={{
                                        width: `${Math.min(pct * 100, 100)}%`,
                                        background: statusColor,
                                        boxShadow: `0 0 14px ${statusColor}55`,
                                        transition: 'width 700ms var(--ease-out)',
                                    }}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-2" style={{ marginTop: 16 }}>
                                <div className="surface-card-muted" style={{ padding: '12px 14px' }}>
                                    <div className="section-label">Remaining</div>
                                    <div className="metric-value font-mono font-bold" style={{ fontSize: 18, color: T.fgHigh, marginTop: 8 }}>
                                        {formatCurrency(remaining, currency)}
                                    </div>
                                </div>
                                <div className="surface-card-muted" style={{ padding: '12px 14px' }}>
                                    <div className="section-label">Over by</div>
                                    <div className="metric-value font-mono font-bold" style={{ fontSize: 18, color: overBy > 0 ? T.semDanger : T.fgMedium, marginTop: 8 }}>
                                        {formatCurrency(overBy, currency)}
                                    </div>
                                </div>
                            </div>

                            {thresholdMessage && (
                                <div
                                    className="flex items-center gap-2"
                                    style={{
                                        background: rawPct >= 1 ? T.statusErrorBg : T.statusWarningBg,
                                        border: `1px solid ${rawPct >= 1 ? T.finLoss : T.semWarning}33`,
                                        borderRadius: 14,
                                        padding: '10px 12px',
                                        marginTop: 14,
                                    }}
                                >
                                    <AlertCircle size={14} color={rawPct >= 1 ? T.finLoss : T.semWarning} />
                                    <span style={{ fontSize: 11, color: rawPct >= 1 ? T.finLoss : T.semWarning }}>
                                        {thresholdMessage}
                                    </span>
                                </div>
                            )}

                            {saveError && (
                                <div
                                    className="flex items-center gap-2"
                                    style={{
                                        background: T.statusErrorBg,
                                        border: `1px solid ${T.finLoss}33`,
                                        borderRadius: 14,
                                        padding: '8px 12px',
                                        marginTop: 8,
                                    }}
                                >
                                    <AlertCircle size={14} color={T.finLoss} />
                                    <span style={{ fontSize: 11, color: T.finLoss }}>{saveError}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                <section className="surface-card" style={{ padding: 18, background: T.bgSurface }}>
                    <div className="section-header" style={{ marginBottom: 14 }}>
                        <div>
                            <div className="section-label">Breakdown</div>
                            <h2 className="section-title">Category spending</h2>
                        </div>
                    </div>
                    <p className="section-copy" style={{ marginBottom: 14 }}>Existing category totals, restyled like a planner sheet instead of another hero-card dashboard.</p>

                    {visibleCategorySpend.map((cat) => {
                        const catPct = numericGoal > 0 ? cat.value / numericGoal : 0
                        return (
                            <div key={cat.id} style={{ padding: '12px 0', borderBottom: `1px solid ${T.border}` }}>
                                <div className="flex justify-between items-center mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="rounded-full" style={{ width: 8, height: 8, background: cat.color }} />
                                        <span style={{ fontSize: 13, color: T.fgHigh, fontWeight: 500 }}>{cat.name}</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="font-mono font-bold" style={{ fontSize: 13, color: T.fgHigh }}>
                                            {formatCurrency(cat.value, currency)}
                                        </span>
                                        <span className="font-mono" style={{ fontSize: 9, color: T.fgSubtle, marginLeft: 4 }}>
                                            /mo
                                        </span>
                                    </div>
                                </div>
                                <div className="rounded-full overflow-hidden" style={{ height: 6, background: T.fgDivider }}>
                                    <div
                                        className="rounded-full h-full transition-all duration-500"
                                        style={{
                                            width: `${Math.min(catPct * 100, 100)}%`,
                                            background: cat.color,
                                            boxShadow: `0 0 12px ${cat.color}44`,
                                        }}
                                    />
                                </div>
                                <div className="font-mono mt-1" style={{ fontSize: 9, color: T.fgSubtle }}>
                                    {cat.count} subscription{cat.count !== 1 ? 's' : ''} · {Math.round(catPct * 100)}% of budget
                                </div>
                            </div>
                        )
                    })}

                    {categorySpend.length > 3 && (
                        <button
                            onClick={() => setShowAllCategories((v) => !v)}
                            className="interactive-btn w-full cursor-pointer font-mono"
                            style={{
                                height: 38,
                                borderRadius: 14,
                                background: T.bgSurface,
                                border: `1px solid ${T.border}`,
                                color: T.fgMedium,
                                fontSize: 11,
                                marginBottom: 8,
                            }}
                        >
                            {showAllCategories ? 'Show top 3' : `Show all (${categorySpend.length})`}
                        </button>
                    )}

                    {categorySpend.length === 0 && (
                        <div className="surface-card-muted text-center py-10" style={{ color: T.fgSubtle, fontSize: 12, paddingInline: 16 }}>
                            <div>No active subscriptions to analyze.</div>
                            <button
                                onClick={() => navigate('/add')}
                                className="interactive-btn cursor-pointer border-none font-mono"
                                style={{
                                    marginTop: 10,
                                    height: 36,
                                    padding: '0 14px',
                                    borderRadius: 12,
                                    background: T.accentPrimary,
                                    color: '#fff',
                                    fontSize: 11,
                                }}
                            >
                                Add your first subscription
                            </button>
                        </div>
                    )}
                </section>
            </div>
        </div>
    )
}
