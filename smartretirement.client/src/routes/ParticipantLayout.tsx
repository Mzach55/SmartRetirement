import { Outlet, useParams } from 'react-router'
import { ApiError } from '../api/errors.ts'
import { AppShell } from '../components/layout/AppShell.tsx'
import { Alert, Button, Card, Skeleton } from '../components/ui/index.ts'
import { useParticipantQuery } from '../features/participants/index.ts'
import { parsePositiveRouteId } from '../lib/routeParams.ts'
import NotFoundPage from './NotFoundPage.tsx'
import styles from '../styles/Routes.module.css'

function ParticipantLayout() {
  const routeParams = useParams()
  const participantId = parsePositiveRouteId(routeParams.participantId)
  const participantQuery = useParticipantQuery(participantId)

  if (participantId === null) {
    return <NotFoundPage participantUnavailable />
  }

  if (participantQuery.isPending) {
    return (
      <main className={styles.routeGate} id="main-content" aria-busy="true">
        <Card className={styles.routeGateCard}>
          <span className={styles.routeGateMark} aria-hidden="true">
            R
          </span>
          <Skeleton height="1.5rem" width="13rem" />
          <Skeleton height="0.85rem" width="18rem" />
        </Card>
      </main>
    )
  }

  if (
    participantQuery.isError &&
    participantQuery.error instanceof ApiError &&
    participantQuery.error.status === 404
  ) {
    return <NotFoundPage participantUnavailable />
  }

  if (participantQuery.isError) {
    return (
      <main className={styles.routeGate} id="main-content">
        <Card className={styles.routeGateCard}>
          <Alert title="Participant could not be loaded" tone="danger">
            <p>
              The portal could not verify this participant. Check that the API
              is running, then try again.
            </p>
          </Alert>
          <Button onClick={() => void participantQuery.refetch()}>
            Retry participant
          </Button>
        </Card>
      </main>
    )
  }

  return (
    <AppShell participant={participantQuery.data}>
      <Outlet context={{ participant: participantQuery.data }} />
    </AppShell>
  )
}

export default ParticipantLayout
