import { describe, expect, it } from 'vitest'
import { creatorDeadline, signatureDeadline } from './poap'

describe('event availability', () => {
  it('keeps the creator window shorter than the signature grace window', () => {
    const created = 1_000n
    expect(signatureDeadline(created) - creatorDeadline(created)).toBe(7n * 86400n)
  })
})
