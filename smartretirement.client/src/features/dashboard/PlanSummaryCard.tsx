import {
  ActionLink,
  Button,
  Card,
  ProgressBar,
  Skeleton,
  StatusBadge,
} from '../../components/ui/index.ts'
import {
  calculateContributionUsagePercentage,
  calculateRemainingContributionCapacity,
  sumContributionsForTaxYear,
} from '../../lib/financials.ts'
import {
  formatCurrency,
  formatPercentage,
  formatPlanSponsor,
  formatPlanType,
} from '../../lib/formatters.ts'
import type { Contribution, Plan } from '../../types/api.ts'
import styles from './Dashboard.module.css'

interface PlanSummaryCardProps {
  readonly contributions: readonly Contribution[] | undefined
  readonly hasContributionError: boolean
  readonly isContributionPending: boolean
  readonly onRetryContributions: () => void
  readonly plan: Plan
  readonly taxYear: number
}

export function PlanSummaryCard({
  contributions,
  hasContributionError,
  isContributionPending,
  onRetryContributions,
  plan,
  taxYear,
}: PlanSummaryCardProps) {
  const annualTotal = contributions
    ? sumContributionsForTaxYear(contributions, taxYear)
    : 0
  const remaining = calculateRemainingContributionCapacity(
    plan.annualContributionLimit,
    annualTotal,
  )
  const usage = calculateContributionUsagePercentage(
    annualTotal,
    plan.annualContributionLimit,
  )

  return (
    <Card className={styles.planCard}>
      <div className={styles.planHeader}>
        <div>
          <p className={styles.planType}>{formatPlanType(plan.type)}</p>
          <h3>{plan.name}</h3>
          <p className={styles.planSponsor}>{formatPlanSponsor(plan.employer)}</p>
        </div>
        <StatusBadge tone={plan.isActive ? 'positive' : 'warning'}>
          {plan.isActive ? 'Active' : 'Inactive'}
        </StatusBadge>
      </div>

      <div className={styles.balanceBlock}>
        <p>Current balance</p>
        <strong>{formatCurrency(plan.currentBalance)}</strong>
      </div>

      <div className={styles.capacityBlock}>
        {isContributionPending ? (
          <div className={styles.capacityLoading} aria-label="Loading contribution history">
            <Skeleton height="0.85rem" width="11rem" />
            <Skeleton height="0.55rem" />
            <Skeleton height="0.75rem" width="15rem" />
          </div>
        ) : null}

        {hasContributionError ? (
          <div className={styles.capacityError} role="status">
            <div>
              <strong>Contribution history unavailable</strong>
              <p>The balance is current, but annual capacity could not be calculated.</p>
            </div>
            <Button
              onClick={onRetryContributions}
              size="small"
              variant="secondary"
            >
              Retry
            </Button>
          </div>
        ) : null}

        {!isContributionPending && !hasContributionError ? (
          <>
            <ProgressBar
              label={`${taxYear} limit used`}
              max={plan.annualContributionLimit}
              value={annualTotal}
            />
            <div className={styles.capacityFacts}>
              <span>
                <strong>{formatCurrency(annualTotal)}</strong> contributed
              </span>
              <span>
                <strong>{formatCurrency(remaining)}</strong> remaining
              </span>
            </div>
            <p className={styles.capacityNote}>
              {formatPercentage(usage)} of a{' '}
              {formatCurrency(plan.annualContributionLimit)} annual limit
            </p>
          </>
        ) : null}
      </div>

      <ActionLink size="small" to={`plans/${plan.id}`} variant="secondary">
        View plan details
      </ActionLink>
    </Card>
  )
}
