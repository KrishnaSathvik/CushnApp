import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Globe,
    Download,
    Trash2,
    User,
    LogOut,
    UserPlus,
    ChevronRight,
    Shield,
    Upload,
    CheckCircle,
    AlertTriangle,
    Sun,
    Moon,
    Plus,
    Pencil,
    Bell,
    RotateCcw,
    X,
} from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useSettings, SUPPORTED_CURRENCIES } from '../context/SettingsContext'
import useSubscriptions from '../hooks/useSubscriptions'
import useBudget from '../hooks/useBudget'
import { exportJSON } from '../lib/exportData'
import { parseCSV } from '../lib/importData'
import { DEFAULT_BUDGET } from '../lib/constants'
import BottomSheet from '../components/BottomSheet'
import ServiceLogo from '../components/ServiceLogo'
import useNotificationPreferences from '../hooks/useNotificationPreferences'
import { enrichSubscriptionCandidate, findPotentialDuplicate } from '../lib/vendorEnrichment'

function SettingRow({ icon: Icon, label, value, onClick, danger, accent, disabled = false, last = false, hint = null }) {
    const { T } = useTheme()
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className="interactive-btn flex items-center gap-3 w-full cursor-pointer"
            style={{
                background: 'transparent',
                border: 'none',
                padding: '15px 16px',
                borderBottom: last ? 'none' : `1px solid ${T.border}`,
                textAlign: 'left',
                opacity: disabled ? 0.55 : 1,
            }}
        >
            <div
                className="flex items-center justify-center"
                style={{
                    width: 34,
                    height: 34,
                    borderRadius: 8,
                    background: danger ? T.semDanger + '16' : accent ? T.accentSoft : T.bgGlassStrong,
                    border: `1px solid ${danger ? `${T.semDanger}33` : accent ? `${T.accentPrimary}33` : T.border}`,
                }}
            >
                <Icon size={15} color={danger ? T.semDanger : accent ? T.accentPrimary : T.fgMedium} />
            </div>
            <div className="flex-1">
                <div style={{ fontSize: 14, fontWeight: 600, color: danger ? T.semDanger : T.fgHigh }}>
                    {label}
                </div>
                {value && (
                    <div className="font-mono" style={{ fontSize: 11, color: T.fgSubtle, marginTop: 3 }}>
                        {value}
                    </div>
                )}
                {hint && (
                    <div className="font-mono" style={{ fontSize: 9, color: T.fgSubtle, marginTop: 3 }}>
                        {hint}
                    </div>
                )}
            </div>
            <ChevronRight size={14} color={T.fgSubtle} />
        </button>
    )
}

function SectionTitle({ children }) {
    return (
        <div className="section-label" style={{ paddingTop: 6 }}>
            {children}
        </div>
    )
}

function Card({ children }) {
    const { T } = useTheme()
    return (
        <div
            className="surface-card"
            style={{
                overflow: 'hidden',
                background: T.bgSurface,
                boxShadow: 'none',
            }}
        >
            {children}
        </div>
    )
}

