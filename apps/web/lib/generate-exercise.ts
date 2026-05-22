import { langfuseSpanProcessor } from '@/instrumentation'
import { env } from '@/lib/env'
import { createClient } from '@/lib/supabase/server'
import { mockGenerateExercise } from '@/mocks/generate-exercise'
import { observe, propagateAttributes } from '@langfuse/tracing'
import { Language, UserId } from '@lingua-hub/core'
import {
  evaluateExercisePolicy,
  type ExerciseScope,
  generateExercise as makeGenerateExerciseCommand,
  resolveExercisePolicy,
  supabaseExercisePolicyRepositoryFactories,
} from '@lingua-hub/exercise'
import { createGoogleLlmClient, GoogleModel } from '@lingua-hub/llm'
import {
  supabaseCuratedContentRepositoryFactories,
  supabaseImportedVocabRepositoryFactories,
} from '@lingua-hub/vocab'
import { Result } from '@praha/byethrow'
import { after } from 'next/server'
import { requireAuthenticatedUserId } from './auth'

// TODO: derive targetLanguage from the authenticated user's study profile
const TARGET_LANGUAGE = Language.languageSchema.parse('ja')

const { generateObject } = createGoogleLlmClient(
  env.GOOGLE_GENERATIVE_AI_API_KEY,
  GoogleModel.Gemini31FlashLite,
)

export async function generateExercise(scope: ExerciseScope.ExerciseScope) {
  if (env.MOCK_LLM) {
    return mockGenerateExercise(scope)
  }

  const userId = await requireAuthenticatedUserId()

  // Flush spans regardless of outcome so error traces are exported too.
  after(() => langfuseSpanProcessor.forceFlush())

  return observe(
    () => propagateAttributes({ userId }, () => generateForUser(scope, userId)),
    { name: 'exercise-generation' },
  )()
}

async function generateForUser(
  scope: ExerciseScope.ExerciseScope,
  userId: UserId.UserId,
) {
  const supabase = await createClient()
  const repo = supabaseCuratedContentRepositoryFactories

  const policyResult = await resolveExercisePolicy({
    findSetById: repo.createFindSetById(supabase),
    findByUserIdAndLanguage:
      supabaseExercisePolicyRepositoryFactories.createFindByUserIdAndLanguage(
        supabase,
      ),
  })({ scope, userId, language: TARGET_LANGUAGE })
  if (Result.isFailure(policyResult)) {
    return policyResult
  }

  const generateExerciseCommand = makeGenerateExerciseCommand({
    generateObject,
    evaluateExercisePolicy: evaluateExercisePolicy({
      findSetWithItemsById: repo.createFindSetWithItemsById(supabase),
      getImportedVocabItems:
        supabaseImportedVocabRepositoryFactories.createGetImportedVocabItems(
          supabase,
        ),
    }),
  })
  return generateExerciseCommand({
    userId,
    targetLanguage: TARGET_LANGUAGE,
    policy: policyResult.value,
  })
}
