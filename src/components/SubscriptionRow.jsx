import { useState, useRef } from 'react'
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion'
import { Trash2, Edit, Pause, Play, Copy } from 'lucide-react'
import ServiceLogo from './ServiceLogo'
import Chip from './Chip'
import TypeBadge from './TypeBadge'
import { useTheme } from '../context/ThemeContext'
import { useSettings } from '../context/SettingsContext'
import { formatCurrency } from '../lib/formatCurrency'
import { normalizeToAnnual } from '../lib/normalizeAmount'
import { getBillTypeInfo, resolveBillTypeKey } from '../lib/billTypes'

export default function SubscriptionRow({
    subscription,
    categoryName,
    categoryColor,
    daysLeft,
    onClick,
    onDelete,
    onPause,
    onDuplicate,
    variant = 'default',
    groupBy = 'type',
    reviewBadgeLabel = null,
}) {
    const { T } = useTheme()
    const { currency, billTypeByCategory } = useSettings()
    const { id, name, amount, cycle, status } = subscription
    const isPaused = status === 'paused'
    const [showAnnual, setShowAnnual] = useState(false)
    const [showContext, setShowContext] = useState(false)
    const longPressTimer = useRef(null)

    // Swipe-to-delete
    const x = useMotionValue(0)
    const deleteOpacity = useTransform(x, [-120, -60], [1, 0])
    const deleteBg = useTransform(x, [-120, 0], ['rgba(239,68,68,0.25)', 'rgba(239,68,68,0)'])

    const handleDragEnd = (_, info) => {
        if (info.offset.x < -100 && onDelete) {
            onDelete(id)
        }
    }

    // Long press
    const handlePointerDown = () => {
        longPressTimer.current = setTimeout(() => {
            setShowContext(true)
        }, 500)
    }

    const handlePointerUp = () => {
        clearTimeout(longPressTimer.current)
    }

    // Amount toggle
    const displayAmount = showAnnual
        ? normalizeToAnnual(amount, cycle)
        : amount
    const displaySuffix = showAnnual ? '/yr' : ''

    // Group styling
    const billTypeKey = resolveBillTypeKey({
        categoryId: subscription.categoryId,
        categoryName,
        billTypeByCategory,
    })
    const billTypeInfo = getBillTypeInfo(billTypeKey)
    const typeColor = billTypeInfo.color
    const rowColor = groupBy === 'type' ? categoryColor || T.fgTertiary : typeColor
    const urgencyColor = daysLeft !== null && daysLeft !== undefined
        ? (daysLeft <= 0 ? T.semDanger : daysLeft <= 2 ? T.semWarning : daysLeft <= 7 ? '#EAB308' : null)
        : null

    return (
        <div style={{ position: 'relative', overflow: 'hidden' }}>
            {/* Delete zone background */}
            <motion.div
                style={{
                    position: 'absolute', right: 0, top: 0, bottom: 0,
                    width: 100, background: deleteBg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: '0 0 0 0',
                }}
            >
                <motion.div style={{ opacity: deleteOpacity }}>
                    <Trash2 size={18} color={T.semDanger} />
                </motion.div>
            </motion.div>

            {/* Swipeable row */}
            <motion.div
                drag="x"
                dragConstraints={{ left: -120, right: 0 }}
                dragElastic={0.1}
                onDragEnd={handleDragEnd}
                style={{ x, background: 'transparent', position: 'relative', zIndex: 1 }}
                onPointerDown={handlePointerDown}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
            >
                <div
                    onClick={onClick}
                    className="interactive-btn flex items-center gap-3 cursor-pointer transition-colors"
                    style={{
                        padding: variant === 'grouped' ? '0 14px' : '0 16px',
                        minHeight: variant === 'grouped' ? 56 : 64,
                        borderBottom: `1px solid ${T.border}`,
                        borderLeft: variant === 'grouped'
                            ? `3px solid ${(urgencyColor || typeColor)}55`
                            : 'none',
                        opacity: isPaused ? 0.5 : 1,
                        background: urgencyColor && variant === 'grouped' ? `${urgencyColor}10` : 'transparent',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = T.bgHover)}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                    {/* Visual */}
                    <ServiceLogo
                        name={name}
                        size={variant === 'grouped' ? 30 : 36}
                        catColor={variant === 'grouped' ? rowColor : categoryColor}
                        radius={billTypeKey === 'loan' || billTypeKey === 'utility' ? 8 : (variant === 'grouped' ? 10 : 12)}
                    />

                    {/* Info */}
                    <div className="flex-1 overflow-hidden">
                        <div
                            className={variant === 'grouped' ? "font-medium truncate" : "font-medium truncate"}
                            style={{ fontSize: variant === 'grouped' ? 13 : 14, color: T.fgPrimary, fontWeight: 600 }}
                        >
                            {name}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            {variant === 'grouped' ? (
                                groupBy === 'type' ? (
                                    <Chip color={categoryColor} size={8}>{categoryName}</Chip>
                                ) : (
                                    <TypeBadge type={billTypeKey} size={8} />
                                )
                            ) : (
                                <>
                                    <Chip color={categoryColor} size={9}>{categoryName}</Chip>
                                    <span className="font-mono" style={{ fontSize: 9, color: T.fgTertiary }}>
                                        {cycle}
                                    </span>
                                </>
                            )}
                            {isPaused && (
                                <Chip color={T.fgTertiary} size={8}>paused</Chip>
                            )}
                            {reviewBadgeLabel && (
                                <Chip color={reviewBadgeLabel === 'Reviewed' ? T.semSuccess : T.semWarning} size={8}>{reviewBadgeLabel}</Chip>
                            )}
                        </div>
                    </div>

                    {/* Amount + renewal */}
                    <div
                        className="text-right shrink-0"
                        onClick={(e) => { e.stopPropagation(); setShowAnnual(!showAnnual) }}
                    >
                        <div
                            className="font-mono font-bold"
                            style={{ fontSize: variant === 'grouped' ? 13 : 15, color: T.fgPrimary, letterSpacing: -0.2 }}
                        >
                            {formatCurrency(displayAmount, currency)}{displaySuffix}
                        </div>
                        {daysLeft !== null && daysLeft !== undefined && (
                            <div
                                className="font-mono mt-0.5"
                                style={{
                                    fontSize: 9,
                                    color: urgencyColor || T.fgTertiary,
                                }}
                            >
                                {daysLeft}d{variant === 'grouped' ? '' : ' left'}
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* Long-press context menu */}
            <AnimatePresence>
                {showContext && (
                    <>
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setShowContext(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: -4 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.15 }}
                            style={{
                                position: 'absolute', right: 12, top: 4, zIndex: 50,
                                background: T.bgGlassStrong, border: `1px solid ${T.border}`,
                                borderRadius: 16, padding: 6, minWidth: 170,
                                backdropFilter: 'blur(20px)',
                                WebkitBackdropFilter: 'blur(20px)',
                                boxShadow: T.shadowLg,
                            }}
                        >
                            <ContextItem icon={Edit} label="Edit" T={T} onClick={() => { setShowContext(false); onClick?.() }} />
                            <ContextItem
                                icon={isPaused ? Play : Pause}
                                label={isPaused ? 'Resume' : 'Pause'}
                                T={T}
                                onClick={() => { setShowContext(false); onPause?.(id) }}
                            />
                            <ContextItem icon={Copy} label="Duplicate" T={T} onClick={() => { setShowContext(false); onDuplicate?.(id) }} />
                            <ContextItem icon={Trash2} label="Delete" danger T={T} onClick={() => { setShowContext(false); onDelete?.(id) }} />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    )
}

function ContextItem({ icon: Icon, label, onClick, danger, T }) {
    return (
        <button
            onClick={onClick}
            className="flex items-center gap-2 w-full cursor-pointer"
            style={{
                background: 'transparent', border: 'none',
                padding: '9px 12px', borderRadius: 12,
                fontSize: 12, color: danger ? T.semDanger : T.fgPrimary,
                textAlign: 'left', fontFamily: 'monospace',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = T.bgHover)}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
            <Icon size={14} color={danger ? T.semDanger : T.fgSecondary} />
            {label}
        </button>
    )
}
