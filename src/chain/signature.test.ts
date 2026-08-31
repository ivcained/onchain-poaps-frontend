import { describe, expect, it } from 'vitest'
import { isSignatureWindowOpen, signatureClaimData, signatureClaimUrl, signatureMessageHash } from './signature'

const recipient = '0x0000000000000000000000000000000000000001' as const
const signature = '0x1234' as const

describe('signature mint helpers', () => {
  it('builds a stable EIP-191 hash from the contract payload', () => {
    expect(signatureMessageHash(1n, 84532, recipient)).toMatch(/^0x[0-9a-f]{64}$/)
  })
  it('creates a claim URL and portable artifact', () => {
    const url = signatureClaimUrl('https://poaps.example', 7n, signature)
    expect(url).toBe('https://poaps.example/claim?event=7&signature=0x1234')
    expect(signatureClaimData('https://poaps.example', 7n, recipient, signature)).toEqual({ eventId: '7', recipient, signature, url })
  })
  it('enforces the inclusive 37-day window', () => {
    expect(isSignatureWindowOpen(100n, 100n + 37n * 86400n)).toBe(true)
    expect(isSignatureWindowOpen(100n, 100n + 37n * 86400n + 1n)).toBe(false)
  })
})
