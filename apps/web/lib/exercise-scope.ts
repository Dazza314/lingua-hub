import { CuratedSetId } from '@lingua-hub/vocab'
import { Result } from '@praha/byethrow'

export type ExerciseScope = {
  type: 'set'
  setId: CuratedSetId.CuratedSetId
}

export function parseExerciseScope(
  raw: string | undefined | null,
): ExerciseScope | null {
  if (!raw) {
    return null
  }
  const [type, value] = raw.split(':')
  if (type !== 'set' || !value) {
    return null
  }
  const parsed = CuratedSetId.parse(value)
  if (Result.isFailure(parsed)) {
    return null
  }
  return { type: 'set', setId: parsed.value }
}
