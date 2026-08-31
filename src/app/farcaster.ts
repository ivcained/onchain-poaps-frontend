import { sdk } from '@farcaster/miniapp-sdk'

export function announceMiniAppReady(): void {
  void sdk.actions.ready().catch(() => undefined)
}

export async function initializeMiniApp(): Promise<boolean> {
  try {
    await sdk.actions.ready()
    return true
  } catch {
    return false
  }
}
