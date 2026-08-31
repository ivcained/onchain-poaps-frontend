import { beforeEach, describe, expect, it, vi } from 'vitest'
import { readTotalEvents } from './reads'
import { poapClient } from './reads'

describe('contract reads', () => {
  beforeEach(() => vi.restoreAllMocks())

  it('reads the total event count through the typed client', async () => {
    vi.spyOn(poapClient, 'readContract').mockResolvedValue(12n as never)
    await expect(readTotalEvents()).resolves.toBe(12n)
    expect(poapClient.readContract).toHaveBeenCalledWith(expect.objectContaining({ functionName: 'totalEvents' }))
  })
})
