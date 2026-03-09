import { useState, useEffect } from 'react'
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
import { enrichSubscriptionCandidate } from '../lib/vendorEnrichment'

export default function SubscriptionDetail() {
    const { id } = useParams()
    const navigate = useNavigate()
    const location = useLocation()
    const { T, theme } = useTheme()
    const { currency } = useSettings()
    const { session, isAuthenticated } = useAuth()
    const userId = isAuthenticated ? session?.user?.id : null
    const { categories, getCategoryName, getCategoryColorById, updateSubscription, deleteSubscription, pauseSubscription } = useSubscriptions()
    const [sub, setSub] = useState(null)
    const [editing, setEditing] = useState(false)
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
                    setSub(data)
                    setForm({
                        name: data.name || '',
                        amount: data.amount?.toString() || '',
                        cycle: data.cycle || 'monthly',
                        categoryId: data.categoryId || categories[0]?.id || 1,
                        renewalDate: data.renewalDate || '',
                        notes: data.notes || '',
                    })
                }
            })
        }
    }, [id, userId, categories])

    if (!sub) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="font-mono" style={{ color: T.fgMedium }}>Loading...</div>
            </div>
        )
    }

    const catColor = getCategoryColorById(sub.categoryId)
    const catName = getCategoryName(sub.categoryId)
    const vendor = enrichSubscriptionCandidate(sub)

    const handleSave = async () => {
        const enriched = enrichSubscriptionCandidate({ name: form.name })
        await updateSubscription(sub.id, {
            name: enriched.name,
            amount: parseFloat(form.amount) || 0,
            cycle: form.cycle,
            categoryId: form.categoryId,
            renewalDate: form.renewalDate,
            notes: form.notes,
            vendorDomain: enriched.vendorDomain,
            vendorConfidence: enriched.vendorConfidence,
            vendorMatchType: enriched.vendorMatchType,
        })
        navigate(returnPath, { state: returnState })
    }

    const handleDelete = async () => {
        await deleteSubscription(sub.id)
        navigate(returnPath, { state: returnState })
    }

    const handlePause = async () => {
        if (sub.status === 'paused') {
            await updateSubscription(sub.id, { status: 'active' })
        } else {
            await pauseSubscription(sub.id)
        }
        navigate(returnPath, { state: returnState })
    }

    const fields = [
        { icon: Pencil, label: 'Name', key: 'name', value: form.name },
        { icon: Wallet, label: 'Amount', key: 'amount', value: formatCurrency(parseFloat(form.amount) || 0, currency), mono: true },
        { icon: RefreshCw, label: 'Billing Cycle', key: 'cycle', value: form.cycle },
        { icon: Tag, label: 'Category', key: 'categoryId', value: catName, isCat: true },
        { icon: Tag, label: 'Vendor Domain', key: 'vendorDomain', value: vendor.vendorDomain || 'Not matched' },
        { icon: Calendar, label: 'Renewal Date', key: 'renewalDate', value: form.renewalDate || 'Not set' },
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
                    style={{ fontSize: 12, color: T.fgMedium, fontWeight: 600 }}
                >
                    Cancel
                </span>
                <div className="flex items-center gap-2">
                    <ServiceLogo name={sub.name} domain={vendor.vendorDomain} size={30} catColor={catColor} radius={10} />
                    <span style={{ fontSize: 15, color: T.fgHigh, fontWeight: 700 }}>
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
                        <span style={{ fontSize: 11, color: T.fgMedium, marginBottom: 4, display: 'block' }}>Name</span>
                        <input
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            className="w-full outline-none"
                            style={{
                                height: 44,
                                background: T.bgGlassStrong,
                                border: `1px solid ${T.border}`,
                                borderRadius: 14,
                                color: T.fgHigh,
                                fontSize: 14,
                                padding: '0 14px',
                                boxSizing: 'border-box',
                            }}
                        />
                    </label>

                    {/* Amount */}
                    <label className="block">
                        <span style={{ fontSize: 11, color: T.fgMedium, marginBottom: 4, display: 'block' }}>Amount</span>
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
                                color: T.fgHigh,
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
                        <span style={{ fontSize: 11, color: T.fgMedium, marginBottom: 4, display: 'block' }}>Billing Cycle</span>
                        <select
                            value={form.cycle}
                            onChange={(e) => setForm({ ...form, cycle: e.target.value })}
                            className="w-full outline-none"
                            style={{
                                height: 44,
                                background: T.bgGlassStrong,
                                border: `1px solid ${T.border}`,
                                borderRadius: 14,
                                color: T.fgHigh,
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
                        <span style={{ fontSize: 11, color: T.fgMedium, marginBottom: 4, display: 'block' }}>Category</span>
                        <select
                            value={form.categoryId}
                            onChange={(e) => setForm({ ...form, categoryId: parseCategoryValue(e.target.value) })}
                            className="w-full outline-none"
                            style={{
                                height: 44,
                                background: T.bgGlassStrong,
                                border: `1px solid ${T.border}`,
                                borderRadius: 14,
                                color: T.fgHigh,
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
                        <span style={{ fontSize: 11, color: T.fgMedium, marginBottom: 4, display: 'block' }}>Renewal Date</span>
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
                                color: T.fgHigh,
                                fontSize: 14,
                                padding: '0 14px',
                                boxSizing: 'border-box',
                                colorScheme: theme === 'light' ? 'light' : 'dark',
                            }}
                        />
                    </label>

                    {/* Notes */}
                    <label className="block">
                        <span style={{ fontSize: 11, color: T.fgMedium, marginBottom: 4, display: 'block' }}>Notes</span>
                        <textarea
                            value={form.notes}
                            onChange={(e) => setForm({ ...form, notes: e.target.value })}
                            rows={3}
                            className="w-full outline-none resize-none"
                            style={{
                                background: T.bgGlassStrong,
                                border: `1px solid ${T.border}`,
                                borderRadius: 14,
                                color: T.fgHigh,
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
                        <div className="flex gap-2 flex-wrap">
                            {vendor.vendorDomain && (
                                <Chip color={T.semInfo}>{vendor.vendorDomain}</Chip>
                            )}
                            <Chip color={vendor.vendorConfidence >= 0.9 ? T.semSuccess : T.semWarning}>
                                {vendor.vendorConfidence >= 0.9 ? 'High confidence vendor match' : 'Review vendor match'}
                            </Chip>
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
                                <Icon size={16} color={T.fgSubtle} />
                                <span className="flex-1" style={{ fontSize: 13, color: T.fgHigh }}>
                                    {f.label}
                                </span>
                                {f.isCat ? (
                                    <Chip color={catColor}>{f.value}</Chip>
                                ) : (
                                    <span
                                        style={{
                                            fontSize: 12,
                                            color: T.accentPrimary,
                                            fontFamily: f.mono ? "'JetBrains Mono', monospace" : 'inherit',
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
                </div>
            )}

            {/* Danger zone */}
            <div className="flex gap-2" style={{ padding: '14px 16px 18px' }}>
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
