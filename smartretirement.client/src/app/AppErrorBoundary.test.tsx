import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { AppErrorBoundary } from './AppErrorBoundary.tsx'

function BrokenPage(): never {
  throw new Error('render failed')
}

describe('AppErrorBoundary', () => {
  it('replaces an unexpected rendering failure with a recovery experience', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)

    render(
      <AppErrorBoundary>
        <BrokenPage />
      </AppErrorBoundary>,
    )

    expect(screen.getByRole('heading', { name: 'RetireWise needs a fresh start.' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Restart the demo' })).toHaveAttribute('href', '/')
  })
})
