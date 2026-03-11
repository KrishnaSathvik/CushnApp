import { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { BellRing, X } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { useSettings } from '../context/SettingsContext'
import useSubscriptions from '../hooks/useSubscriptions'
import useInAppReminders from '../hooks/useInAppReminders'
import { formatCurrency } from '../lib/formatCurrency'

const NAV_ITEMS = [
    { path: '/', label: 'Home' },
    { path: '/add', label: 'Add' },
    { path: '/analytics', label: 'Analytics' },
    { path: '/calendar', label: 'Calendar' },
    { path: '/budget', label: 'Budget' },
    { path: '/settings', label: 'Settings' },
]

export default function DashboardHeader() {
    const { T } = useTheme()
    const navigate = useNavigate()
    const location = useLocation()
    const { currency } = useSettings()
    const { subscriptions, daysUntilRenewal } = useSubscriptions()
    const { reminders, dismissReminder, dismissingId } = useInAppReminders()
    const [showNotifications, setShowNotifications] = useState(false)

    const visibleReminders = useMemo(() => (
        reminders
            .map((event) => {
                const sub = subscriptions.find((item) => item.id === event.subscriptionId)
                return {
                    ...event,
                    subscription: sub || null,
                    days: daysUntilRenewal(event.renewalDate),
                }
            })
            .sort((a, b) => {
                const left = a.days ?? 9999
                const right = b.days ?? 9999
                if (left !== right) return left - right
                return new Date(a.reminderDate).getTime() - new Date(b.reminderDate).getTime()
            })
            .slice(0, 3)
    ), [reminders, subscriptions, daysUntilRenewal])

    return (
        <>
            <header
                style={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 50,
                    background: T.bgBase + 'ee',
                    backdropFilter: 'blur(12px)',
                    borderBottom: `1px solid ${T.border}`,
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                }}
            >
                <button
                    onClick={() => navigate('/')}
                    className="interactive-btn flex items-center gap-2 cursor-pointer border-none"
                    style={{
                        background: 'transparent',
                        padding: '9px 0',
                        minHeight: 44,
                    }}
                >
                    <img src="/logo.png" alt="Cushn Logo" style={{ width: 24, height: 24, borderRadius: 6 }} />
                    <span style={{ fontSize: 17, fontWeight: 700, color: T.fgPrimary, letterSpacing: '-0.5px' }}>Cushn</span>
                </button>

                <nav className="hidden md:flex items-center gap-2">
                    {NAV_ITEMS.map((item) => {
                        const isActive = location.pathname === item.path
                        return (
                            <button
                                key={item.path}
                                onClick={() => navigate(item.path)}
                                className="interactive-btn cursor-pointer border-none font-mono"
                                style={{
                                    height: 36,
                                    padding: '0 12px',
                                    borderRadius: 999,
                                    background: isActive ? T.accentSoft : 'transparent',
                                    color: isActive ? T.accentPrimary : T.fgSecondary,
                                    border: `1px solid ${isActive ? T.accentPrimary : T.border}`,
                                    fontSize: 11,
                                }}
                            >
                                {item.label}
                            </button>
                        )
                    })}
                </nav>

                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button
                        onClick={() => setShowNotifications((prev) => !prev)}
                        aria-label={visibleReminders.length > 0 ? `${visibleReminders.length} notifications` : 'No notifications'}
                        aria-expanded={showNotifications}
                        className="interactive-btn relative flex items-center justify-center rounded-full border-none cursor-pointer"
                        style={{ width: 44, height: 44, background: T.bgGlass, border: `1px solid ${T.border}` }}
                    >
                        <BellRing size={17} color={T.fgPrimary} />
                        {visibleReminders.length > 0 && (
                            <span
                                className="font-mono"
                                style={{
                                    position: 'absolute',
                                    top: -3,
                                    right: -3,
                                    minWidth: 17,
                                    height: 17,
                                    borderRadius: 999,
                                    padding: '0 4px',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: 9,
                                    fontWeight: 700,
                                    color: T.fgOnAccent,
                                    background: T.accentPrimary,
                                    border: `1px solid ${T.bgSurface}`,
                                }}
                            >
                                {visibleReminders.length}
                            </span>
                        )}
                    </button>

                    {showNotifications && (
                        <div
                            className="surface-card"
                            style={{
                                position: 'absolute',
                                top: 'calc(100% + 10px)',
                                right: 0,
                                width: 'min(360px, calc(100vw - 32px))',
                                padding: 12,
                                zIndex: 60,
                            }}
                        >
                            <div className="flex items-center gap-2" style={{ color: T.fgPrimary }}>
                                <BellRing size={16} color={T.accentPrimary} />
                                <div className="section-label" style={{ margin: 0 }}>
                                    In-app notifications
                                </div>
                            </div>
                            {visibleReminders.length > 0 ? (
                                <div style={{ marginTop: 10, display: 'grid', gap: 10 }}>
                                    {visibleReminders.map((reminder) => {
                                        const daysLabel = reminder.days === null
                                            ? 'Renewal approaching'
                                            : reminder.days === 0
                                                ? 'Due today'
                                                : `${reminder.days} day${reminder.days !== 1 ? 's' : ''} left`
                                        const name = reminder.subscription?.name || 'Subscription'
                                        const amount = reminder.subscription
                                            ? formatCurrency(reminder.subscription.amount, reminder.subscription.currency || currency).replace('.00', '')
                                            : null
                                        return (
                                            <div
                                                key={reminder.id}
                                                className="flex items-start justify-between gap-3"
                                                style={{
                                                    padding: '12px 12px',
                                                    borderRadius: 14,
                                                    background: T.bgElevated,
                                                    border: `1px solid ${T.border}`,
                                                }}
                                            >
                                                <div className="min-w-0">
                                                    <div style={{ fontSize: 14, fontWeight: 700, color: T.fgPrimary }}>
                                                        {name}
                                                    </div>
                                                    <div className="font-mono" style={{ fontSize: 11, color: T.accentPrimary, marginTop: 4 }}>
                                                        {daysLabel}
                                                    </div>
                                                    <div style={{ fontSize: 12, color: T.fgSecondary, marginTop: 6 }}>
                                                        Renews on {reminder.renewalDate}{amount ? ` • ${amount}` : ''}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 shrink-0">
                                                    {reminder.subscription && (
                                                        <button
                                                            onClick={() => {
                                                                setShowNotifications(false)
                                                                navigate(`/detail/${reminder.subscription.id}`)
                                                            }}
                                                            className="interactive-btn cursor-pointer"
                                                            style={{
                                                                minHeight: 36,
                                                                border: `1px solid ${T.border}`,
                                                                background: T.bgSurface,
                                                                color: T.fgPrimary,
                                                                borderRadius: 999,
                                                                fontSize: 11,
                                                                padding: '7px 10px',
                                                            }}
                                                        >
                                                            Open
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => dismissReminder(reminder.id)}
                                                        disabled={dismissingId === reminder.id}
                                                        className="interactive-btn flex items-center justify-center cursor-pointer"
                                                        aria-label={`Dismiss reminder for ${name}`}
                                                        style={{
                                                            width: 36,
                                                            height: 36,
                                                            borderRadius: 999,
                                                            border: `1px solid ${T.border}`,
                                                            background: T.bgSurface,
                                                            color: T.fgSecondary,
                                                            opacity: dismissingId === reminder.id ? 0.6 : 1,
                                                        }}
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            ) : (
                                <div
                                    className="surface-card-muted"
                                    style={{
                                        marginTop: 10,
                                        padding: '14px 16px',
                                        background: T.bgElevated,
                                        color: T.fgSecondary,
                                        fontSize: 13,
                                    }}
                                >
                                    No new notifications right now.
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </header>
        </>
    )
}
