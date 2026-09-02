export type MintMethod = 'signature' | 'allowlist' | 'public' | 'closed'

export type MintMethodInput = {
  hasSignature: boolean
  allowlistEnabled: boolean
  allowlistEligible: boolean
  isPublic: boolean
  claimed: boolean
}

export function chooseMintMethod(input: MintMethodInput): MintMethod {
  if (input.claimed) return 'closed'
  if (input.hasSignature) return 'signature'
  if (input.allowlistEnabled && input.allowlistEligible) return 'allowlist'
  if (input.isPublic) return 'public'
  return 'closed'
}

export function mintMethodLabel(method: MintMethod): string {
  switch (method) {
    case 'signature': return 'Mint with your claim'
    case 'allowlist': return 'Mint from the allowlist'
    case 'public': return 'Mint this POAP'
    case 'closed': return 'Minting unavailable'
  }
}
