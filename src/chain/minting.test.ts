import { describe, expect, it } from 'vitest'
import { getAddress } from 'viem'
import { addressLeaf, eventIdFromLocation, isPublicMintAvailable } from './minting'

describe('minting helpers', () => {
  it('matches the contract address-only allowlist leaf', () => {
    const address = getAddress('0x0000000000000000000000000000000000000001')
    expect(addressLeaf(address)).toBe('0x1468288056310c82aa4c01a7e12a10f8111a0560e72b700555479031b86c357d')
  })
  it('parses event detail paths', () => {
    expect(eventIdFromLocation('/poap/12')).toBe(12n)
    expect(eventIdFromLocation('/poap/nope')).toBeNull()
  })
  it('only enables public mint for unclaimed public events', () => {
    expect(isPublicMintAvailable(true, false)).toBe(true)
    expect(isPublicMintAvailable(true, true)).toBe(false)
    expect(isPublicMintAvailable(false, false)).toBe(false)
  })
})
