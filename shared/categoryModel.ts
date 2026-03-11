export const CATEGORY_DEFINITIONS = [
  { name: 'Entertainment', color: '#F87171', icon: 'film', isDefault: true },
  { name: 'Productivity', color: '#0D9488', icon: 'lightbulb', isDefault: true },
  { name: 'Dev Tools', color: '#60A5FA', icon: 'code', isDefault: true },
  { name: 'Cloud & Storage', color: '#A78BFA', icon: 'cloud', isDefault: true },
  { name: 'Debt & Loans', color: '#8B5CF6', icon: 'landmark', isDefault: true },
  { name: 'Utilities', color: '#F97316', icon: 'zap', isDefault: true },
  { name: 'Health & Fitness', color: '#34D399', icon: 'heart-pulse', isDefault: true },
  { name: 'Insurance', color: '#3B82F6', icon: 'shield', isDefault: true },
  { name: 'News & Media', color: '#FBBF24', icon: 'newspaper', isDefault: true },
  { name: 'Auto & Transport', color: '#6366F1', icon: 'landmark', isDefault: true },
  { name: 'Money Transfers', color: '#14B8A6', icon: 'landmark', isDefault: true },
  { name: 'Shopping', color: '#EC4899', icon: 'tag', isDefault: true },
  { name: 'Other', color: '#6B7280', icon: 'tag', isDefault: true },
] as const

export const CATEGORY_NAMES = CATEGORY_DEFINITIONS.map((item) => item.name)

export const CATEGORY_ALIASES: Record<string, string> = {
  cloud: 'Cloud & Storage',
  'cloud and storage': 'Cloud & Storage',
  'cloud & storage': 'Cloud & Storage',
  health: 'Health & Fitness',
  'health and fitness': 'Health & Fitness',
  'health & fitness': 'Health & Fitness',
  loans: 'Debt & Loans',
  debt: 'Debt & Loans',
  'loans & cards': 'Debt & Loans',
  'loans and cards': 'Debt & Loans',
  'debt & loans': 'Debt & Loans',
  'debt and loans': 'Debt & Loans',
  transfers: 'Money Transfers',
  shopping: 'Shopping',
  entertainment: 'Entertainment',
  productivity: 'Productivity',
  'dev tools': 'Dev Tools',
  utilities: 'Utilities',
  insurance: 'Insurance',
  'news & media': 'News & Media',
  'news and media': 'News & Media',
  'auto & transport': 'Auto & Transport',
  'auto and transport': 'Auto & Transport',
  other: 'Other',
}

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  Entertainment: [
    'netflix',
    'spotify',
    'hulu',
    'disney',
    'max',
    'hbo',
    'peacock',
    'paramount',
    'crunchyroll',
    'twitch',
    'youtube premium',
    'apple tv',
    'prime video',
    'amc',
    'movie',
    'streaming',
    'music',
  ],
  Productivity: [
    'claude',
    'chatgpt',
    'chat gpt',
    'perplexity',
    'slack',
    'zoom',
    'loom',
    'todoist',
    'obsidian',
    'notion',
    'craft',
    'openai',
    'ai',
    'copilot',
    'grok',
    'grammarly',
    'adobe',
  ],
  'Dev Tools': [
    'github',
    'figma',
    'vercel',
    'netlify',
    'linear',
    'jira',
    'postman',
    'sentry',
    'datadog',
    'aws',
    'azure',
    'digitalocean',
    'digital ocean',
    'heroku',
    'cursor',
    'jetbrains',
    'supabase',
    'docker',
  ],
  'Cloud & Storage': [
    'icloud',
    'dropbox',
    'google one',
    'google drive',
    'onedrive',
    'backblaze',
    'box',
    'storage',
    'backup',
    'cloud',
    'drive',
  ],
  'Debt & Loans': [
    'loan',
    'credit card',
    'card payment',
    'minimum payment',
    'upstart',
    'affirm',
    'klarna',
    'afterpay',
    'credit',
    'debt',
    'amex',
    'capital one',
    'chase',
    'discover',
    'citi',
    'apple card',
  ],
  Utilities: [
    'electric',
    'electricity',
    'water',
    'gas',
    'internet',
    'wifi',
    'trash',
    'sewer',
    'sewage',
    'phone',
    'cell',
    'verizon',
    'comcast',
    'xfinity',
    'spectrum',
    'att',
    'at&t',
    't mobile',
    't-mobile',
    'mint mobile',
    'utility',
    'rent',
    'mortgage',
  ],
  'Health & Fitness': [
    'health',
    'fitness',
    'gym',
    'planet fitness',
    'peloton',
    'whoop',
    'headspace',
    'calm',
    'myfitnesspal',
    'classpass',
    'workout',
    'meditation',
  ],
  Insurance: [
    'insurance',
    'geico',
    'state farm',
    'progressive',
    'allstate',
    'liberty mutual',
    'renters',
    'homeowners',
    'car insurance',
  ],
  'News & Media': [
    'news',
    'media',
    'new york times',
    'nytimes',
    'wsj',
    'wall street journal',
    'medium',
    'substack',
    'economist',
    'audible',
    'kindle unlimited',
    'patreon',
  ],
  'Auto & Transport': [
    'car payment',
    'auto loan',
    'toyota financial',
    'ford credit',
    'carvana',
    'carmax',
    'parking',
    'toll',
    'aaa',
    'uber one',
  ],
  'Money Transfers': [
    'ria',
    'ria transfer',
    'western union',
    'wise',
    'remitly',
    'money transfer',
    'remittance',
  ],
  Shopping: [
    'amazon prime',
    'instacart',
    'instacart+',
    'walmart+',
    'costco',
    'target circle',
    'shopping',
    'delivery membership',
  ],
}

function normalizeKey(value: unknown) {
  return String(value || '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function normalizeCategoryName(value: unknown) {
  const raw = String(value || '').trim()
  if (!raw) return 'Other'

  const exact = CATEGORY_NAMES.find((name) => normalizeKey(name) === normalizeKey(raw))
  if (exact) return exact

  return CATEGORY_ALIASES[normalizeKey(raw)] || 'Other'
}

export function inferCategoryFromText(value: unknown) {
  const text = normalizeKey(value)
  if (!text) return 'Other'

  let bestMatch = { category: 'Other', score: 0 }

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const keyword of keywords) {
      const normalizedKeyword = normalizeKey(keyword)
      if (!normalizedKeyword || !text.includes(normalizedKeyword)) continue

      const score = normalizedKeyword.length
      if (score > bestMatch.score) {
        bestMatch = { category, score }
      }
    }
  }

  return bestMatch.category
}

export function inferCategoryFromVendor(name: unknown, vendorDomain?: unknown) {
  const combined = [name, vendorDomain]
    .map((value) => String(value || '').trim())
    .filter(Boolean)
    .join(' ')

  return inferCategoryFromText(combined)
}

export function getBillTypeForCategoryName(categoryName: unknown) {
  const normalized = normalizeCategoryName(categoryName)
  if (normalized === 'Utilities') return 'utility'
  if (
    normalized === 'Debt & Loans'
    || normalized === 'Auto & Transport'
    || normalized === 'Money Transfers'
  ) {
    return 'loan'
  }
  if (normalized === 'Insurance') return 'insurance'
  return 'subscription'
}
