import { describe, expect, it, vi } from 'vitest'

const { ready } = vi.hoisted(() => ({ ready: vi.fn().mockResolvedValue(undefined) }))
vi.mock('@farcaster/miniapp-sdk', () => ({ sdk: { actions: { ready } } }))

import { announceMiniAppReady, initializeMiniApp } from './farcaster'

describe('Farcaster Mini App bootstrap', () => {
  it('calls ready without waiting for React effects', async () => {
    announceMiniAppReady()
    await Promise.resolve()
    expect(ready).toHaveBeenCalled()
  })
  it('reports successful readiness', async () => {
    await expect(initializeMiniApp()).resolves.toBe(true)
  })
})
