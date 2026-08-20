/**
 * Convert a route segment into the positive integer IDs used by the API.
 *
 * Returning null keeps malformed URL state out of API functions and query
 * keys. Values such as "1.5", "01", zero, and negative numbers are rejected.
 */
export function parsePositiveRouteId(value: string | undefined): number | null {
  if (value === undefined || !/^[1-9]\d*$/.test(value)) {
    return null
  }

  const parsed = Number(value)

  return Number.isSafeInteger(parsed) ? parsed : null
}
