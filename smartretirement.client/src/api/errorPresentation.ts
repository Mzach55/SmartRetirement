import { ApiContractError, ApiError, ApiNetworkError } from './errors.ts'

/** Convert typed API failures into safe, actionable participant-facing copy. */
export function getRequestErrorMessage(
  error: unknown,
  fallback: string,
): string {
  if (error instanceof ApiError) {
    return error.message
  }

  if (error instanceof ApiNetworkError) {
    return 'RetireWise could not reach the API. Check that it is running and try again.'
  }

  if (error instanceof ApiContractError) {
    return 'RetireWise received an unexpected response. Please try again.'
  }

  return fallback
}
