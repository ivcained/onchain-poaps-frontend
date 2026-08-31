import { describe, expect, it } from 'vitest'
import { eventPath, parseRoute } from './routes'

describe('deployment-safe routes', () => {
  it('keeps shareable event paths stable', () => {
    expect(eventPath(42n)).toBe('/poap/42')
    expect(parseRoute('/poap/42')).toEqual({ kind: 'event', eventId: 42n })
  })
  it('supports claim query links', () => {
    expect(parseRoute('/claim', '?event=9')).toEqual({ kind: 'event', eventId: 9n })
  })
})
