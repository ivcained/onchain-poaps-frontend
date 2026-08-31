import { http } from 'viem'
import { baseSepolia } from 'viem/chains'
import { createConfig, injected } from 'wagmi'

export const wagmiConfig = createConfig({
  chains: [baseSepolia],
  connectors: [injected()],
  transports: { [baseSepolia.id]: http('https://sepolia.base.org') },
})
