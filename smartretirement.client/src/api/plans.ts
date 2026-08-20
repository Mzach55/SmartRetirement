import { parsePlan, parsePlans } from './contractParsers.ts'
import { requestJson } from './httpClient.ts'
import type { ApiCallOptions } from './httpClient.ts'
import { requirePositiveId } from './ids.ts'
import type { Plan } from '../types/api.ts'

export function getPlanById(
  planId: number,
  options?: ApiCallOptions,
): Promise<Plan> {
  const id = requirePositiveId(planId, 'Plan ID')

  return requestJson(`/api/plans/${id}`, parsePlan, options)
}

export function getPlansByParticipantId(
  participantId: number,
  options?: ApiCallOptions,
): Promise<readonly Plan[]> {
  const id = requirePositiveId(participantId, 'Participant ID')

  return requestJson(`/api/participants/${id}/plans`, parsePlans, options)
}
