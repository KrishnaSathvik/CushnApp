const NUMBER_WORDS = {
    zero: 0,
    one: 1,
    two: 2,
    three: 3,
    four: 4,
    five: 5,
    six: 6,
    seven: 7,
    eight: 8,
    nine: 9,
    ten: 10,
    eleven: 11,
    twelve: 12,
    thirteen: 13,
    fourteen: 14,
    fifteen: 15,
    sixteen: 16,
    seventeen: 17,
    eighteen: 18,
    nineteen: 19,
    twenty: 20,
    thirty: 30,
    forty: 40,
    fifty: 50,
    sixty: 60,
    seventy: 70,
    eighty: 80,
    ninety: 90,
}

const MAGNITUDE_WORDS = {
    hundred: 100,
    thousand: 1000,
}

const FILLER_RE = /\b(uh|um|like|please|actually|basically|literally)\b/gi
const COMMAND_RE = /\b(add|create|track)\s+(?:a\s+)?(?:new\s+)?(?:subscription|bill)\b/gi
const LEADING_PHRASE_RE = /^\s*(i pay for|i have|can you add|please add)\s+/i
const BRAND_REPLACEMENTS = [
    [/\bt mobile\b/gi, 'T-Mobile'],
    [/\bchat g p t\b/gi, 'ChatGPT'],
    [/\bh b o max\b/gi, 'HBO Max'],
    [/\bapple tv\b/gi, 'Apple TV'],
    [/\byou tube\b/gi, 'YouTube'],
]

function isNumberWord(token) {
    return token in NUMBER_WORDS || token in MAGNITUDE_WORDS
}

function parseCardinalTokens(tokens) {
    let total = 0
    let current = 0

    for (const token of tokens) {
        if (token in NUMBER_WORDS) {
            current += NUMBER_WORDS[token]
            continue
        }

        if (token === 'hundred') {
            current = Math.max(current, 1) * 100
            continue
        }

        if (token === 'thousand') {
            total += Math.max(current, 1) * 1000
            current = 0
        }
    }

    return total + current
}

function parseAmountTokens(tokens, nextToken) {
    if (!tokens.length || tokens.some((token) => !isNumberWord(token))) {
        return null
    }

    if (nextToken === 'dollars' || nextToken === 'dollar') {
        return String(parseCardinalTokens(tokens))
    }

    if (tokens.includes('hundred') || tokens.includes('thousand')) {
        return String(parseCardinalTokens(tokens))
    }

    if (tokens.length === 2) {
        const [first, second] = tokens.map((token) => NUMBER_WORDS[token])
        if (first >= 10 && second >= 10) {
            return `${first}.${String(second).padStart(2, '0')}`
        }
        return String(parseCardinalTokens(tokens))
    }

    if (tokens.length === 3) {
        const [first, second, third] = tokens.map((token) => NUMBER_WORDS[token])
        if (first >= 10 && second >= 20 && third >= 0 && third <= 9) {
            return `${first}.${String(second + third).padStart(2, '0')}`
        }
    }

    return null
}

function normalizeSpokenAmounts(text) {
    const tokens = text.split(/\s+/)
    const output = []

    for (let index = 0; index < tokens.length; ) {
        let end = index
        while (end < tokens.length && isNumberWord(tokens[end].toLowerCase()) && end - index < 4) {
            end += 1
        }

        if (end > index) {
            const phraseTokens = tokens.slice(index, end).map((token) => token.toLowerCase())
            const nextToken = tokens[end]?.toLowerCase()
            const normalized = parseAmountTokens(phraseTokens, nextToken)
            if (normalized) {
                output.push(normalized)
                index = end
                if (nextToken === 'dollars' || nextToken === 'dollar') {
                    index += 1
                }
                continue
            }
        }

        output.push(tokens[index])
        index += 1
    }

    return output.join(' ')
}

function collapseRepeatedFragments(text) {
    const fragments = text
        .split(/[,\n]+/)
        .map((fragment) => fragment.trim())
        .filter(Boolean)

    const deduped = []
    for (const fragment of fragments) {
        if (deduped[deduped.length - 1]?.toLowerCase() === fragment.toLowerCase()) continue
        deduped.push(fragment)
    }

    return deduped.join(', ')
}

export function normalizeVoiceTranscriptForParse(rawTranscript) {
    let text = String(rawTranscript || '').trim()
    if (!text) return ''

    for (const [pattern, replacement] of BRAND_REPLACEMENTS) {
        text = text.replace(pattern, replacement)
    }

    text = text
        .replace(FILLER_RE, ' ')
        .replace(COMMAND_RE, ' ')
        .replace(LEADING_PHRASE_RE, '')
        .replace(/\s+/g, ' ')
        .trim()

    text = normalizeSpokenAmounts(text)
    text = collapseRepeatedFragments(text)

    return text.replace(/\s+/g, ' ').trim()
}
