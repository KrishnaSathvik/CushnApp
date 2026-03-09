import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mic, Sparkles, Plus, Loader2, Paperclip, FileText, X } from 'lucide-react'
import { AnimatePresence } from 'framer-motion'
import useSubscriptions from '../hooks/useSubscriptions'
import ConfirmationSheet from '../components/ConfirmationSheet'
import FileImportDialog from '../components/FileImportDialog'
import VoiceInput from '../components/VoiceInput'
import { useTheme } from '../context/ThemeContext'
import { useSettings } from '../context/SettingsContext'
import { parseWithClaude, inferCategory } from '../lib/parseSubscriptions'
import { BILLING_CYCLES, EXAMPLE_INPUTS } from '../lib/constants'
import { enrichSubscriptionCandidate } from '../lib/vendorEnrichment'
import { createImageAttachment, extractFileText, ACCEPTED_FILE_TYPES, hasMeaningfulExtractedText, isImageFile } from '../lib/fileParser'
import { normalizeVoiceTranscriptForParse } from '../lib/voiceTranscript'

const TYPING_HINTS = [
    'Netflix 15.99 monthly',
    'Spotify 9.99 monthly entertainment',
    'Figma 15 monthly design tools',
]

const PARSE_BAR_BOTTOM = 'max(92px, calc(env(safe-area-inset-bottom) + 80px))'

