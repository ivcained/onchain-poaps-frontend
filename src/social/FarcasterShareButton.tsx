import type { ShareMoment } from './sharePayload'
import { composeShare } from '../app/farcaster'

type Props = { moment: ShareMoment; label?: string }

export function FarcasterShareButton({ moment, label = 'Pass the relay' }: Props) {
  const share = async () => {
    try {
      await composeShare(moment)
    } catch {
      // The user may cancel a native share sheet; no error surface is needed.
    }
  }

  return <button type="button" className="share-button" onClick={share}>{label}</button>
}
