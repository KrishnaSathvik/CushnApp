import { PlusCircle, Zap, Landmark, Shield } from 'lucide-react'
import { useSettings } from '../context/SettingsContext'
import { getBillTypeInfo, resolveBillTypeKey } from '../lib/billTypes'

const iconMap = {
    'plus-circle': PlusCircle,
    'zap': Zap,
    'landmark': Landmark,
    'shield': Shield
}

export default function TypeBadge({ categoryId, categoryName, type, size = 9 }) {
    const { billTypeByCategory } = useSettings()
    // Determine the actual type dictionary string
    let typeKey = type
    if (categoryName && !type) {
        typeKey = resolveBillTypeKey({ categoryId, categoryName, billTypeByCategory })
    }

    const t = getBillTypeInfo(typeKey)
    const Icon = iconMap[t.icon]

    const radius = t.id === 'utility' ? 2 : t.id === 'loan' ? 0 : 4

    return (
        <span
            className="inline-flex items-center gap-1 font-mono font-bold whitespace-nowrap"
            style={{
                padding: '2px 7px',
                background: t.color + '22',
                color: t.color,
                fontSize: size,
                borderRadius: radius,
                border: `1px solid ${t.color}55`
            }}
        >
            {Icon && <Icon size={size + 1} />}
            {t.label}
        </span>
    )
}
