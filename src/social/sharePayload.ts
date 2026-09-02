export type ShareMoment =
  | { kind: 'event-published'; eventId: bigint; name: string }
  | { kind: 'claim-confirmed'; eventId: bigint; name: string }
  | { kind: 'relay-invite'; eventId: bigint; name: string }

export function eventShareUrl(origin: string, eventId: bigint): string {
  const url = new URL(`/share/event/${eventId.toString()}`, origin)
  return url.toString()
}

export function shareText(origin: string, moment: ShareMoment): string {
  const url = eventShareUrl(origin, moment.eventId)
  switch (moment.kind) {
    case 'event-published':
      return `I made “${moment.name}” on Onchain POAPs. Claim yours: ${url}`
    case 'claim-confirmed':
      return `I collected “${moment.name}” onchain. Pass the relay: ${url}`
    case 'relay-invite':
      return `This event has an onchain POAP. Claim yours: ${url}`
  }
}
