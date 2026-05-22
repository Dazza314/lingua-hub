import type { ExerciseScope } from '@/lib/exercise-scope'
import { Language } from '@lingua-hub/core'
import { EmptyVocabError, Exercise } from '@lingua-hub/exercise'
import { Result } from '@praha/byethrow'
import { setTimeout as sleep } from 'timers/promises'

const LANGUAGE = Language.languageSchema.parse('ja')
const MOCK_EXERCISE: Exercise.Exercise = {
  language: LANGUAGE,
  contextTag: '[someone, in a café]',
  sentence: '私はりんごを食べます。',
}
const DELAY_MS = 700

export async function mockGenerateExercise(
  _scope?: ExerciseScope,
): Promise<Result.Result<Exercise.Exercise, EmptyVocabError>> {
  await sleep(DELAY_MS)
  return Result.succeed(MOCK_EXERCISE)
}
