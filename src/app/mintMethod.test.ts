import { describe, expect, it } from 'vitest'
import { chooseMintMethod, mintMethodLabel } from './mintMethod'

describe('mint method selection', () => {
  it('prioritizes a recipient-bound signature', () => {
    expect(chooseMintMethod({ hasSignature: true, allowlistEnabled: true, allowlistEligible: true, isPublic: true, claimed: false })).toBe('signature')
  })
  it('falls back from allowlist to public mint', () => {
    expect(chooseMintMethod({ hasSignature: false, allowlistEnabled: true, allowlistEligible: false, isPublic: true, claimed: false })).toBe('public')
  })
  it('reports already claimed as closed', () => {
    expect(chooseMintMethod({ hasSignature: true, allowlistEnabled: true, allowlistEligible: true, isPublic: true, claimed: true })).toBe('closed')
  })
  it('provides action-oriented labels', () => {
    expect(mintMethodLabel('public')).toBe('Mint this POAP')
  })
})
