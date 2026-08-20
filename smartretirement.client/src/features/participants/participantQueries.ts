import { queryOptions, useQuery } from '@tanstack/react-query'
import {
  getParticipantById,
  getParticipants,
} from '../../api/index.ts'
import { queryKeys } from '../../query/queryKeys.ts'

export function participantListQueryOptions() {
  return queryOptions({
    queryKey: queryKeys.participants.list(),
    queryFn: ({ signal }) => getParticipants({ signal }),
  })
}

export function participantDetailQueryOptions(participantId: number) {
  return queryOptions({
    queryKey: queryKeys.participants.detail(participantId),
    queryFn: ({ signal }) => getParticipantById(participantId, { signal }),
  })
}

export function useParticipantsQuery() {
  return useQuery(participantListQueryOptions())
}

export function useParticipantQuery(participantId: number | null) {
  return useQuery({
    ...participantDetailQueryOptions(participantId ?? 0),
    enabled: participantId !== null,
  })
}
