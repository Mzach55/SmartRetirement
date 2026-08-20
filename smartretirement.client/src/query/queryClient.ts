import { QueryClient } from '@tanstack/react-query'
import {
  ApiContractError,
  ApiError,
  ApiNetworkError,
} from '../api/errors.ts'

const STALE_TIME_MS = 30_000

function shouldRetryQuery(failureCount: number, error: Error): boolean {
  if (failureCount >= 1 || error instanceof ApiContractError) {
    return false
  }

  if (error instanceof ApiError) {
    return error.status >= 500
  }

  return error instanceof ApiNetworkError
}

export function createAppQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: shouldRetryQuery,
        staleTime: STALE_TIME_MS,
      },
      mutations: {
        retry: false,
      },
    },
  })
}

// A browser SPA needs one stable cache for the lifetime of the application.
export const queryClient = createAppQueryClient()
