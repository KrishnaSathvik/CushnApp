import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, X } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

export default function InstallBanner() {
    const { T } = useTheme()
    const [deferredPrompt, setDeferredPrompt] = useState(null)
    const [dismissed, setDismissed] = useState(() => {
        if (typeof window === 'undefined') return false
        return !!sessionStorage.getItem('pwa_banner_dismissed')
    })
    const [isInstalled, setIsInstalled] = useState(() => {
        if (typeof window === 'undefined') return false
        return window.matchMedia('(display-mode: standalone)').matches
    })

    useEffect(() => {
        const handler = (e) => {
            e.preventDefault()
            setDeferredPrompt(e)
        }

        window.addEventListener('beforeinstallprompt', handler)

        const installedHandler = () => setIsInstalled(true)
        window.addEventListener('appinstalled', installedHandler)

        return () => {
            window.removeEventListener('beforeinstallprompt', handler)
            window.removeEventListener('appinstalled', installedHandler)
        }
    }, [])

    const handleInstall = async () => {
        if (!deferredPrompt) return
        deferredPrompt.prompt()
        const { outcome } = await deferredPrompt.userChoice
        if (outcome === 'accepted') {
            setIsInstalled(true)
        }
        setDeferredPrompt(null)
    }

    const handleDismiss = () => {
        setDismissed(true)
        sessionStorage.setItem('pwa_banner_dismissed', 'true')
    }

    if (isInstalled || dismissed || !deferredPrompt) return null

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 40 }}
                style={{
                    position: 'fixed', bottom: 70, left: 12, right: 12, zIndex: 25,
                    background: T.bgElevated, border: `1px solid ${T.accentPrimary}33`,
                    borderRadius: 14, padding: '12px 14px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                    display: 'flex', alignItems: 'center', gap: 12,
                }}
            >
                <div
                    className="flex items-center justify-center rounded-xl shrink-0"
                    style={{ width: 38, height: 38, background: T.accentPrimary + '22' }}
                >
                    <Download size={18} color={T.accentPrimary} />
                </div>
                <div className="flex-1">
                    <div className="font-mono" style={{ fontSize: 12, color: T.fgPrimary, fontWeight: 600 }}>
                        Install Cushn
                    </div>
                    <div className="font-mono" style={{ fontSize: 10, color: T.fgTertiary }}>
                        Add to home screen for the best experience
                    </div>
                </div>
                <button
                    onClick={handleInstall}
                    className="cursor-pointer shrink-0"
                    style={{
                        background: T.accentPrimary, border: 'none', borderRadius: 8,
                        padding: '8px 14px', fontSize: 11, color: T.bgBase,
                        fontWeight: 600, fontFamily: 'monospace',
                    }}
                >
                    Install
                </button>
                <button
                    onClick={handleDismiss}
                    className="cursor-pointer shrink-0"
                    style={{ background: 'transparent', border: 'none', padding: 4 }}
                >
                    <X size={14} color={T.fgTertiary} />
                </button>
            </motion.div>
        </AnimatePresence>
    )
}
