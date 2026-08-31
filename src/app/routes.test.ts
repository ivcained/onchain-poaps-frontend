import { describe, expect, it } from 'vitest'
import { eventPath, parseRoute } from './routes'

describe('routes', () => {
  it('parses app routes', () => {
    expect(parseRoute('/create')).toEqual({ kind: 'create' })
    expect(parseRoute('/gallery')).toEqual({ kind: 'gallery' })
    expect(parseRoute('/poap/12')).toEqual({ kind: 'event', eventId: 12n })
    expect(parseRoute('/claim', '?event=7')).toEqual({ kind: 'event', eventId: 7n })
  })
  it('normalizes trailing slashes and rejects malformed ids', () => {
    expect(parseRoute('/gallery/')).toEqual({ kind: 'gallery' })
    expect(parseRoute('/poap/nope')).toEqual({ kind: 'home' })
    expect(eventPath(12n)).toBe('/poap/12')
  })
})
