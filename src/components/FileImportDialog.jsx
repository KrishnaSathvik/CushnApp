import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, FileText, Loader2, Search, Sparkles, X } from 'lucide-react'
import ServiceLogo from './ServiceLogo'
import Chip from './Chip'
import { useTheme } from '../context/ThemeContext'
import { useSettings } from '../context/SettingsContext'
import { formatCurrency } from '../lib/formatCurrency'
import { normalizeToMonthly } from '../lib/normalizeAmount'
import { enrichSubscriptionCandidate, findPotentialDuplicate } from '../lib/vendorEnrichment'
import { getCategoryColor } from '../lib/tokens'

function buildSteps(stage) {
    const extractDone = stage !== 'extracting'
    const parseDone = stage === 'done' || stage === 'empty' || stage === 'error'
    const reviewDone = stage === 'done' || stage === 'empty'

    return [
        {
            key: 'extract',
            label: 'Extracting readable text',
            state: stage === 'extracting' ? 'active' : extractDone ? 'complete' : 'pending',
        },
        {
            key: 'parse',
            label: 'Analyzing recurring charges',
            state: stage === 'parsing' ? 'active' : parseDone ? 'complete' : 'pending',
        },
        {
            key: 'review',
            label: stage === 'empty' ? 'Final result ready' : 'Reviewing findings',
            state: reviewDone ? 'complete' : 'pending',
        },
    ]
}

function StepIcon({ step, T }) {
    if (step.state === 'complete') return <CheckCircle2 size={15} color={T.semSuccess} />
    if (step.state === 'active') return <Loader2 size={15} color={T.accentPrimary} className="animate-spin" />
    return <Search size={15} color={T.fgTertiary} />
}

