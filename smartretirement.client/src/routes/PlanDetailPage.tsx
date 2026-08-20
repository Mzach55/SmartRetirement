import { useState } from 'react'
import { Link, useLocation, useParams } from 'react-router'
import { ApiError } from '../api/errors.ts'
import {
  ActionLink,
  Alert,
  Button,
  Card,
  EmptyState,
  PageHeader,
  ProgressBar,
  Skeleton,
  StatusBadge,
} from '../components/ui/index.ts'
import { usePlanContributionsQuery } from '../features/contributions/index.ts'
import { TaxYearSelector } from '../features/dashboard/index.ts'
import { useCurrentParticipant } from '../features/participants/index.ts'
import { usePlanQuery } from '../features/plans/index.ts'
import {
  calculateContributionUsagePercentage,
  calculateRemainingContributionCapacity,
  getContributionTaxYears,
  sumContributionsForTaxYear,
} from '../lib/financials.ts'
import {
  formatCurrency,
  formatDateOnly,
  formatPercentage,
  formatPlanSponsor,
  formatPlanType,
} from '../lib/formatters.ts'
import { parsePositiveRouteId } from '../lib/routeParams.ts'
import { useDocumentTitle } from '../lib/useDocumentTitle.ts'
import NotFoundPage from './NotFoundPage.tsx'
import styles from './Routes.module.css'

