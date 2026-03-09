import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Plus, ChevronDown, ChevronRight, Zap, Landmark, Shield, Film, Code, HeartPulse, Lightbulb, Newspaper, Tag, Cloud } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import useSubscriptions from '../hooks/useSubscriptions'
import useBudget from '../hooks/useBudget'
import ArcGauge from '../components/ArcGauge'
import SubscriptionRow from '../components/SubscriptionRow'
import { useTheme } from '../context/ThemeContext'
import { useSettings } from '../context/SettingsContext'
import { formatCurrency } from '../lib/formatCurrency'
import { normalizeToMonthly } from '../lib/normalizeAmount'
import { getBillTypeInfo, resolveBillTypeKey } from '../lib/billTypes'

function getIconComp(name) {
    switch (name || '') {
        case 'film': return Film
        case 'code': return Code
        case 'heart-pulse': return HeartPulse
        case 'lightbulb': return Lightbulb
        case 'cloud': return Cloud
        case 'newspaper': return Newspaper
        case 'zap': return Zap
        case 'plus-circle': return Plus
        case 'landmark': return Landmark
        case 'shield': return Shield
        default: return Tag
    }
}
export default function HomeScreen() {
    const navigate = useNavigate()
    const { T } = useTheme()
    const { currency, billTypeByCategory } = useSettings()
    const {
        monthlyTotal, annualTotal, nextRenewal,
        loading, getCategoryName, getCategoryColorById,
        daysUntilRenewal, subscriptions, categories,
        deleteSubscription, pauseSubscription, addSubscription,
    } = useSubscriptions()
    const { budget } = useBudget()
    const { userName } = useAuth()
    const [showSearch, setShowSearch] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [groupBy, setGroupBy] = useState('type')
    const [expandedGroups, setExpandedGroups] = useState({})

    const toggleGroup = (key) => setExpandedGroups(prev => ({ ...prev, [key]: !prev[key] }))

    const activeCount = subscriptions.filter(s => s.status === 'active').length
    const nextDays = nextRenewal ? daysUntilRenewal(nextRenewal.renewalDate) : null
    const activeSubs = useMemo(() => subscriptions.filter(s => s.status === 'active'), [subscriptions])
    const dueSoonSubs = useMemo(() => (
        activeSubs
            .map((sub) => ({ sub, days: daysUntilRenewal(sub.renewalDate) }))
            .filter((item) => item.days !== null && item.days >= 0 && item.days <= 7)
            .sort((a, b) => a.days - b.days)
            .slice(0, 4)
    ), [activeSubs, daysUntilRenewal])
    const budgetGoal = budget.monthlyGoal || 200
    const budgetPct = budgetGoal > 0 ? monthlyTotal / budgetGoal : 0
    const budgetTone = budgetPct < 0.7 ? 'On track' : budgetPct < 1 ? 'Near limit' : 'Over budget'
    const budgetToneColor = budgetPct < 0.7 ? T.finGain : budgetPct < 1 ? T.semWarning : T.finLoss
    const budgetRemaining = Math.max(budgetGoal - monthlyTotal, 0)
    const gaugeDetails = [
        {
            title: 'Budget left',
            value: formatCurrency(budgetRemaining, currency).replace('.00', ''),
            tone: budgetRemaining > 0 ? `${Math.round(Math.max(0, 1 - budgetPct) * 100)}% available` : '0% available',
            color: budgetRemaining > 0 ? T.finGain : T.finLoss,
        },
        {
            title: 'Annual total',
            value: formatCurrency(annualTotal, currency).replace('.00', ''),
            tone: 'projected spend',
            color: T.finChart4,
        },
        {
            title: 'Next renewal',
            value: nextDays !== null ? `${nextDays}d` : 'None',
            tone: nextDays !== null ? 'until next charge' : 'nothing upcoming',
            color: T.semWarning,
        },
        {
            title: 'Active subscriptions',
            value: `${activeCount}`,
            tone: 'currently running',
            color: T.accentPrimary,
        },
    ]

    // Compute Groups
    const groupData = useMemo(() => {
        const activeSubs = subscriptions.filter(s => s.status === 'active')
        let filtered = activeSubs
        if (searchTerm) filtered = filtered.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()))

        const data = {}
        filtered.forEach(sub => {
            const catName = getCategoryName(sub.categoryId)
            const typeKey = resolveBillTypeKey({
                categoryId: sub.categoryId,
                categoryName: catName,
                billTypeByCategory,
            })
            const key = groupBy === 'type' ? typeKey : (catName === 'Other' ? 'Other' : catName)
            if (!data[key]) data[key] = []
            data[key].push(sub)
        })

        // Sort items inside groups by days left closely approaching
        Object.keys(data).forEach(k => {
            data[k].sort((a, b) => {
                const da = daysUntilRenewal(a.renewalDate) ?? 9999
                const db = daysUntilRenewal(b.renewalDate) ?? 9999
                return da - db
            })
        })
        return data
    }, [subscriptions, groupBy, searchTerm, getCategoryName, daysUntilRenewal, billTypeByCategory])
    const hasSearchNoResults = searchTerm.trim().length > 0 && Object.keys(groupData).length === 0 && activeCount > 0

    const getGroupMeta = (groupKey) => {
        if (groupBy === 'type') {
            const info = getBillTypeInfo(groupKey)
            return { label: info.label, color: info.color, icon: info.icon }
        } else {
            const cat = categories.find(c => c.name === groupKey)
            return { label: groupKey, color: cat ? cat.color : T.fgSubtle, icon: cat ? cat.icon : 'tag' }
        }
    }

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
            onClick={() => navigate(`/detail/${sub.id}`)}
            onDelete={handleDelete}
            onPause={handlePause}
            onDuplicate={handleDuplicate}
            variant="grouped"
            groupBy={groupBy}
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
                                {userName ? `Welcome back, ${userName}. ` : ''}Your subscriptions, renewals, and budget status in one command-center view.
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowSearch(!showSearch)}
                                className="interactive-btn flex items-center justify-center rounded-full border-none cursor-pointer"
                                style={{ width: 42, height: 42, background: T.bgGlass, border: `1px solid ${T.border}` }}
                            >
                                <Search size={16} color={T.fgHigh} />
                            </button>
                        </div>
                    </div>

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
                                background: `${budgetToneColor}16`,
                                filter: 'blur(44px)',
                                borderRadius: '50%',
                            }}
                        />
                        <div className="section-label">Spend rhythm</div>
                        <p className="page-subtitle" style={{ marginTop: 8, textAlign: 'center' }}>
                            {budgetTone} for {new Date().toLocaleString('default', { month: 'long' })}.
                        </p>
                        <div className="flex justify-center" style={{ marginTop: 10, position: 'relative' }}>
                            <ArcGauge spent={monthlyTotal} budget={budgetGoal} currency={currency} size={250} />
                        </div>
                        <div className="stat-grid" style={{ marginTop: 8 }}>
                            {gaugeDetails.map((item) => (
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
                                    <div style={{ fontSize: 12, color: T.fgMedium, marginTop: 4 }}>{item.tone}</div>
                                </div>
                            ))}
                        </div>
                        <div
                            className="surface-card-muted"
                            style={{
                                padding: '12px 14px',
                                marginTop: 10,
                                border: `1px solid ${T.border}`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: 12,
                            }}
                        >
                            <span className="section-label">Monthly goal</span>
                            <span className="font-mono" style={{ fontSize: 12, color: budgetToneColor }}>
                                {formatCurrency(budgetGoal, currency).replace('.00', '')}
                            </span>
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
                                <div style={{ fontSize: 13, color: T.fgMedium, marginTop: 4 }}>
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
                                    color: T.fgHigh,
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
                                    <div className="surface-card-muted" style={{ padding: '14px 16px', fontSize: 13, color: T.fgMedium }}>
                                        Nothing due in the next 7 days.
                                    </div>
                                ) : (
                                    <div className="surface-card-muted" style={{ overflow: 'hidden' }}>
                                        {dueSoonSubs.map(({ sub }, index) => (
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
                                                    daysLeft={daysUntilRenewal(sub.renewalDate)}
                                                    onClick={() => navigate(`/detail/${sub.id}`)}
                                                    onDelete={handleDelete}
                                                    onPause={handlePause}
                                                    onDuplicate={handleDuplicate}
                                                    variant="grouped"
                                                    groupBy="type"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}
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
                                {['type', 'category'].map(opt => (
                                    <button
                                        key={opt}
                                        onClick={() => setGroupBy(opt)}
                                        className="interactive-btn cursor-pointer font-semibold"
                                        style={{
                                            padding: '10px 12px',
                                            borderRadius: 12,
                                            border: 'none',
                                            background: groupBy === opt ? T.accentSoft : 'transparent',
                                            color: groupBy === opt ? T.accentPrimary : T.fgMedium,
                                            fontSize: 12,
                                        }}
                                    >
                                        {opt === 'type' ? 'Bill type' : 'Category'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="dashboard-stack" style={{ gap: 10 }}>
                            {Object.entries(groupData).map(([groupKey, items]) => {
                                const meta = getGroupMeta(groupKey)
                                const isExpanded = expandedGroups[groupKey] !== false // Default true
                                const groupTotal = items.reduce((sum, s) => sum + normalizeToMonthly(s.amount, s.cycle), 0)
                                const IconComp = getIconComp(meta.icon)

                                return (
                                    <div key={groupKey}>
                                        <div
                                            onClick={() => toggleGroup(groupKey)}
                                            className="surface-card-muted flex items-center gap-3 cursor-pointer transition-colors"
                                            style={{
                                                padding: '14px 16px',
                                                background: `linear-gradient(180deg, ${meta.color}12, ${T.bgElevated})`,
                                                borderColor: `${meta.color}2a`,
                                                borderBottomLeftRadius: isExpanded ? 0 : 18,
                                                borderBottomRightRadius: isExpanded ? 0 : 18,
                                            }}
                                        >
                                            <div style={{
                                                width: 28, height: 28,
                                                borderRadius: groupKey === 'utility' ? 3 : groupKey === 'loan' ? 2 : '50%',
                                                background: meta.color,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                flexShrink: 0
                                            }}>
                                                <IconComp size={12} color="#fff" />
                                            </div>
                                            <span
                                                className="flex-1 font-bold tracking-wide uppercase truncate min-w-0"
                                                style={{ fontSize: 12, color: meta.color }}
                                            >
                                                {meta.label}
                                            </span>
                                            <span className="font-mono font-bold shrink-0" style={{ fontSize: 11, color: meta.color }}>
                                                {formatCurrency(groupTotal, currency)}/mo
                                            </span>
                                            {isExpanded ? (
                                                <ChevronDown size={18} color={T.fgSubtle} />
                                            ) : (
                                                <ChevronRight size={18} color={T.fgSubtle} />
                                            )}
                                        </div>

                                        {isExpanded && (
                                            <div
                                                className="surface-card-muted"
                                                style={{
                                                    background: T.bgSurface,
                                                    borderTop: 'none',
                                                    borderTopLeftRadius: 0,
                                                    borderTopRightRadius: 0,
                                                    overflow: 'hidden',
                                                }}
                                            >
                                                {items.map((item, index) => (
                                                    <div
                                                        key={item.id}
                                                        style={{
                                                            background: index % 2 === 0 ? T.bgSurface : T.bgSubtle,
                                                        }}
                                                    >
                                                        {renderGroupItem(item)}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>

                        {hasSearchNoResults && (
                            <div className="flex flex-col items-center gap-3 mt-8 px-8">
                                <div className="text-center">
                                    <div style={{ fontSize: 16, fontWeight: 600, color: T.fgHigh, marginBottom: 4 }}>
                                        No matches found
                                    </div>
                                    <div style={{ fontSize: 13, color: T.fgMedium, lineHeight: 1.6 }}>
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
                                        color: T.fgHigh,
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
                                    <div style={{ fontSize: 16, fontWeight: 600, color: T.fgHigh, marginBottom: 4 }}>
                                        No subscriptions yet
                                    </div>
                                    <div style={{ fontSize: 13, color: T.fgMedium, lineHeight: 1.6 }}>
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
