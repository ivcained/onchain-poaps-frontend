import { describe, expect, it } from 'vitest'
import { eventPath, parseRoute } from './routes'

describe('route parsing', () => {
  it('parses home and event routes', () => {
    expect(parseRoute('/')).toEqual({ kind: 'home' })
    expect(parseRoute('/poap/7')).toEqual({ kind: 'event', eventId: 7n })
    expect(eventPath(7n)).toBe('/poap/7')
  })

  it('parses gallery and create routes', () => {
    expect(parseRoute('/gallery')).toEqual({ kind: 'gallery' })
    expect(parseRoute('/create')).toEqual({ kind: 'create' })
  })

  it('parses share event deep links', () => {
    expect(parseRoute('/share/event/7')).toEqual({ kind: 'shareEvent', eventId: 7n })
  })

  it('parses claim routes', () => {
    expect(parseRoute('/claim')).toEqual({ kind: 'claim' })
    expect(parseRoute('/claim', '?event=7')).toEqual({ kind: 'event', eventId: 7n })
  })
})
