import { describe, expect, it } from 'vitest'
import { BASE_SEPOLIA_CHAIN_ID, POAP_CONTRACT_ADDRESS, creatorDeadline, registrationFlags, signatureDeadline } from './poap'

describe('POAP chain configuration', () => {
  it('uses the deployed Base Sepolia contract', () => {
    expect(BASE_SEPOLIA_CHAIN_ID).toBe(84532)
    expect(POAP_CONTRACT_ADDRESS).toBe('0xC3249356a483fbe17d5355D39105D2eA666d9de6')
  })

  it.each([
    [false, false, 0], [true, false, 1], [false, true, 2], [true, true, 3],
  ])('maps soulbound=%s public=%s to flags=%s', (soulbound, isPublic, flags) => {
    expect(registrationFlags(soulbound, isPublic)).toBe(flags)
  })

  it('calculates creator and signature windows', () => {
    const createdAt = 1_000n
    expect(creatorDeadline(createdAt)).toBe(1_000n + 30n * 86400n)
    expect(signatureDeadline(createdAt)).toBe(1_000n + 37n * 86400n)
  })
})
