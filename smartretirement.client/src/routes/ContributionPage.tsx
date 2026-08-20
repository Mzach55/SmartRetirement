import { Link, useNavigate, useParams } from 'react-router'
import { getRequestErrorMessage } from '../api/errorPresentation.ts'
import { ApiError } from '../api/errors.ts'
import {
  Alert,
  Button,
  Card,
  PageHeader,
  Skeleton,
  StatusBadge,
} from '../components/ui/index.ts'
import {
  ContributionForm,
  useCreateContributionMutation,
  usePlanContributionsQuery,
} from '../features/contributions/index.ts'
import { useCurrentParticipant } from '../features/participants/index.ts'
import { usePlanQuery } from '../features/plans/index.ts'
import { formatCurrency, formatPlanType } from '../lib/formatters.ts'
import { parsePositiveRouteId } from '../lib/routeParams.ts'
import { useDocumentTitle } from '../lib/useDocumentTitle.ts'
import type { CreateContributionRequest } from '../types/api.ts'
import NotFoundPage from './NotFoundPage.tsx'
import styles from './Routes.module.css'

function ContributionPage() {
  const participant = useCurrentParticipant()
  const navigate = useNavigate()
  const { planId: routePlanId } = useParams()
  const planId = parsePositiveRouteId(routePlanId)
  const planQuery = usePlanQuery(planId)
  useDocumentTitle(
    planQuery.data === undefined
      ? 'Make a contribution | RetireWise'
      : `Contribute to ${planQuery.data.name} | RetireWise`,
  )
  const verifiedPlanId =
    planQuery.data?.participantId === participant.id ? planId : null
  const contributionsQuery = usePlanContributionsQuery(verifiedPlanId)
  const contributionMutation = useCreateContributionMutation({
    participantId: participant.id,
    planId: planId ?? 0,
  })
  const plansPath = `/participants/${participant.id}/plans`

  if (planId === null) {
    return <NotFoundPage />
  }

  if (planQuery.isPending) {
    return (
      <main className={`${styles.page} ${styles.pageNarrow}`} id="main-content" aria-busy="true">
        <Skeleton height="1rem" width="10rem" />
        <div className={styles.detailLoadingHeader}>
          <Skeleton height="2.25rem" width="18rem" />
          <Skeleton height="1rem" width="28rem" />
        </div>
        <Card className={styles.stack}>
          <Skeleton height="1.25rem" width="14rem" />
          <Skeleton height="14rem" />
        </Card>
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
      <main className={`${styles.page} ${styles.pageNarrow}`} id="main-content">
        <Link className={styles.backLink} to={plansPath}>
          ← Back to all plans
        </Link>
        <Alert title="Plan could not be loaded" tone="danger">
          <p>{getRequestErrorMessage(planQuery.error, 'The plan request failed.')}</p>
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
  const planPath = `${plansPath}/${plan.id}`
  const errorCode = contributionMutation.error instanceof ApiError
    ? contributionMutation.error.problem?.code
    : undefined
  const mutationErrorTitle = errorCode === 'AnnualLimitExceeded'
    ? 'Annual contribution limit exceeded'
    : errorCode === 'PlanInactive'
      ? 'This plan is inactive'
      : 'Contribution could not be submitted'

  async function submitContribution(request: CreateContributionRequest) {
    const contribution = await contributionMutation.mutateAsync(request)

    navigate(planPath, {
      state: {
        contributionCreated: true,
        amount: contribution.amount,
      },
    })
  }

  return (
    <main className={`${styles.page} ${styles.pageNarrow}`} id="main-content">
      <Link className={styles.backLink} to={planPath}>
        ← Return to plan details
      </Link>
      <PageHeader
        eyebrow={formatPlanType(plan.type)}
        title="Make a contribution"
        description={`Add funds to ${plan.name} and review the effect on its annual contribution limit.`}
        action={<StatusBadge tone="info">Server validated</StatusBadge>}
      />

      <div className={styles.stack}>
        <Card className={styles.destinationCard} padding="compact" tone="soft">
          <div>
            <p>Destination plan</p>
            <strong>{plan.name}</strong>
          </div>
          <div>
            <p>Current balance</p>
            <strong>{formatCurrency(plan.currentBalance)}</strong>
          </div>
        </Card>

        <Alert title="The service layer makes the final decision" tone="info">
          <p>
            The preview uses currently loaded history. The API recalculates the
            annual total before saving and rejects any contribution over the cap.
          </p>
        </Alert>

        {!plan.isActive ? (
          <Alert title="This plan cannot accept contributions" tone="warning">
            <p>The plan is inactive. Its balance and history remain available.</p>
          </Alert>
        ) : null}

        {contributionMutation.isError ? (
          <Alert title={mutationErrorTitle} tone="danger">
            <p>
              {getRequestErrorMessage(
                contributionMutation.error,
                'The contribution request failed. Your entered values were preserved.',
              )}
            </p>
          </Alert>
        ) : null}

        {plan.isActive && contributionsQuery.isPending ? (
          <Card className={styles.stack} aria-busy="true">
            <Skeleton height="1.25rem" width="13rem" />
            <Skeleton height="13rem" />
          </Card>
        ) : null}

        {plan.isActive && contributionsQuery.isError ? (
          <Alert title="Contribution history could not be loaded" tone="danger">
            <p>
              RetireWise needs the latest history to provide an accurate preview.
              Your contribution has not been submitted.
            </p>
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

        {plan.isActive && contributionsQuery.isSuccess ? (
          <Card>
            <ContributionForm
              contributions={contributionsQuery.data}
              isPending={contributionMutation.isPending}
              onCancel={() => navigate(planPath)}
              onChange={() => contributionMutation.reset()}
              onSubmit={submitContribution}
              plan={plan}
            />
          </Card>
        ) : null}
      </div>
    </main>
  )
}

export default ContributionPage
