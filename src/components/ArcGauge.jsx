import { useTheme } from '../context/ThemeContext'
import { motion } from 'framer-motion'
import { formatCurrency } from '../lib/formatCurrency'

export default function ArcGauge({ spent, budget, currency = 'USD', size = 160 }) {
    const { T } = useTheme()
    const pct = budget > 0 ? Math.min(spent / budget, 1) : 0
    const r = size * 0.45 // increased radius to give more room inside
    const cx = size / 2
    const cy = size / 2 + 10
    const startAngle = -200
    const endAngle = 20
    const range = endAngle - startAngle
    const arcPct = pct * range
    const toRad = (d) => (d * Math.PI) / 180

    const arcPath = (start, end, radius) => {
        const s = {
            x: cx + radius * Math.cos(toRad(start)),
            y: cy + radius * Math.sin(toRad(start)),
        }
        const e = {
            x: cx + radius * Math.cos(toRad(end)),
            y: cy + radius * Math.sin(toRad(end)),
        }
        const lg = Math.abs(end - start) > 180 ? 1 : 0
        return `M ${s.x} ${s.y} A ${radius} ${radius} 0 ${lg} 1 ${e.x} ${e.y}`
    }

    const color = pct < 0.7 ? T.accentPrimary : pct < 0.9 ? T.semWarning : T.semDanger

    // Format the strings we need to display
    const spentText = formatCurrency(spent, currency).replace('.00', '');
    const budgetText = formatCurrency(budget, currency).replace('.00', '');

    // Scale font size down if the text is exceptionally long
    const baseFontSize = size * 0.14;
    const maxCharsWithoutScaling = 7; // E.g., "$1,234" fits well
    const scalingFactor = spentText.length > maxCharsWithoutScaling
        ? maxCharsWithoutScaling / spentText.length
        : 1;
    const dynamicFontSize = Math.max(9, baseFontSize * scalingFactor);

    return (
        <svg width={size} height={size * 0.75}>
            {/* track */}
            <path
                d={arcPath(startAngle, endAngle, r)}
                fill="none"
                stroke={T.border}
                strokeWidth={Math.max(10, size * 0.06)}
                strokeLinecap="round"
            />
            {/* fill */}
            {pct > 0 && (
                <motion.path
                    d={arcPath(startAngle, startAngle + arcPct, r)}
                    fill="none"
                    stroke={color}
                    strokeWidth={Math.max(10, size * 0.06)}
                    strokeLinecap="round"
                    style={{ filter: `drop-shadow(0 0 6px ${color}88)` }}
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                />
            )}
            {/* amount */}
            <text
                x={cx}
                y={cy - size * 0.04}
                textAnchor="middle"
                style={{
                    fill: T.fgPrimary,
                    fontSize: dynamicFontSize,
                    fontFamily: "var(--font-mono)",
                    fontWeight: 700,
                }}
            >
                {spentText}
            </text>
            <text
                x={cx}
                y={cy + size * 0.08}
                textAnchor="middle"
                style={{
                    fill: T.fgTertiary,
                    fontSize: Math.max(9, size * 0.05),
                    fontFamily: "var(--font-mono)",
                }}
            >
                of {budgetText} budget
            </text>
            <text
                x={cx}
                y={cy + size * 0.17}
                textAnchor="middle"
                style={{
                    fill: color,
                    fontSize: Math.max(9, size * 0.05),
                    fontFamily: "var(--font-mono)",
                    fontWeight: 700,
                }}
            >
                {Math.round(pct * 100)}% used
            </text>
        </svg>
    )
}
