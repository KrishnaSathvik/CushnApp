const COMMON_PATTERNS = [
  'password',
  '123456',
  'qwerty',
  'admin',
  'letmein',
  'welcome',
  'subtrackr',
]

export function evaluatePassword(password = '') {
  const value = String(password)
  const isEmpty = value.length === 0
  const lengthOK = value.length >= 8
  const hasUpper = /[A-Z]/.test(value)
  const hasLower = /[a-z]/.test(value)
  const hasNumber = /[0-9]/.test(value)
  const hasSymbol = /[^A-Za-z0-9]/.test(value)
  const hasNoCommonPattern = value.length > 0 && !COMMON_PATTERNS.some((p) => value.toLowerCase().includes(p))
  const hasNoSequence = value.length > 0 && !/(0123|1234|2345|3456|4567|5678|6789|abcd|qwer)/i.test(value)

  const checks = [
    { id: 'length', label: 'At least 8 characters', passed: lengthOK },
    { id: 'upper', label: 'An uppercase letter', passed: hasUpper },
    { id: 'lower', label: 'A lowercase letter', passed: hasLower },
    { id: 'number', label: 'A number', passed: hasNumber },
    { id: 'symbol', label: 'A symbol', passed: hasSymbol },
    { id: 'patterns', label: 'No common patterns', passed: hasNoCommonPattern && hasNoSequence },
  ]

  const baseScore = checks.filter((c) => c.passed).length
  const patternPenalty = hasNoCommonPattern && hasNoSequence ? 0 : 2
  const score = Math.max(0, baseScore - patternPenalty)
  const label =
    score <= 2 ? 'Weak' :
      score <= 4 ? 'Fair' :
        score === 5 ? 'Good' : 'Strong'

  const suggestions = checks.filter((c) => !c.passed).map((c) => c.label)

  return {
    isEmpty,
    score,
    label,
    checks,
    suggestions,
  }
}
