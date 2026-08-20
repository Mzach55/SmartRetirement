import { describe, expect, it } from 'vitest'
import {
  parseContributionAmount,
  toContributionRequest,
  validateContributionForm,
} from './contributionForm.ts'

describe('contribution form rules', () => {
  it.each(['', '0', '-1', '12.345', 'not-money'])(
    'rejects invalid amount %s',
    (amount) => {
      expect(parseContributionAmount(amount)).toBeNull()
    },
  )

  it('accepts dollars and cents', () => {
    expect(parseContributionAmount('500.25')).toBe(500.25)
  })

  it('reports every invalid field in one validation pass', () => {
    const errors = validateContributionForm({
      amount: '0',
      contributionDate: '2025-02-30',
      description: 'x'.repeat(501),
      taxYear: '0',
    })

    expect(errors).toEqual({
      amount: expect.any(String),
      contributionDate: expect.any(String),
      description: expect.any(String),
      taxYear: expect.any(String),
    })
  })

  it('maps valid draft strings to the API contract and trims description', () => {
    expect(toContributionRequest(4, {
      amount: '500.25',
      contributionDate: '2025-10-15',
      description: '  Additional contribution  ',
      taxYear: '2025',
    })).toEqual({
      planId: 4,
      amount: 500.25,
      contributionDate: '2025-10-15',
      description: 'Additional contribution',
      taxYear: 2025,
    })
  })
})
