import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocked = vi.hoisted(() => ({
  isConfigured: true,
  insertSingle: vi.fn(),
  updateEq: vi.fn(),
  from: vi.fn(),
}))

vi.mock('../lib/supabase', () => ({
  isSupabaseConfigured: () => mocked.isConfigured,
  supabase: {
    from: mocked.from,
  },
}))

import {
  convertGuestSessionToUser,
  createGuestSession,
  ensureGuestSession,
  touchGuestSession,
} from '../lib/guestSessions'

describe('guestSessions', () => {
  beforeEach(() => {
    mocked.isConfigured = true
    mocked.insertSingle.mockReset()
    mocked.updateEq.mockReset()
    mocked.from.mockReset()

    mocked.from.mockImplementation(() => ({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: mocked.insertSingle,
        })),
      })),
      update: vi.fn(() => ({
        eq: mocked.updateEq,
      })),
    }))

    Object.defineProperty(globalThis, 'window', {
      value: {
        location: {
          origin: 'https://app.example.com',
          pathname: '/guest',
        },
      },
      configurable: true,
    })

    Object.defineProperty(globalThis, 'navigator', {
      value: {
        language: 'en-US',
        platform: 'MacIntel',
        userAgent: 'Vitest Browser',
      },
      configurable: true,
    })
  })

  it('creates a guest session row and returns the id', async () => {
    mocked.insertSingle.mockResolvedValue({
      data: { id: 'guest-1' },
      error: null,
    })

    const guestSessionId = await createGuestSession('Krishna')

    expect(guestSessionId).toBe('guest-1')
    expect(mocked.from).toHaveBeenCalledWith('guest_sessions')
  })

  it('touches an existing guest session without creating a new one', async () => {
    mocked.updateEq.mockResolvedValue({ error: null })

    const guestSessionId = await ensureGuestSession('guest-1', 'Krishna')

    expect(guestSessionId).toBe('guest-1')
    expect(mocked.insertSingle).not.toHaveBeenCalled()
    expect(mocked.updateEq).toHaveBeenCalledWith('id', 'guest-1')
  })

  it('links a guest session to an authenticated user', async () => {
    mocked.updateEq.mockResolvedValue({ error: null })

    const converted = await convertGuestSessionToUser('guest-1', 'user-1')

    expect(converted).toBe(true)
    expect(mocked.updateEq).toHaveBeenCalledWith('id', 'guest-1')
  })

  it('returns false when touch fails', async () => {
    mocked.updateEq.mockResolvedValue({ error: new Error('write failed') })

    const touched = await touchGuestSession('guest-1', 'Krishna')

    expect(touched).toBe(false)
  })
})
