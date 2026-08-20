import type { CreateContributionRequest } from '../../types/api.ts'

export interface ContributionFormValues {
  readonly amount: string
  readonly contributionDate: string
  readonly description: string
  readonly taxYear: string
}

export type ContributionFormErrors = Partial<
  Record<keyof ContributionFormValues, string>
>

function isValidDateOnly(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)

  if (match === null) {
    return false
  }

  const year = Number(match[1])
  const monthIndex = Number(match[2]) - 1
  const day = Number(match[3])
  const date = new Date(Date.UTC(year, monthIndex, day))

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === monthIndex &&
    date.getUTCDate() === day
  )
}

export function parseContributionAmount(value: string): number | null {
  const trimmed = value.trim()

  if (!/^\d+(?:\.\d{1,2})?$/.test(trimmed)) {
    return null
  }

  const amount = Number(trimmed)

  return Number.isFinite(amount) && amount > 0 ? amount : null
}

export function parseContributionTaxYear(value: string): number | null {
  if (!/^[1-9]\d*$/.test(value.trim())) {
    return null
  }

  const taxYear = Number(value)

  return Number.isSafeInteger(taxYear) ? taxYear : null
}

export function validateContributionForm(
  values: ContributionFormValues,
): ContributionFormErrors {
  const errors: ContributionFormErrors = {}

  if (parseContributionAmount(values.amount) === null) {
    errors.amount = 'Enter an amount greater than zero with no more than two decimal places.'
  }

  if (!isValidDateOnly(values.contributionDate)) {
    errors.contributionDate = 'Choose a valid contribution date.'
  }

  if (parseContributionTaxYear(values.taxYear) === null) {
    errors.taxYear = 'Enter a positive whole-number tax year.'
  }

  if (values.description.trim().length > 500) {
    errors.description = 'Description cannot exceed 500 characters.'
  }

  return errors
}

export function toContributionRequest(
  planId: number,
  values: ContributionFormValues,
): CreateContributionRequest {
  const amount = parseContributionAmount(values.amount)
  const taxYear = parseContributionTaxYear(values.taxYear)

  if (amount === null || taxYear === null || !isValidDateOnly(values.contributionDate)) {
    throw new TypeError('Contribution form values must be valid before submission.')
  }

  const description = values.description.trim()

  return {
    planId,
    amount,
    contributionDate: values.contributionDate,
    taxYear,
    description: description === '' ? null : description,
  }
}