export default function AddScreen() {
    const navigate = useNavigate()
    const { T, theme } = useTheme()
    const { currency } = useSettings()
    const { addSubscription, categories, subscriptions } = useSubscriptions()
    const [mode, setMode] = useState('text') // 'text' | 'manual' | 'voice'
    const [input, setInput] = useState('')
    const [parsing, setParsing] = useState(false)
    const [parsed, setParsed] = useState(null) // null | array of parsed subs
    const [parseNotice, setParseNotice] = useState(null) // { type: 'error'|'info', text: string } | null
    const [manualNotice, setManualNotice] = useState(null)
    const [isSavingManual, setIsSavingManual] = useState(false)
    const [isConfirmingParsed, setIsConfirmingParsed] = useState(false)
    const [typingHintIndex, setTypingHintIndex] = useState(0)
    const [typingCharCount, setTypingCharCount] = useState(0)
    // File upload state
    const [fileUploading, setFileUploading] = useState(false)
    const fileInputRef = useRef(null)
    const [fileImportReview, setFileImportReview] = useState({
        open: false,
        stage: 'idle',
        fileNames: [],
        imagePreviews: [],
        extractedText: '',
        findings: [],
        error: '',
    })
    const [form, setForm] = useState({
        name: '',
        amount: '',
        cycle: 'monthly',
        categoryId: null, // We'll set this once categories load
        renewalDate: '',
        notes: '',
    })

    // Track if user manually picked a category so we don't overwrite it
    const [userPickedCategory, setUserPickedCategory] = useState(false)

    useEffect(() => {
        if (mode !== 'text' || input.trim()) return
        const currentHint = TYPING_HINTS[typingHintIndex]
        let timer
        if (typingCharCount < currentHint.length) {
            timer = setTimeout(() => setTypingCharCount((c) => c + 1), 45)
        } else {
            timer = setTimeout(() => {
                setTypingHintIndex((i) => (i + 1) % TYPING_HINTS.length)
                setTypingCharCount(0)
            }, 1000)
        }
        return () => clearTimeout(timer)
    }, [mode, input, typingHintIndex, typingCharCount])

    const getCategoryIdByName = useCallback((name) => {
        if (!name) return categories[0]?.id || 1
        const cat = categories.find(
            c => c.name.toLowerCase() === name.toLowerCase()
        )
        return cat?.id || categories[0]?.id || 1
    }, [categories])

    // Set initial category to 'Other' if possible
    useEffect(() => {
        if (categories.length > 0 && !form.categoryId && !userPickedCategory) {
            setForm(prev => ({ ...prev, categoryId: getCategoryIdByName('Other') }))
        }
    }, [categories, form.categoryId, userPickedCategory, getCategoryIdByName])

    // Auto-categorize based on name typing
    useEffect(() => {
        if (!userPickedCategory && form.name.length > 2) {
            const inferred = inferCategory(form.name)
            if (inferred !== 'Other') {
                const id = getCategoryIdByName(inferred)
                setForm(prev => ({ ...prev, categoryId: id }))
            }
        }
    }, [form.name, userPickedCategory, categories, getCategoryIdByName])

    // ─── AI Parse ────────────────────────────────────────────────────────
    const handleParse = async () => {
        if (!input.trim()) {
            setParseNotice({ type: 'info', text: 'Enter at least one subscription to parse.' })
            return
        }
        setParseNotice(null)
        setParsing(true)
        try {
            const trimmed = input.trim()
            const results = await parseWithClaude(trimmed, new Date().toISOString().slice(0, 10))
            if (results.length > 0) {
                setParsed(results)
            } else {
                setParseNotice({
                    type: 'info',
                    text: 'No subscriptions detected. Try one item like: Netflix 15.99 monthly',
                })
            }
        } catch (err) {
            console.error('Parse error:', err)
            setParseNotice({
                type: 'error',
                text: 'Could not parse your input right now. Try again or use Manual Entry.',
            })
        } finally {
            setParsing(false)
        }
    }

    // ─── Confirm parsed subs ────────────────────────────────────────────
    const handleConfirm = async (subs) => {
        if (isConfirmingParsed) return
        setIsConfirmingParsed(true)
        try {
            for (const sub of subs) {
                const catId = getCategoryIdByName(sub.category)
                await addSubscription({
                    name: sub.name,
                    amount: sub.amount,
                    cycle: sub.cycle,
                    categoryId: catId,
                    renewalDate: sub.renewalDate,
                    notes: '',
                    currency,
                    vendorDomain: sub.vendorDomain,
                    vendorConfidence: sub.vendorConfidence,
                    vendorMatchType: sub.vendorMatchType,
                })
            }
            navigate('/')
        } finally {
            setIsConfirmingParsed(false)
        }
    }

    // ─── Voice transcript callback ──────────────────────────────────────
    const handleVoiceTranscript = (text) => {
        const normalized = normalizeVoiceTranscriptForParse(text)
        setInput((prev) => (prev ? prev + ', ' : '') + (normalized || text))
        setMode('text')
    }

    const closeFileImportReview = useCallback(() => {
        if (fileUploading) return
        fileImportReview.imagePreviews.forEach((image) => {
            URL.revokeObjectURL(image.url)
        })
        setFileImportReview({
            open: false,
            stage: 'idle',
            fileNames: [],
            imagePreviews: [],
            extractedText: '',
            findings: [],
            error: '',
        })
    }, [fileImportReview.imagePreviews, fileUploading])

    // ─── File upload & text extraction ─────────────────────────────────
    const handleFileSelect = async (e) => {
        const files = Array.from(e.target.files || [])
        if (!files.length) return
        setFileUploading(true)
        setFileImportReview({
            open: true,
            stage: 'extracting',
            fileNames: files.map((file) => file.name),
            imagePreviews: files.filter((file) => isImageFile(file)).map((file) => ({
                name: file.name,
                url: URL.createObjectURL(file),
            })),
            extractedText: '',
            findings: [],
            error: '',
        })
        // Clear the input so we don't process HTML input value
        e.target.value = ''
        try {
            const textChunks = []
            const attachments = []
            for (const file of files) {
                if (isImageFile(file)) {
                    attachments.push(await createImageAttachment(file))
                    continue
                }

                const text = await extractFileText(file)
                if (!hasMeaningfulExtractedText(text)) {
                    throw new Error(
                        `${file.name} did not contain enough readable text to parse. If it is a scanned PDF or image-based statement, try a text-based PDF, CSV, or TXT export.`
                    )
                }
                textChunks.push(`--- ${file.name} ---\n${text.trim()}`)
            }
            const combined = textChunks.join('\n\n')
            setFileImportReview((prev) => ({
                ...prev,
                stage: 'parsing',
                extractedText: combined || (attachments.length > 0 ? 'Images uploaded for direct AI analysis.' : ''),
                error: '',
            }))
            try {
                const results = await parseWithClaude(combined, new Date().toISOString().slice(0, 10), { attachments })
                if (results.length > 0) {
                    setFileImportReview((prev) => ({
                        ...prev,
                        stage: 'done',
                        findings: results,
                    }))
                } else {
                    setFileImportReview((prev) => ({
                        ...prev,
                        stage: 'empty',
                        findings: [],
                    }))
                }
            } catch (err) {
                console.error('Parse error after file upload:', err)
                setFileImportReview((prev) => ({
                    ...prev,
                    stage: 'error',
                    error: 'Could not parse the file right now. Try again or upload a different export.',
                }))
            }
        } catch (err) {
            console.error('File read error:', err)
            setFileImportReview((prev) => ({
                ...prev,
                stage: 'error',
                error: err.message || 'Failed to read file.',
            }))
        } finally {
            setFileUploading(false)
        }
    }

    // ─── Manual add ─────────────────────────────────────────────────────
    const handleManualAdd = async () => {
        const amountNum = Number(form.amount)
        if (!form.name.trim()) {
            setManualNotice({ type: 'error', text: 'Service name is required.' })
            return
        }
        if (!Number.isFinite(amountNum) || amountNum <= 0) {
            setManualNotice({ type: 'error', text: 'Enter a valid amount greater than 0.' })
            return
        }
        if (!form.categoryId) {
            setManualNotice({ type: 'error', text: 'Please select a category.' })
            return
        }
        setManualNotice(null)
        if (isSavingManual) return
        setIsSavingManual(true)
        try {
            const enriched = enrichSubscriptionCandidate({ name: form.name.trim() })
            await addSubscription({
                name: enriched.name,
                amount: amountNum,
                cycle: form.cycle,
                categoryId: form.categoryId,
                renewalDate: form.renewalDate || new Date().toISOString().slice(0, 10),
                notes: form.notes,
                currency,
                vendorDomain: enriched.vendorDomain,
                vendorConfidence: enriched.vendorConfidence,
                vendorMatchType: enriched.vendorMatchType,
            })
            navigate('/')
        } finally {
            setIsSavingManual(false)
        }
    }

    // ─── Voice mode ─────────────────────────────────────────────────────
    if (mode === 'voice') {
        return (
            <div className="min-h-screen" style={{ background: T.bgBase }}>
                <VoiceInput onTranscript={handleVoiceTranscript} onClose={() => setMode('text')} />
            </div>
        )
    }

    return (
        <div className="dashboard-page" style={{ background: T.bgBase }}>
            <div className="dashboard-container dashboard-stack" style={{ paddingTop: 18 }}>
                <section
                    className="hero-card"
                    style={{
                        padding: 22,
                        background: T.bgSurface,
                        border: `1px solid ${T.border}`,
                        width: '100%',
                    }}
                >
                    <div className="flex items-start justify-between gap-3" style={{ position: 'relative', zIndex: 1 }}>
                        <div>
                            <p className="page-eyebrow">Workflow</p>
                            <h1 className="page-title">Add subscriptions</h1>
                            <p className="page-subtitle" style={{ marginTop: 6, maxWidth: 620 }}>
                                Paste subscriptions, upload a bank statement (PDF/CSV/TXT), use voice, or fill in the manual form.
                            </p>
                        </div>
                    </div>

                    <div style={{ marginTop: 18, maxWidth: 320 }}>
                        <div className="segmented-control" style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', width: '100%' }}>
                            <div
                                style={{
                                    position: 'absolute',
                                    top: 4,
                                    bottom: 4,
                                    left: mode === 'text' ? 4 : 'calc(50% + 2px)',
                                    width: 'calc(50% - 6px)',
                                    borderRadius: 999,
                                    background: T.accentPrimary,
                                    transition: 'left var(--duration-normal) var(--ease-out)',
                                }}
                            />
                            {[
                                { key: 'text', label: 'Smart paste' },
                                { key: 'manual', label: 'Manual form' },
                            ].map((item) => (
                                <button
                                    key={item.key}
                                    onClick={() => setMode(item.key)}
                                    className="interactive-btn cursor-pointer"
                                    style={{
                                        position: 'relative',
                                        zIndex: 1,
                                        height: 40,
                                        border: 'none',
                                        background: 'transparent',
                                        color: mode === item.key ? T.fgOnAccent : T.fgMedium,
                                        fontWeight: 700,
                                        borderRadius: 999,
                                    }}
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    </div>

                </section>


                {mode === 'text' ? (
                    <div
                        className="dashboard-stack"
                        style={{
                            flex: 1,
                            paddingBottom: 120,
                            width: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                        }}
                    >
                        <div className="split-grid" style={{ alignItems: 'start' }}>
                            <div className="surface-card editor-shell" style={{ padding: '18px 18px 20px', width: '100%' }}>
                                <div className="section-header" style={{ marginBottom: 12 }}>
                                    <div>
                                        <div className="section-label">Composer</div>
                                        <h3 className="section-title">Natural language input</h3>
                                    </div>
                                </div>
                                {!input.trim() && (
                                    <div
                                        className="font-mono"
                                        style={{
                                            fontSize: 11,
                                            lineHeight: 1.5,
                                            color: T.accentPrimary,
                                            background: `${T.accentPrimary}11`,
                                            border: `1px solid ${T.accentPrimary}33`,
                                            borderRadius: 14,
                                            padding: '8px 10px',
                                            position: 'relative',
                                        }}
                                    >
                                        {TYPING_HINTS[typingHintIndex].slice(0, typingCharCount)}
                                        <span className="animate-blink">|</span>
                                    </div>
                                )}
                                {!import.meta.env.VITE_PARSE_API_URL && (
                                    <div
                                        className="font-mono"
                                        style={{
                                            color: T.semWarning,
                                            marginTop: 10,
                                            fontSize: 10,
                                            lineHeight: 1.45,
                                            position: 'relative',
                                        }}
                                    >
                                        No parse endpoint set, using local parser. Set VITE_PARSE_API_URL for server-side AI parsing.
                                    </div>
                                )}

                                <div
                                    className="surface-card-muted"
                                    style={{
                                        padding: 14,
                                        minHeight: 320,
                                        position: 'relative',
                                        background: `linear-gradient(180deg, ${T.bgMuted}, ${T.bgSurface})`,
                                        boxShadow: input.trim() ? `0 0 0 1px ${T.accentPrimary}33, 0 0 28px ${T.accentPrimary}12` : 'none',
                                    }}
                                >
                                    <textarea
                                        value={input}
                                        onChange={(e) => {
                                            setInput(e.target.value)
                                            if (parseNotice) setParseNotice(null)
                                        }}
                                        autoFocus
                                        placeholder="Type here..."
                                        className="w-full outline-none resize-none"
                                        style={{
                                            background: 'transparent',
                                            border: 'none',
                                            color: T.fgHigh,
                                            fontSize: 16,
                                            lineHeight: 1.8,
                                            minHeight: 280,
                                            fontFamily: 'Manrope, system-ui, sans-serif',
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="dashboard-stack" style={{ gap: 14 }}>
                                <section className="surface-card" style={{ padding: 18, width: '100%', background: T.bgSurface }}>
                                    {parseNotice && (
                                        <div
                                            className="surface-card-muted"
                                            style={{
                                                fontSize: 11,
                                                lineHeight: 1.55,
                                                color: parseNotice.type === 'error' ? T.semDanger : T.fgMedium,
                                                padding: '8px 10px',
                                                background: parseNotice.type === 'error' ? `${T.semDanger}12` : T.bgGlassStrong,
                                                borderColor: parseNotice.type === 'error' ? `${T.semDanger}44` : T.border,
                                            }}
                                        >
                                            {parseNotice.text}
                                        </div>
                                    )}
                                    <div className="section-header" style={{ marginBottom: 12, marginTop: parseNotice ? 14 : 0 }}>
                                        <div>
                                            <div className="section-label">Examples</div>
                                            <h3 className="section-title">Quick input samples</h3>
                                        </div>
                                    </div>
                                    <div className="pill-group">
                                        {EXAMPLE_INPUTS.map((ex, i) => (
                                            <button
                                                key={i}
                                                className="interactive-btn font-mono cursor-pointer"
                                                style={{
                                                    background: T.bgSubtle,
                                                    border: `1px solid ${T.border}`,
                                                    borderRadius: 999,
                                                    padding: '7px 11px',
                                                    fontSize: 9,
                                                    color: T.fgMedium,
                                                }}
                                                onClick={() => setInput((prev) => (prev ? prev + ', ' : '') + ex)}
                                                type="button"
                                            >
                                                "{ex}"
                                            </button>
                                        ))}
                                    </div>
                                </section>


                            </div>
                        </div>
                        <div
                            className="surface-overlay"
                            style={{
                                position: 'sticky',
                                bottom: PARSE_BAR_BOTTOM,
                                zIndex: 10,
                                padding: '12px 14px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 10,
                                width: '100%',
                                borderRadius: 18,
                            }}
                        >
                            <span className="font-mono" style={{ fontSize: 11, color: T.fgSubtle }}>
                                {fileUploading
                                    ? 'Preparing file review...'
                                    : input.trim()
                                        ? `${input.split(/[,\n;]+/).filter(s => s.trim()).length} item${input.split(/[,\n;]+/).filter(s => s.trim()).length !== 1 ? 's' : ''} detected`
                                        : 'Upload a statement or paste text to analyze recurring charges.'}
                            </span>
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'stretch',
                                    gap: 8,
                                    width: '100%',
                                }}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept={ACCEPTED_FILE_TYPES}
                                    multiple
                                    onChange={handleFileSelect}
                                    style={{ display: 'none' }}
                                />
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={fileUploading || parsing}
                                    title="Upload bank statement (PDF, CSV, TXT)"
                                    className="interactive-btn flex items-center justify-center rounded-full cursor-pointer border-none"
                                    style={{
                                        width: 40,
                                        height: 40,
                                        background: T.bgSurface,
                                        color: T.fgMedium,
                                        border: `1px solid ${T.border}`,
                                        opacity: fileUploading || parsing ? 0.6 : 1,
                                    }}
                                >
                                    {fileUploading ? (
                                        <Loader2 size={16} className="animate-spin" />
                                    ) : (
                                        <Paperclip size={17} />
                                    )}
                                </button>
                                <button
                                    onClick={() => setMode('voice')}
                                    className="interactive-btn flex items-center justify-center rounded-full cursor-pointer border-none"
                                    style={{
                                        width: 40,
                                        height: 40,
                                        background: mode === 'voice' ? `${T.accentPrimary}22` : T.bgSurface,
                                        color: T.accentPrimary,
                                        border: `1px solid ${T.accentPrimary}44`,
                                        boxShadow: mode === 'voice' ? `0 0 24px ${T.accentPrimary}33` : 'none',
                                    }}
                                >
                                    <Mic size={18} />
                                </button>
                                <button
                                    onClick={handleParse}
                                    disabled={!input.trim() || parsing || isConfirmingParsed}
                                    className="interactive-btn flex items-center justify-center gap-2 cursor-pointer border-none"
                                    style={{
                                        flex: 1,
                                        background: input.trim() && !parsing && !isConfirmingParsed ? T.accentPrimary : T.fgDivider,
                                        color: '#fff',
                                        borderRadius: 14,
                                        padding: '10px 14px',
                                        fontSize: 13,
                                        fontWeight: 700,
                                        boxShadow: input.trim() && !parsing && !isConfirmingParsed ? `0 0 20px ${T.accentPrimary}55` : 'none',
                                        opacity: input.trim() && !parsing && !isConfirmingParsed ? 1 : 0.5,
                                        height: 40,
                                        width: '100%',
                                        transition: 'all var(--duration-normal) var(--ease-spring)',
                                    }}
                                >
                                    {parsing ? (
                                        <>
                                            <Loader2 size={14} className="animate-spin" />
                                            Parsing...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles size={14} />
                                            Parse with AI
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div
                        className="dashboard-stack"
                        style={{
                            paddingBottom: 120,
                            width: '100%',
                        }}
                    >

                        <div className="split-grid">
                            <div className="dashboard-stack" style={{ gap: 14 }}>
                                <div className="surface-card" style={{ padding: '16px 16px 14px', background: T.bgSurface }}>
                                    <div className="section-label">Basics</div>
                                    <h2 className="section-title" style={{ marginTop: 8, marginBottom: 14 }}>Subscription details</h2>
                                    <label className="block mb-4">
                                        <span style={{ fontSize: 11, color: T.fgMedium, marginBottom: 6, display: 'block' }}>
                                            Service Name *
                                        </span>
                                        <input
                                            value={form.name}
                                            onChange={(e) => {
                                                setForm({ ...form, name: e.target.value })
                                                if (manualNotice) setManualNotice(null)
                                            }}
                                            placeholder="e.g. Netflix, Spotify, GitHub..."
                                            className="w-full outline-none"
                                            style={{
                                                height: 46,
                                                background: T.bgGlassStrong,
                                                border: `1px solid ${T.border}`,
                                                borderRadius: 14,
                                                color: T.fgHigh,
                                                fontSize: 14,
                                                padding: '0 14px',
                                                boxSizing: 'border-box',
                                            }}
                                        />
                                    </label>

                                    <label className="block">
                                        <span style={{ fontSize: 11, color: T.fgMedium, marginBottom: 6, display: 'block' }}>
                                            Amount *
                                        </span>
                                        <div style={{ position: 'relative' }}>
                                            <span style={{ position: 'absolute', left: 14, top: 13, fontSize: 14, color: T.fgMedium, fontFamily: 'JetBrains Mono, ui-monospace, monospace' }}>
                                                {currency === 'USD' ? '$' : currency}
                                            </span>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={form.amount}
                                                onChange={(e) => {
                                                    setForm({ ...form, amount: e.target.value })
                                                    if (manualNotice) setManualNotice(null)
                                                }}
                                                placeholder="9.99"
                                                className="w-full outline-none font-mono"
                                                style={{
                                                    height: 46,
                                                    background: T.bgGlassStrong,
                                                    border: `1px solid ${T.border}`,
                                                    borderRadius: 14,
                                                    color: T.fgHigh,
                                                    fontSize: 14,
                                                    padding: '0 14px 0 52px',
                                                    boxSizing: 'border-box',
                                                }}
                                            />
                                        </div>
                                    </label>
                                </div>

                                <div className="surface-card" style={{ padding: '16px 16px 14px', background: T.bgSurface }}>
                                    <div className="section-label">Billing</div>
                                    <h2 className="section-title" style={{ marginTop: 8, marginBottom: 14 }}>Cycle and category</h2>
                                    <label className="block">
                                        <span style={{ fontSize: 11, color: T.fgMedium, marginBottom: 8, display: 'block' }}>
                                            Billing Cycle
                                        </span>
                                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                                            {BILLING_CYCLES.map((c) => (
                                                <button
                                                    key={c}
                                                    onClick={() => setForm({ ...form, cycle: c })}
                                                    className="interactive-btn cursor-pointer capitalize font-mono"
                                                    style={{
                                                        padding: '10px 6px',
                                                        borderRadius: 12,
                                                        background: form.cycle === c ? T.accentSoft : T.bgGlassStrong,
                                                        border: `1px solid ${form.cycle === c ? `${T.accentPrimary}44` : T.border}`,
                                                        color: form.cycle === c ? T.accentPrimary : T.fgSubtle,
                                                        fontSize: 11,
                                                        fontWeight: form.cycle === c ? 700 : 500,
                                                    }}
                                                >
                                                    {c}
                                                </button>
                                            ))}
                                        </div>
                                    </label>
                                    <label className="block">
                                        <span style={{ fontSize: 11, color: T.fgMedium, marginBottom: 8, display: 'block' }}>
                                            Category
                                        </span>
                                        <div className="flex gap-2 flex-wrap">
                                            {categories.map((cat) => (
                                                <button
                                                    key={cat.id}
                                                    onClick={() => {
                                                        setUserPickedCategory(true)
                                                        setForm({ ...form, categoryId: cat.id })
                                                        if (manualNotice) setManualNotice(null)
                                                    }}
                                                    className="interactive-btn cursor-pointer"
                                                    style={{
                                                        padding: '8px 12px',
                                                        borderRadius: 999,
                                                        background: form.categoryId === cat.id ? `${cat.color}22` : T.bgGlassStrong,
                                                        border: `1px solid ${form.categoryId === cat.id ? cat.color : T.border}`,
                                                        color: form.categoryId === cat.id ? cat.color : T.fgSubtle,
                                                        fontSize: 11,
                                                        fontWeight: form.categoryId === cat.id ? 700 : 500,
                                                    }}
                                                >
                                                    {cat.name}
                                                </button>
                                            ))}
                                        </div>
                                    </label>
                                </div>
                            </div>

                            <div className="dashboard-stack" style={{ gap: 14 }}>
                                <div className="surface-card" style={{ padding: '16px 16px 14px', background: T.bgSurface }}>
                                    <div className="section-label">Schedule</div>
                                    <h2 className="section-title" style={{ marginTop: 8, marginBottom: 14 }}>Renewal and notes</h2>
                                    <label className="block mb-4">
                                        <span style={{ fontSize: 11, color: T.fgMedium, marginBottom: 6, display: 'block' }}>
                                            Next Renewal Date
                                        </span>
                                        <input
                                            type="date"
                                            value={form.renewalDate}
                                            onChange={(e) => setForm({ ...form, renewalDate: e.target.value })}
                                            className="w-full outline-none"
                                            style={{
                                                height: 46,
                                                background: T.bgGlassStrong,
                                                border: `1px solid ${T.border}`,
                                                borderRadius: 14,
                                                color: T.fgHigh,
                                                fontSize: 14,
                                                padding: '0 14px',
                                                boxSizing: 'border-box',
                                                colorScheme: theme === 'light' ? 'light' : 'dark',
                                            }}
                                        />
                                    </label>

                                    <label className="block">
                                        <span style={{ fontSize: 11, color: T.fgMedium, marginBottom: 6, display: 'block' }}>
                                            Notes (optional)
                                        </span>
                                        <textarea
                                            value={form.notes}
                                            onChange={(e) => setForm({ ...form, notes: e.target.value })}
                                            placeholder="Shared with family, business expense..."
                                            rows={6}
                                            className="w-full outline-none resize-none"
                                            style={{
                                                background: T.bgGlassStrong,
                                                border: `1px solid ${T.border}`,
                                                borderRadius: 14,
                                                color: T.fgHigh,
                                                fontSize: 14,
                                                padding: '12px 14px',
                                                boxSizing: 'border-box',
                                            }}
                                        />
                                    </label>
                                </div>


                            </div>
                        </div>

                        {/* Submit */}
                        {manualNotice && (
                            <div
                                className="surface-card"
                                style={{
                                    fontSize: 11,
                                    lineHeight: 1.55,
                                    color: manualNotice.type === 'error' ? T.semDanger : T.fgMedium,
                                    padding: '8px 10px',
                                    background: manualNotice.type === 'error' ? `${T.semDanger}12` : T.bgGlassStrong,
                                    borderColor: manualNotice.type === 'error' ? `${T.semDanger}44` : T.border,
                                }}
                            >
                                {manualNotice.text}
                            </div>
                        )}
                        <button
                            onClick={handleManualAdd}
                            className="interactive-btn w-full flex items-center justify-center gap-2 cursor-pointer border-none"
                            style={{
                                height: 48,
                                background: form.name && form.amount && !isSavingManual ? T.accentPrimary : T.fgDivider,
                                borderRadius: 16,
                                fontSize: 14,
                                color: '#fff',
                                fontWeight: 700,
                                boxShadow: form.name && form.amount && !isSavingManual ? `0 0 20px ${T.accentPrimary}55` : 'none',
                                opacity: form.name && form.amount && !isSavingManual ? 1 : 0.5,
                            }}
                            disabled={!form.name || !form.amount || isSavingManual}
                        >
                            {isSavingManual ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Plus size={18} />
                                    Add Subscription
                                </>
                            )}
                        </button>
                    </div>
                )}

            </div>

            {/* ─── Confirmation Sheet ─────────────────────────────────────── */}
            <AnimatePresence>
                {parsed && parsed.length > 0 && (
                    <ConfirmationSheet
                        items={parsed}
                        categories={categories}
                        existingSubscriptions={subscriptions}
                        onConfirm={handleConfirm}
                        onClose={() => {
                            if (isConfirmingParsed) return
                            setParsed(null)
                        }}
                    />
                )}
            </AnimatePresence>

            <FileImportDialog
                open={fileImportReview.open}
                stage={fileImportReview.stage}
                fileNames={fileImportReview.fileNames}
                imagePreviews={fileImportReview.imagePreviews}
                extractedText={fileImportReview.extractedText}
                findings={fileImportReview.findings}
                error={fileImportReview.error}
                categories={categories}
                existingSubscriptions={subscriptions}
                onClose={closeFileImportReview}
                onConfirm={async (subs) => {
                    await handleConfirm(subs)
                    closeFileImportReview()
                }}
            />
        </div>
    )
}
