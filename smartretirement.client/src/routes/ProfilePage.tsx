import { getRequestErrorMessage } from '../api/errorPresentation.ts'
import {
  Alert,
  Card,
  PageHeader,
  StatusBadge,
} from '../components/ui/index.ts'
import {
  ProfileForm,
  useCurrentParticipant,
  useUpdateParticipantMutation,
} from '../features/participants/index.ts'
import { formatUtcDateTime } from '../lib/formatters.ts'
import { useDocumentTitle } from '../lib/useDocumentTitle.ts'
import type { UpdateParticipantRequest } from '../types/api.ts'
import styles from './Routes.module.css'

function ProfilePage() {
  useDocumentTitle('Profile | RetireWise')
  const participant = useCurrentParticipant()
  const participantMutation = useUpdateParticipantMutation(participant.id)

  async function updateProfile(request: UpdateParticipantRequest) {
    return participantMutation.mutateAsync(request)
  }

  return (
    <main className={`${styles.page} ${styles.pageNarrow}`} id="main-content">
      <PageHeader
        eyebrow="Participant"
        title="Profile"
        description="Review and update the personal details associated with this participant record."
        action={<StatusBadge tone="info">Demo record</StatusBadge>}
      />

      <div className={styles.stack}>
        {participantMutation.isSuccess ? (
          <Alert title="Profile updated" tone="success">
            <p>
              The participant detail cache was updated and the chooser was
              refreshed with the latest identity.
            </p>
          </Alert>
        ) : null}

        {participantMutation.isError ? (
          <Alert title="Profile could not be updated" tone="danger">
            <p>
              {getRequestErrorMessage(
                participantMutation.error,
                'The profile request failed. Your entered values were preserved.',
              )}
            </p>
          </Alert>
        ) : null}

        <Card>
          <div className={styles.sectionHeading}>
            <div>
              <h2 id="profile-heading">Personal information</h2>
              <p>Participant ID {participant.id} · Created {formatUtcDateTime(participant.createdAtUtc)}</p>
            </div>
          </div>

          <div aria-labelledby="profile-heading">
            <ProfileForm
              isPending={participantMutation.isPending}
              key={participant.id}
              onChange={() => participantMutation.reset()}
              onSubmit={updateProfile}
              participant={participant}
            />
          </div>
        </Card>
      </div>
    </main>
  )
}

export default ProfilePage
