import { tryParseProblemDetails } from './contractParsers.ts'
import { ApiContractError, ApiError, ApiNetworkError } from './errors.ts'

export interface ApiCallOptions {
  readonly signal?: AbortSignal
}

interface JsonRequestOptions extends ApiCallOptions {
  readonly body?: unknown
  readonly method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
}

type ResponseParser<T> = (value: unknown) => T

const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim() ?? ''
const apiBaseUrl = configuredBaseUrl.replace(/\/+$/, '')

function buildUrl(path: string): string {
  if (!path.startsWith('/api/')) {
    throw new Error(`API paths must begin with /api/: ${path}`)
  }

  return `${apiBaseUrl}${path}`
}

async function parseErrorResponse(response: Response) {
  const contentType = response.headers.get('content-type') ?? ''

  if (!contentType.includes('json')) {
    return undefined
  }

  try {
    return tryParseProblemDetails(await response.json())
  } catch {
    return undefined
  }
}

export async function requestJson<T>(
  path: string,
  parseResponse: ResponseParser<T>,
  options: JsonRequestOptions = {},
): Promise<T> {
  const { body, method = 'GET', signal } = options
  const headers = new Headers({ Accept: 'application/json' })
  let requestBody: string | undefined

  if (body !== undefined) {
    headers.set('Content-Type', 'application/json')
    requestBody = JSON.stringify(body)
  }

  let response: Response

  try {
    response = await fetch(buildUrl(path), {
      body: requestBody,
      headers,
      method,
      signal,
    })
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw error
    }

    throw new ApiNetworkError(error)
  }

  if (!response.ok) {
    throw new ApiError(response.status, await parseErrorResponse(response))
  }

  if (response.status === 204) {
    throw new ApiContractError(
      `${method} ${path} returned no content when JSON was expected.`,
    )
  }

  const contentType = response.headers.get('content-type') ?? ''

  if (!contentType.includes('json')) {
    throw new ApiContractError(
      `${method} ${path} returned an unexpected content type.`,
    )
  }

  let payload: unknown

  try {
    payload = await response.json()
  } catch (error) {
    throw new ApiContractError(
      `${method} ${path} returned malformed JSON: ${String(error)}`,
    )
  }

  return parseResponse(payload)
}
