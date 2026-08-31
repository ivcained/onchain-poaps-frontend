import { describe, expect, it, vi } from 'vitest'
import { initializeMiniApp } from './farcaster'

vi.mock('@farcaster/miniapp-sdk', () => ({ sdk: { actions: { ready: vi.fn().mockResolvedValue(undefined) } } }))

describe('Farcaster Mini App bootstrap', () => {
  it('signals readiness when embedded', async () => {
    await expect(initializeMiniApp()).resolves.toBe(true)
  })
})
