import { isAddress, type Address } from 'viem'

export function parseRecipients(raw: string): { recipients: Address[]; invalid: string[]; duplicates: string[]; tooMany: boolean } {
  const values = raw.split(/[\s,]+/).map((value) => value.trim()).filter(Boolean)
  const recipients: Address[] = []; const invalid: string[] = []; const duplicates: string[] = []; const seen = new Set<string>()
  for (const value of values) { if (!isAddress(value)) { invalid.push(value); continue }; const address = value as Address; const key = address.toLowerCase(); if (seen.has(key)) { duplicates.push(address); continue }; seen.add(key); recipients.push(address) }
  return { recipients, invalid, duplicates, tooMany: recipients.length > 101 }
}
export function creatorWindowOpen(createdAt: bigint, nowSeconds: bigint): boolean { return nowSeconds <= createdAt + 30n * 86400n }
