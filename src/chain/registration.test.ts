import { describe, expect, it } from 'vitest'
import { registrationArgs, validateRegistration, type RegistrationInput } from './registration'

const valid: RegistrationInput = { name: 'Launch Night', description: 'A show', eventDate: '1735689600', location: 'Base', allowlistRoot: '', svgImage: '<svg></svg>', externalUrl: 'https://example.com', isSoulbound: true, isPublic: true }

describe('registration helpers', () => {
  it('maps form values to contract arguments and flags', () => {
    expect(registrationArgs(valid)).toEqual(['Launch Night', 'A show', 1735689600n, 'Base', `0x${'0'.repeat(64)}`, '<svg></svg>', 'https://example.com', 3])
  })
  it('reports contract-compatible field errors', () => {
    expect(validateRegistration({ ...valid, name: '', svgImage: 'png', description: 'x'.repeat(513) })).toEqual(['Name is required.', 'Description must be 512 characters or fewer.', 'A valid SVG artwork string is required.'])
  })
  it('accepts a bytes32 root and empty optional values', () => {
    expect(validateRegistration({ ...valid, allowlistRoot: `0x${'a'.repeat(64)}`, eventDate: '' })).toEqual([])
  })
})
