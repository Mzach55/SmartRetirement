import { queryOptions, useQuery } from '@tanstack/react-query'
import { getPlanById, getPlansByParticipantId } from '../../api/index.ts'
import { queryKeys } from '../../query/queryKeys.ts'

export function planDetailQueryOptions(planId: number) {
  return queryOptions({
    queryKey: queryKeys.plans.detail(planId),
    queryFn: ({ signal }) => getPlanById(planId, { signal }),
  })
}

export function participantPlansQueryOptions(participantId: number) {
  return queryOptions({
    queryKey: queryKeys.plans.byParticipant(participantId),
    queryFn: ({ signal }) => getPlansByParticipantId(participantId, { signal }),
  })
}

export function usePlanQuery(planId: number | null) {
  return useQuery({
    ...planDetailQueryOptions(planId ?? 0),
    enabled: planId !== null,
  })
}

export function useParticipantPlansQuery(participantId: number) {
  return useQuery(participantPlansQueryOptions(participantId))
}
