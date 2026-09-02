import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { WagmiProvider } from 'wagmi'
import { App } from './App'
import { wagmiConfig } from './chain/wagmi'

const queryClient = new QueryClient()

describe('App', () => {
  it('renders the idea-to-SVG studio', async () => {
    render(<WagmiProvider config={wagmiConfig}><QueryClientProvider client={queryClient}><App /></QueryClientProvider></WagmiProvider>)
    expect(await screen.findByRole('heading', { name: /Turn an idea into a collectible/ }, { timeout: 3000 })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'SVG generator' })).toBeInTheDocument()
    expect(screen.getByLabelText('What should this POAP feel like?')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '↻ New variation' })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Generated POAP artwork' })).toBeInTheDocument()
  })
})
