import {
  coerceFutureRenewalDate,
  normalizeCategory,
  normalizeCycle,
} from '../../../shared/parseNormalization.ts'

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SYSTEM_PROMPT = `
You are an expert financial subscription and recurring payment parser.

Your job is to extract ONLY recurring subscription or bill charges from text — whether it's a bank statement export (CSV/PDF), a manual description, or a list of services the user pays for.

===== WHEN READING BANK STATEMENTS =====

Bank statement text may include every transaction. You must:
1. IGNORE all one-time purchases (restaurants, retail shopping, ATM withdrawals, transfers, refunds, etc.)
2. ONLY extract transactions that are clearly recurring subscriptions or recurring bills.

Strong signals a charge is a subscription or recurring bill:
- Known streaming/SaaS services: Netflix, Spotify, Hulu, Disney+, Apple, Google, Amazon Prime, etc.
- The word "subscription", "monthly", "annual", "recurring", "membership" in the description
- Utility companies: electric, gas, water, internet providers, phone carriers
- Insurance companies
- Loan payments
- Cloud storage services
- SaaS tools: GitHub, Figma, Slack, Zoom, Notion, Adobe, etc.

If the text is sparse, noisy, OCR-corrupted, mostly headers, mostly filenames, or does not contain enough evidence to support a recurring charge, return [].
Never guess based on common subscriptions. Only include a service when the input text provides direct evidence.

DO NOT extract:
- One-time purchases at retail stores, restaurants, or gas stations
- ATM or cash withdrawals
- Transfers between accounts
- Refunds or credits
- Payroll / salary deposits

===== USER-DESCRIBED SUBSCRIPTIONS =====

The user may also write naturally:
- "Netflix $15 monthly"
- "Spotify yearly 99"
- "Gym membership $50 every month on the 3rd"
- "Car insurance 600 every 6 months"

Parse these normally.

===== OUTPUT FORMAT =====

Return ONLY a valid JSON array. No extra text, no markdown, no explanations.

Each object must have:

  name: The clean official service/company name.
    Remove: "subscription", "plan", "account", "membership", "app", "payment", "billing"
    Examples: "Netflix", "Spotify", "T-Mobile", "Geico"

  amount: The charge amount as a number (always positive).
    Extract from "$15", "15.99", "USD 12.00" etc.
    For annual billing, keep the actual annual amount.

  cycle: One of exactly: "monthly" | "annual" | "weekly" | "quarterly"
    If unknown, default to "monthly".
    Hint: If the same charge appears ~12 times in a year-worth of data, it's monthly.

  category: Choose the BEST match from this exact list:
    "Entertainment"   → streaming media, music, gaming, video, books
    "Dev Tools"       → software dev tools, hosting, APIs, design tools (Figma, GitHub, AWS, Vercel)
    "Health"          → gym, fitness apps, health/wellness, meditation
    "Productivity"    → AI tools, task managers, project management, office suites (Notion, Slack, Zoom, OpenAI, Claude)
    "Cloud"           → cloud storage, backup services (iCloud, Google One, Dropbox, OneDrive)
    "News & Media"    → news sites, magazines, newsletters, podcasts (NYT, Substack, Economist)
    "Utilities"       → internet, phone, electricity, gas, water, trash, TV/cable
    "Loans"           → student loans, car payments, mortgage payments, credit card minimum payments
    "Insurance"       → health, car, renters, homeowners, life insurance
    "Other"           → anything that doesn't clearly fit above

  renewalDate: The NEXT upcoming charge date in YYYY-MM-DD.
    - Use any date visible in the statement for this charge.
    - If the date has already passed, project it forward one billing cycle.
    - If no date is available, return null.

===== RENEWAL DATE RULES =====

HOW TO CALCULATE RENEWAL DATES:
1. Identify the billing day (e.g. "every 11th" → day 11).
2. Compare the billing day to the CURRENT day.
3. If billing day >= CURRENT day → return THIS month.
4. If billing day < CURRENT day → return NEXT month.

EXAMPLES (if today is "2026-03-09"):
- "every 11th" → "2026-03-11"  (11 >= 9, so this month)
- "every 2nd"  → "2026-04-02"  (2 < 9, so next month)

===== DEDUPLICATION =====

If you see the same service charged multiple months in the statement data, return it ONCE.

===== AMOUNT NORMALIZATION =====

"$15" → 15
"20 dollars" → 20  
"USD 9.99" → 9.99
"99/year" → 99  (cycle: "annual")

===== STRICT RULES =====

Return ONLY a JSON array.
Do NOT include explanations.
Do NOT include markdown code fences.
Do NOT include extra text.
If no recurring subscriptions or bills are clearly present, return [].
`