export default function SettingsScreen() {
    const navigate = useNavigate()
    const { T, theme, themePreference, setThemePreference } = useTheme()
    const { session, isGuest, userName, logout, updateProfile, deleteAccount } = useAuth()
    const {
        currency,
        setCurrency,
        billTypeByCategory,
        setCategoryBillType,
        resetBillTypeMapping,
    } = useSettings()
    const {
        addSubscriptionsBulk,
        clearAllSubscriptions,
        subscriptions,
        categories,
        addCategory,
    } = useSubscriptions()
    const { budget, saveBudget } = useBudget()
    const { preferences, savePreferences } = useNotificationPreferences()

    const [showClearConfirm, setShowClearConfirm] = useState(false)
    const [showDeleteAccountConfirm, setShowDeleteAccountConfirm] = useState(false)
    const [deleteAccountConfirmText, setDeleteAccountConfirmText] = useState('')
    const [showCurrencySheet, setShowCurrencySheet] = useState(false)
    const [showThemeSheet, setShowThemeSheet] = useState(false)
    const [showNotificationsSheet, setShowNotificationsSheet] = useState(false)
    const [showCategoryEditor, setShowCategoryEditor] = useState(false)
    const [categoryEditorValue, setCategoryEditorValue] = useState('')
    const [importPreview, setImportPreview] = useState(null)
    const [restorePreview, setRestorePreview] = useState(null)
    const [toast, setToast] = useState(null)

    const [isImporting, setIsImporting] = useState(false)
    const [isApplyingImport, setIsApplyingImport] = useState(false)
    const [isRestoringBackup, setIsRestoringBackup] = useState(false)
    const [isClearingData, setIsClearingData] = useState(false)
    const [isLoggingOut, setIsLoggingOut] = useState(false)
    const [isDeletingAccount, setIsDeletingAccount] = useState(false)
    const [isUpdatingReminderPrefs, setIsUpdatingReminderPrefs] = useState(false)
    const [isCategorySaving, setIsCategorySaving] = useState(false)

    // User profile edit state
    const [isEditingName, setIsEditingName] = useState(false)
    const [editNameValue, setEditNameValue] = useState('')
    const [isSavingName, setIsSavingName] = useState(false)

    const fileInputRef = useRef(null)
    const restoreInputRef = useRef(null)

    const showToast = (type, message) => {
        setToast({ type, message })
        setTimeout(() => setToast(null), 4000)
    }

    const handleExportJSON = async () => {
        try {
            exportJSON({
                subscriptions,
                categories,
                budget,
                settings: {
                    currency,
                    billTypeByCategory,
                },
                notificationPreferences: preferences,
                themePreference,
            })
        } catch (err) {
            console.error('Export failed:', err)
            showToast('error', 'Export failed')
        }
    }

    const handleImportClick = () => {
        if (isImporting) return
        fileInputRef.current?.click()
    }

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0]
        if (!file) return
        e.target.value = ''

        try {
            setIsImporting(true)
            const text = await file.text()
            const { subscriptions: parsed, errors } = parseCSV(text)

            if (errors.length > 0 && parsed.length === 0) {
                showToast('error', errors[0])
                return
            }
            setImportPreview(buildImportPreview(file.name, parsed, errors, subscriptions, categories))
        } catch (err) {
            console.error('Import failed:', err)
            showToast('error', 'Failed to import CSV')
        } finally {
            setIsImporting(false)
        }
    }

    const applyImportPreview = async () => {
        if (!importPreview || isApplyingImport) return
        try {
            setIsApplyingImport(true)
            if (importPreview.importable.length === 0) {
                showToast('error', 'No new subscriptions to import')
                setImportPreview(null)
                return
            }

            await addSubscriptionsBulk(importPreview.importable)
            const added = importPreview.importable.length
            const skippedRows = importPreview.duplicates.length + importPreview.errors.length
            const msg = skippedRows > 0
                ? `Imported ${added} subscription${added !== 1 ? 's' : ''} (${skippedRows} row${skippedRows !== 1 ? 's' : ''} skipped)`
                : `Imported ${added} subscription${added !== 1 ? 's' : ''} successfully`
            setImportPreview(null)
            showToast('success', msg)
        } catch (err) {
            console.error('Import apply failed:', err)
            showToast('error', 'Failed to import CSV')
        } finally {
            setIsApplyingImport(false)
        }
    }

    const handleRestoreClick = () => {
        if (isRestoringBackup) return
        restoreInputRef.current?.click()
    }

    const handleRestoreFileChange = async (e) => {
        const file = e.target.files?.[0]
        if (!file) return
        e.target.value = ''
        try {
            const text = await file.text()
            const parsed = JSON.parse(text)
            const backupRoot = parsed?.data && typeof parsed.data === 'object' ? parsed.data : parsed
            const subscriptionsBackup = Array.isArray(backupRoot?.subscriptions) ? backupRoot.subscriptions : null
            if (!subscriptionsBackup) {
                showToast('error', 'Invalid backup file: missing subscriptions array')
                return
            }
            const categoriesBackup = Array.isArray(backupRoot?.categories) ? backupRoot.categories : []
            const budgetBackup = backupRoot?.budget && typeof backupRoot.budget === 'object' ? backupRoot.budget : {}
            const settingsBackup = backupRoot?.settings && typeof backupRoot.settings === 'object' ? backupRoot.settings : {}
            const notificationPreferencesBackup = backupRoot?.notificationPreferences && typeof backupRoot.notificationPreferences === 'object'
                ? backupRoot.notificationPreferences
                : null
            setRestorePreview({
                subscriptions: subscriptionsBackup,
                categories: categoriesBackup,
                budget: budgetBackup,
                settings: settingsBackup,
                notificationPreferences: notificationPreferencesBackup,
                counts: {
                    subscriptions: subscriptionsBackup.length,
                    categories: categoriesBackup.length,
                },
                fileName: file.name,
                brand: parsed?.brand || 'Cushn',
                version: parsed?.version || 1,
            })
        } catch (err) {
            console.error('Restore preview failed:', err)
            showToast('error', 'Invalid JSON backup file')
        }
    }

    const applyRestore = async () => {
        if (!restorePreview || isRestoringBackup) return
        try {
            setIsRestoringBackup(true)
            const byNormalizedName = new Map(
                categories.map((cat) => [normalizeName(cat.name), { id: cat.id, name: cat.name }]),
            )
            const backupIdToCategoryName = new Map(
                (restorePreview.categories || []).map((cat) => [String(cat.id), cat.name]),
            )
            const restoredCategoryIdByBackupId = new Map()

            for (const cat of restorePreview.categories || []) {
                const normalized = normalizeName(cat.name)
                if (!normalized) continue
                if (byNormalizedName.has(normalized)) {
                    restoredCategoryIdByBackupId.set(String(cat.id), byNormalizedName.get(normalized)?.id ?? null)
                    continue
                }
                const added = await addCategory({
                    name: cat.name,
                    color: cat.color || pickCategoryColor(byNormalizedName.size),
                    icon: cat.icon || 'tag',
                    isDefault: false,
                })
                if (added?.id) {
                    byNormalizedName.set(normalized, { id: added.id, name: added.name })
                    restoredCategoryIdByBackupId.set(String(cat.id), added.id)
                }
            }

            const fallbackCategoryId = categories[0]?.id || byNormalizedName.values().next().value?.id || null
            const mappedSubscriptions = restorePreview.subscriptions
                .map((sub) => {
                    const backupCatName = backupIdToCategoryName.get(String(sub.categoryId))
                    const resolved = backupCatName ? byNormalizedName.get(normalizeName(backupCatName)) : null
                    return {
                        name: sub.name || 'Imported subscription',
                        amount: Number(sub.amount) || 0,
                        currency: sub.currency || currency,
                        cycle: sub.cycle || 'monthly',
                        categoryId: resolved?.id ?? fallbackCategoryId,
                        renewalDate: sub.renewalDate || new Date().toISOString().slice(0, 10),
                        notes: sub.notes || '',
                        status: sub.status || 'active',
                        startDate: sub.startDate || null,
                        vendorDomain: sub.vendorDomain || null,
                        vendorConfidence: sub.vendorConfidence ?? null,
                        vendorMatchType: sub.vendorMatchType || null,
                    }
                })
                .filter((sub) => sub.amount >= 0 && sub.categoryId != null)

            await clearAllSubscriptions()
            if (mappedSubscriptions.length > 0) {
                await addSubscriptionsBulk(mappedSubscriptions)
            }
            setCurrency(restorePreview.settings?.currency || restorePreview.budget?.currency || currency)
            await saveBudget({
                monthlyGoal: Number(restorePreview.budget?.monthlyGoal) || DEFAULT_BUDGET,
                currency: restorePreview.settings?.currency || restorePreview.budget?.currency || currency,
                categoryLimits: restorePreview.budget?.categoryLimits || {},
            })
            resetBillTypeMapping()
            Object.entries(restorePreview.settings?.billTypeByCategory || {}).forEach(([backupCategoryId, billType]) => {
                const restoredCategoryId = restoredCategoryIdByBackupId.get(String(backupCategoryId))
                if (restoredCategoryId != null && billType) {
                    setCategoryBillType(restoredCategoryId, billType)
                }
            })
            if (restorePreview.settings?.themePreference) {
                setThemePreference(restorePreview.settings.themePreference)
            }
            if (restorePreview.notificationPreferences) {
                await savePreferences(restorePreview.notificationPreferences)
            }
            setRestorePreview(null)
            showToast('success', `Restore complete: ${mappedSubscriptions.length} subscription${mappedSubscriptions.length !== 1 ? 's' : ''}`)
        } catch (err) {
            console.error('Restore failed:', err)
            showToast('error', 'Restore failed')
        } finally {
            setIsRestoringBackup(false)
        }
    }

    const handleClearData = async () => {
        try {
            setIsClearingData(true)
            await clearAllSubscriptions()
            await saveBudget({
                monthlyGoal: DEFAULT_BUDGET,
                currency: budget?.currency || currency,
            })
            setShowClearConfirm(false)
            navigate('/')
        } catch (err) {
            console.error('Clear failed:', err)
            showToast('error', 'Failed to clear data')
        } finally {
            setIsClearingData(false)
        }
    }

    const handleLogout = async () => {
        try {
            setIsLoggingOut(true)
            await logout()
            navigate('/landing', { replace: true })
        } catch (err) {
            console.error('Logout failed:', err)
            showToast('error', err?.message || 'Failed to log out')
        } finally {
            setIsLoggingOut(false)
        }
    }

    const handleDeleteAccount = async () => {
        try {
            setIsDeletingAccount(true)
            await deleteAccount()
            setShowDeleteAccountConfirm(false)
            setDeleteAccountConfirmText('')
            navigate('/landing', { replace: true })
        } catch (err) {
            console.error('Account deletion failed:', err)
            showToast('error', err?.message || 'Failed to delete account')
        } finally {
            setIsDeletingAccount(false)
        }
    }

    const toggleReminders = async () => {
        if (isUpdatingReminderPrefs) return
        try {
            setIsUpdatingReminderPrefs(true)
            const next = !preferences.inAppEnabled
            await savePreferences({ inAppEnabled: next })
            showToast('success', `Renewal reminders ${next ? 'enabled' : 'disabled'}`)
        } catch (err) {
            console.error('Failed to update reminder preference:', err)
            showToast('error', 'Failed to update reminder preference')
        } finally {
            setIsUpdatingReminderPrefs(false)
        }
    }

    const toggleEmailReminders = async () => {
        if (isUpdatingReminderPrefs) return
        try {
            setIsUpdatingReminderPrefs(true)
            const next = !preferences.emailEnabled
            await savePreferences({ emailEnabled: next })
            showToast('success', `Email reminders ${next ? 'enabled' : 'disabled'}`)
        } catch (err) {
            console.error('Failed to update email reminder preference:', err)
            showToast('error', 'Failed to update email reminder preference')
        } finally {
            setIsUpdatingReminderPrefs(false)
        }
    }

    const toggleLeadDay = async (day) => {
        if (isUpdatingReminderPrefs) return
        try {
            setIsUpdatingReminderPrefs(true)
            const current = new Set(preferences.daysBefore || [1, 3])
            if (current.has(day)) current.delete(day)
            else current.add(day)
            const daysBefore = Array.from(current).sort((a, b) => a - b)
            await savePreferences({ daysBefore: daysBefore.length > 0 ? daysBefore : [1] })
        } catch (err) {
            console.error('Failed to update reminder lead days:', err)
            showToast('error', 'Failed to update lead days')
        } finally {
            setIsUpdatingReminderPrefs(false)
        }
    }

    const openAddCategoryModal = () => {
        setCategoryEditorValue('')
        setShowCategoryEditor(true)
    }

    const saveCategoryEditor = async () => {
        if (isCategorySaving) return
        const trimmed = categoryEditorValue.trim()
        if (!trimmed) {
            showToast('error', 'Category name is required')
            return
        }
        if (categories.some((c) => normalizeName(c.name) === normalizeName(trimmed))) {
            showToast('error', 'Category already exists')
            return
        }
        try {
            setIsCategorySaving(true)
            await addCategory({
                name: trimmed,
                color: pickCategoryColor(categories.length),
                icon: 'tag',
                isDefault: false,
            })
            showToast('success', `Added "${trimmed}"`)
            setShowCategoryEditor(false)
        } catch (err) {
            console.error('Category save failed:', err)
            showToast('error', 'Failed to save category')
        } finally {
            setIsCategorySaving(false)
        }
    }

    const getNotificationLabel = () => {
        const active = []
        if (preferences.inAppEnabled) active.push('Push')
        if (preferences.emailEnabled) active.push('Email')
        if (active.length === 0) return 'Off'
        return active.join(', ')
    }

    return (
        <div className="dashboard-page" style={{ background: T.bgSubtle }}>
            <div className="dashboard-container dashboard-stack" style={{ paddingTop: 18 }}>
                <section className="hero-card" style={{ padding: 18, background: T.bgSurface, border: `1px solid ${T.border}` }}>
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <p className="page-eyebrow">Preferences</p>
                            <h1 className="page-title" style={{ fontSize: 'clamp(1.45rem, 4vw, 2.05rem)' }}>Settings</h1>
                        </div>
                    </div>
                    <p className="page-subtitle" style={{ marginTop: 12 }}>Manage your account, appearance, reminders, backup options, and account safety controls.</p>
                </section>

                <SectionTitle>Account</SectionTitle>
                <Card>
                    {isGuest ? (
                        <>
                            <div
                                style={{
                                    padding: '18px 16px',
                                    borderBottom: `1px solid ${T.border}`,
                                    background: `linear-gradient(180deg, ${T.accentSoft}, transparent)`,
                                }}
                            >
                                <div style={{ fontSize: 15, fontWeight: 700, color: T.fgHigh }}>
                                    Guest mode - {userName}
                                </div>
                                <div style={{ fontSize: 12, color: T.fgMedium, marginTop: 6, lineHeight: 1.6 }}>
                                    Your data is local only. Create an account to sync across devices.
                                </div>
                            </div>
                            <SettingRow icon={UserPlus} label="Sign up to sync" accent onClick={() => navigate('/signup')} />
                        </>
                    ) : (
                        <div
                            style={{
                                padding: '18px 16px',
                                background: `linear-gradient(180deg, ${T.accentSoft}, transparent)`,
                            }}
                        >
                            <div className="flex items-center gap-3 justify-between">
                                <div className="flex items-center gap-3 flex-1">
                                    <div
                                        className="flex items-center justify-center rounded-full flex-shrink-0"
                                        style={{ width: 44, height: 44, background: T.accentSoft, border: `1px solid ${T.accentPrimary}33` }}
                                    >
                                        <User size={18} color={T.accentPrimary} />
                                    </div>
                                    <div className="flex-1">
                                        {isEditingName ? (
                                            <div className="flex flex-col gap-2 w-full max-w-xs" style={{ marginTop: 2 }}>
                                                <input
                                                    type="text"
                                                    value={editNameValue}
                                                    onChange={(e) => setEditNameValue(e.target.value)}
                                                    placeholder="Your name"
                                                    disabled={isSavingName}
                                                    className="w-full outline-none"
                                                    style={{
                                                        height: 36,
                                                        background: T.bgSurface,
                                                        border: `1px solid ${T.accentPrimary}44`,
                                                        borderRadius: 8,
                                                        color: T.fgHigh,
                                                        fontSize: 14,
                                                        padding: '0 10px',
                                                        boxSizing: 'border-box'
                                                    }}
                                                    autoFocus
                                                />
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={async () => {
                                                            if (!editNameValue.trim() || editNameValue.trim() === userName) {
                                                                setIsEditingName(false)
                                                                return
                                                            }
                                                            setIsSavingName(true)
                                                            try {
                                                                await updateProfile(editNameValue.trim())
                                                                showToast('success', 'Profile updated')
                                                                setIsEditingName(false)
                                                            } catch (err) {
                                                                console.error(err)
                                                                showToast('error', 'Failed to update name')
                                                            } finally {
                                                                setIsSavingName(false)
                                                            }
                                                        }}
                                                        disabled={isSavingName}
                                                        className="interactive-btn font-mono cursor-pointer border-none"
                                                        style={{
                                                            background: T.accentPrimary,
                                                            color: T.fgOnAccent,
                                                            borderRadius: 6,
                                                            padding: '4px 12px',
                                                            fontSize: 11,
                                                            fontWeight: 700,
                                                            opacity: isSavingName ? 0.6 : 1
                                                        }}
                                                    >
                                                        {isSavingName ? 'Saving...' : 'Save'}
                                                    </button>
                                                    <button
                                                        onClick={() => setIsEditingName(false)}
                                                        disabled={isSavingName}
                                                        className="interactive-btn font-mono cursor-pointer border-none"
                                                        style={{
                                                            background: T.bgGlassStrong,
                                                            border: `1px solid ${T.border}`,
                                                            color: T.fgMedium,
                                                            borderRadius: 6,
                                                            padding: '4px 12px',
                                                            fontSize: 11,
                                                            opacity: isSavingName ? 0.6 : 1
                                                        }}
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <div style={{ fontSize: 15, fontWeight: 700, color: T.fgHigh }}>{userName}</div>
                                                <button
                                                    onClick={() => {
                                                        setEditNameValue(userName)
                                                        setIsEditingName(true)
                                                    }}
                                                    className="interactive-btn cursor-pointer"
                                                    style={{ background: 'transparent', border: 'none', padding: 2, display: 'flex' }}
                                                    title="Edit Name"
                                                >
                                                    <Pencil size={12} color={T.fgSubtle} />
                                                </button>
                                            </div>
                                        )}
                                        {!isEditingName && (
                                            <div className="font-mono" style={{ fontSize: 10, color: T.fgSubtle, marginTop: 3 }}>
                                                {session?.user?.email || 'Authenticated'}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {!isEditingName && (
                                    <div className="flex flex-col items-end gap-1">
                                        <div className="font-mono" style={{ fontSize: 11, color: T.accentPrimary, background: T.accentSoft, padding: '5px 8px', borderRadius: 999 }}>
                                            Synced
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </Card>

                <SectionTitle>Preferences</SectionTitle>
                <Card>
                    <SettingRow icon={Globe} label="Currency" value={currency} onClick={() => setShowCurrencySheet(true)} />
                    <SettingRow
                        icon={theme === 'dark' ? Moon : Sun}
                        label="Theme"
                        value={themePreference === 'system' ? 'System default' : themePreference.charAt(0).toUpperCase() + themePreference.slice(1)}
                        onClick={() => setShowThemeSheet(true)}
                        accent
                        last
                    />
                </Card>

                <SectionTitle>Notifications</SectionTitle>
                <Card>
                    <SettingRow
                        icon={Bell}
                        label="Renewal Alerts"
                        value={getNotificationLabel()}
                        onClick={() => setShowNotificationsSheet(true)}
                        disabled={isUpdatingReminderPrefs}
                        last
                    />
                </Card>

                <SectionTitle>Data & Backup</SectionTitle>
                <Card>
                    <SettingRow icon={Download} label="Export Cushn backup" onClick={handleExportJSON} />
                    <SettingRow
                        icon={Upload}
                        label="Import subscriptions from CSV"
                        value={isImporting ? 'Preparing preview...' : 'Preview before import'}
                        accent
                        onClick={handleImportClick}
                        disabled={isImporting}
                    />
                    <SettingRow
                        icon={RotateCcw}
                        label="Restore Cushn backup"
                        value={isRestoringBackup ? 'Restoring...' : null}
                        accent
                        onClick={handleRestoreClick}
                        disabled={isRestoringBackup}
                        last
                    />
                </Card>

                <SectionTitle>Categories</SectionTitle>
                <Card>
                    <button
                        onClick={openAddCategoryModal}
                        className="interactive-btn w-full flex items-center gap-3 cursor-pointer"
                        style={{
                            background: 'transparent',
                            border: 'none',
                            borderBottom: `1px solid ${T.border}`,
                            padding: '14px 16px',
                            color: T.accentPrimary,
                            fontFamily: 'monospace',
                            fontSize: 12,
                        }}
                    >
                        <Plus size={14} /> Add custom category
                    </button>
                    <div style={{ padding: '14px 16px', color: T.fgMedium, fontSize: 12, lineHeight: 1.6 }}>
                        Add custom categories when you need them. Default categories are already available across the app.
                    </div>
                </Card>

                <SectionTitle>Danger Zone</SectionTitle>
                <div className="surface-card" style={{ overflow: 'hidden', background: T.statusErrorBg, boxShadow: 'none', borderColor: `${T.semDanger}22` }}>
                    {isGuest ? (
                        <SettingRow
                            icon={Trash2}
                            label="Clear all subscriptions"
                            value="Deletes subscriptions and resets budget"
                            danger
                            onClick={() => setShowClearConfirm(true)}
                            disabled={isClearingData}
                        />
                    ) : (
                        <SettingRow
                            icon={Trash2}
                            label="Delete account"
                            value="Deletes your backend data and account permanently"
                            danger
                            onClick={() => {
                                setDeleteAccountConfirmText('')
                                setShowDeleteAccountConfirm(true)
                            }}
                            disabled={isDeletingAccount}
                        />
                    )}
                    <SettingRow
                        icon={LogOut}
                        label={isLoggingOut ? 'Logging out...' : 'Log out'}
                        danger
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        last
                    />
                </div>

                <div
                    className="font-mono"
                    style={{
                        padding: '2px 4px 10px',
                        textAlign: 'center',
                        fontSize: 10,
                        color: T.fgSubtle,
                    }}
                >
                    Cushn v{import.meta.env.VITE_APP_VERSION || '1.0.0'}
                </div>
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                style={{ display: 'none' }}
                onChange={handleFileChange}
            />
            <input
                ref={restoreInputRef}
                type="file"
                accept=".json,application/json"
                style={{ display: 'none' }}
                onChange={handleRestoreFileChange}
            />

            <BottomSheet open={showCurrencySheet} onClose={() => setShowCurrencySheet(false)}>
                <div style={{ padding: '0 20px 20px' }}>
                    <div className="flex items-start justify-between gap-3 mb-4">
                        <h3 className="font-bold" style={{ fontSize: 18, color: T.fgHigh }}>
                            Select Currency
                        </h3>
                        <button
                            onClick={() => setShowCurrencySheet(false)}
                            className="interactive-btn flex items-center justify-center rounded-full cursor-pointer"
                            aria-label="Close currency selection"
                            style={{
                                width: 28,
                                height: 28,
                                borderRadius: 999,
                                border: `1px solid ${T.border}`,
                                background: T.bgElevated,
                                color: T.fgMedium,
                                flexShrink: 0,
                            }}
                        >
                            <X size={14} />
                        </button>
                    </div>
                    <div className="flex flex-col gap-2">
                        {SUPPORTED_CURRENCIES.map((c) => (
                            <button
                                key={c.code}
                                onClick={() => {
                                    setCurrency(c.code)
                                    setShowCurrencySheet(false)
                                }}
                                className="flex items-center justify-between p-3 rounded-xl border border-transparent cursor-pointer"
                                style={{
                                    background: currency === c.code ? T.accentPrimary + '11' : T.bgSurface,
                                    borderColor: currency === c.code ? T.accentPrimary : T.border,
                                }}
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className="flex items-center justify-center rounded-full font-mono font-bold"
                                        style={{
                                            width: 36,
                                            height: 36,
                                            background: currency === c.code ? T.accentPrimary : T.bgElevated,
                                            color: currency === c.code ? '#fff' : T.fgHigh,
                                        }}
                                    >
                                        {c.symbol}
                                    </div>
                                    <span className="font-medium" style={{ fontSize: 15, color: T.fgHigh }}>
                                        {c.code}
                                    </span>
                                </div>
                                <span className="font-mono" style={{ fontSize: 13, color: T.fgSubtle }}>
                                    {c.label}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            </BottomSheet>

            <BottomSheet open={showThemeSheet} onClose={() => setShowThemeSheet(false)}>
                <div style={{ padding: '0 20px 20px' }}>
                    <div className="flex items-start justify-between gap-3 mb-4">
                        <h3 className="font-bold" style={{ fontSize: 18, color: T.fgHigh }}>
                            Appearance
                        </h3>
                        <button
                            onClick={() => setShowThemeSheet(false)}
                            className="interactive-btn flex items-center justify-center rounded-full cursor-pointer"
                            aria-label="Close theme selection"
                            style={{
                                width: 28,
                                height: 28,
                                borderRadius: 999,
                                border: `1px solid ${T.border}`,
                                background: T.bgElevated,
                                color: T.fgMedium
                            }}
                        >
                            <span style={{ fontSize: 16 }}>&times;</span>
                        </button>
                    </div>
                    <div className="flex flex-col gap-2">
                        {[
                            { id: 'system', label: 'System default' },
                            { id: 'dark', label: 'Dark' },
                            { id: 'light', label: 'Light' }
                        ].map((opt) => (
                            <button
                                key={opt.id}
                                className="interactive-btn flex items-center justify-between w-full cursor-pointer text-left"
                                style={{
                                    padding: '16px',
                                    background: themePreference === opt.id ? `${T.accentPrimary}1A` : 'transparent',
                                    border: `1px solid ${themePreference === opt.id ? T.accentPrimary : T.border}`,
                                    borderRadius: 12,
                                    color: themePreference === opt.id ? T.accentPrimary : T.fgHigh,
                                }}
                                onClick={() => {
                                    setThemePreference(opt.id)
                                    setShowThemeSheet(false)
                                }}
                            >
                                <span style={{ fontSize: 16, fontWeight: 500 }}>{opt.label}</span>
                                {themePreference === opt.id && <CheckCircle size={20} color={T.accentPrimary} />}
                            </button>
                        ))}
                    </div>
                </div>
            </BottomSheet>

            <BottomSheet open={showNotificationsSheet} onClose={() => setShowNotificationsSheet(false)}>
                <div style={{ padding: '0 20px 20px' }}>
                    <div className="flex items-start justify-between gap-3 mb-6">
                        <h3 className="font-bold" style={{ fontSize: 18, color: T.fgHigh }}>
                            Renewal Alerts
                        </h3>
                        <button
                            onClick={() => setShowNotificationsSheet(false)}
                            className="interactive-btn flex items-center justify-center rounded-full cursor-pointer"
                            aria-label="Close notification settings"
                            style={{
                                width: 28,
                                height: 28,
                                borderRadius: 999,
                                border: `1px solid ${T.border}`,
                                background: T.bgElevated,
                                color: T.fgMedium
                            }}
                        >
                            <span style={{ fontSize: 16 }}>&times;</span>
                        </button>
                    </div>

                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <div style={{ fontSize: 15, fontWeight: 600, color: T.fgHigh }}>Push Notifications</div>
                                <div style={{ fontSize: 12, color: T.fgSubtle, marginTop: 4 }}>In-app delivery center</div>
                            </div>
                            <button
                                onClick={toggleReminders}
                                disabled={isUpdatingReminderPrefs}
                                className="interactive-btn"
                                style={{
                                    width: 44,
                                    height: 24,
                                    borderRadius: 999,
                                    position: 'relative',
                                    border: 'none',
                                    background: preferences.inAppEnabled ? T.accentPrimary : T.bgGlassStrong,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    opacity: isUpdatingReminderPrefs ? 0.6 : 1,
                                }}
                            >
                                <div
                                    style={{
                                        position: 'absolute',
                                        top: 2,
                                        left: preferences.inAppEnabled ? 22 : 2,
                                        width: 20,
                                        height: 20,
                                        borderRadius: '50%',
                                        background: '#fff',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
                                    }}
                                />
                            </button>
                        </div>

                        <div className="flex items-center justify-between mt-2 pt-4" style={{ borderTop: `1px solid ${T.border}` }}>
                            <div>
                                <div style={{ fontSize: 15, fontWeight: 600, color: T.fgHigh }}>Email Alerts</div>
                                <div style={{ fontSize: 12, color: T.fgSubtle, marginTop: 4 }}>Delivery to {session?.user?.email || 'your account default'}</div>
                            </div>
                            <button
                                onClick={toggleEmailReminders}
                                disabled={isUpdatingReminderPrefs}
                                className="interactive-btn"
                                style={{
                                    width: 44,
                                    height: 24,
                                    borderRadius: 999,
                                    position: 'relative',
                                    border: 'none',
                                    background: preferences.emailEnabled ? T.accentPrimary : T.bgGlassStrong,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    opacity: isUpdatingReminderPrefs ? 0.6 : 1,
                                }}
                            >
                                <div
                                    style={{
                                        position: 'absolute',
                                        top: 2,
                                        left: preferences.emailEnabled ? 22 : 2,
                                        width: 20,
                                        height: 20,
                                        borderRadius: '50%',
                                        background: '#fff',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
                                    }}
                                />
                            </button>
                        </div>

                        <div className="mt-4 pt-4" style={{ borderTop: `1px solid ${T.border}` }}>
                            <div className="font-bold" style={{ fontSize: 15, color: T.fgHigh, mb: 12 }}>
                                Reminder timing
                            </div>
                            <div className="font-mono mt-2" style={{ fontSize: 12, color: T.fgSubtle, marginBottom: 12 }}>
                                Select when you want us to alert you.
                            </div>
                            <div className="flex gap-2 flex-wrap">
                                {[1, 3, 7].map((day) => {
                                    const selected = (preferences.daysBefore || [1, 3]).includes(day)
                                    return (
                                        <button
                                            key={day}
                                            onClick={() => toggleLeadDay(day)}
                                            disabled={isUpdatingReminderPrefs}
                                            className="interactive-btn cursor-pointer font-mono"
                                            style={{
                                                background: selected ? T.accentSoft : T.bgGlassStrong,
                                                border: `1px solid ${selected ? T.accentPrimary : T.border}`,
                                                color: selected ? T.accentPrimary : T.fgMedium,
                                                borderRadius: 999,
                                                fontSize: 12,
                                                padding: '8px 14px',
                                                opacity: isUpdatingReminderPrefs ? 0.6 : 1,
                                            }}
                                        >
                                            {day} day{day !== 1 ? 's' : ''} before
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </BottomSheet>

            {showClearConfirm && (
                <div
                    className="fixed inset-0 flex items-center justify-center z-50"
                    style={{ background: 'rgba(0,0,0,0.7)' }}
                    onClick={() => setShowClearConfirm(false)}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            background: T.bgElevated,
                            borderRadius: 14,
                            padding: 24,
                            margin: '0 20px',
                            maxWidth: 340,
                            width: '100%',
                            border: `1px solid ${T.border}`,
                        }}
                    >
                        <div className="font-bold" style={{ fontSize: 16, color: T.fgHigh, marginBottom: 8 }}>
                            Clear all data?
                        </div>
                        <div className="font-mono" style={{ fontSize: 12, color: T.fgMedium, marginBottom: 20, lineHeight: 1.5 }}>
                            This deletes all subscriptions and resets your budget.
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowClearConfirm(false)}
                                className="flex-1 cursor-pointer"
                                style={{
                                    background: T.bgElevated,
                                    border: `1px solid ${T.border}`,
                                    borderRadius: 8,
                                    padding: '10px',
                                    fontSize: 13,
                                    color: T.fgHigh,
                                    fontFamily: 'monospace',
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleClearData}
                                className="flex-1 cursor-pointer"
                                disabled={isClearingData}
                                style={{
                                    background: T.semDanger,
                                    border: 'none',
                                    borderRadius: 8,
                                    padding: '10px',
                                    fontSize: 13,
                                    color: T.fgHigh,
                                    fontFamily: 'monospace',
                                    opacity: isClearingData ? 0.6 : 1,
                                }}
                            >
                                {isClearingData ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showDeleteAccountConfirm && (
                <div
                    className="fixed inset-0 flex items-center justify-center z-50"
                    style={{ background: 'rgba(0,0,0,0.7)' }}
                    onClick={() => {
                        if (!isDeletingAccount) setShowDeleteAccountConfirm(false)
                    }}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            background: T.bgElevated,
                            borderRadius: 14,
                            padding: 24,
                            margin: '0 20px',
                            maxWidth: 360,
                            width: '100%',
                            border: `1px solid ${T.border}`,
                        }}
                    >
                        <div className="font-bold" style={{ fontSize: 16, color: T.fgHigh, marginBottom: 8 }}>
                            Delete account permanently?
                        </div>
                        <div className="font-mono" style={{ fontSize: 12, color: T.fgMedium, marginBottom: 20, lineHeight: 1.5 }}>
                            This deletes your Cushn account and all synced backend data, including subscriptions, categories, budget, and reminder preferences. This cannot be undone.
                        </div>
                        <div className="font-mono" style={{ fontSize: 11, color: T.fgSubtle, marginBottom: 8 }}>
                            Type DELETE to confirm
                        </div>
                        <input
                            value={deleteAccountConfirmText}
                            onChange={(e) => setDeleteAccountConfirmText(e.target.value)}
                            placeholder="DELETE"
                            autoFocus
                            className="w-full outline-none font-mono"
                            style={{
                                height: 40,
                                background: T.bgSurface,
                                border: `1px solid ${T.border}`,
                                borderRadius: 8,
                                color: T.fgHigh,
                                fontSize: 12,
                                padding: '0 12px',
                                marginBottom: 20,
                            }}
                        />
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowDeleteAccountConfirm(false)
                                    setDeleteAccountConfirmText('')
                                }}
                                className="flex-1 cursor-pointer"
                                disabled={isDeletingAccount}
                                style={{
                                    background: T.bgElevated,
                                    border: `1px solid ${T.border}`,
                                    borderRadius: 8,
                                    padding: '10px',
                                    fontSize: 13,
                                    color: T.fgHigh,
                                    fontFamily: 'monospace',
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteAccount}
                                className="flex-1 cursor-pointer"
                                disabled={isDeletingAccount || deleteAccountConfirmText !== 'DELETE'}
                                style={{
                                    background: T.semDanger,
                                    border: 'none',
                                    borderRadius: 8,
                                    padding: '10px',
                                    fontSize: 13,
                                    color: T.fgHigh,
                                    fontFamily: 'monospace',
                                    opacity: (isDeletingAccount || deleteAccountConfirmText !== 'DELETE') ? 0.6 : 1,
                                }}
                            >
                                {isDeletingAccount ? 'Deleting...' : 'Delete account'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showCategoryEditor && (
                <div
                    className="fixed inset-0 flex items-center justify-center z-50"
                    style={{ background: 'rgba(0,0,0,0.7)' }}
                    onClick={() => {
                        if (!isCategorySaving) setShowCategoryEditor(false)
                    }}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            background: T.bgElevated,
                            borderRadius: 14,
                            padding: 20,
                            margin: '0 20px',
                            maxWidth: 360,
                            width: '100%',
                            border: `1px solid ${T.border}`,
                        }}
                    >
                        <div className="font-bold" style={{ fontSize: 16, color: T.fgHigh, marginBottom: 8 }}>
                            Add category
                        </div>
                        <input
                            autoFocus
                            value={categoryEditorValue}
                            onChange={(e) => setCategoryEditorValue(e.target.value)}
                            placeholder="Category name"
                            className="w-full outline-none font-mono"
                            style={{
                                height: 40,
                                background: T.bgSurface,
                                border: `1px solid ${T.border}`,
                                borderRadius: 8,
                                color: T.fgHigh,
                                fontSize: 12,
                                padding: '0 12px',
                                marginBottom: 14,
                            }}
                        />
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowCategoryEditor(false)}
                                className="flex-1 cursor-pointer"
                                disabled={isCategorySaving}
                                style={{
                                    background: T.bgElevated,
                                    border: `1px solid ${T.border}`,
                                    borderRadius: 8,
                                    padding: '10px',
                                    fontSize: 13,
                                    color: T.fgHigh,
                                    fontFamily: 'monospace',
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={saveCategoryEditor}
                                className="flex-1 cursor-pointer"
                                disabled={isCategorySaving}
                                style={{
                                    background: T.accentPrimary,
                                    border: 'none',
                                    borderRadius: 8,
                                    padding: '10px',
                                    fontSize: 13,
                                    color: '#fff',
                                    fontFamily: 'monospace',
                                    opacity: isCategorySaving ? 0.6 : 1,
                                }}
                            >
                                {isCategorySaving ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {restorePreview && (
                <div
                    className="fixed inset-0 flex items-center justify-center z-50"
                    style={{ background: 'rgba(0,0,0,0.7)' }}
                    onClick={() => {
                        if (!isRestoringBackup) setRestorePreview(null)
                    }}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            background: T.bgElevated,
                            borderRadius: 14,
                            padding: 22,
                            margin: '0 20px',
                            maxWidth: 380,
                            width: '100%',
                            border: `1px solid ${T.border}`,
                        }}
                    >
                        <div className="font-bold" style={{ fontSize: 16, color: T.fgHigh, marginBottom: 6 }}>
                            Restore {restorePreview.brand || 'Cushn'} Backup
                        </div>
                        <div className="font-mono" style={{ fontSize: 10, color: T.fgSubtle, marginBottom: 12 }}>
                            {restorePreview.fileName} · v{restorePreview.version || 1}
                        </div>
                        <div className="font-mono" style={{ fontSize: 12, color: T.fgMedium, lineHeight: 1.6, marginBottom: 16 }}>
                            Subscriptions: {restorePreview.counts.subscriptions}<br />
                            Categories in backup: {restorePreview.counts.categories}<br />
                            Budget goal: {restorePreview.budget?.monthlyGoal ?? DEFAULT_BUDGET}<br />
                            Currency: {restorePreview.settings?.currency || restorePreview.budget?.currency || currency}<br />
                            Theme: {restorePreview.settings?.themePreference || themePreference}<br />
                            Notifications: {restorePreview.notificationPreferences ? 'included' : 'not included'}
                        </div>
                        <div className="font-mono" style={{ fontSize: 10, color: T.semWarning, marginBottom: 18 }}>
                            This replaces current subscriptions and budget, and restores app preferences when available. Missing categories will be added.
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setRestorePreview(null)}
                                className="flex-1 cursor-pointer"
                                disabled={isRestoringBackup}
                                style={{
                                    background: T.bgElevated,
                                    border: `1px solid ${T.border}`,
                                    borderRadius: 8,
                                    padding: '10px',
                                    fontSize: 13,
                                    color: T.fgHigh,
                                    fontFamily: 'monospace',
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={applyRestore}
                                className="flex-1 cursor-pointer"
                                disabled={isRestoringBackup}
                                style={{
                                    background: T.accentPrimary,
                                    border: 'none',
                                    borderRadius: 8,
                                    padding: '10px',
                                    fontSize: 13,
                                    color: '#fff',
                                    fontFamily: 'monospace',
                                    opacity: isRestoringBackup ? 0.6 : 1,
                                }}
                            >
                                {isRestoringBackup ? 'Restoring...' : 'Restore now'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <BottomSheet open={!!importPreview} onClose={() => !isApplyingImport && setImportPreview(null)} height="82%">
                {importPreview && (
                    <div style={{ padding: '0 20px 20px' }}>
                        <div className="flex items-start justify-between gap-3 mb-4">
                            <div>
                                <h3 className="font-bold" style={{ fontSize: 18, color: T.fgHigh }}>
                                    Import Preview
                                </h3>
                                <div className="font-mono" style={{ fontSize: 11, color: T.fgSubtle, marginTop: 4 }}>
                                    {importPreview.fileName}
                                </div>
                            </div>
                            <button
                                onClick={() => setImportPreview(null)}
                                disabled={isApplyingImport}
                                className="interactive-btn flex items-center justify-center rounded-full cursor-pointer"
                                style={{
                                    width: 28,
                                    height: 28,
                                    borderRadius: 999,
                                    border: `1px solid ${T.border}`,
                                    background: T.bgElevated,
                                    color: T.fgMedium,
                                }}
                            >
                                <X size={14} />
                            </button>
                        </div>

                        <div className="grid grid-cols-3 gap-2" style={{ marginBottom: 14 }}>
                            {[
                                { label: 'Ready', value: `${importPreview.importable.length}`, color: T.semSuccess },
                                { label: 'Duplicates', value: `${importPreview.duplicates.length}`, color: T.semWarning },
                                { label: 'Errors', value: `${importPreview.errors.length}`, color: T.semDanger },
                            ].map((item) => (
                                <div key={item.label} className="surface-card-muted" style={{ padding: 12, borderLeft: `3px solid ${item.color}` }}>
                                    <div className="font-mono" style={{ fontSize: 9, color: T.fgSubtle }}>{item.label}</div>
                                    <div className="font-mono font-bold" style={{ fontSize: 18, color: item.color, marginTop: 6 }}>{item.value}</div>
                                </div>
                            ))}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: '52vh', overflowY: 'auto' }}>
                            {importPreview.rows.map((row, index) => (
                                <div
                                    key={`${row.name}-${index}`}
                                    className="surface-card-muted"
                                    style={{
                                        padding: 12,
                                        border: `1px solid ${row.status === 'ready' ? T.border : row.status === 'duplicate' ? `${T.semWarning}44` : `${T.semDanger}33`}`,
                                    }}
                                >
                                    <div className="flex items-center gap-3">
                                        <ServiceLogo name={row.name} domain={row.vendorDomain} size={30} catColor={T.accentPrimary} radius={8} />
                                        <div className="flex-1">
                                            <div style={{ fontSize: 14, fontWeight: 700, color: T.fgHigh }}>{row.name}</div>
                                            <div className="font-mono" style={{ fontSize: 10, color: T.fgSubtle, marginTop: 3 }}>
                                                {row.category || 'Other'} · {row.cycle || 'monthly'} · {row.currency || currency}
                                            </div>
                                        </div>
                                        <div className="font-mono" style={{ fontSize: 10, color: row.status === 'ready' ? T.semSuccess : row.status === 'duplicate' ? T.semWarning : T.semDanger }}>
                                            {row.status}
                                        </div>
                                    </div>
                                    <div className="flex gap-2 flex-wrap" style={{ marginTop: 10 }}>
                                        {row.amount !== '' && (
                                            <span className="font-mono" style={{ fontSize: 11, color: T.accentPrimary }}>
                                                {row.amount}
                                            </span>
                                        )}
                                        {row.vendorDomain && (
                                            <span className="font-mono" style={{ fontSize: 10, color: T.fgSubtle }}>
                                                {row.vendorDomain}
                                            </span>
                                        )}
                                        {row.reason && (
                                            <span className="font-mono" style={{ fontSize: 10, color: row.status === 'duplicate' ? T.semWarning : T.semDanger }}>
                                                {row.reason}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-2" style={{ marginTop: 16 }}>
                            <button
                                onClick={() => setImportPreview(null)}
                                className="flex-1 cursor-pointer"
                                disabled={isApplyingImport}
                                style={{
                                    background: T.bgElevated,
                                    border: `1px solid ${T.border}`,
                                    borderRadius: 10,
                                    padding: '11px 12px',
                                    fontSize: 13,
                                    color: T.fgHigh,
                                    fontFamily: 'monospace',
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={applyImportPreview}
                                className="flex-1 cursor-pointer"
                                disabled={isApplyingImport || importPreview.importable.length === 0}
                                style={{
                                    background: T.accentPrimary,
                                    border: 'none',
                                    borderRadius: 10,
                                    padding: '11px 12px',
                                    fontSize: 13,
                                    color: '#fff',
                                    fontFamily: 'monospace',
                                    opacity: isApplyingImport || importPreview.importable.length === 0 ? 0.6 : 1,
                                }}
                            >
                                {isApplyingImport ? 'Importing...' : `Import ${importPreview.importable.length}`}
                            </button>
                        </div>
                    </div>
                )}
            </BottomSheet>

            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 40 }}
                        style={{
                            position: 'fixed',
                            bottom: 94,
                            left: 16,
                            right: 16,
                            zIndex: 60,
                            background: T.bgElevated,
                            border: `1px solid ${toast.type === 'success' ? T.accentPrimary : T.semDanger}33`,
                            borderRadius: 16,
                            padding: '12px 16px',
                            boxShadow: T.shadowLg,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                        }}
                    >
                        {toast.type === 'success'
                            ? <CheckCircle size={16} color={T.accentPrimary} />
                            : <AlertTriangle size={16} color={T.semDanger} />}
                        <span className="font-mono" style={{ fontSize: 12, color: toast.type === 'success' ? T.fgHigh : T.semDanger }}>
                            {toast.message}
                        </span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

function findCategoryForImport(rawCategory, categories) {
    if (!categories?.length) return null
    const normalized = (rawCategory || '').trim().toLowerCase()
    if (normalized) {
        const exact = categories.find((c) => c.name.trim().toLowerCase() === normalized)
        if (exact) return exact
    }
    return categories.find((c) => c.name.toLowerCase() === 'other') || categories[0]
}

function normalizeName(name) {
    return (name || '').trim().toLowerCase()
}

function pickCategoryColor(seed) {
    const colors = ['#0D9488', '#60A5FA', '#A78BFA', '#F97316', '#34D399', '#F87171', '#FBBF24']
    return colors[seed % colors.length]
}

function buildImportPreview(fileName, parsed, errors, existingSubscriptions, categories) {
    const today = new Date().toISOString().slice(0, 10)
    const rows = parsed.map((sub) => {
        const enriched = enrichSubscriptionCandidate(sub)
        const duplicate = findPotentialDuplicate(enriched, existingSubscriptions)
        const category = findCategoryForImport(enriched.category, categories)
        return {
            ...enriched,
            categoryId: category?.id ?? categories[0]?.id ?? null,
            renewalDate: enriched.renewalDate || today,
            status: duplicate ? 'duplicate' : 'ready',
            reason: duplicate ? `Matches existing "${duplicate.name}"` : null,
        }
    })

    const importable = rows
        .filter((row) => row.status === 'ready' && row.categoryId != null)
        .map((row) => ({
            name: row.name,
            amount: row.amount,
            currency: row.currency,
            cycle: row.cycle,
            categoryId: row.categoryId,
            renewalDate: row.renewalDate,
            notes: row.notes,
            vendorDomain: row.vendorDomain,
            vendorConfidence: row.vendorConfidence,
            vendorMatchType: row.vendorMatchType,
        }))

    const errorRows = errors.map((message) => ({
        name: 'Skipped row',
        amount: '',
        currency: '',
        cycle: '',
        category: '',
        vendorDomain: null,
        status: 'error',
        reason: message,
    }))

    return {
        fileName,
        rows: [...rows, ...errorRows],
        importable,
        duplicates: rows.filter((row) => row.status === 'duplicate'),
        errors,
    }
}
