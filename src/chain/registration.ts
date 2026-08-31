import type { Address } from 'viem'
import { registrationFlags } from './poap'

export type RegistrationInput = {
  name: string
  description: string
  eventDate: string
  location: string
  allowlistRoot: string
  svgImage: string
  externalUrl: string
  isSoulbound: boolean
  isPublic: boolean
}

export function validateRegistration(input: RegistrationInput): string[] {
  const errors: string[] = []
  if (!input.name.trim()) errors.push('Name is required.')
  if (input.name.length > 128) errors.push('Name must be 128 characters or fewer.')
  if (input.description.length > 512) errors.push('Description must be 512 characters or fewer.')
  if (input.location.length > 128) errors.push('Location must be 128 characters or fewer.')
  if (input.externalUrl.length > 128) errors.push('External URL must be 128 characters or fewer.')
  if (!input.svgImage.trim() || !input.svgImage.trim().startsWith('<svg')) errors.push('A valid SVG artwork string is required.')
  if (input.allowlistRoot && !/^0x[0-9a-fA-F]{64}$/.test(input.allowlistRoot)) errors.push('Allowlist root must be a 32-byte hex value or empty.')
  if (input.eventDate && !/^\d+$/.test(input.eventDate)) errors.push('Event date must be a Unix timestamp.')
  return errors
}

export function registrationArgs(input: RegistrationInput): readonly [string, string, bigint, string, `0x${string}`, string, string, number] {
  const root = input.allowlistRoot.trim() || `0x${'0'.repeat(64)}`
  return [input.name.trim(), input.description.trim(), BigInt(input.eventDate || '0'), input.location.trim(), root as `0x${string}`, input.svgImage.trim(), input.externalUrl.trim(), registrationFlags(input.isSoulbound, input.isPublic)]
}

export function displayAddress(address: Address | undefined): string {
  return address ? `${address.slice(0, 6)}…${address.slice(-4)}` : ''
}
