import { useEffect, useState } from 'react'
import { useAccount, useConnect, useDisconnect, useSwitchChain } from 'wagmi'
import { readTotalEvents } from './chain/reads'
import { BASE_SEPOLIA_CHAIN_ID, POAP_CONTRACT_ADDRESS, explorerAddressUrl } from './chain/poap'
import { createSceneFromIdea, renderSvgScene, type Composition, type Density, type Mood } from './lib/svgScene'

const moods: Mood[] = ['ceremonial', 'calm', 'electric', 'playful', 'mysterious']
const compositions: Composition[] = ['emblem', 'poster', 'landscape', 'abstract']
const densities: Density[] = ['minimal', 'balanced', 'rich']

export function App() {
  const [idea, setIdea] = useState('A midnight desert festival with a silver moon and three orange stars')
  const [title, setTitle] = useState('Desert Signal')
  const [mood, setMood] = useState<Mood>('ceremonial')
  const [composition, setComposition] = useState<Composition>('emblem')
  const [density, setDensity] = useState<Density>('balanced')
  const [variation, setVariation] = useState(0)
  const [totalEvents, setTotalEvents] = useState<bigint | null>(null)
  const [chainError, setChainError] = useState<string | null>(null)
  const { address, chainId, isConnected } = useAccount()
  const { connect, connectors, isPending: isConnecting } = useConnect()
  const { disconnect } = useDisconnect()
  const { switchChain, isPending: isSwitching } = useSwitchChain()

  useEffect(() => { readTotalEvents().then(setTotalEvents).catch(() => setChainError('Contract read unavailable — check the RPC connection.')) }, [])
  const svg = renderSvgScene(createSceneFromIdea(`${idea} variation ${variation}`, { mood, composition, density, title }))
  const downloadSvg = () => { const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' })); const anchor = document.createElement('a'); anchor.href = url; anchor.download = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'onchain-poap'}.svg`; anchor.click(); URL.revokeObjectURL(url) }
  const walletLabel = address ? `${address.slice(0, 6)}…${address.slice(-4)}` : 'Connect wallet'

  return <main className="app-shell"><header className="hero"><p className="eyebrow">ONCHAIN POAPS · BASE SEPOLIA</p><div className="hero-row"><div><h1>Turn an idea into a collectible.</h1><p className="intro">Describe the feeling. We’ll draw an editable vector emblem ready for your POAP.</p></div><div className="header-actions"><a className="contract-link" href={explorerAddressUrl} target="_blank" rel="noreferrer">↗ Contract<br /><span>{POAP_CONTRACT_ADDRESS.slice(0, 6)}…{POAP_CONTRACT_ADDRESS.slice(-4)}</span></a>{isConnected ? <button type="button" className="wallet-button" onClick={() => disconnect()}>{walletLabel}</button> : <button type="button" className="wallet-button" disabled={isConnecting} onClick={() => connectors[0] && connect({ connector: connectors[0] })}>{isConnecting ? 'Connecting…' : 'Connect wallet'}</button>}</div></div></header><section className="chain-strip" aria-label="Contract status"><span className="status-dot" /> <strong>{chainId === BASE_SEPOLIA_CHAIN_ID ? 'Base Sepolia connected' : isConnected ? 'Wrong network' : 'Base Sepolia ready'}</strong><span className="chain-stat">{chainError ?? (totalEvents === null ? 'Reading events…' : `${totalEvents.toString()} events registered`)}</span><span className="chain-id">chain {BASE_SEPOLIA_CHAIN_ID}</span>{isConnected && chainId !== BASE_SEPOLIA_CHAIN_ID && <button type="button" className="switch-button" disabled={isSwitching} onClick={() => switchChain({ chainId: BASE_SEPOLIA_CHAIN_ID })}>{isSwitching ? 'Switching…' : 'Switch network'}</button>}</section><section className="studio" aria-label="SVG generator"><div className="preview-panel"><div className="panel-kicker"><span>LIVE PREVIEW</span><span>{svg.length.toLocaleString()} bytes</span></div><div className="art-stage" dangerouslySetInnerHTML={{ __html: svg }} /><div className="preview-actions"><button type="button" onClick={() => setVariation((value) => value + 1)}>↻ New variation</button><button type="button" className="secondary" onClick={downloadSvg}>↓ Download SVG</button></div></div><div className="controls-panel"><label htmlFor="idea">What should this POAP feel like?</label><textarea id="idea" value={idea} onChange={(event) => setIdea(event.target.value)} rows={4} /><label htmlFor="title">Event title on artwork</label><input id="title" value={title} onChange={(event) => setTitle(event.target.value)} maxLength={36} /><fieldset><legend>Mood</legend><div className="choice-row">{moods.map((option) => <button type="button" className={mood === option ? 'choice selected' : 'choice'} onClick={() => setMood(option)} key={option}>{option}</button>)}</div></fieldset><fieldset><legend>Composition</legend><div className="choice-row">{compositions.map((option) => <button type="button" className={composition === option ? 'choice selected' : 'choice'} onClick={() => setComposition(option)} key={option}>{option}</button>)}</div></fieldset><fieldset><legend>Detail</legend><div className="choice-row">{densities.map((option) => <button type="button" className={density === option ? 'choice selected' : 'choice'} onClick={() => setDensity(option)} key={option}>{option}</button>)}</div></fieldset><div className="notice"><strong>{isConnected && chainId === BASE_SEPOLIA_CHAIN_ID ? 'Wallet ready for Base Sepolia.' : 'Connect a wallet when you’re ready.'}</strong><span>This local preview becomes the artwork for the registration transaction. Nothing is registered until you approve the exact SVG.</span></div></div></section><section className="next-step"><span className="step-number">02</span><div><p className="eyebrow">CONTRACT FOUNDATION</p><h2>Read the chain before we write to it.</h2><p>The app now reads the deployed contract, connects an injected wallet, and handles Base Sepolia network switching. Registration is the next transaction flow.</p></div></section></main>
}