export default function FileImportDialog({
    open,
    stage,
    fileNames = [],
    imagePreviews = [],
    extractedText = '',
    findings = [],
    error = '',
    categories = [],
    existingSubscriptions = [],
    onClose,
    onConfirm,
}) {
    const { T, isDark } = useTheme()
    const { currency } = useSettings()
    const [subs, setSubs] = useState(findings)
    const steps = useMemo(() => buildSteps(stage), [stage])

    useEffect(() => {
        setSubs(findings)
    }, [findings])

    const enrichedExisting = useMemo(() => (
        existingSubscriptions.map((item) => enrichSubscriptionCandidate(item))
    ), [existingSubscriptions])

    const totalMonthly = subs.reduce((sum, item) => sum + normalizeToMonthly(item.amount, item.cycle), 0)

    const getDuplicate = (sub) => findPotentialDuplicate(sub, enrichedExisting)
    const getCatColor = (cat) => {
        const dbCat = categories.find((item) => item.name === cat)
        return dbCat?.color || getCategoryColor(cat, isDark)
    }

    const previewText = extractedText.trim().slice(0, 1200)
    const lineCount = extractedText ? extractedText.split('\n').filter(Boolean).length : 0
    const charCount = extractedText ? extractedText.length : 0

    return (
        <AnimatePresence>
            {open && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-40"
                        style={{ background: 'rgba(0,0,0,0.68)' }}
                    />

                    <motion.div
                        initial={{ opacity: 0, y: 24, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 24, scale: 0.98 }}
                        transition={{ type: 'spring', stiffness: 280, damping: 26 }}
                        className="fixed inset-x-2 sm:inset-x-4 z-50"
                        style={{
                            top: 'max(76px, calc(env(safe-area-inset-top) + 8px))',
                            bottom: 'max(8px, env(safe-area-inset-bottom))',
                            maxWidth: 760,
                            margin: '0 auto',
                        }}
                    >
                        <div
                            className="surface-card"
                            style={{
                                height: '100%',
                                background: T.bgGlassStrong,
                                border: `1px solid ${T.border}`,
                                borderRadius: 22,
                                display: 'flex',
                                flexDirection: 'column',
                                overflow: 'hidden',
                            }}
                        >
                            <div
                                className="flex items-start justify-between gap-3"
                                style={{ padding: '13px 13px 11px', borderBottom: `1px solid ${T.border}` }}
                            >
                                <div>
                                    <div className="section-label">Import Review</div>
                                    <h2 className="section-title" style={{ marginTop: 6 }}>
                                        Review uploaded statement
                                    </h2>
                                    <p className="section-copy" style={{ marginTop: 5, maxWidth: 520, fontSize: 13 }}>
                                        We extract readable text first, then analyze only recurring charges. Nothing from your file is added until you confirm it here.
                                    </p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="interactive-btn cursor-pointer border-none"
                                    style={{
                                        width: 32,
                                        height: 32,
                                        borderRadius: 999,
                                        background: T.bgElevated,
                                        color: T.fgSecondary,
                                        border: `1px solid ${T.border}`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            <div
                                className="dashboard-stack"
                                style={{
                                    flex: 1,
                                    minHeight: 0,
                                    overflowY: 'auto',
                                    padding: 10,
                                }}
                            >
                                <div className="surface-card-muted" style={{ padding: 14 }}>
                                    <div className="section-header" style={{ marginBottom: 10 }}>
                                        <div>
                                            <div className="section-label">Files</div>
                                            <h3 className="section-title">Selected upload</h3>
                                        </div>
                                    </div>
                                    <div className="pill-group">
                                        {fileNames.map((name) => (
                                            <div
                                                key={name}
                                                className="font-mono"
                                                style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: 6,
                                                    padding: '7px 10px',
                                                    borderRadius: 999,
                                                    background: T.bgSurface,
                                                    border: `1px solid ${T.border}`,
                                                    fontSize: 10,
                                                    color: T.fgSecondary,
                                                }}
                                            >
                                                <FileText size={12} />
                                                {name}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {imagePreviews.length > 0 && (
                                    <div className="surface-card-muted" style={{ padding: 14 }}>
                                        <div className="section-header" style={{ marginBottom: 12 }}>
                                            <div>
                                                <div className="section-label">Images</div>
                                                <h3 className="section-title">Uploaded previews</h3>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                                            {imagePreviews.map((image) => (
                                                <div
                                                    key={image.url}
                                                    className="surface-card"
                                                    style={{
                                                        overflow: 'hidden',
                                                        background: T.bgSurface,
                                                    }}
                                                >
                                                    <img
                                                        src={image.url}
                                                        alt={image.name}
                                                        style={{
                                                            width: '100%',
                                                            aspectRatio: '1 / 1',
                                                            objectFit: 'cover',
                                                            display: 'block',
                                                        }}
                                                    />
                                                    <div
                                                        className="font-mono"
                                                        style={{
                                                            padding: '8px 9px',
                                                            fontSize: 9,
                                                            color: T.fgSecondary,
                                                            borderTop: `1px solid ${T.border}`,
                                                            whiteSpace: 'nowrap',
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                        }}
                                                    >
                                                        {image.name}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="surface-card-muted" style={{ padding: 14 }}>
                                    <div className="section-header" style={{ marginBottom: 12 }}>
                                        <div>
                                            <div className="section-label">Progress</div>
                                            <h3 className="section-title">Import pipeline</h3>
                                        </div>
                                    </div>
                                    <div className="dashboard-stack" style={{ gap: 10 }}>
                                        {steps.map((step) => (
                                            <div
                                                key={step.key}
                                                className="flex items-center gap-3"
                                                style={{
                                                    padding: '9px 11px',
                                                    borderRadius: 14,
                                                    background: step.state === 'active' ? `${T.accentPrimary}12` : T.bgSurface,
                                                    border: `1px solid ${step.state === 'active' ? `${T.accentPrimary}44` : T.border}`,
                                                }}
                                            >
                                                <StepIcon step={step} T={T} />
                                                <div style={{ fontSize: 13, color: step.state === 'active' ? T.fgPrimary : T.fgSecondary }}>
                                                    {step.label}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {extractedText && (
                                    <div className="surface-card-muted" style={{ padding: 14 }}>
                                        <div className="section-header" style={{ marginBottom: 12 }}>
                                            <div>
                                                <div className="section-label">Extraction</div>
                                                <h3 className="section-title">{extractedText === 'Images uploaded for direct AI analysis.' ? 'Direct image analysis' : 'Readable text preview'}</h3>
                                            </div>
                                            <div className="font-mono shrink-0" style={{ fontSize: 10, color: T.fgTertiary }}>
                                                {extractedText === 'Images uploaded for direct AI analysis.' ? 'Vision input' : `${charCount} chars • ${lineCount} lines`}
                                            </div>
                                        </div>
                                        <div
                                            className="font-mono"
                                            style={{
                                                maxHeight: 180,
                                                overflowY: 'auto',
                                                padding: '12px 12px',
                                                borderRadius: 14,
                                                background: T.bgSurface,
                                                border: `1px solid ${T.border}`,
                                                fontSize: 10,
                                                lineHeight: 1.55,
                                                color: T.fgSecondary,
                                                whiteSpace: 'pre-wrap',
                                            }}
                                        >
                                            {previewText}
                                            {extractedText.length > previewText.length ? '\n\n…' : ''}
                                        </div>
                                    </div>
                                )}

                                {stage === 'error' && (
                                    <div
                                        className="surface-card"
                                        style={{
                                            padding: 16,
                                            background: `${T.semDanger}10`,
                                            borderColor: `${T.semDanger}44`,
                                        }}
                                    >
                                        <div style={{ fontSize: 14, fontWeight: 700, color: T.semDanger }}>
                                            Could not analyze this file
                                        </div>
                                        <div style={{ marginTop: 6, fontSize: 13, lineHeight: 1.55, color: T.fgSecondary }}>
                                            {error}
                                        </div>
                                    </div>
                                )}

                                {stage === 'empty' && (
                                    <div className="dashboard-stack" style={{ gap: 12 }}>
                                        <div
                                            className="surface-card"
                                            style={{
                                                padding: 16,
                                                background: T.bgSurface,
                                            }}
                                        >
                                            <div className="flex items-center gap-2" style={{ color: T.fgPrimary }}>
                                                <Sparkles size={16} color={T.accentPrimary} />
                                                <div style={{ fontSize: 14, fontWeight: 700 }}>
                                                    No subscriptions found
                                                </div>
                                            </div>
                                            <div style={{ marginTop: 8, fontSize: 13, lineHeight: 1.55, color: T.fgSecondary }}>
                                                We finished analyzing the uploaded file and did not find any clear recurring subscriptions or bills.
                                            </div>
                                        </div>

                                        <div
                                            className="surface-card-muted flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between"
                                            style={{ padding: 14 }}
                                        >
                                            <div>
                                                <div className="section-label">Final findings</div>
                                                <div style={{ fontSize: 15, fontWeight: 800, color: T.fgPrimary, marginTop: 4 }}>
                                                    0 subscriptions detected
                                                </div>
                                            </div>
                                            <button
                                                onClick={onClose}
                                                className="interactive-btn cursor-pointer border-none w-full sm:w-auto"
                                                style={{
                                                    background: T.accentPrimary,
                                                    color: '#fff',
                                                    borderRadius: 14,
                                                    padding: '10px 14px',
                                                    fontSize: 13,
                                                    fontWeight: 700,
                                                }}
                                            >
                                                Close preview
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {stage === 'done' && (
                                    <div className="dashboard-stack" style={{ gap: 12 }}>
                                        <div className="surface-card-muted" style={{ padding: 14 }}>
                                            <div className="section-header flex-col items-start sm:flex-row sm:items-center" style={{ marginBottom: 12 }}>
                                                <div>
                                                    <div className="section-label">Findings</div>
                                                    <h3 className="section-title">
                                                        {subs.length} recurring charge{subs.length !== 1 ? 's' : ''} found
                                                    </h3>
                                                </div>
                                                {subs.length > 0 && (
                                                    <button
                                                        onClick={() => setSubs([])}
                                                        className="interactive-btn cursor-pointer border-none"
                                                        style={{
                                                            background: T.bgSurface,
                                                            border: `1px solid ${T.border}`,
                                                            color: T.semDanger,
                                                            borderRadius: 12,
                                                            padding: '6px 10px',
                                                            fontSize: 12,
                                                            fontWeight: 600,
                                                        }}
                                                    >
                                                        Clear all
                                                    </button>
                                                )}
                                            </div>
                                            <div className="dashboard-stack" style={{ gap: 8 }}>
                                                {subs.map((sub, idx) => {
                                                    const duplicate = getDuplicate(sub)
                                                    return (
                                                        <div
                                                            key={`${sub.name}-${idx}`}
                                                            className="surface-card"
                                                            style={{
                                                                padding: '12px 12px 10px',
                                                                background: T.bgSurface,
                                                                borderColor: duplicate ? `${T.semWarning}55` : T.border,
                                                            }}
                                                        >
                                                            <div className="flex items-start gap-3">
                                                                <ServiceLogo
                                                                    name={sub.name}
                                                                    domain={sub.vendorDomain}
                                                                    size={30}
                                                                    radius={8}
                                                                    catColor={getCatColor(sub.category)}
                                                                />
                                                                <div style={{ flex: 1 }}>
                                                                    <div style={{ fontSize: 14, fontWeight: 700, color: T.fgPrimary }}>
                                                                        {sub.name}
                                                                    </div>
                                                                    <div className="font-mono" style={{ fontSize: 10, color: T.fgTertiary, marginTop: 2 }}>
                                                                        {sub.renewalDate ? `Next: ${sub.renewalDate}` : 'Renewal date unavailable'}
                                                                    </div>
                                                                </div>
                                                                <button
                                                                    onClick={() => setSubs((prev) => prev.filter((_, itemIdx) => itemIdx !== idx))}
                                                                    className="interactive-btn cursor-pointer border-none"
                                                                    style={{
                                                                        width: 28,
                                                                        height: 28,
                                                                        borderRadius: 999,
                                                                        background: 'transparent',
                                                                        color: T.semDanger,
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                    }}
                                                                >
                                                                    <X size={14} />
                                                                </button>
                                                            </div>
                                                            {duplicate && (
                                                                <div
                                                                    className="font-mono"
                                                                    style={{
                                                                        marginTop: 8,
                                                                        fontSize: 10,
                                                                        color: T.semWarning,
                                                                        background: `${T.semWarning}12`,
                                                                        border: `1px solid ${T.semWarning}33`,
                                                                        borderRadius: 999,
                                                                        padding: '4px 8px',
                                                                        display: 'inline-flex',
                                                                    }}
                                                                >
                                                                    Possible duplicate of {duplicate.name}
                                                                </div>
                                                            )}
                                                            <div className="flex gap-1.5 flex-wrap" style={{ marginTop: 10 }}>
                                                                <Chip color={T.accentPrimary} size={9}>{formatCurrency(sub.amount, currency)}</Chip>
                                                                <Chip color={getCatColor(sub.category)} size={9}>{sub.category}</Chip>
                                                                <Chip color={T.fgTertiary} size={9}>{sub.cycle}</Chip>
                                                                {sub.vendorDomain && <Chip color={T.semInfo} size={9}>{sub.vendorDomain}</Chip>}
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                                {subs.length === 0 && (
                                                    <div style={{ fontSize: 13, color: T.fgTertiary }}>
                                                        No findings left to confirm.
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {subs.length > 0 && (
                                            <div
                                                className="surface-card-muted flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between"
                                                style={{ padding: 14 }}
                                            >
                                                <div>
                                                    <div className="section-label">Projected monthly total</div>
                                                    <div style={{ fontSize: 16, fontWeight: 800, color: T.accentPrimary, marginTop: 4 }}>
                                                        +{formatCurrency(totalMonthly, currency)}
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => onConfirm(subs)}
                                                    className="interactive-btn cursor-pointer border-none w-full sm:w-auto"
                                                    style={{
                                                        background: T.accentPrimary,
                                                        color: '#fff',
                                                        borderRadius: 14,
                                                        padding: '10px 14px',
                                                        fontSize: 13,
                                                        fontWeight: 700,
                                                    }}
                                                >
                                                    Confirm findings
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
