import type { ApiProblemDetails } from '../types/api.ts'

export class ApiError extends Error {
  readonly problem: ApiProblemDetails | undefined
  readonly status: number

  constructor(status: number, problem?: ApiProblemDetails) {
    const message =
      problem?.detail ??
      problem?.title ??
      `The API request failed with status ${status}.`

    super(message)
    this.name = 'ApiError'
    this.status = status
    this.problem = problem
  }
}

export class ApiNetworkError extends Error {
  constructor(cause: unknown) {
    super('RetireWise could not reach the API.', { cause })
    this.name = 'ApiNetworkError'
  }
}

export class ApiContractError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ApiContractError'
  }
}
