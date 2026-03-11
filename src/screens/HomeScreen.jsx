import { useState, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Search, Plus, Sparkles } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import useSubscriptions from '../hooks/useSubscriptions'
import useBudget from '../hooks/useBudget'
import SubscriptionRow from '../components/SubscriptionRow'
import { useTheme } from '../context/ThemeContext'
import { useSettings } from '../context/SettingsContext'
import { formatCurrency } from '../lib/formatCurrency'
import { normalizeToMonthly } from '../lib/normalizeAmount'
import { buildVendorFingerprint, enrichSubscriptionCandidate } from '../lib/vendorEnrichment'
import { trackEvent } from '../lib/analytics'
import { DEFAULT_BUDGET } from '../lib/constants'
import { useReviewSheet } from '../context/ReviewSheetContext'
import { hasReviewedBadge, isSubscriptionCountedInSpend, shouldSurfaceReview } from '../lib/reviewState'

function formatDueDate(dateString) {
    if (!dateString) return ''
    const date = new Date(`${dateString}T00:00:00`)
    if (Number.isNaN(date.getTime())) return dateString
    return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    })
}

export default function HomeScreen() {
    const navigate = useNavigate()
    const location = useLocation()
    const { T } = useTheme()
    const { currency } = useSettings()
    const { openReviewSheet } = useReviewSheet()
    const {
        monthlyTotal, annualTotal, nextRenewal,
        loading, getCategoryName, getCategoryColorById,
        daysUntilRenewal, subscriptions,
        deleteSubscription, pauseSubscription, addSubscription,
    } = useSubscriptions()
    const { budget } = useBudget()
    const { userName } = useAuth()
    const [showSearch, setShowSearch] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [sortBy, setSortBy] = useState('dueDate')
    const [dismissedCelebration, setDismissedCelebration] = useState(false)
    const onboardingSummary = location.state?.onboardingSummary

    const activeCount = subscriptions.filter((s) => isSubscriptionCountedInSpend(s)).length
    const nextDays = nextRenewal ? daysUntilRenewal(nextRenewal.renewalDate) : null
    const activeSubs = useMemo(() => subscriptions.filter((s) => isSubscriptionCountedInSpend(s)), [subscriptions])
    const surfacedTrimCandidates = useMemo(
        () => activeSubs.filter((sub) => shouldSurfaceReview(sub, getCategoryName, activeSubs)),
        [activeSubs, getCategoryName],
    )
    const dueSoonSubs = useMemo(() => (
        activeSubs
            .map((sub) => ({ sub, days: daysUntilRenewal(sub.renewalDate) }))
            .filter((item) => item.days !== null && item.days >= 0 && item.days <= 7)
            .sort((a, b) => a.days - b.days)
            .slice(0, 4)
    ), [activeSubs, daysUntilRenewal])
    const dueSoonTotal = useMemo(() => (
        dueSoonSubs.reduce((sum, { sub }) => sum + normalizeToMonthly(sub.amount, sub.cycle), 0)
    ), [dueSoonSubs])
    const spendGlowColor = dueSoonSubs.length > 0 ? T.semWarning : T.accentPrimary
    const primaryStats = [
        {
            title: 'Due this week',
            value: formatCurrency(dueSoonTotal, currency).replace('.00', ''),
            tone: dueSoonSubs.length > 0
                ? `${dueSoonSubs.length} renewal${dueSoonSubs.length === 1 ? '' : 's'} coming up`
                : 'No renewals in the next 7 days',
            color: T.semWarning,
        },
        {
            title: 'Annual run rate',
            value: formatCurrency(annualTotal, currency).replace('.00', ''),
            tone: 'Projected recurring spend',
            color: T.accentPrimary,
        },
        {
            title: 'Next charge',
            value: nextDays !== null ? `${nextDays}d` : 'Clear',
            tone: nextRenewal ? nextRenewal.name : 'Nothing upcoming',
            color: nextDays !== null && nextDays <= 2 ? T.semWarning : T.accentPrimary,
        },
    ]

    const sortedSubscriptions = useMemo(() => {
        let filtered = activeSubs
        if (searchTerm.trim()) {
            const query = searchTerm.toLowerCase()
            filtered = filtered.filter((item) => {
                const categoryName = getCategoryName(item.categoryId).toLowerCase()
                return item.name.toLowerCase().includes(query) || categoryName.includes(query)
            })
        }

        const next = [...filtered]
        next.sort((left, right) => {
            if (sortBy === 'amount') {
                return normalizeToMonthly(right.amount, right.cycle) - normalizeToMonthly(left.amount, left.cycle)
            }

            if (sortBy === 'category') {
                const leftCategory = getCategoryName(left.categoryId)
                const rightCategory = getCategoryName(right.categoryId)
                return leftCategory.localeCompare(rightCategory) || left.name.localeCompare(right.name)
            }

            const leftDays = daysUntilRenewal(left.renewalDate) ?? Number.MAX_SAFE_INTEGER
            const rightDays = daysUntilRenewal(right.renewalDate) ?? Number.MAX_SAFE_INTEGER
            return leftDays - rightDays
        })
        return next
    }, [activeSubs, daysUntilRenewal, getCategoryName, searchTerm, sortBy])
    const hasSearchNoResults = searchTerm.trim().length > 0 && sortedSubscriptions.length === 0 && activeCount > 0

    const duplicateInsight = useMemo(() => {
        const vendorBuckets = new Map()
        activeSubs.forEach((sub) => {
            const enriched = enrichSubscriptionCandidate(sub)
            const key = buildVendorFingerprint({
                name: enriched.name,
                vendorDomain: enriched.vendorDomain,
            })
            if (!vendorBuckets.has(key)) {
                vendorBuckets.set(key, { subscriptions: [], total: 0 })
            }
            const bucket = vendorBuckets.get(key)
            bucket.subscriptions.push(sub)
            bucket.total += normalizeToMonthly(sub.amount, sub.cycle)
        })

        return [...vendorBuckets.values()]
            .filter((bucket) => bucket.subscriptions.length > 1)
            .sort((a, b) => b.total - a.total)[0] || null
    }, [activeSubs])

    const showBudgetPrompt = Boolean(onboardingSummary) && Number(budget.monthlyGoal || DEFAULT_BUDGET) === DEFAULT_BUDGET

    const quickWin = duplicateInsight
        ? {
            title: 'Duplicate vendor spotted',
            description: `${duplicateInsight.subscriptions.length} entries could be costing ${formatCurrency(duplicateInsight.total, currency).replace('.00', '')}/month.`,
            cta: 'Review duplicates',
            action: () => {
                trackEvent('home_quick_win_clicked', {
                    kind: 'duplicate_vendor',
                    duplicate_count: duplicateInsight.subscriptions.length,
                })
                openReviewSheet(duplicateInsight.subscriptions[0])
            },
            tone: T.semWarning,
        }
            : surfacedTrimCandidates[0]
            ? {
                title: `${surfacedTrimCandidates[0].name}: worth the cost?`,
                description: `Review ${surfacedTrimCandidates[0].name} and decide whether to keep it, cancel it, or snooze it.`,
                cta: 'Review subscription',
                action: () => {
                    trackEvent('home_quick_win_clicked', {
                        kind: 'trim_candidate',
                        subscription_id: surfacedTrimCandidates[0].id,
                    })
                    openReviewSheet(surfacedTrimCandidates[0])
                },
                tone: T.accentPrimary,
            }
            : null

    // Handlers
    const handleDelete = async (id) => await deleteSubscription(id)
    const handlePause = async (id) => await pauseSubscription(id)
    const handleDuplicate = async (id) => {
        const sub = subscriptions.find(s => s.id === id)
        if (sub) {
            const { id: _, ...rest } = sub
            await addSubscription({ ...rest, name: `${rest.name} (copy)` })
        }
    }

    const renderGroupItem = (sub) => (
        <SubscriptionRow
            key={sub.id}
            subscription={sub}
            categoryName={getCategoryName(sub.categoryId)}
            categoryColor={getCategoryColorById(sub.categoryId)}
            daysLeft={daysUntilRenewal(sub.renewalDate)}
            onClick={() => (shouldSurfaceReview(sub, getCategoryName, activeSubs) ? openReviewSheet(sub) : navigate(`/detail/${sub.id}`))}
            onDelete={handleDelete}
            onPause={handlePause}
            onDuplicate={handleDuplicate}
            variant="grouped"
            groupBy="type"
            reviewBadgeLabel={hasReviewedBadge(sub) ? 'Reviewed' : shouldSurfaceReview(sub, getCategoryName, activeSubs) ? 'Review' : null}
        />
    )

    return (
        <div className="dashboard-page" style={{ background: T.bgBase }}>
            <div className="dashboard-container dashboard-stack" style={{ paddingTop: 18 }}>
                <section
                    className="hero-card"
                    style={{
                        padding: 22,
                        background: T.bgSurface,
                        border: `1px solid ${T.border}`,
                    }}
                >
                    <div className="flex items-start justify-between gap-3" style={{ position: 'relative', zIndex: 1 }}>
                        <div>
                            <p className="page-eyebrow">Dashboard</p>
                            <h1 className="page-title">Home</h1>
                            <p className="page-subtitle" style={{ marginTop: 6 }}>
                                {userName ? `Welcome back, ${userName}. ` : ''}Your recurring spend, near-term renewals, and best next action.
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowSearch(!showSearch)}
                                className="interactive-btn flex items-center justify-center rounded-full border-none cursor-pointer"
                                style={{ width: 42, height: 42, background: T.bgGlass, border: `1px solid ${T.border}` }}
                            >
                                <Search size={16} color={T.fgPrimary} />
                            </button>
                        </div>
                    </div>

                    {onboardingSummary && !dismissedCelebration && (
                        <div
                            className="surface-card-muted"
                            style={{
                                marginTop: 18,
                                padding: '14px 16px',
                                border: `1px solid ${T.accentPrimary}33`,
                                background: `${T.accentPrimary}10`,
                            }}
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <div className="section-label" style={{ color: T.accentPrimary }}>First audit complete</div>
                                    <div style={{ fontSize: 16, color: T.fgPrimary, fontWeight: 700, marginTop: 8 }}>
                                        You added {onboardingSummary.count} subscription{onboardingSummary.count === 1 ? '' : 's'} totaling {formatCurrency(onboardingSummary.monthly, currency).replace('.00', '')}/month.
                                    </div>
                                    <div style={{ fontSize: 13, color: T.fgSecondary, lineHeight: 1.6, marginTop: 8 }}>
                                        That is {formatCurrency(onboardingSummary.annual, currency).replace('.00', '')}/year. Want to find more you might have missed?
                                    </div>
                                </div>
                                <button
                                    onClick={() => setDismissedCelebration(true)}
                                    className="interactive-btn cursor-pointer font-mono"
                                    style={{
                                        border: `1px solid ${T.border}`,
                                        background: T.bgSurface,
                                        color: T.fgSecondary,
                                        borderRadius: 999,
                                        padding: '6px 10px',
                                        fontSize: 10,
                                        height: 'fit-content',
                                    }}
                                >
                                    Dismiss
                                </button>
                            </div>
                            <button
                                onClick={() => navigate('/add')}
                                className="interactive-btn cursor-pointer"
                                style={{
                                    marginTop: 12,
                                    border: 'none',
                                    borderRadius: 12,
                                    padding: '10px 14px',
                                    background: T.accentPrimary,
                                    color: '#fff',
                                    fontSize: 12,
                                    fontWeight: 700,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 8,
                                }}
                            >
                                Find more subscriptions
                                <Plus size={14} />
                            </button>
                        </div>
                    )}

                    <div
                        className="surface-card-muted"
                        style={{
                            marginTop: 18,
                            padding: '18px 16px 16px',
                            border: `1px solid ${T.border}`,
                            background: `linear-gradient(180deg, ${T.bgMuted}, ${T.bgSurface})`,
                            position: 'relative',
                            overflow: 'hidden',
                        }}
                    >
                        <div
                            style={{
                                position: 'absolute',
                                inset: 'auto -8% 18% auto',
                                width: 180,
                                height: 180,
                                background: `${spendGlowColor}16`,
                                filter: 'blur(44px)',
                                borderRadius: '50%',
                            }}
                        />
                        <div className="section-label">Recurring spend</div>
                        <div style={{ marginTop: 10, display: 'grid', gap: 10 }}>
                            <div>
                                <div
                                    className="font-mono font-bold"
                                    style={{ fontSize: 'clamp(2.3rem, 8vw, 4rem)', color: T.fgPrimary, letterSpacing: -1.6 }}
                                >
                                    {formatCurrency(monthlyTotal, currency).replace('.00', '')}
                                    <span style={{ fontSize: '0.35em', color: T.fgTertiary, marginLeft: 6 }}>/mo</span>
                                </div>
                                <div
                                    className="font-mono"
                                    style={{ fontSize: 14, color: T.accentPrimary, fontWeight: 700, marginTop: 6 }}
                                >
                                    {formatCurrency(annualTotal, currency).replace('.00', '')}/year projected
                                </div>
                            </div>
                        </div>
                        <div className="stat-grid" style={{ marginTop: 14 }}>
                            {primaryStats.map((item) => (
                                <div
                                    key={item.title}
                                    className="surface-card-muted"
                                    style={{
                                        padding: '12px 14px',
                                        border: `1px solid ${T.border}`,
                                        background: `linear-gradient(180deg, ${T.bgMuted}, ${T.bgSurface})`,
                                    }}
                                >
                                    <div className="section-label">{item.title}</div>
                                    <div className="metric-value font-mono font-bold" style={{ fontSize: 18, color: item.color, marginTop: 8 }}>
                                        {item.value}
                                    </div>
                                    <div style={{ fontSize: 12, color: T.fgSecondary, marginTop: 4 }}>{item.tone}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <div className="dashboard-stack">
                    {loading && (
                        <section
                            className="surface-card-muted"
                            style={{
                                padding: '14px 16px',
                                border: `1px solid ${T.border}`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: 12,
                            }}
                        >
                            <div>
                                <div className="section-label">Sync status</div>
                                <div style={{ fontSize: 13, color: T.fgSecondary, marginTop: 4 }}>
                                    Refresh sync is still loading. The rest of Home stays available while your latest dashboard data resolves.
                                </div>
                            </div>
                        </section>
                    )}

                    {showSearch && (
                        <div className="surface-overlay" style={{ padding: 14, borderRadius: 18 }}>
                            <input
                                type="text"
                                placeholder="Search subscriptions, categories, or services"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                autoFocus
                                className="w-full font-mono"
                                style={{
                                    background: T.bgMuted,
                                    border: `1px solid ${T.border}`,
                                    borderRadius: 14,
                                    padding: '14px 16px',
                                    fontSize: 12,
                                    color: T.fgPrimary,
                                    outline: 'none',
                                }}
                            />
                        </div>
                    )}

                    {activeCount > 0 && (
                        <section className="split-grid">
                            <div className="surface-card" style={{ padding: 18 }}>
                                <div className="section-header" style={{ marginBottom: 12 }}>
                                    <div>
                                        <div className="section-label">Attention</div>
                                        <h3 className="section-title">Due soon</h3>
                                        <div style={{ fontSize: 12, color: T.fgSecondary, marginTop: 6 }}>
                                            {dueSoonSubs.length > 0
                                                ? `${dueSoonSubs.length} renewal${dueSoonSubs.length === 1 ? '' : 's'} need attention in the next 7 days totaling ${formatCurrency(dueSoonTotal, currency).replace('.00', '')}.`
                                                : 'Nothing due in the next 7 days.'}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => navigate('/calendar')}
                                        className="interactive-btn cursor-pointer border-none bg-transparent font-mono"
                                        style={{ fontSize: 10, color: T.accentPrimary, padding: 0 }}
                                    >
                                        View calendar
                                    </button>
                                </div>
                                {dueSoonSubs.length === 0 ? (
                                    <div className="surface-card-muted" style={{ padding: '14px 16px', fontSize: 13, color: T.fgSecondary }}>
                                        Nothing due in the next 7 days.
                                    </div>
                                ) : (
                                    <div className="surface-card-muted" style={{ overflow: 'hidden' }}>
                                        {dueSoonSubs.map(({ sub, days }, index) => (
                                            <div
                                                key={`due-${sub.id}`}
                                                style={{
                                                    background: index === 0
                                                        ? `linear-gradient(180deg, ${T.semWarning}18, transparent 48%), ${T.bgElevated}`
                                                        : T.bgElevated,
                                                }}
                                            >
                                                <SubscriptionRow
                                                    subscription={sub}
                                                    categoryName={getCategoryName(sub.categoryId)}
                                                    categoryColor={getCategoryColorById(sub.categoryId)}
                                                    daysLeft={days}
                                                    onClick={() => navigate(`/detail/${sub.id}`)}
                                                    onDelete={handleDelete}
                                                    onPause={handlePause}
                                                    onDuplicate={handleDuplicate}
                                                    variant="grouped"
                                                    groupBy="type"
                                                />
                                                <div
                                                    style={{
                                                        padding: '0 18px 14px',
                                                        marginTop: -6,
                                                        fontSize: 12,
                                                        color: T.fgSecondary,
                                                    }}
                                                >
                                                    Due on <span style={{ color: T.fgPrimary }}>{formatDueDate(sub.renewalDate)}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </section>
                    )}

                    {quickWin && (
                        <section
                            className="surface-card"
                            style={{
                                padding: 18,
                                border: `1px solid ${quickWin.tone}33`,
                                background: `linear-gradient(180deg, ${quickWin.tone}10, ${T.bgSurface})`,
                            }}
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <Sparkles size={15} color={quickWin.tone} />
                                        <span className="section-label" style={{ color: quickWin.tone }}>
                                            Quick wins
                                        </span>
                                    </div>
                                    <div style={{ fontSize: 18, color: T.fgPrimary, fontWeight: 700, marginTop: 8 }}>
                                        {quickWin.title}
                                    </div>
                                    <div style={{ fontSize: 13, color: T.fgSecondary, lineHeight: 1.6, marginTop: 6 }}>
                                        {quickWin.description}
                                    </div>
                                </div>
                                <button
                                    onClick={quickWin.action}
                                    className="interactive-btn cursor-pointer"
                                    style={{
                                        borderRadius: 12,
                                        border: `1px solid ${quickWin.tone}44`,
                                        background: `${quickWin.tone}18`,
                                        color: quickWin.tone,
                                        padding: '10px 12px',
                                        fontSize: 12,
                                        fontWeight: 700,
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    {quickWin.cta}
                                </button>
                            </div>
                        </section>
                    )}

                    {showBudgetPrompt && (
                        <section
                            className="surface-card"
                            style={{
                                padding: 18,
                                border: `1px solid ${T.accentPrimary}33`,
                                background: `linear-gradient(180deg, ${T.accentPrimary}10, ${T.bgSurface})`,
                            }}
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <div className="section-label" style={{ color: T.accentPrimary }}>
                                        Budget prompt
                                    </div>
                                    <div style={{ fontSize: 18, color: T.fgPrimary, fontWeight: 700, marginTop: 8 }}>
                                        Set your monthly subscription goal next
                                    </div>
                                    <div style={{ fontSize: 13, color: T.fgSecondary, lineHeight: 1.6, marginTop: 6 }}>
                                        You are at {formatCurrency(monthlyTotal, currency).replace('.00', '')}/month right now. Add a goal on Budget to see how much room you actually want for recurring spend.
                                    </div>
                                </div>
                                <button
                                    onClick={() => navigate('/budget')}
                                    className="interactive-btn cursor-pointer"
                                    style={{
                                        borderRadius: 12,
                                        border: `1px solid ${T.accentPrimary}44`,
                                        background: `${T.accentPrimary}18`,
                                        color: T.accentPrimary,
                                        padding: '10px 12px',
                                        fontSize: 12,
                                        fontWeight: 700,
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    Open budget
                                </button>
                            </div>
                        </section>
                    )}

                    <section className="surface-card" style={{ padding: 18 }}>
                        <div className="section-header" style={{ marginBottom: 14 }}>
                            <div>
                                <div className="section-label">Library</div>
                                <h3 className="section-title">All subscriptions</h3>
                            </div>
                            <div className="surface-card-muted" style={{ padding: 4, display: 'flex', gap: 4 }}>
                                {[
                                    { key: 'dueDate', label: 'Due date' },
                                    { key: 'amount', label: 'Amount' },
                                    { key: 'category', label: 'Category' },
                                ].map(opt => (
                                    <button
                                        key={opt.key}
                                        onClick={() => setSortBy(opt.key)}
                                        className="interactive-btn cursor-pointer font-semibold"
                                        style={{
                                            padding: '10px 12px',
                                            borderRadius: 12,
                                            border: 'none',
                                            background: sortBy === opt.key ? T.accentSoft : 'transparent',
                                            color: sortBy === opt.key ? T.accentPrimary : T.fgSecondary,
                                            fontSize: 12,
                                        }}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="dashboard-stack" style={{ gap: 10 }}>
                            {sortedSubscriptions.map((item, index) => (
                                <div
                                    key={item.id}
                                    style={{
                                        background: index % 2 === 0 ? T.bgSurface : T.bgSubtle,
                                        position: 'relative',
                                    }}
                                >
                                    {renderGroupItem(item)}
                                </div>
                            ))}
                        </div>

                        {hasSearchNoResults && (
                            <div className="flex flex-col items-center gap-3 mt-8 px-8">
                                <div className="text-center">
                                    <div style={{ fontSize: 16, fontWeight: 600, color: T.fgPrimary, marginBottom: 4 }}>
                                        No matches found
                                    </div>
                                    <div style={{ fontSize: 13, color: T.fgSecondary, lineHeight: 1.6 }}>
                                        No subscriptions match <strong>{searchTerm}</strong>. Try another keyword.
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="interactive-btn flex items-center gap-2 cursor-pointer"
                                    style={{
                                        background: T.bgGlassStrong,
                                        border: `1px solid ${T.border}`,
                                        borderRadius: 14,
                                        padding: '8px 14px',
                                        fontSize: 12,
                                        color: T.fgPrimary,
                                        fontWeight: 600,
                                    }}
                                >
                                    Clear search
                                </button>
                            </div>
                        )}

                        {activeCount === 0 && !loading && (
                            <div className="flex flex-col items-center gap-4 py-10 px-8">
                                <div
                                    className="flex items-center justify-center rounded-full"
                                    style={{ width: 68, height: 68, background: T.accentSoft, border: `1px solid ${T.accentPrimary}44`, boxShadow: T.shadowMd }}
                                >
                                    <Plus size={28} color={T.accentPrimary} />
                                </div>
                                <div className="text-center">
                                    <div style={{ fontSize: 16, fontWeight: 600, color: T.fgPrimary, marginBottom: 4 }}>
                                        No subscriptions yet
                                    </div>
                                    <div style={{ fontSize: 13, color: T.fgSecondary, lineHeight: 1.6 }}>
                                        Tap the <strong>Add</strong> tab to add your first subscription using AI or manually.
                                    </div>
                                </div>
                                <button
                                    onClick={() => navigate('/add')}
                                    className="interactive-btn flex items-center gap-2 cursor-pointer"
                                    style={{
                                        background: T.accentPrimary, border: 'none', borderRadius: 10,
                                        padding: '10px 20px', fontSize: 13, color: '#fff', fontWeight: 700,
                                        boxShadow: `0 0 20px ${T.accentPrimary}55`,
                                    }}
                                >
                                    <Plus size={16} /> Add subscription
                                </button>
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </div>
    )
}
