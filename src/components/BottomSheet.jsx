import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'

export default function BottomSheet({ open, onClose, height = '90%', children }) {
    const { T } = useTheme()

    return (
        <AnimatePresence>
            {open && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
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
                            height,
                            background: T.bgGlassStrong,
                            borderRadius: '24px 24px 0 0',
                            borderTop: `1px solid ${T.border}`,
                            backdropFilter: 'blur(24px)',
                            WebkitBackdropFilter: 'blur(24px)',
                            boxShadow: T.shadowLg,
                        }}
                    >
                        {/* Drag handle */}
                        <div className="flex justify-center pt-3 pb-2">
                            <div
                                className="rounded-full"
                                style={{
                                    width: 42,
                                    height: 5,
                                    background: T.fgDivider,
                                }}
                            />
                        </div>
                        <div className="overflow-y-auto" style={{ height: 'calc(100% - 28px)' }}>
                            {children}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
