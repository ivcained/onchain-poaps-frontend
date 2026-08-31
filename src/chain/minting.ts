import { keccak256, encodePacked, type Address } from 'viem'

export function addressLeaf(address: Address): `0x${string}` {
  return keccak256(encodePacked(['address'], [address]))
}

export function eventIdFromLocation(pathname: string): bigint | null {
  const match = pathname.match(/^\/poap\/(\d+)$/)
  return match ? BigInt(match[1]) : null
}

export function isPublicMintAvailable(isPublic: boolean, claimed: boolean): boolean {
  return isPublic && !claimed
}
