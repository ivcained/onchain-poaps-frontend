import type { Address } from 'viem'

export const BASE_SEPOLIA_CHAIN_ID = 84532
export const BASE_SEPOLIA_RPC_URL = 'https://sepolia.base.org'
export const POAP_CONTRACT_ADDRESS = '0xC3249356a483fbe17d5355D39105D2eA666d9de6' as Address
export const BASESCAN_SEPOLIA_URL = 'https://sepolia.basescan.org'

export const poapAbi = [
  { type: 'function', name: 'totalEvents', stateMutability: 'view', inputs: [], outputs: [{ name: '', type: 'uint256' }] },
  { type: 'function', name: 'registerEvent', stateMutability: 'nonpayable', inputs: [
    { name: 'name', type: 'string' }, { name: 'description', type: 'string' }, { name: 'eventDate', type: 'uint256' },
    { name: 'location', type: 'string' }, { name: 'allowlistRoot', type: 'bytes32' }, { name: 'svgImage', type: 'string' },
    { name: 'externalUrl', type: 'string' }, { name: 'flags', type: 'uint8' },
  ], outputs: [{ name: 'eventId', type: 'uint256' }] },
  { type: 'function', name: 'events', stateMutability: 'view', inputs: [{ name: '', type: 'uint256' }], outputs: [
    { name: 'name', type: 'string' }, { name: 'description', type: 'string' }, { name: 'eventDate', type: 'uint256' },
    { name: 'location', type: 'string' }, { name: 'allowlistRoot', type: 'bytes32' }, { name: 'svgImage', type: 'address' },
    { name: 'creator', type: 'address' }, { name: 'createdAt', type: 'uint256' }, { name: 'externalUrl', type: 'string' },
    { name: 'isSoulbound', type: 'bool' }, { name: 'isPublic', type: 'bool' },
  ] },
  { type: 'function', name: 'hasClaimed', stateMutability: 'view', inputs: [{ name: '', type: 'uint256' }, { name: '', type: 'address' }], outputs: [{ name: '', type: 'bool' }] },
  { type: 'function', name: 'balanceOf', stateMutability: 'view', inputs: [{ name: 'account', type: 'address' }, { name: 'id', type: 'uint256' }], outputs: [{ name: '', type: 'uint256' }] },
  { type: 'function', name: 'allowlistMint', stateMutability: 'nonpayable', inputs: [{ name: 'eventId', type: 'uint256' }, { name: 'merkleProof', type: 'bytes32[]' }], outputs: [] },
  { type: 'function', name: 'updateAllowlistRoot', stateMutability: 'nonpayable', inputs: [{ name: 'eventId', type: 'uint256' }, { name: 'newRoot', type: 'bytes32' }], outputs: [] },
  { type: 'function', name: 'updateEventPublic', stateMutability: 'nonpayable', inputs: [{ name: 'eventId', type: 'uint256' }, { name: 'isPublic', type: 'bool' }], outputs: [] },
  { type: 'event', name: 'NewEvent', inputs: [{ name: 'eventId', type: 'uint256', indexed: true }, { name: 'name', type: 'string', indexed: false }, { name: 'creator', type: 'address', indexed: true }], anonymous: false },
  { type: 'event', name: 'NewMint', inputs: [{ name: 'eventId', type: 'uint256', indexed: true }, { name: 'recipient', type: 'address', indexed: true }], anonymous: false },
] as const

export type PoapEvent = {
  name: string; description: string; eventDate: bigint; location: string; allowlistRoot: `0x${string}`; svgImage: Address
  creator: Address; createdAt: bigint; externalUrl: string; isSoulbound: boolean; isPublic: boolean
}

export const explorerAddressUrl = `${BASESCAN_SEPOLIA_URL}/address/${POAP_CONTRACT_ADDRESS}`
export const explorerEventUrl = (eventId: bigint | number | string) => `${BASESCAN_SEPOLIA_URL}/token/${POAP_CONTRACT_ADDRESS}?a=${eventId}`
export function registrationFlags(isSoulbound: boolean, isPublic: boolean): number { return (isSoulbound ? 1 : 0) + (isPublic ? 2 : 0) }
export function creatorDeadline(createdAt: bigint): bigint { return createdAt + 30n * 24n * 60n * 60n }
export function signatureDeadline(createdAt: bigint): bigint { return createdAt + 37n * 24n * 60n * 60n }
