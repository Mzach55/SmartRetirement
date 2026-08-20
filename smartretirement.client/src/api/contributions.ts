import {
  parseContribution,
  parseContributions,
} from './contractParsers.ts'
import { requestJson } from './httpClient.ts'
import type { ApiCallOptions } from './httpClient.ts'
import { requirePositiveId } from './ids.ts'
import type {
  Contribution,
  CreateContributionRequest,
} from '../types/api.ts'

export function getContributionsByPlanId(
  planId: number,
  options?: ApiCallOptions,
): Promise<readonly Contribution[]> {
  const id = requirePositiveId(planId, 'Plan ID')

  return requestJson(`/api/plans/${id}/contributions`, parseContributions, options)
}

export function createContribution(
  request: CreateContributionRequest,
  options?: ApiCallOptions,
): Promise<Contribution> {
  return requestJson('/api/contributions', parseContribution, {
    ...options,
    body: request,
    method: 'POST',
  })
}
