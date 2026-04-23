'use server'

import { generateExercise } from '@/lib/generate-exercise'
import { SerialisedResultAsync, serialiseResult } from '@/lib/serialise-result'
import {
  EmptyVocabError,
  Exercise,
  UnexpectedExerciseError,
} from '@lingua-hub/exercise'

export type GenerateExerciseResult = SerialisedResultAsync<
  Exercise.Exercise,
  EmptyVocabError | UnexpectedExerciseError
>

export async function generateExerciseAction(): GenerateExerciseResult {
  return serialiseResult(generateExercise())
}
