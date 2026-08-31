export type Mood = 'calm' | 'electric' | 'playful' | 'ceremonial' | 'mysterious'
export type Composition = 'emblem' | 'poster' | 'landscape' | 'abstract'
export type Density = 'minimal' | 'balanced' | 'rich'

export interface SvgScene {
  width: number
  height: number
  background: { color: string; gradient?: [string, string] }
  shapes: SvgShape[]
}

export type SvgShape =
  | { kind: 'circle'; cx: number; cy: number; r: number; fill: string; opacity?: number }
  | {
      kind: 'rect'
      x: number
      y: number
      width: number
      height: number
      fill: string
      rx?: number
      opacity?: number
    }
  | {
      kind: 'path'
      d: string
      fill: string
      stroke?: string
      strokeWidth?: number
      opacity?: number
    }
  | {
      kind: 'text'
      x: number
      y: number
      value: string
      fill: string
      size: number
      anchor: 'start' | 'middle' | 'end'
    }

const palettes: Record<Mood, [string, string, string]> = {
  calm: ['#102a43', '#3c91e6', '#d9f0ff'],
  electric: ['#160f29', '#ff4ecd', '#55f6ff'],
  playful: ['#24130b', '#ffb703', '#fb5607'],
  ceremonial: ['#17120d', '#d7a84f', '#f5f0e8'],
  mysterious: ['#10141f', '#8c7bff', '#d7d2ff'],
}

function cleanText(value: string, maxLength = 36): string {
  return value.replace(/[&<>"']/g, '').trim().slice(0, maxLength)
}

function hash(value: string): number {
  return [...value].reduce((total, char) => (total * 31 + char.charCodeAt(0)) >>> 0, 7)
}

export function createSceneFromIdea(
  idea: string,
  options: {
    mood?: Mood
    composition?: Composition
    density?: Density
    title?: string
  } = {},
): SvgScene {
  const mood = options.mood ?? 'ceremonial'
  const composition = options.composition ?? 'emblem'
  const density = options.density ?? 'balanced'
  const [background, accent, highlight] = palettes[mood]
  const seed = hash(idea || 'onchain poap')
  const width = composition === 'landscape' ? 1200 : 1000
  const height = composition === 'poster' ? 1250 : 1000
  const cx = width / 2
  const cy = height / 2
  const count = density === 'minimal' ? 5 : density === 'rich' ? 13 : 9
  const shapes: SvgShape[] = [
    { kind: 'circle', cx, cy, r: Math.min(width, height) * 0.36, fill: accent, opacity: 0.14 },
    { kind: 'circle', cx, cy, r: Math.min(width, height) * 0.27, fill: background, opacity: 0.96 },
  ]

  for (let index = 0; index < count; index += 1) {
    const angle = ((seed % 360) + index * (360 / count)) * (Math.PI / 180)
    const radius = Math.min(width, height) * (0.22 + ((seed + index * 17) % 9) / 100)
    const x = cx + Math.cos(angle) * radius
    const y = cy + Math.sin(angle) * radius
    const size = 12 + ((seed + index * 23) % 22)
    shapes.push({ kind: 'circle', cx: x, cy: y, r: size, fill: index % 2 ? highlight : accent, opacity: 0.78 })
  }

  if (composition === 'abstract') {
    shapes.push({
      kind: 'path',
      d: `M ${cx - 190} ${cy + 150} Q ${cx} ${cy - 230} ${cx + 190} ${cy + 150} Q ${cx} ${cy + 30} ${cx - 190} ${cy + 150} Z`,
      fill: accent,
      opacity: 0.72,
    })
  } else {
    shapes.push({ kind: 'rect', x: cx - 150, y: cy - 150, width: 300, height: 300, rx: 54, fill: accent, opacity: 0.9 })
    shapes.push({ kind: 'circle', cx, cy, r: 92, fill: highlight, opacity: 0.95 })
    shapes.push({ kind: 'circle', cx, cy, r: 42, fill: background })
  }

  const title = cleanText(options.title || idea.split(/[,.!?]/)[0] || 'Onchain POAP')
  shapes.push({ kind: 'text', x: cx, y: height - 82, value: title, fill: highlight, size: 30, anchor: 'middle' })

  return {
    width,
    height,
    background: { color: background, gradient: [background, '#0b0a0d'] },
    shapes,
  }
}

function attr(name: string, value: string | number | undefined): string {
  return value === undefined ? '' : ` ${name}="${String(value).replace(/"/g, '&quot;')}"`
}

export function renderSvgScene(scene: SvgScene): string {
  const gradient = scene.background.gradient
    ? `<defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${scene.background.gradient[0]}"/><stop offset="100%" stop-color="${scene.background.gradient[1]}"/></linearGradient></defs>`
    : ''
  const elements = scene.shapes
    .map((shape) => {
      if (shape.kind === 'circle') return `<circle cx="${shape.cx}" cy="${shape.cy}" r="${shape.r}" fill="${shape.fill}"${attr('opacity', shape.opacity)}/>`
      if (shape.kind === 'rect') return `<rect x="${shape.x}" y="${shape.y}" width="${shape.width}" height="${shape.height}"${attr('rx', shape.rx)} fill="${shape.fill}"${attr('opacity', shape.opacity)}/>`
      if (shape.kind === 'path') return `<path d="${shape.d}" fill="${shape.fill}"${attr('stroke', shape.stroke)}${attr('stroke-width', shape.strokeWidth)}${attr('opacity', shape.opacity)}/>`
      return `<text x="${shape.x}" y="${shape.y}" fill="${shape.fill}" font-size="${shape.size}" text-anchor="${shape.anchor}" font-family="system-ui, sans-serif">${cleanText(shape.value)}</text>`
    })
    .join('')
  const paint = scene.background.gradient ? 'url(#bg)' : scene.background.color
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${scene.width} ${scene.height}" role="img" aria-label="Generated POAP artwork">${gradient}<rect width="100%" height="100%" fill="${paint}"/>${elements}</svg>`
}

export function sanitizeSvg(svg: string): string {
  return svg
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<foreignObject[\s\S]*?<\/foreignObject>/gi, '')
    .replace(/\s(on[a-z]+|href|xlink:href)="[^"]*"/gi, '')
    .replace(/<!DOCTYPE[\s\S]*?>/gi, '')
    .trim()
}
