import { describe, expect, it } from 'vitest'
import {
  calculateContributionUsagePercentage,
  calculateProjectedContributionTotal,
  calculateRemainingContributionCapacity,
  getContributionTaxYears,
  sumContributionsForTaxYear,
  sumPlanBalances,
  wouldExceedAnnualLimit,
} from './financials.ts'
import {
  maya401kContributions,
  mayaPlans,
} from '../test/fixtures.ts'

describe('financial selectors', () => {
  it('sums authoritative plan balances independently from contributions', () => {
    expect(sumPlanBalances(mayaPlans)).toBe(22_500)
  })

  it('sums only contributions from the selected tax year', () => {
    expect(sumContributionsForTaxYear(maya401kContributions, 2025)).toBe(18_000)
    expect(sumContributionsForTaxYear(maya401kContributions, 2026)).toBe(0)
  })

  it('returns unique tax years newest first', () => {
    const mixedYears = [
      ...maya401kContributions,
      { ...maya401kContributions[0], id: 3, taxYear: 2024 },
      { ...maya401kContributions[0], id: 4, taxYear: 2026 },
    ]

    expect(getContributionTaxYears(mixedYears)).toEqual([2026, 2025, 2024])
  })

  it('uses cent-safe arithmetic for projected totals', () => {
    expect(calculateProjectedContributionTotal(0.1, 0.2)).toBe(0.3)
  })

  it('allows a contribution equal to the remaining limit', () => {
    expect(wouldExceedAnnualLimit(18_000, 5_500, 23_500)).toBe(false)
    expect(calculateRemainingContributionCapacity(23_500, 23_500)).toBe(0)
    expect(calculateContributionUsagePercentage(23_500, 23_500)).toBe(100)
  })

  it('flags only amounts that exceed the configured limit', () => {
    expect(wouldExceedAnnualLimit(18_000, 5_500.01, 23_500)).toBe(true)
  })
})
