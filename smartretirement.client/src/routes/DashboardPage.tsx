import { useState } from 'react'
import { Alert, Button, Card, EmptyState, PageHeader, Skeleton } from '../components/ui/index.ts'
import {
  BalanceSummary,
  PlanSummaryCard,
  TaxYearSelector,
} from '../features/dashboard/index.ts'
import { usePlansContributionsQueries } from '../features/contributions/index.ts'
import { useCurrentParticipant } from '../features/participants/index.ts'
import { useParticipantPlansQuery } from '../features/plans/index.ts'
import {
  getContributionTaxYears,
  sumContributionsForTaxYear,
  sumPlanBalances,
} from '../lib/financials.ts'
import type { Plan } from '../types/api.ts'
import dashboardStyles from '../features/dashboard/Dashboard.module.css'
import { useDocumentTitle } from '../lib/useDocumentTitle.ts'
import styles from './Routes.module.css'

const NO_PLANS: readonly Plan[] = []

function DashboardPage() {
  useDocumentTitle('Overview | RetireWise')
  const participant = useCurrentParticipant()
  const plansQuery = useParticipantPlansQuery(participant.id)
  const plans = plansQuery.data ?? NO_PLANS
  const contributionQueries = usePlansContributionsQueries(plans)
  const [selectedYear, setSelectedYear] = useState<number | null>(null)

  const loadedContributions = contributionQueries.flatMap(
    (query) => query.data ?? [],
  )
  const contributionYears = getContributionTaxYears(loadedContributions)
  const currentYear = new Date().getFullYear()
  const availableYears =
    contributionYears.length > 0 ? contributionYears : [currentYear]
  const taxYear =
    selectedYear !== null && availableYears.includes(selectedYear)
      ? selectedYear
      : availableYears[0]
  const contributionsPending = contributionQueries.some(
    (query) => query.isPending,
  )
  const contributionErrorCount = contributionQueries.filter(
    (query) => query.isError,
  ).length
  const annualContributionTotal = loadedContributions.length > 0
    ? sumContributionsForTaxYear(loadedContributions, taxYear)
    : 0

  return (
    <main className={styles.page} id="main-content">
      <PageHeader
        eyebrow="Overview"
        title={`${participant.firstName}'s savings snapshot`}
        description="A focused summary of account balances, plan coverage, and annual contribution progress."
        action={
          plansQuery.isPending || contributionsPending ? (
            <div aria-label="Loading contribution years" aria-busy="true">
              <Skeleton height="2.5rem" width="9.5rem" />
            </div>
          ) : (
            <TaxYearSelector
              onChange={setSelectedYear}
              selectedYear={taxYear}
              years={availableYears}
            />
          )
        }
      />

      <div className={styles.stack}>
        {plansQuery.isPending ? (
          <div className={styles.stack} aria-label="Loading dashboard" aria-busy="true">
            <section className={styles.statsGrid}>
              {[1, 2, 3].map((marker) => (
                <Card key={marker}>
                  <Skeleton height="0.8rem" width="7rem" />
                  <div className={styles.statValue}>
                    <Skeleton height="2rem" width="8rem" />
                  </div>
                  <Skeleton height="0.7rem" width="11rem" />
                </Card>
              ))}
            </section>
            <section className={dashboardStyles.planGrid}>
              {[1, 2].map((marker) => (
                <Card className={dashboardStyles.planCard} key={marker}>
                  <Skeleton height="1.25rem" width="12rem" />
                  <Skeleton height="2rem" width="9rem" />
                  <Skeleton height="0.55rem" />
                </Card>
              ))}
            </section>
          </div>
        ) : null}

        {plansQuery.isError ? (
          <Alert title="Plans could not be loaded" tone="danger">
            <p>
              Participant details are available, but the plan summary request
              failed.
            </p>
            <Button
              className={styles.inlineAction}
              onClick={() => void plansQuery.refetch()}
              size="small"
              variant="secondary"
            >
              Retry plan summary
            </Button>
          </Alert>
        ) : null}

        {plansQuery.isSuccess ? (
          <>
            <BalanceSummary
              activePlanCount={plans.filter((plan) => plan.isActive).length}
              contributionTotal={annualContributionTotal}
              contributionTotalPending={contributionsPending}
              planCount={plans.length}
              taxYear={taxYear}
              totalBalance={sumPlanBalances(plans)}
            />

            {contributionErrorCount > 0 ? (
              <Alert title="Some annual totals are unavailable" tone="warning">
                <p>
                  {contributionErrorCount} contribution-history{' '}
                  {contributionErrorCount === 1 ? 'request has' : 'requests have'}{' '}
                  failed.
                  Current plan balances are still shown below, and each affected
                  plan can be retried independently.
                </p>
              </Alert>
            ) : null}

            <section aria-labelledby="accounts-heading">
              <div className={styles.sectionHeading}>
                <div>
                  <h2 id="accounts-heading">Plan overview</h2>
                  <p>Balances and {taxYear} annual capacity at a glance.</p>
                </div>
              </div>

              {plans.length === 0 ? (
                <Card>
                  <EmptyState
                    description="This participant is valid, but no employer-sponsored or individual plans are currently on file."
                    eyebrow="No plan records"
                    title="No savings plans yet"
                  />
                </Card>
              ) : (
                <div className={dashboardStyles.planGrid}>
                  {plans.map((plan, index) => {
                    const contributionQuery = contributionQueries[index]

                    return (
                      <PlanSummaryCard
                        contributions={contributionQuery.data}
                        hasContributionError={contributionQuery.isError}
                        isContributionPending={contributionQuery.isPending}
                        key={plan.id}
                        onRetryContributions={() => {
                          void contributionQuery.refetch()
                        }}
                        plan={plan}
                        taxYear={taxYear}
                      />
                    )
                  })}
                </div>
              )}
            </section>
          </>
        ) : null}
      </div>
    </main>
  )
}

export default DashboardPage
