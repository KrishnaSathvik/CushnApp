import { describe, expect, it } from 'vitest'

import { ACCEPTED_FILE_TYPES, hasMeaningfulExtractedText } from '../lib/fileParser'

describe('hasMeaningfulExtractedText', () => {
  it('rejects empty or tiny extracted text', () => {
    expect(hasMeaningfulExtractedText('')).toBe(false)
    expect(hasMeaningfulExtractedText('--- statement.pdf ---')).toBe(false)
    expect(hasMeaningfulExtractedText('Page 1')).toBe(false)
  })

  it('accepts realistic statement-like text', () => {
    expect(
      hasMeaningfulExtractedText(
        '03/01/2026 T-MOBILE AUTOPAY 85.00 03/03/2026 GEICO INSURANCE 142.12 03/05/2026 NETFLIX.COM 15.49'
      )
    ).toBe(true)
  })

  it('rejects mostly separators and noise', () => {
    expect(
      hasMeaningfulExtractedText('--- PAGE BREAK --- --- PAGE BREAK --- #### 1234')
    ).toBe(false)
  })

  it('advertises spreadsheet uploads in accepted file types', () => {
    expect(ACCEPTED_FILE_TYPES).toContain('.xlsx')
    expect(ACCEPTED_FILE_TYPES).toContain('.xls')
  })
})
