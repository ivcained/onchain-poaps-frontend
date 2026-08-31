import { describe, expect, it } from 'vitest'
import { creatorWindowOpen, parseRecipients } from './creator'

const a = '0x0000000000000000000000000000000000000001' as const
const b = '0x0000000000000000000000000000000000000002' as const

describe('creator helpers', () => {
  it('validates and deduplicates batch recipients', () => {
    expect(parseRecipients(`${a},${a}\n${b} bad`)).toEqual({ recipients: [a, b], invalid: ['bad'], duplicates: [a], tooMany: false })
  })
  it('enforces the 101 recipient batch limit', () => {
    const list = Array.from({ length: 102 }, (_, i) => `0x${(i + 1).toString(16).padStart(40, '0')}`).join('\n')
    expect(parseRecipients(list).tooMany).toBe(true)
  })
  it('keeps the creator window inclusive at 30 days', () => {
    expect(creatorWindowOpen(10n, 10n + 30n * 86400n)).toBe(true)
    expect(creatorWindowOpen(10n, 10n + 30n * 86400n + 1n)).toBe(false)
  })
})
