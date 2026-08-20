import {
  ActionLink,
  Alert,
  Button,
  Card,
  EmptyState,
  PageHeader,
  Skeleton,
  StatusBadge,
} from '../components/ui/index.ts'
import { useCurrentParticipant } from '../features/participants/index.ts'
import { useParticipantPlansQuery } from '../features/plans/index.ts'
import {
  formatCurrency,
  formatPlanSponsor,
  formatPlanType,
} from '../lib/formatters.ts'
import { useDocumentTitle } from '../lib/useDocumentTitle.ts'
import styles from '../styles/Routes.module.css'

function PlansPage() {
  useDocumentTitle('Plans | RetireWise')
  const participant = useCurrentParticipant()
  const plansQuery = useParticipantPlansQuery(participant.id)

  return (
    <main className={styles.page} id="main-content">
      <PageHeader
        eyebrow="Accounts"
        title="Your savings plans"
        description="Review employer-sponsored and individual accounts from one place."
      />

      {plansQuery.isPending ? (
        <section
          className={styles.plansGrid}
          aria-label="Loading plans"
          aria-busy="true"
        >
          {[1, 2].map((marker) => (
            <Card className={styles.planPreview} key={marker}>
              <Skeleton height="1rem" width="7rem" />
              <Skeleton height="1.35rem" width="65%" />
              <Skeleton height="2.25rem" width="48%" />
              <Skeleton height="2.25rem" />
            </Card>
          ))}
        </section>
      ) : null}

      {plansQuery.isError ? (
        <Alert title="Plans could not be loaded" tone="danger">
          <p>Check that the RetireWise API is running, then try again.</p>
          <Button
            className={styles.inlineAction}
            onClick={() => void plansQuery.refetch()}
            size="small"
            variant="secondary"
          >
            Retry plans
          </Button>
        </Alert>
      ) : null}

      {plansQuery.isSuccess && plansQuery.data.length === 0 ? (
        <Card>
          <EmptyState
            description="This participant is valid, but no employer-sponsored or individual plans are currently on file."
            eyebrow="No plan records"
            title="No savings plans yet"
          />
        </Card>
      ) : null}

      {plansQuery.isSuccess && plansQuery.data.length > 0 ? (
        <section className={styles.plansGrid} aria-label="Savings plans">
          {plansQuery.data.map((plan) => (
            <Card className={styles.planPreview} key={plan.id}>
              <div className={styles.planPreviewHeader}>
                <StatusBadge tone={plan.isActive ? 'positive' : 'warning'}>
                  {plan.isActive ? 'Active' : 'Inactive'}
                </StatusBadge>
                <span className={styles.statHint}>{formatPlanType(plan.type)}</span>
              </div>
              <div className={styles.planPreviewBody}>
                <div>
                  <h2 className={styles.planName}>{plan.name}</h2>
                  <p className={styles.planSponsor}>{formatPlanSponsor(plan.employer)}</p>
                </div>
                <div>
                  <p className={styles.statLabel}>Current balance</p>
                  <p className={styles.planBalance}>{formatCurrency(plan.currentBalance)}</p>
                </div>
                <p className={styles.planLimit}>
                  {formatCurrency(plan.annualContributionLimit)} annual limit
                </p>
              </div>
              <ActionLink size="small" to={`${plan.id}`} variant="secondary">
                View plan details
              </ActionLink>
            </Card>
          ))}
        </section>
      ) : null}
    </main>
  )
}

export default PlansPage
