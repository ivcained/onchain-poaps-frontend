import { useMemo, useState } from 'react'
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

  const svg = useMemo(
    () => renderSvgScene(createSceneFromIdea(`${idea} variation ${variation}`, { mood, composition, density, title })),
    [idea, title, mood, composition, density, variation],
  )

  const downloadSvg = () => {
    const blob = new Blob([svg], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'onchain-poap'}.svg`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  return (
    <main className="app-shell">
      <header className="hero">
        <p className="eyebrow">ONCHAIN POAPS · BASE SEPOLIA</p>
        <h1>Turn an idea into a collectible.</h1>
        <p className="intro">Describe the feeling. We’ll draw an editable vector emblem ready for your POAP.</p>
      </header>

      <section className="studio" aria-label="SVG generator">
        <div className="preview-panel">
          <div className="panel-kicker"><span>LIVE PREVIEW</span><span>{svg.length.toLocaleString()} bytes</span></div>
          <div className="art-stage" dangerouslySetInnerHTML={{ __html: svg }} />
          <div className="preview-actions">
            <button type="button" onClick={() => setVariation((value) => value + 1)}>↻ New variation</button>
            <button type="button" className="secondary" onClick={downloadSvg}>↓ Download SVG</button>
          </div>
        </div>

        <div className="controls-panel">
          <label htmlFor="idea">What should this POAP feel like?</label>
          <textarea id="idea" value={idea} onChange={(event) => setIdea(event.target.value)} rows={4} />
          <label htmlFor="title">Event title on artwork</label>
          <input id="title" value={title} onChange={(event) => setTitle(event.target.value)} maxLength={36} />

          <fieldset><legend>Mood</legend><div className="choice-row">{moods.map((option) => <button type="button" className={mood === option ? 'choice selected' : 'choice'} onClick={() => setMood(option)} key={option}>{option}</button>)}</div></fieldset>
          <fieldset><legend>Composition</legend><div className="choice-row">{compositions.map((option) => <button type="button" className={composition === option ? 'choice selected' : 'choice'} onClick={() => setComposition(option)} key={option}>{option}</button>)}</div></fieldset>
          <fieldset><legend>Detail</legend><div className="choice-row">{densities.map((option) => <button type="button" className={density === option ? 'choice selected' : 'choice'} onClick={() => setDensity(option)} key={option}>{option}</button>)}</div></fieldset>

          <div className="notice"><strong>Nothing is registered yet.</strong><span>This is a local, deterministic preview. When you’re happy, the final SVG will be validated before a future registration transaction.</span></div>
        </div>
      </section>

      <section className="next-step"><span className="step-number">01</span><div><p className="eyebrow">NEXT STEP</p><h2>Make it yours, then put it onchain.</h2><p>Upload, paste, or generate artwork. The registration flow will show the exact SVG and metadata before your wallet approves anything.</p></div></section>
    </main>
  )
}
