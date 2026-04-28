'use server'

import { env } from '@/lib/env'
import { generateExercise } from '@/lib/generate-exercise'
import { mockGenerateExercise } from '@/mocks/generate-exercise'
import { SerialisedResultAsync, serialiseResult } from '@/lib/serialise-result'
import { EmptyVocabError, Exercise } from '@lingua-hub/exercise'

export type GenerateExerciseResult = SerialisedResultAsync<
  Exercise.Exercise,
  EmptyVocabError
>

const fn = env.MOCK_LLM ? mockGenerateExercise : generateExercise

export async function generateExerciseAction(): GenerateExerciseResult {
  return serialiseResult(fn())
}
