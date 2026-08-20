import { useRef, useState } from 'react'
import {
  Alert,
  Button,
  Card,
  Field,
  StatusBadge,
} from '../../components/ui/index.ts'
import {
  calculateProjectedContributionTotal,
  calculateRemainingContributionCapacity,
  sumContributionsForTaxYear,
  wouldExceedAnnualLimit,
} from '../../lib/financials.ts'
import { formatCurrency } from '../../lib/formatters.ts'
import type {
  Contribution,
  CreateContributionRequest,
  Plan,
} from '../../types/api.ts'
import {
  parseContributionAmount,
  parseContributionTaxYear,
  toContributionRequest,
  validateContributionForm,
} from './contributionForm.ts'
import type {
  ContributionFormErrors,
  ContributionFormValues,
} from './contributionForm.ts'
import styles from '../../styles/ContributionForm.module.css'

interface ContributionFormProps {
  readonly contributions: readonly Contribution[]
  readonly isPending: boolean
  readonly onCancel: () => void
  readonly onChange: () => void
  readonly onSubmit: (request: CreateContributionRequest) => Promise<void>
  readonly plan: Plan
}

function getLocalDateOnly(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function createInitialValues(): ContributionFormValues {
  const now = new Date()

  return {
    amount: '',
    contributionDate: getLocalDateOnly(now),
    description: '',
    taxYear: String(now.getFullYear()),
  }
}

export function ContributionForm({
  contributions,
  isPending,
  onCancel,
  onChange,
  onSubmit,
  plan,
}: ContributionFormProps) {
  const [values, setValues] = useState<ContributionFormValues>(createInitialValues)
  const [errors, setErrors] = useState<ContributionFormErrors>({})
  const errorSummaryRef = useRef<HTMLDivElement>(null)
  const amount = parseContributionAmount(values.amount) ?? 0
  const taxYear = parseContributionTaxYear(values.taxYear)
  const existingTotal = taxYear === null
    ? 0
    : sumContributionsForTaxYear(contributions, taxYear)
  const projectedTotal = calculateProjectedContributionTotal(existingTotal, amount)
  const remainingAfter = calculateRemainingContributionCapacity(
    plan.annualContributionLimit,
    projectedTotal,
  )
  const appearsExcessive = amount > 0 && wouldExceedAnnualLimit(
    existingTotal,
    amount,
    plan.annualContributionLimit,
  )
  const hasErrors = Object.keys(errors).length > 0

  function updateValue(field: keyof ContributionFormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => {
      if (current[field] === undefined) {
        return current
      }

      const next = { ...current }
      delete next[field]
      return next
    })
    onChange()
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextErrors = validateContributionForm(values)

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      queueMicrotask(() => errorSummaryRef.current?.focus())
      return
    }

    try {
      await onSubmit(toContributionRequest(plan.id, values))
    } catch {
      // The mutation owner displays the typed API failure without clearing input.
    }
  }

  return (
    <form className={styles.form} noValidate onSubmit={handleSubmit}>
      {hasErrors ? (
        <div ref={errorSummaryRef} tabIndex={-1}>
          <Alert title="Review the contribution details" tone="danger">
            <p>Correct the highlighted fields and submit the contribution again.</p>
          </Alert>
        </div>
      ) : null}

      <div className={styles.formGrid}>
        <Field
          error={errors.amount}
          hint="Use dollars and cents, such as 500.00."
          htmlFor="contribution-amount"
          label="Contribution amount"
        >
          <input
            aria-describedby={errors.amount ? 'contribution-amount-error' : 'contribution-amount-hint'}
            aria-invalid={errors.amount !== undefined}
            autoComplete="off"
            disabled={isPending}
            id="contribution-amount"
            inputMode="decimal"
            min="0.01"
            onChange={(event) => updateValue('amount', event.target.value)}
            placeholder="500.00"
            step="0.01"
            type="number"
            value={values.amount}
          />
        </Field>

        <Field
          error={errors.contributionDate}
          htmlFor="contribution-date"
          label="Contribution date"
        >
          <input
            aria-describedby={errors.contributionDate ? 'contribution-date-error' : undefined}
            aria-invalid={errors.contributionDate !== undefined}
            disabled={isPending}
            id="contribution-date"
            onChange={(event) => updateValue('contributionDate', event.target.value)}
            type="date"
            value={values.contributionDate}
          />
        </Field>

        <Field
          error={errors.taxYear}
          hint="Annual limits are calculated independently for each tax year."
          htmlFor="tax-year"
          label="Tax year"
        >
          <input
            aria-describedby={errors.taxYear ? 'tax-year-error' : 'tax-year-hint'}
            aria-invalid={errors.taxYear !== undefined}
            disabled={isPending}
            id="tax-year"
            inputMode="numeric"
            min="1"
            onChange={(event) => updateValue('taxYear', event.target.value)}
            step="1"
            type="number"
            value={values.taxYear}
          />
        </Field>

        <Field
          error={errors.description}
          hint={`${values.description.length}/500 characters`}
          htmlFor="contribution-description"
          label="Description"
          optional
        >
          <input
            aria-describedby={errors.description ? 'contribution-description-error' : 'contribution-description-hint'}
            aria-invalid={errors.description !== undefined}
            disabled={isPending}
            id="contribution-description"
            maxLength={500}
            onChange={(event) => updateValue('description', event.target.value)}
            placeholder="For example, payroll contribution"
            value={values.description}
          />
        </Field>
      </div>

      <Card className={styles.preview} padding="compact" tone="soft">
        <div className={styles.previewHeader}>
          <div>
            <h2>Annual-limit preview</h2>
            <p>{taxYear ?? 'Selected year'} contribution estimate</p>
          </div>
          <StatusBadge tone={appearsExcessive ? 'danger' : 'info'}>
            {appearsExcessive ? 'Over limit' : 'Advisory only'}
          </StatusBadge>
        </div>
        <dl className={styles.previewGrid}>
          <div>
            <dt>Existing total</dt>
            <dd>{formatCurrency(existingTotal)}</dd>
          </div>
          <div>
            <dt>Proposed</dt>
            <dd>{formatCurrency(amount)}</dd>
          </div>
          <div>
            <dt>Projected total</dt>
            <dd>{formatCurrency(projectedTotal)}</dd>
          </div>
          <div>
            <dt>Remaining after</dt>
            <dd>{formatCurrency(remainingAfter)}</dd>
          </div>
        </dl>
        <p className={styles.limitText}>
          Configured annual limit: {formatCurrency(plan.annualContributionLimit)}
        </p>
      </Card>

      {appearsExcessive ? (
        <Alert title="This contribution appears to exceed the annual limit" tone="warning">
          <p>
            You may still submit it to demonstrate the authoritative server-side
            validation. RetireWise will not save a rejected contribution.
          </p>
        </Alert>
      ) : null}

      <div className={styles.actions}>
        <Button disabled={isPending} onClick={onCancel} variant="secondary">
          Cancel
        </Button>
        <Button disabled={isPending} type="submit">
          {isPending ? 'Submitting…' : 'Submit contribution'}
        </Button>
      </div>
    </form>
  )
}
