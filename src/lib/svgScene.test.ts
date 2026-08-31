import { describe, expect, it } from 'vitest'
import { createSceneFromIdea, renderSvgScene, sanitizeSvg } from './svgScene'

describe('svg scene generator', () => {
  it('creates deterministic artwork from an idea', () => {
    const first = createSceneFromIdea('midnight desert festival')
    const second = createSceneFromIdea('midnight desert festival')
    expect(renderSvgScene(first)).toBe(renderSvgScene(second))
    expect(first.shapes.length).toBeGreaterThan(5)
  })

  it('supports composition and density choices', () => {
    const scene = createSceneFromIdea('ocean signal', {
      composition: 'landscape',
      density: 'rich',
      mood: 'electric',
      title: 'Signal Night',
    })
    expect(scene.width).toBe(1200)
    expect(scene.shapes.length).toBeGreaterThan(12)
    expect(renderSvgScene(scene)).toContain('Signal Night')
  })

  it('renders an SVG without executable markup', () => {
    const svg = renderSvgScene(createSceneFromIdea('quiet gathering'))
    expect(svg).toMatch(/^<svg /)
    expect(svg).toContain('viewBox="0 0 1000 1000"')
    expect(svg).not.toContain('<script')
  })

  it('removes dangerous SVG content from pasted input', () => {
    const clean = sanitizeSvg('<svg onclick="alert(1)"><script>alert(1)</script><foreignObject>x</foreignObject><circle /></svg>')
    expect(clean).toBe('<svg><circle /></svg>')
  })
})
