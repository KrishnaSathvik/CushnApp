import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Pencil, Check, AlertTriangle } from 'lucide-react'
import ServiceLogo from './ServiceLogo'
import Chip from './Chip'
import { getCategoryColor } from '../lib/tokens'
import { useTheme } from '../context/ThemeContext'
import { useSettings } from '../context/SettingsContext'
import { BILLING_CYCLES } from '../lib/constants'
import { normalizeToMonthly } from '../lib/normalizeAmount'
import { formatCurrency } from '../lib/formatCurrency'
import { enrichSubscriptionCandidate, findPotentialDuplicate } from '../lib/vendorEnrichment'

/**
 * Confirmation sheet that shows parsed subscriptions for review before saving.
 * @param {Object[]} items - Parsed subscription objects
 * @param {Object[]} categories - Categories from the database (dynamic, not hardcoded)
 * @param {Function} onConfirm - Callback with confirmed subs array
 * @param {Function} onClose - Callback to close the sheet
 */
export default function ConfirmationSheet({ items, categories = [], existingSubscriptions = [], onConfirm, onClose }) {
    const { T, isDark } = useTheme()
    const { currency } = useSettings()
    const [subs, setSubs] = useState(items)
    const [editingIdx, setEditingIdx] = useState(null)
    const [isConfirming, setIsConfirming] = useState(false)

    // Duplicate detection
    const enrichedExisting = useMemo(() => (
        existingSubscriptions.map((item) => enrichSubscriptionCandidate(item))
    ), [existingSubscriptions])
    const getDuplicate = (sub) => findPotentialDuplicate(sub, enrichedExisting)

    // Derive category options from the categories prop (dynamic)
    const categoryOptions = categories.length > 0
        ? categories.map(c => c.name)
        : ['Entertainment', 'Dev Tools', 'Health', 'Productivity', 'Cloud', 'News & Media', 'Other']

    useEffect(() => {
        setSubs(items)
    }, [items])

    const handleRemove = (idx) => {
        setSubs((prev) => prev.filter((_, i) => i !== idx))
    }

    const handleEdit = (idx, field, value) => {
        setSubs((prev) =>
            prev.map((s, i) =>
                i === idx ? { ...s, [field]: field === 'amount' ? parseFloat(value) || 0 : value } : s
            )
        )
    }

    const totalMonthly = subs.reduce((sum, s) => {
        return sum + normalizeToMonthly(s.amount, s.cycle)
    }, 0)
    const hasInvalidDrafts = subs.some((sub) => !Number.isFinite(sub.amount) || sub.amount <= 0)

    const getCatColor = (cat) => {
        // Use database category color if available, otherwise fall back to tokens
        const dbCat = categories.find(c => c.name === cat)
        if (dbCat?.color) return dbCat.color
        return getCategoryColor(cat, isDark)
    }

    return (
        <>
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="fixed inset-0 z-40"
                style={{ background: 'rgba(0,0,0,0.7)' }}
            />

            {/* Sheet */}
            <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', stiffness: 400, damping: 40 }}
                className="fixed bottom-0 left-0 right-0 z-50 overflow-hidden"
                style={{
                    height: '92%',
                    background: T.bgGlassStrong,
                    borderRadius: '24px 24px 0 0',
                    borderTop: `1px solid ${T.border}`,
                    backdropFilter: 'blur(24px)',
                    WebkitBackdropFilter: 'blur(24px)',
                    boxShadow: T.shadowLg,
                }}
            >
                {/* Drag handle */}
                <div className="flex justify-center pt-3">
                    <div className="rounded-full" style={{ width: 42, height: 5, background: T.fgDivider }} />
                </div>

                {/* Header */}
                <div
                    className="flex justify-between items-center"
                    style={{ padding: '10px 14px 8px', borderBottom: `1px solid ${T.border}` }}
                >
                    <div>
                        <div style={{ fontSize: 15, color: T.fgHigh, fontWeight: 700 }}>
                            Review {subs.length} subscription{subs.length !== 1 ? 's' : ''}
                        </div>
                        <div className="font-mono mt-0.5" style={{ fontSize: 10, color: T.fgSubtle }}>
                            AI detected from your input
                        </div>
                        {hasInvalidDrafts && (
                            <div className="font-mono mt-1" style={{ fontSize: 10, color: T.semWarning }}>
                                Fill in missing amounts before confirming.
                            </div>
                        )}
                    </div>
                    <div className="flex gap-2 items-center">
                        {subs.length > 0 && (
                            <button
                                onClick={() => setSubs([])}
                                className="interactive-btn cursor-pointer border-none"
                                style={{
                                    background: T.bgElevated,
                                    border: `1px solid ${T.border}`,
                                    color: T.semDanger,
                                    borderRadius: 12,
                                    padding: '6px 10px',
                                    fontSize: 12,
                                    fontWeight: 600,
                                }}
                            >
                                Clear All
                            </button>
                        )}
                        <button
                            onClick={() => {
                                if (hasInvalidDrafts) return
                                setIsConfirming(true)
                                const finalized = [...subs]
                                setSubs([])
                                setTimeout(() => {
                                    onClose()
                                    onConfirm(finalized)
                                }, finalized.length * 50 + 300)
                            }}
                            disabled={subs.length === 0 || hasInvalidDrafts}
                            className="interactive-btn cursor-pointer border-none"
                            style={{
                                background: subs.length > 0 && !hasInvalidDrafts ? T.accentPrimary : T.fgDivider,
                                color: '#fff',
                                borderRadius: 12,
                                padding: '7px 14px',
                                fontSize: 12,
                                fontWeight: 700,
                                opacity: subs.length > 0 && !hasInvalidDrafts ? 1 : 0.5,
                            }}
                        >
                            Confirm All
                        </button>
                    </div>
                </div>

                {/* Parsed cards */}
                <div className="overflow-y-auto" style={{ padding: '8px 12px', height: 'calc(100% - 130px)' }}>
                    <AnimatePresence>
                        {subs.map((sub, i) => (
                            <motion.div
                                key={i}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{
                                    opacity: 0,
                                    x: isConfirming ? 0 : -200,
                                    y: isConfirming ? 100 : 0,
                                    scale: isConfirming ? 0.8 : 1,
                                    height: 0,
                                    marginBottom: 0
                                }}
                                transition={{ delay: isConfirming ? i * 0.05 : 0, duration: 0.3 }}
                                style={{
                                    background: T.bgSurface,
                                    borderRadius: 16,
                                    padding: '12px 12px 10px',
                                    marginBottom: 8,
                                    border: getDuplicate(sub) ? `1px solid ${T.semWarning}55` : `1px solid ${T.border}`,
                                    boxShadow: T.shadowSm,
                                }}
                            >
                                {/* Duplicate warning */}
                                {getDuplicate(sub) && (
                                    <div
                                        className="flex items-center gap-1.5 font-mono"
                                        style={{
                                            fontSize: 10, color: T.semWarning,
                                            marginBottom: 6, padding: '4px 8px',
                                            background: T.semWarning + '15', borderRadius: 999,
                                        }}
                                    >
                                        <AlertTriangle size={11} />
                                        Possible duplicate — matches "{getDuplicate(sub)?.name}"
                                    </div>
                                )}
                                {/* Card header */}
                                <div className="flex items-center gap-2 mb-2">
                                    <ServiceLogo name={sub.name} domain={sub.vendorDomain} size={30} catColor={getCatColor(sub.category)} radius={8} />
                                    <div className="flex-1">
                                        {editingIdx === i ? (
                                            <input
                                                value={sub.name}
                                                onChange={(e) => handleEdit(i, 'name', e.target.value)}
                                                className="outline-none w-full"
                                                style={{
                                                    fontSize: 13, color: T.fgHigh, fontWeight: 600,
                                                    background: T.bgElevated, border: `1px solid ${T.accentPrimary}`,
                                                    borderRadius: 10, padding: '6px 10px',
                                                }}
                                            />
                                        ) : (
                                            <div style={{ fontSize: 13, color: T.fgHigh, fontWeight: 600 }}>{sub.name}</div>
                                        )}
                                        <div className="font-mono" style={{ fontSize: 10, color: T.fgSubtle }}>
                                            {sub.cycle}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setEditingIdx(editingIdx === i ? null : i)}
                                        className="interactive-btn cursor-pointer bg-transparent border-none p-1"
                                    >
                                        {editingIdx === i ? (
                                            <Check size={14} color={T.accentPrimary} />
                                        ) : (
                                            <Pencil size={14} color={T.fgSubtle} />
                                        )}
                                    </button>
                                    <button
                                        onClick={() => handleRemove(i)}
                                        className="interactive-btn cursor-pointer bg-transparent border-none p-1"
                                    >
                                        <X size={16} color={T.semDanger} />
                                    </button>
                                </div>

                                {/* Edit mode */}
                                {editingIdx === i && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="mb-2"
                                    >
                                        {/* Amount */}
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="font-mono" style={{ fontSize: 10, color: T.fgSubtle, width: 60 }}>Amount</span>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={sub.amount}
                                                onChange={(e) => handleEdit(i, 'amount', e.target.value)}
                                                className="outline-none flex-1 font-mono"
                                                style={{
                                                    fontSize: 12, color: T.fgHigh, background: T.bgElevated,
                                                    border: `1px solid ${T.border}`, borderRadius: 10, padding: '5px 10px',
                                                }}
                                            />
                                        </div>
                                        {/* Cycle */}
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="font-mono" style={{ fontSize: 10, color: T.fgSubtle, width: 60 }}>Cycle</span>
                                            <div className="flex gap-1 flex-1">
                                                {BILLING_CYCLES.map((c) => (
                                                    <button
                                                        key={c}
                                                        onClick={() => handleEdit(i, 'cycle', c)}
                                                        className="interactive-btn cursor-pointer capitalize font-mono"
                                                        style={{
                                                            flex: 1, padding: '5px 2px', borderRadius: 10, fontSize: 9,
                                                            background: sub.cycle === c ? T.accentSoft : T.bgElevated,
                                                            border: `1px solid ${sub.cycle === c ? T.accentPrimary : T.border}`,
                                                            color: sub.cycle === c ? T.accentPrimary : T.fgSubtle,
                                                        }}
                                                    >
                                                        {c}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        {/* Category */}
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono" style={{ fontSize: 10, color: T.fgSubtle, width: 60 }}>Category</span>
                                            <div className="flex gap-1 flex-1 flex-wrap">
                                                {categoryOptions.map((c) => (
                                                    <button
                                                        key={c}
                                                        onClick={() => handleEdit(i, 'category', c)}
                                                        className="interactive-btn cursor-pointer font-mono"
                                                        style={{
                                                            padding: '4px 8px', borderRadius: 999, fontSize: 8,
                                                            background: sub.category === c ? getCatColor(c) + '33' : T.bgElevated,
                                                            border: `1px solid ${sub.category === c ? getCatColor(c) : T.border}`,
                                                            color: sub.category === c ? getCatColor(c) : T.fgSubtle,
                                                        }}
                                                    >
                                                        {c}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        {/* Renewal Date */}
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="font-mono" style={{ fontSize: 10, color: T.fgSubtle, width: 60 }}>Next Bill</span>
                                            <input
                                                type="date"
                                                value={sub.renewalDate}
                                                onChange={(e) => handleEdit(i, 'renewalDate', e.target.value)}
                                                className="outline-none flex-1 font-mono"
                                                style={{
                                                    fontSize: 12, color: T.fgHigh, background: T.bgElevated,
                                                    border: `1px solid ${T.border}`, borderRadius: 10, padding: '5px 10px',
                                                    colorScheme: isDark ? 'dark' : 'light'
                                                }}
                                            />
                                        </div>
                                    </motion.div>
                                )}

                                {/* Tags */}
                                <div className="flex gap-1.5 flex-wrap">
                                    <Chip color={sub.amount > 0 ? T.accentPrimary : T.semWarning} size={9}>
                                        {sub.amount > 0 ? formatCurrency(sub.amount, currency) : 'Amount missing'}
                                    </Chip>
                                    <Chip color={getCatColor(sub.category)} size={9}>{sub.category}</Chip>
                                    <Chip color={T.fgSubtle} size={9}>{sub.cycle}</Chip>
                                    {sub.vendorDomain && (
                                        <Chip color={T.semInfo} size={9}>{sub.vendorDomain}</Chip>
                                    )}
                                    <Chip color={sub.vendorConfidence >= 0.9 ? T.semSuccess : T.semWarning} size={9}>
                                        {sub.vendorConfidence >= 0.9 ? 'High match' : 'Needs review'}
                                    </Chip>
                                    {sub.renewalDate && (
                                        <Chip color={T.fgSubtle} size={9}>Next: {sub.renewalDate}</Chip>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {subs.length === 0 && (
                        <div className="text-center py-12" style={{ color: T.fgSubtle, fontSize: 13 }}>
                            All items removed. Close this sheet to start over.
                        </div>
                    )}

                    {/* Total */}
                    {subs.length > 0 && (
                        <div
                            className="flex justify-between items-center"
                            style={{ padding: '10px 4px 0', borderTop: `1px solid ${T.border}` }}
                        >
                            <span style={{ fontSize: 12, color: T.fgMedium }}>Monthly total added</span>
                            <span className="font-mono font-bold" style={{ fontSize: 16, color: T.accentPrimary }}>
                                +{formatCurrency(totalMonthly, currency)}
                            </span>
                        </div>
                    )}
                </div>
            </motion.div>
        </>
    )
}
