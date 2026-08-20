import { Card, Skeleton } from '../../components/ui/index.ts'
import { formatCurrency } from '../../lib/formatters.ts'
import styles from './Dashboard.module.css'

interface BalanceSummaryProps {
  readonly activePlanCount: number
  readonly contributionTotal: number
  readonly contributionTotalPending: boolean
  readonly planCount: number
  readonly taxYear: number
  readonly totalBalance: number
}

export function BalanceSummary({
  activePlanCount,
  contributionTotal,
  contributionTotalPending,
  planCount,
  taxYear,
  totalBalance,
}: BalanceSummaryProps) {
  return (
    <section className={styles.summaryGrid} aria-label="Account summary">
      <Card>
        <p className={styles.statLabel}>Total balance</p>
        <p className={styles.statValue}>{formatCurrency(totalBalance)}</p>
        <p className={styles.statHint}>Across all savings plans</p>
      </Card>

      <Card>
        <p className={styles.statLabel}>Active plans</p>
        <p className={styles.statValue}>
          {activePlanCount}
          <span className={styles.statValueContext}> of {planCount}</span>
        </p>
        <p className={styles.statHint}>Employer and individual accounts</p>
      </Card>

      <Card>
        <p className={styles.statLabel}>{taxYear} contributions</p>
        <div className={styles.statValue} aria-live="polite">
          {contributionTotalPending ? (
            <Skeleton height="2rem" width="8rem" />
          ) : (
            formatCurrency(contributionTotal)
          )}
        </div>
        <p className={styles.statHint}>Across available plan histories</p>
      </Card>
    </section>
  )
}
