import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { EventMintActions } from './EventMintActions'

const props = { connected: true, canWrite: true, claimed: false, isWriting: false, isConfirming: false, eventUrl: '/poap/1', explorerUrl: 'https://example.test', onMint: vi.fn() }

describe('EventMintActions', () => {
  it('renders the selected method as the primary action', () => {
    render(<EventMintActions {...props} method="allowlist" />)
    expect(screen.getByRole('button', { name: 'Mint from the allowlist' })).toBeTruthy()
  })
  it('offers the Relay after collection', () => {
    render(<EventMintActions {...props} method="closed" claimed onRelay={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Pass the relay' })).toBeTruthy()
  })
  it('keeps unavailable minting disabled', () => {
    render(<EventMintActions {...props} method="closed" />)
    expect(screen.getByRole('button', { name: 'Minting unavailable' })).toHaveProperty('disabled', true)
  })
})
