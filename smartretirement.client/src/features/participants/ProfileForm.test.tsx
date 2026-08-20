import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { mayaParticipant } from '../../test/fixtures.ts'
import { ProfileForm } from './ProfileForm.tsx'

describe('ProfileForm', () => {
  it('starts clean and submits a changed profile through its callback', async () => {
    const user = userEvent.setup()
    const updatedParticipant = { ...mayaParticipant, firstName: 'May' }
    const onSubmit = vi.fn(async () => updatedParticipant)

    render(
      <ProfileForm
        isPending={false}
        onChange={vi.fn()}
        onSubmit={onSubmit}
        participant={mayaParticipant}
      />,
    )

    const saveButton = screen.getByRole('button', { name: 'Save profile' })
    expect(saveButton).toBeDisabled()

    const firstNameInput = screen.getByLabelText('First name')
    await user.clear(firstNameInput)
    await user.type(firstNameInput, ' May ')
    await user.click(saveButton)

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        firstName: 'May',
        lastName: 'Chen',
        email: 'maya.chen@example.com',
        dateOfBirth: '1989-04-12',
      })
    })
  })

  it('preserves the draft and reports invalid email input', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn(async () => mayaParticipant)

    render(
      <ProfileForm
        isPending={false}
        onChange={vi.fn()}
        onSubmit={onSubmit}
        participant={mayaParticipant}
      />,
    )

    const emailInput = screen.getByLabelText('Email address')
    await user.clear(emailInput)
    await user.type(emailInput, 'not-an-email')
    await user.click(screen.getByRole('button', { name: 'Save profile' }))

    expect(emailInput).toHaveValue('not-an-email')
    expect(emailInput).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByText('Enter a valid email address.')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })
})
