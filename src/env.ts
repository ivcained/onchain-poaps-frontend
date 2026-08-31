export interface AppEnv {
  chainId: 84532
  poapContractAddress: `0x${string}`
  baseSepoliaRpcUrl: string
}

const BASE_SEPOLIA_CHAIN_ID = 84532
const ADDRESS_PATTERN = /^0x[a-fA-F0-9]{40}$/

export function parseAppEnv(raw: Record<string, string | undefined>): AppEnv {
  const chainId = Number(raw.VITE_CHAIN_ID)
  if (chainId !== BASE_SEPOLIA_CHAIN_ID) {
    throw new Error('VITE_CHAIN_ID must be 84532 (Base Sepolia).')
  }

  const address = raw.VITE_POAP_CONTRACT_ADDRESS
  if (!address || !ADDRESS_PATTERN.test(address)) {
    throw new Error('VITE_POAP_CONTRACT_ADDRESS must be a valid EVM address.')
  }

  const rpcUrl = raw.VITE_BASE_SEPOLIA_RPC_URL
  if (!rpcUrl || !/^https:\/\//.test(rpcUrl)) {
    throw new Error('VITE_BASE_SEPOLIA_RPC_URL must be an HTTPS URL.')
  }

  return {
    chainId: BASE_SEPOLIA_CHAIN_ID,
    poapContractAddress: address as `0x${string}`,
    baseSepoliaRpcUrl: rpcUrl,
  }
}

export const appEnv =
  import.meta.env.VITE_CHAIN_ID === undefined &&
  import.meta.env.VITE_POAP_CONTRACT_ADDRESS === undefined &&
  import.meta.env.VITE_BASE_SEPOLIA_RPC_URL === undefined
    ? ({
        chainId: BASE_SEPOLIA_CHAIN_ID,
        poapContractAddress: '0xC3249356a483fbe17d5355D39105D2eA666d9de6',
        baseSepoliaRpcUrl: 'https://sepolia.base.org',
      } satisfies AppEnv)
    : parseAppEnv(import.meta.env)
