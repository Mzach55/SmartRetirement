import { useParams } from 'react-router'
import { ActionLink } from '../components/ui/index.ts'
import { useDocumentTitle } from '../lib/useDocumentTitle.ts'
import styles from '../styles/Routes.module.css'

interface NotFoundPageProps {
  readonly participantUnavailable?: boolean
}

function NotFoundPage({ participantUnavailable = false }: NotFoundPageProps) {
  useDocumentTitle('Page not found | RetireWise')
  const { participantId } = useParams()
  const recoveryPath = participantId && !participantUnavailable
    ? `/participants/${participantId}`
    : '/'

  return (
    <main className={`${styles.page} ${styles.notFound}`} id="main-content">
      <div>
        <p className={styles.notFoundCode}>404</p>
        <h1>
          {participantUnavailable
            ? 'That participant is not available.'
            : 'That page is outside the plan.'}
        </h1>
        <p>
          {participantUnavailable
            ? 'Choose one of the seeded participant profiles to continue the RetireWise demo.'
            : 'The requested RetireWise page does not exist. Use the link below to return to a known part of the participant portal.'}
        </p>
        <div className={styles.notFoundAction}>
          <ActionLink to={recoveryPath}>
            {participantId && !participantUnavailable
              ? 'Return to dashboard'
              : 'Choose a demo participant'}
          </ActionLink>
        </div>
      </div>
    </main>
  )
}

export default NotFoundPage
