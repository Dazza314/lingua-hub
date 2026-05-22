import { CuratedSetId } from '@lingua-hub/vocab'

export type ExerciseScope =
  | { type: 'set'; setId: CuratedSetId.CuratedSetId }
  | { type: 'saved' }

export const saved: ExerciseScope = { type: 'saved' }

export const forSet = (setId: CuratedSetId.CuratedSetId): ExerciseScope => ({
  type: 'set',
  setId,
})