type ParsePayload = {
  text?: string
  currentDate?: string
  attachments?: Array<{
    type?: string
    mediaType?: string
    data?: string
    fileName?: string
  }>
}

function cleanName(value: unknown) {
  return String(value || '')
    .replace(/\s+/g, ' ')
    .trim()
}

function normalizeAmount(value: unknown) {
  const numeric = typeof value === 'number'
    ? value
    : Number.parseFloat(String(value || '').replace(/[^0-9.-]/g, ''))
  if (!Number.isFinite(numeric) || numeric <= 0) return null
  return Math.round(numeric * 100) / 100
}

function fingerprintSubscription(item: { name: string; amount: number; cycle: string }) {
  return `${item.name.toLowerCase()}|${item.amount.toFixed(2)}|${item.cycle}`
}

function normalizeSubscriptions(subscriptions: unknown[], currentDate?: string) {
  const seen = new Set<string>()
  const normalized = []

  for (const item of subscriptions) {
    if (!item || typeof item !== 'object') continue

    const name = cleanName((item as Record<string, unknown>).name)
    const amount = normalizeAmount((item as Record<string, unknown>).amount)
    const cycle = normalizeCycle((item as Record<string, unknown>).cycle)
    const category = normalizeCategory((item as Record<string, unknown>).category)
    const renewalDate = coerceFutureRenewalDate((item as Record<string, unknown>).renewalDate, cycle, currentDate)

    if (!name || amount == null) continue

    const normalizedItem = { name, amount, cycle, category, renewalDate }
    const fingerprint = fingerprintSubscription(normalizedItem)
    if (seen.has(fingerprint)) continue
    seen.add(fingerprint)
    normalized.push(normalizedItem)
  }

  return normalized
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  try {
    const apiKey = Deno.env.get('ANTHROPIC_API_KEY')
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'Missing ANTHROPIC_API_KEY' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { text, currentDate, attachments = [] }: ParsePayload = await req.json().catch(() => ({}))
    const imageAttachments = attachments
      .filter((item) => item?.type === 'image' && item?.mediaType && item?.data)
      .map((item) => ({
        type: 'image',
        source: {
          type: 'base64',
          media_type: item.mediaType,
          data: item.data,
        },
      }))

    if (!text?.trim() && imageAttachments.length === 0) {
      return new Response(JSON.stringify({ subscriptions: [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const response = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1024,
        temperature: 0,
        system: SYSTEM_PROMPT + '\nCRITICAL FOR DATES:\nThe renewalDate MUST ALWAYS be the NEXT upcoming payment date in the FUTURE. If today is 2026-03-04 and the user says "every 11th", the next payment is 2026-03-11. BUT if today is 2026-03-04 and the user says "every 2nd", the next payment is 2026-04-02 because the 2nd already passed this month. Never return a date in the past.',
        messages: [
          {
            role: 'user',
            content: [
              ...imageAttachments,
              {
                type: 'text',
                text: `Current date context: ${currentDate || 'today'}\n\nParse these subscriptions from the provided statement text and/or images. If the images or text do not clearly show recurring subscriptions or bills, return [] and do not guess.\n\n${text || 'No extracted text was available. Use only the uploaded images if they contain readable subscription or bill information.'}`
              },
            ]
          },
        ],
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      return new Response(JSON.stringify({ error: err }), {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const data = await response.json()
    const content = data?.content?.[0]?.text || ''
    const jsonMatch = content.match(/\[[\s\S]*\]/)

    let subscriptions = []
    try {
      subscriptions = jsonMatch ? JSON.parse(jsonMatch[0]) : []
    } catch {
      subscriptions = []
    }

    const normalized = normalizeSubscriptions(
      Array.isArray(subscriptions) ? subscriptions : [],
      currentDate,
    )

    return new Response(JSON.stringify({ subscriptions: normalized }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
