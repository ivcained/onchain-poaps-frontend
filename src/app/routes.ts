export type AppRoute = { kind: 'home' } | { kind: 'create' } | { kind: 'gallery' } | { kind: 'event'; eventId: bigint } | { kind: 'claim' }

export function parseRoute(pathname: string, search = ''): AppRoute {
  const path = pathname.replace(/\/+$/, '') || '/'
  if (path === '/create') return { kind: 'create' }
  if (path === '/gallery') return { kind: 'gallery' }
  if (path === '/claim') {
    const claim = new URLSearchParams(search).get('event')
    if (claim && /^\d+$/.test(claim)) return { kind: 'event', eventId: BigInt(claim) }
    return { kind: 'claim' }
  }
  const match = path.match(/^\/poap\/(\d+)$/)
  if (match) return { kind: 'event', eventId: BigInt(match[1]) }
  const claim = new URLSearchParams(search).get('event')
  if (path === '/' && claim && /^\d+$/.test(claim)) return { kind: 'event', eventId: BigInt(claim) }
  return { kind: 'home' }
}

export function eventPath(eventId: bigint | number | string): string { return `/poap/${eventId.toString()}` }
