import { describe, expect, it } from 'vitest'
import { parseAppEnv } from './env'

const validEnv = {
  VITE_CHAIN_ID: '84532',
  VITE_POAP_CONTRACT_ADDRESS: '0xC3249356a483fbe17d5355D39105D2eA666d9de6',
  VITE_BASE_SEPOLIA_RPC_URL: 'https://sepolia.base.org',
}

describe('parseAppEnv', () => {
  it('returns typed Base Sepolia configuration for valid values', () => {
    expect(parseAppEnv(validEnv)).toEqual({
      chainId: 84532,
      poapContractAddress: validEnv.VITE_POAP_CONTRACT_ADDRESS,
      baseSepoliaRpcUrl: validEnv.VITE_BASE_SEPOLIA_RPC_URL,
    })
  })

  it.each([
    ['VITE_CHAIN_ID', '1'],
    ['VITE_POAP_CONTRACT_ADDRESS', 'not-an-address'],
    ['VITE_BASE_SEPOLIA_RPC_URL', 'http://insecure.example'],
    ['VITE_BASE_SEPOLIA_RPC_URL', 'https://'],
    ['VITE_BASE_SEPOLIA_RPC_URL', 'https://%'],
  ])('rejects invalid %s', (key, value) => {
    expect(() => parseAppEnv({ ...validEnv, [key]: value })).toThrow()
  })

  it('rejects missing required values', () => {
    expect(() => parseAppEnv({})).toThrow(/VITE_CHAIN_ID/)
  })
})
