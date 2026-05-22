import { ExerciseScope } from '@lingua-hub/exercise'
import { CuratedSetId } from '@lingua-hub/vocab'
import { Result } from '@praha/byethrow'

export function parseExerciseScope(
  raw: string | undefined | null,
): ExerciseScope.ExerciseScope {
  if (!raw) {
    return ExerciseScope.saved
  }
  const [type, value] = raw.split(':')
  if (type !== 'set' || !value) {
    return ExerciseScope.saved
  }
  const parsed = CuratedSetId.parse(value)
  if (Result.isFailure(parsed)) {
    return ExerciseScope.saved
  }
  return ExerciseScope.forSet(parsed.value)
}
