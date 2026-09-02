import { useEffect, useState } from 'react'
import { sdk } from '@farcaster/miniapp-sdk'

export type MiniAppMode = 'standalone' | 'miniapp'

export async function detectMiniAppMode(): Promise<MiniAppMode> {
  try {
    const context = await sdk.context
    return context ? 'miniapp' : 'standalone'
  } catch {
    return 'standalone'
  }
}

export function useMiniAppMode(): MiniAppMode {
  const [mode, setMode] = useState<MiniAppMode>('standalone')
  useEffect(() => { let active = true; detectMiniAppMode().then((next) => { if (active) setMode(next) }); return () => { active = false } }, [])
  return mode
}
