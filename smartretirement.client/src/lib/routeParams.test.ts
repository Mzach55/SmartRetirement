import { describe, expect, it } from 'vitest'
import { parsePositiveRouteId } from './routeParams.ts'

describe('parsePositiveRouteId', () => {
  it('parses canonical positive integer segments', () => {
    expect(parsePositiveRouteId('7')).toBe(7)
  })

  it.each([undefined, '', '0', '-1', '1.5', '01', 'abc'])(
    'rejects invalid route segment %s',
    (value) => {
      expect(parsePositiveRouteId(value)).toBeNull()
    },
  )

  it('rejects integers outside the safe JavaScript range', () => {
    expect(parsePositiveRouteId('9007199254740992')).toBeNull()
  })
})
