import { encodePacked, hashMessage, recoverAddress, type Address, type Hex } from 'viem'
import { POAP_CONTRACT_ADDRESS } from './poap'

export function signatureMessageHash(eventId: bigint, chainId: number, recipient: Address): Hex { return hashMessage({ raw: encodePacked(['uint256', 'uint256', 'address'], [eventId, BigInt(chainId), recipient]) }) }
export function signatureMessageBytes(eventId: bigint, chainId: number, recipient: Address): Hex { return encodePacked(['uint256', 'uint256', 'address'], [eventId, BigInt(chainId), recipient]) }
export async function recoverSignatureSigner(eventId: bigint, chainId: number, recipient: Address, signature: Hex): Promise<Address> { return recoverAddress({ hash: signatureMessageHash(eventId, chainId, recipient), signature }) }
export function signatureClaimUrl(origin: string, eventId: bigint, signature: Hex): string { const url = new URL('/claim', origin); url.searchParams.set('event', eventId.toString()); url.searchParams.set('signature', signature); return url.toString() }
export function signatureClaimData(origin: string, eventId: bigint, recipient: Address, signature: Hex): { eventId: string; recipient: Address; signature: Hex; url: string } { return { eventId: eventId.toString(), recipient, signature, url: signatureClaimUrl(origin, eventId, signature) } }
export function isSignatureWindowOpen(createdAt: bigint, nowSeconds: bigint): boolean { return nowSeconds <= createdAt + 37n * 24n * 60n * 60n }
export const signatureContract = POAP_CONTRACT_ADDRESS
