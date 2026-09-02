import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { EventMintActions } from './EventMintActions'

describe('EventMintActions', () => {
  it('keeps the primary mint action prominent and relay secondary', () => {
    render(<EventMintActions method="public" connected canWrite claimed={false} isWriting={false} isConfirming={false} eventUrl="/poap/1" explorerUrl="https://example.test" onMint={vi.fn()} onRelay={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Mint this POAP' })).toHaveClass('register-button')
    expect(screen.queryByRole('button', { name: 'Pass the relay' })).not.toBeInTheDocument()
  })

  it('only reveals relay after a confirmed claim', () => {
    render(<EventMintActions method="public" connected canWrite claimed onRelay={vi.fn()} isWriting={false} isConfirming={false} eventUrl="/poap/1" explorerUrl="https://example.test" onMint={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Pass the relay' })).toBeInTheDocument()
  })
})