import { describe, it, expect } from 'vitest'
import { evaluatePassword } from '../lib/passwordPolicy'

describe('passwordPolicy', () => {
  it('marks short/common passwords as weak', () => {
    const res = evaluatePassword('password123')
    expect(res.label).toBe('Weak')
    expect(res.score).toBeLessThan(3)
  })

  it('marks mixed but incomplete passwords as fair/good', () => {
    const res = evaluatePassword('trackbills2026')
    expect(res.score).toBeGreaterThanOrEqual(3)
    expect(['Fair', 'Good', 'Strong']).toContain(res.label)
  })

  it('marks strong passwords as strong', () => {
    const res = evaluatePassword('Z7!mQ2@pL9#r')
    expect(res.label).toBe('Strong')
    expect(res.score).toBe(6)
  })
})
