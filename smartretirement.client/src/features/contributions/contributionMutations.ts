import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createContribution } from '../../api/index.ts'
import { queryKeys } from '../../query/queryKeys.ts'
import type { CreateContributionRequest } from '../../types/api.ts'

interface ContributionMutationScope {
  readonly participantId: number
  readonly planId: number
}

export function useCreateContributionMutation({
  participantId,
  planId,
}: ContributionMutationScope) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: [...queryKeys.contributions.all, 'create', planId],
    mutationFn: (request: CreateContributionRequest) => {
      if (request.planId !== planId) {
        throw new RangeError(
          'The contribution request must target the plan in the current route.',
        )
      }

      return createContribution(request)
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.contributions.byPlan(planId),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.plans.detail(planId),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.plans.byParticipant(participantId),
        }),
      ])
    },
  })
}
