/**
 * fileParser.js
 * Extracts readable text from uploaded files (PDF, CSV, TXT)
 * so the AI can parse subscriptions from them.
 */

import pdfWorkerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import * as XLSX from 'xlsx'

const IMAGE_MIME_TYPES = new Set([
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
])

export function hasMeaningfulExtractedText(text) {
    if (!text || typeof text !== 'string') return false

    const normalized = text
        .replace(/---\s*PAGE BREAK\s*---/gi, ' ')
        .replace(/\s+/g, ' ')
        .trim()

    if (normalized.length < 40) return false

    const letterCount = (normalized.match(/[A-Za-z]/g) || []).length
    const digitCount = (normalized.match(/\d/g) || []).length
    const wordCount = normalized.split(/\s+/).filter(Boolean).length

    return wordCount >= 8 && (letterCount >= 20 || digitCount >= 8)
}

/**
 * Extract text from a PDF file using pdfjs-dist.
 * @param {File} file
 * @returns {Promise<string>}
 */
async function extractPdfText(file) {
    // Dynamic import to avoid loading pdfjs on every page
    const pdfjsLib = await import('pdfjs-dist')

    // Use the worker bundled by Vite so uploads do not depend on a CDN path.
    pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerSrc

    const arrayBuffer = await file.arrayBuffer()
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer })
    const pdf = await loadingTask.promise

    const pageTexts = []
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const content = await page.getTextContent()

        // Sort items by y-position (top-to-bottom) then x-position so the
        // extracted text order mirrors what a human would read on screen.
        const sorted = [...content.items].sort((a, b) => {
            const dy = b.transform[5] - a.transform[5]
            if (Math.abs(dy) > 2) return dy
            return a.transform[4] - b.transform[4]
        })

        // Join with newlines when the y-position changes significantly
        let pageText = ''
        let lastY = null
        for (const item of sorted) {
            if (!('str' in item)) continue
            const y = Math.round(item.transform[5])
            if (lastY !== null && Math.abs(lastY - y) > 4) {
                pageText += '\n'
            }
            pageText += item.str + ' '
            lastY = y
        }
        pageTexts.push(pageText.trim())
    }

    return pageTexts.join('\n\n--- PAGE BREAK ---\n\n')
}

/**
 * Read a plain-text or CSV file as a string.
 * @param {File} file
 * @returns {Promise<string>}
 */
function readTextFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (e) => resolve(e.target.result)
        reader.onerror = () => reject(new Error('Failed to read file'))
        reader.readAsText(file, 'utf-8')
    })
}

function readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (e) => resolve(String(e.target?.result || ''))
        reader.onerror = () => reject(new Error('Failed to read file'))
        reader.readAsDataURL(file)
    })
}

async function extractSpreadsheetText(file) {
    const arrayBuffer = await file.arrayBuffer()
    const workbook = XLSX.read(arrayBuffer, { type: 'array' })

    const sheets = workbook.SheetNames.map((sheetName) => {
        const sheet = workbook.Sheets[sheetName]
        const rows = XLSX.utils.sheet_to_json(sheet, {
            header: 1,
            raw: false,
            defval: '',
            blankrows: false,
        })

        const textRows = rows
            .map((row) => Array.isArray(row) ? row.map((cell) => String(cell).trim()).filter(Boolean).join(' | ') : '')
            .filter(Boolean)

        return textRows.length > 0
            ? `--- SHEET: ${sheetName} ---\n${textRows.join('\n')}`
            : ''
    }).filter(Boolean)

    if (sheets.length === 0) {
        throw new Error(`No readable rows found in ${file.name}.`)
    }

    return sheets.join('\n\n')
}

export function isImageFile(file) {
    const name = file?.name?.toLowerCase?.() || ''
    const type = file?.type?.toLowerCase?.() || ''
    return (
        IMAGE_MIME_TYPES.has(type) ||
        name.endsWith('.jpg') ||
        name.endsWith('.jpeg') ||
        name.endsWith('.png') ||
        name.endsWith('.webp') ||
        name.endsWith('.gif')
    )
}

export async function createImageAttachment(file) {
    if (!isImageFile(file)) {
        throw new Error(`Unsupported image type: ${file?.name || 'unknown file'}. Please upload a JPG, PNG, WEBP, or GIF image.`)
    }

    const dataUrl = await readFileAsDataUrl(file)
    const [, mediaType = '', data = ''] = dataUrl.match(/^data:([^;]+);base64,(.+)$/) || []

    if (!mediaType || !data) {
        throw new Error(`Could not read image data from ${file.name}.`)
    }

    return {
        type: 'image',
        fileName: file.name,
        mediaType,
        data,
    }
}

/**
 * Main entry point — returns extracted text from any supported file.
 * @param {File} file
 * @returns {Promise<string>}
 */
export async function extractFileText(file) {
    const name = file.name.toLowerCase()
    const type = file.type.toLowerCase()

    if (type === 'application/pdf' || name.endsWith('.pdf')) {
        return extractPdfText(file)
    }

    if (
        type === 'text/csv' ||
        type === 'text/plain' ||
        name.endsWith('.csv') ||
        name.endsWith('.txt') ||
        name.endsWith('.tsv')
    ) {
        return readTextFile(file)
    }

    if (
        type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        type === 'application/vnd.ms-excel' ||
        name.endsWith('.xlsx') ||
        name.endsWith('.xls')
    ) {
        return extractSpreadsheetText(file)
    }

    if (isImageFile(file)) {
        throw new Error(
            `Image files are analyzed directly by AI. Use the upload flow rather than text extraction for ${file.name}.`
        )
    }

    throw new Error(
        `Unsupported file type: ${file.name}. Please upload a PDF, CSV, XLSX, TXT, or image file.`
    )
}

/**
 * Human-readable accepted file extensions string (for the `accept` attribute).
 */
export const ACCEPTED_FILE_TYPES = '.pdf,.csv,.xlsx,.xls,.txt,.tsv,.jpg,.jpeg,.png,.webp,.gif'
