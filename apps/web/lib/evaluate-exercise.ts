import { env } from '@/lib/env'
import {
  evaluateExercise as evaluateExerciseCommand,
  Exercise,
} from '@lingua-hub/exercise'
import { createGoogleLlmClient, GoogleModel } from '@lingua-hub/llm'

const { streamObject } = createGoogleLlmClient(
  env.GOOGLE_GENERATIVE_AI_API_KEY,
  GoogleModel.Gemma4_31B,
)

export function evaluateExercise(
  exercise: Exercise.Exercise,
  userTranslation: string,
) {
  return evaluateExerciseCommand({ streamObject })({
    exercise,
    userTranslation,
  })
}
