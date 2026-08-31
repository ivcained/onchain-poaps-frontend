import { describe, expect, it } from 'vitest'
import { allowlistLeaf, merkleProof, merkleRoot, parseAllowlist } from './allowlist'

const one = '0x0000000000000000000000000000000000000001' as const
const two = '0x0000000000000000000000000000000000000002' as const
const three = '0x0000000000000000000000000000000000000003' as const

describe('allowlist helpers', () => {
  it('parses, validates, and deduplicates addresses', () => {
    expect(parseAllowlist(`${one}, ${one}\ninvalid ${two}`)).toEqual({ addresses: [one, two], invalid: ['invalid'], duplicates: [one] })
  })
  it('uses the contract leaf format and produces stable roots', () => {
    expect(allowlistLeaf(one)).toMatch(/^0x[0-9a-f]{64}$/)
    expect(merkleRoot([one, two, three])).toBe(merkleRoot([three, one, two]))
  })
  it('creates a proof for every listed address', () => {
    const addresses = [one, two, three]
    expect(merkleProof(addresses, one).length).toBeGreaterThan(0)
    expect(merkleProof(addresses, '0x0000000000000000000000000000000000000004')).toEqual([])
  })
})