function PlanDetailPage() {
  const participant = useCurrentParticipant()
  const location = useLocation()
  const { planId: routePlanId } = useParams()
  const planId = parsePositiveRouteId(routePlanId)
  const planQuery = usePlanQuery(planId)
  useDocumentTitle(
    planQuery.data === undefined
      ? 'Plan details | RetireWise'
      : `${planQuery.data.name} | RetireWise`,
  )
  const verifiedPlanId =
    planQuery.data?.participantId === participant.id ? planId : null
  const contributionsQuery = usePlanContributionsQuery(verifiedPlanId)
  const [selectedYear, setSelectedYear] = useState<number | null>(null)

  if (planId === null) {
    return <NotFoundPage />
  }

  if (planQuery.isPending) {
    return (
      <main className={styles.page} id="main-content" aria-busy="true">
        <Skeleton height="1rem" width="9rem" />
        <div className={styles.detailLoadingHeader}>
          <Skeleton height="2.25rem" width="18rem" />
          <Skeleton height="1rem" width="25rem" />
        </div>
        <div className={styles.detailGrid}>
          <Card className={styles.stack}>
            <Skeleton height="1.25rem" width="12rem" />
            <Skeleton height="7rem" />
          </Card>
          <Card className={styles.stack}>
            <Skeleton height="1.25rem" width="9rem" />
            <Skeleton height="5rem" />
          </Card>
        </div>
      </main>
    )
  }

  if (
    planQuery.isError &&
    planQuery.error instanceof ApiError &&
    planQuery.error.status === 404
  ) {
    return <NotFoundPage />
  }

  if (planQuery.isError) {
    return (
      <main className={styles.page} id="main-content">
        <Link className={styles.backLink} to="../plans">
          ← Back to all plans
        </Link>
        <Alert title="Plan could not be loaded" tone="danger">
          <p>Check that the RetireWise API is running, then try again.</p>
          <Button
            className={styles.inlineAction}
            onClick={() => void planQuery.refetch()}
            size="small"
            variant="secondary"
          >
            Retry plan
          </Button>
        </Alert>
      </main>
    )
  }

  if (planQuery.data.participantId !== participant.id) {
    return <NotFoundPage />
  }

  const plan = planQuery.data
  const contributions = contributionsQuery.data ?? []
  const contributionYears = getContributionTaxYears(contributions)
  const availableYears = contributionYears.length > 0
    ? contributionYears
    : [new Date().getFullYear()]
  const taxYear =
    selectedYear !== null && availableYears.includes(selectedYear)
      ? selectedYear
      : availableYears[0]
  const annualTotal = sumContributionsForTaxYear(contributions, taxYear)
  const remaining = calculateRemainingContributionCapacity(
    plan.annualContributionLimit,
    annualTotal,
  )
  const usage = calculateContributionUsagePercentage(
    annualTotal,
    plan.annualContributionLimit,
  )
  const visibleContributions = [...contributions]
    .filter((contribution) => contribution.taxYear === taxYear)
    .sort((left, right) =>
      right.contributionDate.localeCompare(left.contributionDate) ||
      right.id - left.id,
    )
  const navigationState =
    typeof location.state === 'object' && location.state !== null
      ? location.state as Record<string, unknown>
      : undefined
  const createdAmount =
    navigationState?.contributionCreated === true &&
    typeof navigationState.amount === 'number' &&
    Number.isFinite(navigationState.amount)
      ? navigationState.amount
      : null

  return (
    <main className={styles.page} id="main-content">
      <Link className={styles.backLink} to="../plans">
        ← Back to all plans
      </Link>
      <PageHeader
        eyebrow={formatPlanType(plan.type)}
        title={plan.name}
        description="Balance, sponsorship, annual capacity, and contribution history."
        action={
          plan.isActive ? (
            <ActionLink to="contribute">Make a contribution</ActionLink>
          ) : (
            <StatusBadge tone="warning">Contributions unavailable</StatusBadge>
          )
        }
      />

      {createdAmount !== null ? (
        <div className={styles.pageNotice}>
          <Alert title="Contribution recorded" tone="success">
            <p>
              {formatCurrency(createdAmount)} was added successfully. Balance,
              capacity, and history queries have been refreshed.
            </p>
          </Alert>
        </div>
      ) : null}

      <div className={styles.detailGrid}>
        <Card>
          <div className={styles.sectionHeading}>
            <div>
              <h2>Account information</h2>
              <p>Current plan metadata from the API.</p>
            </div>
            <StatusBadge tone={plan.isActive ? 'positive' : 'warning'}>
              {plan.isActive ? 'Active' : 'Inactive'}
            </StatusBadge>
          </div>
          <dl className={styles.detailList}>
            <div>
              <dt>Current balance</dt>
              <dd>{formatCurrency(plan.currentBalance)}</dd>
            </div>
            <div>
              <dt>Plan type</dt>
              <dd>{formatPlanType(plan.type)}</dd>
            </div>
            <div>
              <dt>Sponsor</dt>
              <dd>{formatPlanSponsor(plan.employer)}</dd>
            </div>
            <div>
              <dt>Opened on</dt>
              <dd>{formatDateOnly(plan.openedOn)}</dd>
            </div>
          </dl>
        </Card>

        <Card tone="soft">
          <div className={styles.sectionHeading}>
            <div>
              <h2>Annual capacity</h2>
              <p>Contribution progress by tax year.</p>
            </div>
          </div>

          {contributionsQuery.isPending ? (
            <div className={styles.stack} aria-busy="true">
              <Skeleton height="2.5rem" width="9rem" />
              <Skeleton height="0.65rem" />
              <Skeleton height="0.8rem" width="70%" />
            </div>
          ) : null}

          {contributionsQuery.isError ? (
            <Alert title="Annual capacity unavailable" tone="warning">
              <p>The plan balance remains available. Retry its contribution history.</p>
              <Button
                className={styles.inlineAction}
                onClick={() => void contributionsQuery.refetch()}
                size="small"
                variant="secondary"
              >
                Retry history
              </Button>
            </Alert>
          ) : null}

          {contributionsQuery.isSuccess ? (
            <div className={styles.capacityDetail}>
              <TaxYearSelector
                onChange={setSelectedYear}
                selectedYear={taxYear}
                years={availableYears}
              />
              <ProgressBar
                label={`${taxYear} limit used`}
                max={plan.annualContributionLimit}
                value={annualTotal}
              />
              <p>
                <strong>{formatCurrency(annualTotal)}</strong> contributed ·{' '}
                <strong>{formatCurrency(remaining)}</strong> remaining
              </p>
              <small>
                {formatPercentage(usage)} of a{' '}
                {formatCurrency(plan.annualContributionLimit)} annual limit
              </small>
            </div>
          ) : null}
        </Card>
      </div>

      <Card>
        <div className={styles.sectionHeading}>
          <div>
            <h2 id="history-heading">Contribution history</h2>
            <p>
              {contributionsQuery.isPending
                ? 'Loading transactions.'
                : `${taxYear} transactions, newest first.`}
            </p>
          </div>
          <StatusBadge>
            {contributionsQuery.isPending
              ? 'Loading'
              : `${visibleContributions.length} entries`}
          </StatusBadge>
        </div>

        {contributionsQuery.isPending ? (
          <div className={styles.stack} aria-busy="true">
            <Skeleton height="3.5rem" />
            <Skeleton height="3.5rem" />
          </div>
        ) : null}

        {contributionsQuery.isError ? (
          <Alert title="Contribution history unavailable" tone="warning">
            <p>Use the retry action in annual capacity to request this data again.</p>
          </Alert>
        ) : null}

        {contributionsQuery.isSuccess && visibleContributions.length === 0 ? (
          <EmptyState
            description={`No contributions are recorded for ${taxYear}. Choose another available year if one exists.`}
            eyebrow="No transactions"
            title="No contribution history for this year"
          />
        ) : null}

        {contributionsQuery.isSuccess && visibleContributions.length > 0 ? (
          <div className={styles.tableScroller}>
            <table className={styles.historyTable} aria-labelledby="history-heading">
              <thead>
                <tr>
                  <th scope="col">Date</th>
                  <th scope="col">Description</th>
                  <th scope="col">Tax year</th>
                  <th scope="col">Amount</th>
                </tr>
              </thead>
              <tbody>
                {visibleContributions.map((contribution) => (
                  <tr key={contribution.id}>
                    <td>{formatDateOnly(contribution.contributionDate)}</td>
                    <td>{contribution.description ?? 'Contribution'}</td>
                    <td>{contribution.taxYear}</td>
                    <td>{formatCurrency(contribution.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </Card>
    </main>
  )
}

export default PlanDetailPage
