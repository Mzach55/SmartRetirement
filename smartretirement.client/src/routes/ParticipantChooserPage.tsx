import { Link } from 'react-router'
import {
  ActionLink,
  Alert,
  Button,
  Card,
  EmptyState,
  Skeleton,
  StatusBadge,
} from '../components/ui/index.ts'
import { useParticipantsQuery } from '../features/participants/index.ts'
import {
  formatParticipantInitials,
  formatParticipantName,
} from '../lib/formatters.ts'
import { useDocumentTitle } from '../lib/useDocumentTitle.ts'
import styles from './Routes.module.css'

function ParticipantChooserPage() {
  useDocumentTitle('Choose a participant | RetireWise')
  const participantsQuery = useParticipantsQuery()

  return (
    <div className={styles.chooserShell}>
      <header className={styles.publicHeader}>
        <Link className={styles.publicBrand} to="/">
          <span className={styles.publicBrandMark} aria-hidden="true">
            R
          </span>
          RetireWise
        </Link>
        <span className={styles.publicHeaderNote}>Participant experience demo</span>
      </header>

      <main className={styles.chooserMain} id="main-content">
        <section className={styles.chooserHero}>
          <div>
            <p className={styles.heroEyebrow}>Plan with confidence</p>
            <h1>A clearer view of your financial future.</h1>
            <p className={styles.heroDescription}>
              See retirement and savings plans in one focused workspace, track
              annual contributions, and understand how much room remains.
            </p>
          </div>

          <aside className={styles.heroAside}>
            <StatusBadge tone="info">Demo mode</StatusBadge>
            <p className={styles.heroAsideLabel}>A transparent preview</p>
            <p>
              Choose a seeded participant below. This is an interview demo and
              does not represent authentication or account security.
            </p>
          </aside>
        </section>

        <section className={styles.chooserSection} aria-labelledby="demo-heading">
          <div className={styles.chooserSectionHeader}>
            <h2 id="demo-heading">Choose a participant</h2>
            <p>
              Each profile demonstrates a different combination of supported
              savings plans.
            </p>
          </div>

          {participantsQuery.isPending ? (
            <div
              className={styles.participantGrid}
              aria-label="Loading participants"
              aria-busy="true"
            >
              {[1, 2, 3].map((marker) => (
                <Card className={styles.participantCard} key={marker}>
                  <div className={styles.participantIdentity}>
                    <Skeleton height="3rem" width="3rem" />
                    <div className={styles.participantLoadingText}>
                      <Skeleton width="9rem" />
                      <Skeleton height="0.75rem" width="13rem" />
                    </div>
                  </div>
                  <Skeleton height="2.75rem" />
                </Card>
              ))}
            </div>
          ) : null}

          {participantsQuery.isError ? (
            <Alert title="Participants could not be loaded" tone="danger">
              <p>
                Check that the RetireWise API is running, then try the request
                again.
              </p>
              <Button
                className={styles.inlineAction}
                onClick={() => void participantsQuery.refetch()}
                size="small"
                variant="secondary"
              >
                Retry participant list
              </Button>
            </Alert>
          ) : null}

          {participantsQuery.isSuccess && participantsQuery.data.length === 0 ? (
            <Card>
              <EmptyState
                description="The API is available, but it does not currently contain any participant profiles."
                eyebrow="No demo records"
                title="There is nobody to select yet"
              />
            </Card>
          ) : null}

          {participantsQuery.isSuccess && participantsQuery.data.length > 0 ? (
            <div className={styles.participantGrid}>
              {participantsQuery.data.map((participant) => (
                <Card className={styles.participantCard} key={participant.id}>
                  <div className={styles.participantIdentity}>
                    <span className={styles.avatar} aria-hidden="true">
                      {formatParticipantInitials(participant)}
                    </span>
                    <div>
                      <h3>{formatParticipantName(participant)}</h3>
                      <p>Retirement and savings workspace</p>
                    </div>
                  </div>
                  <ActionLink
                    to={`/participants/${participant.id}`}
                    variant="secondary"
                  >
                    View participant portal
                  </ActionLink>
                </Card>
              ))}
            </div>
          ) : null}
        </section>
      </main>

      <footer className={styles.publicFooter}>
        Educational demonstration only. Not financial, tax, or legal advice.
      </footer>
    </div>
  )
}

export default ParticipantChooserPage
