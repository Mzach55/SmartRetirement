import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateParticipant } from '../../api/index.ts'
import { queryKeys } from '../../query/queryKeys.ts'
import type { UpdateParticipantRequest } from '../../types/api.ts'

export function useUpdateParticipantMutation(participantId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: [...queryKeys.participants.all, 'update', participantId],
    mutationFn: (request: UpdateParticipantRequest) =>
      updateParticipant(participantId, request),
    onSuccess: async (participant) => {
      queryClient.setQueryData(
        queryKeys.participants.detail(participant.id),
        participant,
      )

      await queryClient.invalidateQueries({
        queryKey: queryKeys.participants.list(),
      })
    },
  })
}
