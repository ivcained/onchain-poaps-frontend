import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { App } from './App'

describe('App', () => {
  it('explains the configured scaffold without claiming contract workflows', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: 'Onchain POAPs' })).toBeInTheDocument()
    expect(screen.getByText(/Contract workflows arrive in the next milestone/)).toBeInTheDocument()
    expect(screen.getByText(/Base Sepolia \(84532\)/)).toBeInTheDocument()
  })
})
