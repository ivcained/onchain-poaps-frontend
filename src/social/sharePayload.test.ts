import { describe, expect, it } from 'vitest'
import { eventShareUrl, shareText } from './sharePayload'

describe('Relay share payloads', () => {
  it('creates a direct event landing URL', () => {
    expect(eventShareUrl('https://ocp.ivc.lol', 7n)).toBe('https://ocp.ivc.lol/share/event/7')
  })

  it('keeps share copy contextual and actionable', () => {
    const text = shareText('https://ocp.ivc.lol', { kind: 'claim-confirmed', eventId: 7n, name: 'Base Camp' })
    expect(text).toContain('Base Camp')
    expect(text).toContain('Pass the relay')
    expect(text).toContain('/share/event/7')
  })
})
