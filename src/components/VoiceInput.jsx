import { useState, useEffect, useRef, useCallback } from 'react'
import { Mic, MicOff, Square } from 'lucide-react'
import Chip from './Chip'
import { useTheme } from '../context/ThemeContext'

const WAVE_BARS = [
    { height: 10, delay: 0.00 }, { height: 16, delay: 0.05 }, { height: 22, delay: 0.10 },
    { height: 14, delay: 0.15 }, { height: 28, delay: 0.20 }, { height: 12, delay: 0.25 },
    { height: 20, delay: 0.30 }, { height: 26, delay: 0.35 }, { height: 18, delay: 0.40 },
    { height: 24, delay: 0.45 }, { height: 11, delay: 0.50 }, { height: 19, delay: 0.55 },
    { height: 27, delay: 0.60 }, { height: 15, delay: 0.65 }, { height: 23, delay: 0.70 },
    { height: 13, delay: 0.75 }, { height: 21, delay: 0.80 }, { height: 17, delay: 0.85 },
    { height: 25, delay: 0.90 }, { height: 12, delay: 0.95 },
]

/**
 * Voice input component using Web Speech API.
 * Shows live transcript, waveform animation, and detected items.
 */
export default function VoiceInput({ onTranscript, onClose }) {
    const { T } = useTheme()
    const [isListening, setIsListening] = useState(false)
    const [transcript, setTranscript] = useState('')
    const [interimText, setInterimText] = useState('')
    const [error, setError] = useState(null)
    const recognitionRef = useRef(null)

    const startListening = useCallback(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

        if (!SpeechRecognition) {
            setError('Speech recognition is not supported in this browser.')
            return
        }

        const recognition = new SpeechRecognition()
        recognition.continuous = true
        recognition.interimResults = true
        recognition.lang = 'en-US'

        recognition.onresult = (event) => {
            let interim = ''
            let final = ''

            for (let i = 0; i < event.results.length; i++) {
                if (event.results[i].isFinal) {
                    final += event.results[i][0].transcript + ' '
                } else {
                    interim += event.results[i][0].transcript
                }
            }

            if (final) {
                setTranscript((prev) => prev + final)
            }
            setInterimText(interim)
        }

        recognition.onerror = (event) => {
            console.error('Speech error:', event.error)
            if (event.error === 'not-allowed') {
                setError('Microphone access was denied. Please allow microphone access and try again.')
            } else {
                setError(`Speech recognition error: ${event.error}`)
            }
            setIsListening(false)
        }

        recognition.onend = () => {
            setIsListening(false)
        }

        recognitionRef.current = recognition
        recognition.start()
        setIsListening(true)
        setError(null)
    }, [])

    const stopListening = useCallback(() => {
        if (recognitionRef.current) {
            recognitionRef.current.stop()
        }
        setIsListening(false)
    }, [])

    const handleDone = () => {
        stopListening()
        const fullText = transcript + interimText
        if (fullText.trim()) {
            onTranscript(fullText.trim())
        }
        onClose()
    }

    useEffect(() => {
        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop()
            }
        }
    }, [])

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div
                className="flex justify-between items-center"
                style={{ padding: '8px 14px 6px', borderBottom: `1px solid ${T.border}` }}
            >
                <span
                    onClick={onClose}
                    className="cursor-pointer"
                    style={{ fontSize: 14, color: T.fgMedium }}
                >
                    ‹ Cancel
                </span>
                <span style={{ fontSize: 14, color: T.fgHigh, fontWeight: 600 }}>Voice Input</span>
                {isListening && <Chip color={T.semDanger}>● live</Chip>}
                {!isListening && <div style={{ width: 40 }} />}
            </div>

            {/* Error */}
            {error && (
                <div
                    className="flex items-center gap-2"
                    style={{
                        margin: '12px 14px 0',
                        padding: '10px 14px',
                        background: T.semDanger + '14',
                        border: `1px solid ${T.semDanger}33`,
                        borderRadius: 8,
                    }}
                >
                    <div className="rounded-full" style={{ width: 6, height: 6, background: T.semDanger, flexShrink: 0 }} />
                    <span style={{ fontSize: 11, color: T.semDanger }}>{error}</span>
                </div>
            )}

            {/* Transcript */}
            <div className="flex-1" style={{ padding: '20px 16px 12px' }}>
                {(transcript || interimText) ? (
                    <div style={{ fontSize: 15, color: T.fgSubtle, lineHeight: 1.7 }}>
                        <span style={{ color: T.fgHigh }}>{transcript}</span>
                        <span style={{ color: T.fgSubtle }}>{interimText}</span>
                        <span
                            className="animate-blink inline-block align-middle"
                            style={{ width: 2, height: 16, background: T.accentPrimary, marginLeft: 2 }}
                        />
                    </div>
                ) : (
                    <div style={{ fontSize: 15, color: T.fgSubtle, lineHeight: 1.7, textAlign: 'center', marginTop: 32 }}>
                        {isListening
                            ? 'Listening... Speak your subscriptions naturally.'
                            : 'Tap the microphone button to start speaking.'}
                    </div>
                )}
            </div>

            {/* Waveform */}
            {isListening && (
                <div className="flex justify-center" style={{ padding: '16px 0' }}>
                    <div className="flex items-center gap-0.5" style={{ height: 40 }}>
                        {WAVE_BARS.map((bar, i) => (
                            <div
                                key={i}
                                className="animate-wave-bar rounded-sm"
                                style={{
                                    width: 3,
                                    height: bar.height,
                                    background: i % 3 === 0 ? T.accentPrimary : T.fgDivider,
                                    animationDelay: `${bar.delay}s`,
                                    opacity: 0.8 + (i % 3) * 0.1,
                                }}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Mic button */}
            <div className="flex flex-col items-center gap-3" style={{ padding: '10px 0 20px' }}>
                <button
                    onClick={isListening ? stopListening : startListening}
                    className="cursor-pointer border-none relative"
                    style={{
                        width: 72,
                        height: 72,
                        borderRadius: '50%',
                        background: isListening ? T.semDanger + '22' : T.accentPrimary + '22',
                        border: `2px solid ${isListening ? T.semDanger : T.accentPrimary}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    {/* Pulse ring */}
                    {isListening && (
                        <div
                            className="absolute rounded-full animate-pulse-glow"
                            style={{
                                inset: -8,
                                border: `1px solid ${T.semDanger}44`,
                                borderRadius: '50%',
                            }}
                        />
                    )}
                    {isListening ? (
                        <Square size={24} color={T.semDanger} fill={T.semDanger} />
                    ) : (
                        <Mic size={28} color={T.accentPrimary} />
                    )}
                </button>
                <span className="font-mono" style={{ fontSize: 11, color: T.fgSubtle }}>
                    {isListening ? 'Tap to stop recording' : 'Tap to start speaking'}
                </span>
            </div>

            {/* Done button */}
            {(transcript || interimText) && (
                <div style={{ padding: '0 14px 80px' }}>
                    <button
                        onClick={handleDone}
                        className="w-full cursor-pointer border-none"
                        style={{
                            height: 48,
                            background: T.accentPrimary,
                            borderRadius: 12,
                            fontSize: 14,
                            color: '#fff',
                            fontWeight: 700,
                            boxShadow: `0 0 20px ${T.accentPrimary}55`,
                        }}
                    >
                        Use this text →
                    </button>
                </div>
            )}
        </div>
    )
}
