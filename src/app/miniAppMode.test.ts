import { describe, expect, it, vi } from 'vitest'
import { detectMiniAppMode } from './miniAppMode'

vi.mock('@farcaster/miniapp-sdk', () => ({ sdk: { context: Promise.resolve({ user: { fid: 1 } }) } }))

describe('Mini App mode', () => {
  it('detects a Farcaster host from SDK context', async () => {
    await expect(detectMiniAppMode()).resolves.toBe('miniapp')
  })
})
