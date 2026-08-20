import type {
  Participant,
  UpdateParticipantRequest,
} from '../../types/api.ts'

export interface ProfileFormValues {
  readonly dateOfBirth: string
  readonly email: string
  readonly firstName: string
  readonly lastName: string
}

export type ProfileFormErrors = Partial<Record<keyof ProfileFormValues, string>>

const SIMPLE_EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function isValidDateOnly(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)

  if (match === null) {
    return false
  }

  const year = Number(match[1])
  const monthIndex = Number(match[2]) - 1
  const day = Number(match[3])
  const date = new Date(Date.UTC(year, monthIndex, day))

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === monthIndex &&
    date.getUTCDate() === day
  )
}

export function participantToProfileValues(
  participant: Participant,
): ProfileFormValues {
  return {
    firstName: participant.firstName,
    lastName: participant.lastName,
    email: participant.email,
    dateOfBirth: participant.dateOfBirth,
  }
}

export function validateProfileForm(
  values: ProfileFormValues,
  today: string,
): ProfileFormErrors {
  const errors: ProfileFormErrors = {}
  const firstName = values.firstName.trim()
  const lastName = values.lastName.trim()
  const email = values.email.trim()

  if (firstName === '') {
    errors.firstName = 'First name is required.'
  } else if (firstName.length > 100) {
    errors.firstName = 'First name cannot exceed 100 characters.'
  }

  if (lastName === '') {
    errors.lastName = 'Last name is required.'
  } else if (lastName.length > 100) {
    errors.lastName = 'Last name cannot exceed 100 characters.'
  }

  if (email === '') {
    errors.email = 'Email address is required.'
  } else if (email.length > 256) {
    errors.email = 'Email address cannot exceed 256 characters.'
  } else if (!SIMPLE_EMAIL_PATTERN.test(email)) {
    errors.email = 'Enter a valid email address.'
  }

  if (values.dateOfBirth === '') {
    errors.dateOfBirth = 'Date of birth is required.'
  } else if (!isValidDateOnly(values.dateOfBirth)) {
    errors.dateOfBirth = 'Choose a valid date of birth.'
  } else if (values.dateOfBirth > today) {
    errors.dateOfBirth = 'Date of birth cannot be in the future.'
  }

  return errors
}

export function toUpdateParticipantRequest(
  values: ProfileFormValues,
): UpdateParticipantRequest {
  return {
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim(),
    email: values.email.trim(),
    dateOfBirth: values.dateOfBirth,
  }
}
