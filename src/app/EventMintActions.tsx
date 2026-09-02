import type { Address } from 'viem'
import type { MintMethod } from './mintMethod'
import { mintMethodLabel } from './mintMethod'

export type EventMintActionsProps = {
  method: MintMethod
  connected: boolean
  canWrite: boolean
  claimed: boolean
  isWriting: boolean
  isConfirming: boolean
  eventUrl: string
  explorerUrl: string
  onMint: () => void
  onRelay?: () => void
  address?: Address
}

export function EventMintActions({ method, connected, canWrite, claimed, isWriting, isConfirming, eventUrl, explorerUrl, onMint, onRelay }: EventMintActionsProps) {
  const disabled = !connected || !canWrite || method === 'closed' || isWriting || isConfirming
  const label = !connected ? 'Connect wallet to mint' : !canWrite ? 'Switch to Base Sepolia' : isWriting ? 'Confirm in wallet…' : isConfirming ? 'Confirming…' : mintMethodLabel(method)
  return <div className="event-actions"><button type="button" className="register-button" disabled={disabled || claimed} onClick={onMint}>{claimed ? 'Already collected' : label}</button><span className="field-hint">{method === 'signature' ? 'Your creator-signed claim is ready.' : method === 'allowlist' ? 'Your wallet is eligible for this allowlist.' : method === 'public' ? 'One claim per wallet while public minting is open.' : 'No minting method is available for this event.'}</span>{claimed && onRelay && <button type="button" className="share-button" onClick={onRelay}>Pass the relay</button>}<a className="tx-link" href={explorerUrl} target="_blank" rel="noreferrer">↗ Verify on BaseScan</a><a className="sr-only" href={eventUrl}>Open event</a></div>
}
