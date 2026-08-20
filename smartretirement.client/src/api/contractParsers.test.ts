import { describe, expect, it } from 'vitest'
import { ApiContractError } from './errors.ts'
import { parseParticipant, parsePlan } from './contractParsers.ts'

describe('runtime API contract parsing', () => {
  it('normalizes a SQLite UTC timestamp that omits its zone suffix', () => {
    const participant = parseParticipant({
      id: 1,
      firstName: 'Maya',
      lastName: 'Chen',
      email: 'maya.chen@example.com',
      dateOfBirth: '1989-04-12',
      createdAtUtc: '2025-01-10T14:30:00',
    })

    expect(participant.createdAtUtc).toBe('2025-01-10T14:30:00Z')
  })

  it('rejects inconsistent employer identity in a plan response', () => {
    expect(() => parsePlan({
      id: 1,
      participantId: 1,
      employerId: 2,
      name: 'Northstar 401(k)',
      type: 1,
      openedOn: '2021-06-01',
      currentBalance: 18_000,
      annualContributionLimit: 23_500,
      isActive: true,
      employer: {
        id: 1,
        name: 'Northstar Analytics',
        industry: 'Financial Technology',
      },
    })).toThrow(ApiContractError)
  })
})
