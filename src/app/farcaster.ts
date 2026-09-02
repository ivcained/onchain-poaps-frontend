import { sdk } from '@farcaster/miniapp-sdk'
import { shareText, eventShareUrl, type ShareMoment } from '../social/sharePayload'

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

export async function composeShare(moment: ShareMoment, origin = window.location.origin): Promise<'composed' | 'shared' | 'copied'> {
  const text = shareText(origin, moment)
  try {
    await sdk.actions.composeCast({ text, embeds: [eventShareUrl(origin, moment.eventId)] })
    return 'composed'
  } catch {
    if (navigator.share) {
      await navigator.share({ text })
      return 'shared'
    }
    await navigator.clipboard.writeText(text)
    return 'copied'
  }
}
