import { describe, expect, it } from 'vitest'
import {
  participantToProfileValues,
  toUpdateParticipantRequest,
  validateProfileForm,
} from './profileForm.ts'
import { mayaParticipant } from '../../test/fixtures.ts'

describe('profile form rules', () => {
  it('initializes editable values from the participant contract', () => {
    expect(participantToProfileValues(mayaParticipant)).toEqual({
      firstName: 'Maya',
      lastName: 'Chen',
      email: 'maya.chen@example.com',
      dateOfBirth: '1989-04-12',
    })
  })

  it('rejects required, malformed, and future values', () => {
    expect(validateProfileForm({
      firstName: ' ',
      lastName: '',
      email: 'not-an-email',
      dateOfBirth: '2030-01-01',
    }, '2026-08-18')).toEqual({
      firstName: expect.any(String),
      lastName: expect.any(String),
      email: expect.any(String),
      dateOfBirth: expect.any(String),
    })
  })

  it('rejects an impossible calendar date', () => {
    const errors = validateProfileForm({
      firstName: 'Maya',
      lastName: 'Chen',
      email: 'maya.chen@example.com',
      dateOfBirth: '2025-02-30',
    }, '2026-08-18')

    expect(errors.dateOfBirth).toBe('Choose a valid date of birth.')
  })

  it('trims values before creating the API request', () => {
    expect(toUpdateParticipantRequest({
      firstName: '  Maya ',
      lastName: ' Chen  ',
      email: ' maya.chen@example.com ',
      dateOfBirth: '1989-04-12',
    })).toEqual({
      firstName: 'Maya',
      lastName: 'Chen',
      email: 'maya.chen@example.com',
      dateOfBirth: '1989-04-12',
    })
  })
})
