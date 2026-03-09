import { useTheme } from '../context/ThemeContext'
import { motion } from 'framer-motion'

export default function Chip({ children, color, size = 10 }) {
    const { T } = useTheme()
    const chipColor = color ?? T.accentPrimary
    return (
        <motion.span
            whileHover={{ scale: 1.03 }}
            transition={{ duration: 0.15 }}
            className="inline-flex items-center font-mono font-bold whitespace-nowrap"
            style={{
                padding: '3px 8px',
                background: chipColor + '22',
                color: chipColor,
                fontSize: size,
                borderRadius: 999,
                border: `1px solid ${chipColor}44`,
            }}
        >
            {children}
        </motion.span>
    )
}
