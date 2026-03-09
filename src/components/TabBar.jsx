import { useLocation, useNavigate } from 'react-router-dom'
import { Home, PlusCircle, PieChart, CalendarDays, Wallet, Settings } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { HIDDEN_TAB_ROUTES } from '../lib/constants'

const tabs = [
    { path: '/', label: 'Home', Icon: Home },
    { path: '/add', label: 'Add', Icon: PlusCircle },
    { path: '/analytics', label: 'Analytics', Icon: PieChart },
    { path: '/calendar', label: 'Calendar', Icon: CalendarDays },
    { path: '/budget', label: 'Budget', Icon: Wallet },
    { path: '/settings', label: 'Settings', Icon: Settings },
]

export default function TabBar() {
    const location = useLocation()
    const navigate = useNavigate()
    const { T } = useTheme()

    // Hide tab bar on landing/auth pages
    if (HIDDEN_TAB_ROUTES.some(p => location.pathname.startsWith(p))) return null

    return (
        <nav
            className="floating-dock md:hidden flex items-center gap-1"
            style={{
                color: T.fgHigh,
            }}
        >
            {tabs.map((tab) => {
                const isActive = location.pathname === tab.path
                const Icon = tab.Icon

                return (
                    <button
                        key={tab.path}
                        onClick={() => navigate(tab.path)}
                        className={`tab-pill interactive-btn flex-1 border-none cursor-pointer ${isActive ? 'tab-pill-active' : ''}`}
                        style={{
                            background: isActive
                                ? undefined
                                : 'transparent',
                            padding: '6px 0',
                            color: isActive ? T.accentPrimary : T.fgSubtle,
                        }}
                    >
                        <div className="flex flex-col items-center gap-0.5">
                            <Icon
                                size={20}
                                color={isActive ? T.accentPrimary : T.fgSubtle}
                                strokeWidth={isActive ? 2.2 : 1.8}
                                className="transition-colors duration-200"
                            />
                            <span
                                className="text-[10px] font-semibold tracking-[0.01em]"
                                style={{
                                    color: isActive ? T.accentPrimary : T.fgSubtle,
                                    opacity: isActive ? 1 : 0.92,
                                }}
                            >
                                {tab.label}
                            </span>
                            <div
                                className="rounded-full transition-all duration-200"
                                style={{
                                    width: isActive ? 14 : 4,
                                    height: 4,
                                    background: isActive ? T.accentPrimary : 'transparent',
                                }}
                            />
                        </div>
                    </button>
                )
            })}
        </nav>
    )
}
