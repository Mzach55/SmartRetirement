import { QueryClientProvider } from '@tanstack/react-query'
import type { PropsWithChildren, ReactElement } from 'react'
import { BrowserRouter } from 'react-router'
import { queryClient } from '../query/queryClient.ts'
import { NavigationEffects } from './NavigationEffects.tsx'

type AppProvidersProps = PropsWithChildren

export function AppProviders({ children }: AppProvidersProps): ReactElement {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <NavigationEffects />
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  )
}
