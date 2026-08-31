import { isAddress, keccak256, encodePacked, type Address } from 'viem'

export function parseAllowlist(raw: string): { addresses: Address[]; invalid: string[]; duplicates: string[] } {
  const values = raw.split(/[\s,]+/).map((value) => value.trim()).filter(Boolean)
  const addresses: Address[] = []
  const invalid: string[] = []
  const duplicates: string[] = []
  const seen = new Set<string>()
  for (const value of values) {
    if (!isAddress(value)) { invalid.push(value); continue }
    const address = value as Address
    const key = address.toLowerCase()
    if (seen.has(key)) { duplicates.push(address); continue }
    seen.add(key); addresses.push(address)
  }
  return { addresses, invalid, duplicates }
}

function sortedPair(a: `0x${string}`, b: `0x${string}`): [`0x${string}`, `0x${string}`] { return a.toLowerCase() <= b.toLowerCase() ? [a, b] : [b, a] }
export function allowlistLeaf(address: Address): `0x${string}` { return keccak256(encodePacked(['address'], [address])) }
export function merkleRoot(addresses: Address[]): `0x${string}` {
  if (!addresses.length) return `0x${'0'.repeat(64)}`
  let layer = [...new Set(addresses.map(allowlistLeaf))].sort()
  while (layer.length > 1) { const next: `0x${string}`[] = []; for (let i = 0; i < layer.length; i += 2) { const right = layer[i + 1] ?? layer[i]; const [left, orderedRight] = sortedPair(layer[i], right); next.push(keccak256(encodePacked(['bytes32', 'bytes32'], [left, orderedRight]))) }; layer = next.sort() }
  return layer[0]
}
export function merkleProof(addresses: Address[], target: Address): `0x${string}`[] {
  const leaves = [...new Set(addresses.map(allowlistLeaf))].sort(); const targetLeaf = allowlistLeaf(target); let index = leaves.indexOf(targetLeaf); if (index < 0) return []
  const proof: `0x${string}`[] = []
  while (leaves.length > 1) { const sibling = index % 2 === 0 ? leaves[index + 1] : leaves[index - 1]; if (sibling) proof.push(sibling); const next: `0x${string}`[] = []; for (let i = 0; i < leaves.length; i += 2) { const right = leaves[i + 1] ?? leaves[i]; const [left, orderedRight] = sortedPair(leaves[i], right); next.push(keccak256(encodePacked(['bytes32', 'bytes32'], [left, orderedRight]))) }; index = Math.floor(index / 2); leaves.splice(0, leaves.length, ...next.sort()) }
  return proof
}
