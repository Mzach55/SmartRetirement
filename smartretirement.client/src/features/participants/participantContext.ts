import { useOutletContext } from 'react-router'
import type { Participant } from '../../types/api.ts'

export interface ParticipantOutletContext {
  readonly participant: Participant
}

/** Read the participant already verified by ParticipantLayout. */
export function useCurrentParticipant(): Participant {
  return useOutletContext<ParticipantOutletContext>().participant
}
