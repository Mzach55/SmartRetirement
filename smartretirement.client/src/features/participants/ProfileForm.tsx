import { useRef, useState } from 'react'
import { Alert, Button, Field } from '../../components/ui/index.ts'
import type { Participant, UpdateParticipantRequest } from '../../types/api.ts'
import {
  participantToProfileValues,
  toUpdateParticipantRequest,
  validateProfileForm,
} from './profileForm.ts'
import type { ProfileFormErrors, ProfileFormValues } from './profileForm.ts'
import styles from './ProfileForm.module.css'

interface ProfileFormProps {
  readonly isPending: boolean
  readonly onChange: () => void
  readonly onSubmit: (request: UpdateParticipantRequest) => Promise<Participant>
  readonly participant: Participant
}

function getLocalDateOnly(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export function ProfileForm({
  isPending,
  onChange,
  onSubmit,
  participant,
}: ProfileFormProps) {
  const initialValues = participantToProfileValues(participant)
  const [values, setValues] = useState<ProfileFormValues>(initialValues)
  const [errors, setErrors] = useState<ProfileFormErrors>({})
  const errorSummaryRef = useRef<HTMLDivElement>(null)
  const hasErrors = Object.keys(errors).length > 0
  const isDirty = Object.keys(initialValues).some(
    (field) => values[field as keyof ProfileFormValues] !== initialValues[field as keyof ProfileFormValues],
  )

  function updateValue(field: keyof ProfileFormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => {
      if (current[field] === undefined) {
        return current
      }

      const next = { ...current }
      delete next[field]
      return next
    })
    onChange()
  }

  function resetForm() {
    setValues(initialValues)
    setErrors({})
    onChange()
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextErrors = validateProfileForm(values, getLocalDateOnly(new Date()))

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      queueMicrotask(() => errorSummaryRef.current?.focus())
      return
    }

    try {
      const updatedParticipant = await onSubmit(toUpdateParticipantRequest(values))
      setValues(participantToProfileValues(updatedParticipant))
    } catch {
      // The mutation owner displays the typed API failure without clearing input.
    }
  }

  return (
    <form className={styles.form} noValidate onSubmit={handleSubmit}>
      {hasErrors ? (
        <div ref={errorSummaryRef} tabIndex={-1}>
          <Alert title="Review the profile details" tone="danger">
            <p>Correct the highlighted fields and save the profile again.</p>
          </Alert>
        </div>
      ) : null}

      <div className={styles.formGrid}>
        <Field error={errors.firstName} htmlFor="first-name" label="First name">
          <input
            aria-describedby={errors.firstName ? 'first-name-error' : undefined}
            aria-invalid={errors.firstName !== undefined}
            autoComplete="given-name"
            disabled={isPending}
            id="first-name"
            maxLength={100}
            onChange={(event) => updateValue('firstName', event.target.value)}
            value={values.firstName}
          />
        </Field>

        <Field error={errors.lastName} htmlFor="last-name" label="Last name">
          <input
            aria-describedby={errors.lastName ? 'last-name-error' : undefined}
            aria-invalid={errors.lastName !== undefined}
            autoComplete="family-name"
            disabled={isPending}
            id="last-name"
            maxLength={100}
            onChange={(event) => updateValue('lastName', event.target.value)}
            value={values.lastName}
          />
        </Field>

        <Field error={errors.email} htmlFor="email" label="Email address">
          <input
            aria-describedby={errors.email ? 'email-error' : undefined}
            aria-invalid={errors.email !== undefined}
            autoComplete="email"
            disabled={isPending}
            id="email"
            maxLength={256}
            onChange={(event) => updateValue('email', event.target.value)}
            type="email"
            value={values.email}
          />
        </Field>

        <Field error={errors.dateOfBirth} htmlFor="date-of-birth" label="Date of birth">
          <input
            aria-describedby={errors.dateOfBirth ? 'date-of-birth-error' : undefined}
            aria-invalid={errors.dateOfBirth !== undefined}
            disabled={isPending}
            id="date-of-birth"
            max={getLocalDateOnly(new Date())}
            onChange={(event) => updateValue('dateOfBirth', event.target.value)}
            type="date"
            value={values.dateOfBirth}
          />
        </Field>
      </div>

      <div className={styles.actions}>
        <Button disabled={isPending || !isDirty} onClick={resetForm} variant="secondary">
          Reset changes
        </Button>
        <Button disabled={isPending || !isDirty} type="submit">
          {isPending ? 'Saving…' : 'Save profile'}
        </Button>
      </div>
    </form>
  )
}
