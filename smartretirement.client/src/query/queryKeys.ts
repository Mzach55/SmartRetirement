const participantRoot = ['participants'] as const
const planRoot = ['plans'] as const
const contributionRoot = ['contributions'] as const

export const queryKeys = {
  participants: {
    all: participantRoot,
    list: () => [...participantRoot, 'list'] as const,
    detail: (participantId: number) =>
      [...participantRoot, 'detail', participantId] as const,
  },
  plans: {
    all: planRoot,
    byParticipant: (participantId: number) =>
      [...planRoot, 'participant', participantId] as const,
    detail: (planId: number) => [...planRoot, 'detail', planId] as const,
  },
  contributions: {
    all: contributionRoot,
    byPlan: (planId: number) =>
      [...contributionRoot, 'plan', planId] as const,
  },
} as const
