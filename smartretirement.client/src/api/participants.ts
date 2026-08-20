import { parseParticipant, parseParticipants } from './contractParsers.ts'
import { requestJson } from './httpClient.ts'
import type { ApiCallOptions } from './httpClient.ts'
import { requirePositiveId } from './ids.ts'
import type {
  Participant,
  UpdateParticipantRequest,
} from '../types/api.ts'

export function getParticipants(
  options?: ApiCallOptions,
): Promise<readonly Participant[]> {
  return requestJson('/api/participants', parseParticipants, options)
}

export function getParticipantById(
  participantId: number,
  options?: ApiCallOptions,
): Promise<Participant> {
  const id = requirePositiveId(participantId, 'Participant ID')

  return requestJson(`/api/participants/${id}`, parseParticipant, options)
}

export function updateParticipant(
  participantId: number,
  request: UpdateParticipantRequest,
  options?: ApiCallOptions,
): Promise<Participant> {
  const id = requirePositiveId(participantId, 'Participant ID')

  return requestJson(`/api/participants/${id}`, parseParticipant, {
    ...options,
    body: request,
    method: 'PUT',
  })
}
