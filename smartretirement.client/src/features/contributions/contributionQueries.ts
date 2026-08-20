import { queryOptions, useQueries, useQuery } from '@tanstack/react-query'
import { getContributionsByPlanId } from '../../api/index.ts'
import { queryKeys } from '../../query/queryKeys.ts'
import type { Plan } from '../../types/api.ts'

export function planContributionsQueryOptions(planId: number) {
  return queryOptions({
    queryKey: queryKeys.contributions.byPlan(planId),
    queryFn: ({ signal }) => getContributionsByPlanId(planId, { signal }),
  })
}

export function usePlanContributionsQuery(planId: number | null) {
  return useQuery({
    ...planContributionsQueryOptions(planId ?? 0),
    enabled: planId !== null,
  })
}

/**
 * Load one independently cached contribution history for every supplied plan.
 * useQueries preserves input order, so each result has the same index as its
 * plan without merging the resources into an artificial endpoint.
 */
export function usePlansContributionsQueries(plans: readonly Plan[]) {
  return useQueries({
    queries: plans.map((plan) => planContributionsQueryOptions(plan.id)),
  })
}
