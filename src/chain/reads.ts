import { createPublicClient, http, type Address } from 'viem'
import { baseSepolia } from 'viem/chains'
import { BASE_SEPOLIA_RPC_URL, POAP_CONTRACT_ADDRESS, poapAbi, type PoapEvent } from './poap'

export const poapClient = createPublicClient({ chain: baseSepolia, transport: http(BASE_SEPOLIA_RPC_URL) })

export async function readTotalEvents(): Promise<bigint> {
  return poapClient.readContract({ address: POAP_CONTRACT_ADDRESS, abi: poapAbi, functionName: 'totalEvents' })
}

export async function readPoapEvent(eventId: bigint): Promise<PoapEvent> {
  const result = await poapClient.readContract({ address: POAP_CONTRACT_ADDRESS, abi: poapAbi, functionName: 'events', args: [eventId] })
  return {
    name: result[0], description: result[1], eventDate: result[2], location: result[3], allowlistRoot: result[4],
    svgImage: result[5], creator: result[6], createdAt: result[7], externalUrl: result[8], isSoulbound: result[9], isPublic: result[10],
  }
}

export async function readClaimed(eventId: bigint, account: Address): Promise<boolean> {
  return poapClient.readContract({ address: POAP_CONTRACT_ADDRESS, abi: poapAbi, functionName: 'hasClaimed', args: [eventId, account] })
}

export async function readBalance(eventId: bigint, account: Address): Promise<bigint> {
  return poapClient.readContract({ address: POAP_CONTRACT_ADDRESS, abi: poapAbi, functionName: 'balanceOf', args: [account, eventId] })
}
