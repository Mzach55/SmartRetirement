import type { Contribution, Plan } from "../types/api.ts";

const CENTS_PER_DOLLAR = 100;

function toCents(amount: number): number {
  if (!Number.isFinite(amount)) {
    throw new TypeError("A financial amount must be a finite number.");
  }

  return Math.round((amount + Number.EPSILON) * CENTS_PER_DOLLAR);
}

function fromCents(cents: number): number {
  return cents / CENTS_PER_DOLLAR;
}

/** Sum the authoritative current balances returned for a participant's plans. */
export function sumPlanBalances(plans: readonly Plan[]): number {
  const totalInCents = plans.reduce(
    (total, plan) => total + toCents(plan.currentBalance),
    0,
  );

  return fromCents(totalInCents);
}

/**
 * Sum contribution history for one tax year.
 *
 * This is intentionally separate from current balance: investment gains,
 * losses, fees, and other account activity can make those values differ.
 */
export function sumContributionsForTaxYear(
  contributions: readonly Contribution[],
  taxYear: number,
): number {
  const totalInCents = contributions.reduce((total, contribution) => {
    if (contribution.taxYear !== taxYear) {
      return total;
    }

    return total + toCents(contribution.amount);
  }, 0);

  return fromCents(totalInCents);
}

/** Return unique contribution tax years from newest to oldest. */
export function getContributionTaxYears(
  contributions: readonly Contribution[],
): readonly number[] {
  return [...new Set(contributions.map((contribution) => contribution.taxYear))]
    .sort((left, right) => right - left);
}

/** Add a proposed amount to the current annual total using cent precision. */
export function calculateProjectedContributionTotal(
  existingTotal: number,
  proposedAmount: number,
): number {
  return fromCents(toCents(existingTotal) + toCents(proposedAmount));
}

/** Return unused capacity, clamped at zero for display purposes. */
export function calculateRemainingContributionCapacity(
  annualLimit: number,
  contributed: number,
): number {
  const remainingInCents = toCents(annualLimit) - toCents(contributed);

  return fromCents(Math.max(remainingInCents, 0));
}

/**
 * Return the percentage of the configured annual limit already used.
 * The value can exceed 100 so inconsistent server data remains visible.
 */
export function calculateContributionUsagePercentage(
  contributed: number,
  annualLimit: number,
): number {
  if (annualLimit <= 0) {
    return 0;
  }

  return (toCents(contributed) / toCents(annualLimit)) * 100;
}

/**
 * Provide an immediate client-side preview of the annual-limit result.
 * The API must perform the final check because its data may have changed.
 */
export function wouldExceedAnnualLimit(
  existingTotal: number,
  proposedAmount: number,
  annualLimit: number,
): boolean {
  const projectedInCents = toCents(existingTotal) + toCents(proposedAmount);

  return projectedInCents > toCents(annualLimit);
}
