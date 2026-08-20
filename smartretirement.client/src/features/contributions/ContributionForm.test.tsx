import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { maya401kContributions, maya401kPlan } from '../../test/fixtures.ts'
import { ContributionForm } from './ContributionForm.tsx'

describe('ContributionForm', () => {
  it('shows accessible validation feedback without submitting invalid input', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn(async () => undefined)

    render(
      <ContributionForm
        contributions={maya401kContributions}
        isPending={false}
        onCancel={vi.fn()}
        onChange={vi.fn()}
        onSubmit={onSubmit}
        plan={maya401kPlan}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Submit contribution' }))

    expect(screen.getByRole('alert')).toHaveTextContent('Review the contribution details')
    expect(screen.getByLabelText('Contribution amount')).toHaveAttribute('aria-invalid', 'true')
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('previews an excessive proposal but still lets the API make the decision', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn(async () => undefined)

    render(
      <ContributionForm
        contributions={maya401kContributions}
        isPending={false}
        onCancel={vi.fn()}
        onChange={vi.fn()}
        onSubmit={onSubmit}
        plan={maya401kPlan}
      />,
    )

    const amountInput = screen.getByLabelText('Contribution amount')
    const yearInput = screen.getByLabelText('Tax year')

    await user.type(amountInput, '6000')
    await user.clear(yearInput)
    await user.type(yearInput, '2025')

    expect(screen.getByText('Over limit')).toBeInTheDocument()
    expect(screen.getByText('$24,000.00')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Submit contribution' }))

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({
        planId: 1,
        amount: 6_000,
        taxYear: 2025,
      }))
    })
  })

  it('disables form controls while a financial write is pending', () => {
    render(
      <ContributionForm
        contributions={maya401kContributions}
        isPending
        onCancel={vi.fn()}
        onChange={vi.fn()}
        onSubmit={vi.fn(async () => undefined)}
        plan={maya401kPlan}
      />,
    )

    expect(screen.getByLabelText('Contribution amount')).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Submitting…' })).toBeDisabled()
  })
})
