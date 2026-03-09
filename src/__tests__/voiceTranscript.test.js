import { describe, expect, it } from 'vitest'
import { normalizeVoiceTranscriptForParse } from '../lib/voiceTranscript'

describe('normalizeVoiceTranscriptForParse', () => {
    it('removes filler and command phrases', () => {
        expect(normalizeVoiceTranscriptForParse('please add subscription um Netflix 15.99 monthly')).toBe('Netflix 15.99 monthly')
    })

    it('normalizes spoken amount phrases', () => {
        expect(normalizeVoiceTranscriptForParse('Upstart loan four hundred eighty three dollars every month')).toBe('Upstart loan 483 every month')
        expect(normalizeVoiceTranscriptForParse('Netflix fifteen ninety nine monthly')).toBe('Netflix 15.99 monthly')
    })

    it('normalizes common spoken brand spacing', () => {
        expect(normalizeVoiceTranscriptForParse('chat g p t twenty dollars monthly')).toBe('ChatGPT 20 monthly')
        expect(normalizeVoiceTranscriptForParse('t mobile fifty dollars monthly')).toBe('T-Mobile 50 monthly')
    })

    it('collapses repeated fragments', () => {
        expect(normalizeVoiceTranscriptForParse('Netflix 15.99 monthly, Netflix 15.99 monthly')).toBe('Netflix 15.99 monthly')
    })
})
