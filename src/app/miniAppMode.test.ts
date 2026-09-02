import { describe, expect, it, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { detectMiniAppMode, useMiniAppMode } from './miniAppMode'

const context = vi.hoisted(() => ({ value: Promise.resolve<{ user: { fid: number } } | null>({ user: { fid: 1 } }) }))
vi.mock('@farcaster/miniapp-sdk', () => ({ sdk: { get context() { return context.value } } }))

describe('Mini App mode', () => {
  it('starts resolving before exposing chrome mode', () => {
    const { result } = renderHook(() => useMiniAppMode())
    expect(result.current).toBe('resolving')
  })

  it('detects a Farcaster host from SDK context', async () => {
    await expect(detectMiniAppMode()).resolves.toBe('miniapp')
  })

  it('falls back to standalone when SDK context is absent', async () => {
    context.value = Promise.resolve(null)
    await expect(detectMiniAppMode()).resolves.toBe('standalone')
  })

  it('settles the hook in standalone mode without context', async () => {
    context.value = Promise.resolve(null)
    const { result } = renderHook(() => useMiniAppMode())
    await waitFor(() => expect(result.current).toBe('standalone'))
  })
})
