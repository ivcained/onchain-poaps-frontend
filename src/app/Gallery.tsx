import { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'
import { readBalance, readOnchainSvg, readOwnedEventIds, readPoapEvent, svgDataUri } from '../chain/reads'
import type { PoapEvent } from '../chain/poap'

export function Gallery() {
  const { address } = useAccount()
  const [items, setItems] = useState<Array<{ id: bigint; event: PoapEvent; svg: string | null }>>([])
  const [status, setStatus] = useState('')
  useEffect(() => { if (!address) { setItems([]); return }; setStatus('Reading your collection…'); readOwnedEventIds(address).then(async (ids) => { const loaded = await Promise.all(ids.map(async (id) => { const event = await readPoapEvent(id); let svg: string | null = null; try { svg = await readOnchainSvg(event.svgImage) } catch { /* metadata remains useful */ }; return { id, event, svg } })); const owned = await Promise.all(loaded.map(async (item) => (await readBalance(item.id, address)) > 0n ? item : null)); setItems(owned.filter((item): item is { id: bigint; event: PoapEvent; svg: string | null } => item !== null)); setStatus(loaded.length ? '' : 'No POAPs yet — mint one from an event link.') }).catch(() => setStatus('Could not load this wallet collection.')) }, [address])
  if (!address) return <section className="detail-section"><p className="eyebrow">YOUR COLLECTION</p><h2>Connect a wallet to see your POAPs.</h2></section>
  return <section className="detail-section" aria-label="Gallery"><p className="eyebrow">YOUR COLLECTION</p><h2>POAPs you carry.</h2>{status && <p className="intro">{status}</p>}<div className="gallery-grid">{items.map(({ id, event, svg }) => <article className="gallery-card" key={id.toString()}>{svg ? <img src={svgDataUri(svg)} alt={`${event.name} artwork`} /> : <div className="gallery-placeholder">{event.name.slice(0, 1)}</div>}<div><p className="eyebrow">EVENT {id.toString()}</p><h3>{event.name}</h3><p>{event.description || 'Onchain event POAP'}</p><span className="claimed">✓ Verified ownership</span></div></article>)}</div></section>
}
