const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SYSTEM_PROMPT = `
You are a financial subscription parser.

Your job is to extract structured subscription data from natural language text.

The user may describe subscriptions casually like:
- "Netflix $15 monthly"
- "Spotify yearly 99"
- "Claude Pro 20 per month"
- "Gym membership 50 every month on the 3rd"
- "Car insurance 600 every 6 months"
- "Apple iCloud storage $2.99 monthly"

You must convert these into a clean JSON array.

-------------------------------------

OUTPUT FORMAT

Return ONLY a valid JSON array.

Each object must contain:

name: The official service name.
Examples: "Netflix", "Spotify", "Claude Pro", "Planet Fitness".

amount: Monthly cost as a number.
If annual, convert to the actual amount but keep cycle as annual.

cycle: One of:
"monthly"
"annual"
"weekly"
"quarterly"

category: Choose ONE from:

Entertainment
Dev Tools
Health
Productivity
Cloud
News & Media
Utilities
Loans
Insurance
Other

renewalDate:
Return the NEXT upcoming date in YYYY-MM-DD format.

HOW TO CALCULATE RENEWAL DATES:
1. Identify the billing day (e.g. "every 11th" -> day 11).
2. Compare the billing day to the CURRENT day.
3. If billing day >= CURRENT day, the renewal date is THIS month.
4. If billing day < CURRENT day, the renewal date is NEXT month.

CRITICAL EXAMPLES:
If today is "2026-03-05" and the user says "every 11th": 11 is >= 5, so return "2026-03-11".
If today is "2026-03-05" and the user says "every 2nd": 2 is < 5, so return "2026-04-02".

If no date is provided return null.

-------------------------------------

CLEANING RULES

Service names must be clean.

BAD:
"Netflix subscription"
"Spotify plan"

GOOD:
"Netflix"
"Spotify"

Remove words like:
subscription
plan
account
membership
app

-------------------------------------

AMOUNT RULES

Extract numbers even if currency is present.

Examples:

"$15" → 15
"20 dollars" → 20
"99/year" → 99

-------------------------------------

MULTIPLE SUBSCRIPTIONS

The user may provide many subscriptions in one sentence.

Example:

"I pay Netflix 15 monthly, Spotify 12 monthly and Claude 20"

You must return three objects.

-------------------------------------

STRICT OUTPUT RULE

Return ONLY JSON.

Do NOT include explanations.
Do NOT include markdown.
Do NOT include extra text.
`

type ParsePayload = {
  text?: string
  currentDate?: string
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const apiKey = Deno.env.get('ANTHROPIC_API_KEY')
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'Missing ANTHROPIC_API_KEY' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { text, currentDate }: ParsePayload = await req.json()
    if (!text?.trim()) {
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
              {
                type: 'text',
                text: `Current date context: ${currentDate || 'today'}\n\nParse these subscriptions:\n\n${text}`
              }
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

    return new Response(JSON.stringify({ subscriptions }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
