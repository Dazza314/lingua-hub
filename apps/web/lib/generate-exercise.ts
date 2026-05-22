import { langfuseSpanProcessor } from '@/instrumentation'
import { env } from '@/lib/env'
import type { ExerciseScope } from '@/lib/exercise-scope'
import { createClient } from '@/lib/supabase/server'
import { mockGenerateExercise } from '@/mocks/generate-exercise'
import { observe, propagateAttributes } from '@langfuse/tracing'
import { Language, UserId } from '@lingua-hub/core'
import {
  evaluateExercisePolicy,
  ExercisePolicy,
  getExercisePolicy,
  generateExercise as makeGenerateExerciseCommand,
  supabaseExercisePolicyRepositoryFactories,
} from '@lingua-hub/exercise'
import { createGoogleLlmClient, GoogleModel } from '@lingua-hub/llm'
import {
  CuratedSetNotFoundError,
  getSetById,
  supabaseCuratedContentRepositoryFactories,
  supabaseImportedVocabRepositoryFactories,
} from '@lingua-hub/vocab'
import { Result } from '@praha/byethrow'
import { after } from 'next/server'
import { requireAuthenticatedUserId } from './auth'

// TODO: derive targetLanguage from the authenticated user's study profile
const TARGET_LANGUAGE = Language.languageSchema.parse('ja')

type SupabaseClient = Awaited<ReturnType<typeof createClient>>

const { generateObject } = createGoogleLlmClient(
  env.GOOGLE_GENERATIVE_AI_API_KEY,
  GoogleModel.Gemini25Flash,
)

export async function generateExercise(scope?: ExerciseScope) {
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
  scope: ExerciseScope | undefined,
  userId: UserId.UserId,
) {
  const supabase = await createClient()

  const policyResult = await resolveExercisePolicy(supabase, userId, scope)
  if (Result.isFailure(policyResult)) {
    return policyResult
  }

  const repo = supabaseCuratedContentRepositoryFactories
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

async function resolveExercisePolicy(
  supabase: SupabaseClient,
  userId: UserId.UserId,
  scope: ExerciseScope | undefined,
): Promise<
  Result.Result<ExercisePolicy.ExercisePolicy, CuratedSetNotFoundError>
> {
  if (scope?.type === 'set') {
    const setResult = await getSetById({
      findSetById:
        supabaseCuratedContentRepositoryFactories.createFindSetById(supabase),
    })({ id: scope.setId })
    if (Result.isFailure(setResult)) {
      return setResult
    }
    return Result.succeed(ExercisePolicy.fromSet(setResult.value))
  }
  const policy = await getExercisePolicy({
    findByUserIdAndLanguage:
      supabaseExercisePolicyRepositoryFactories.createFindByUserIdAndLanguage(
        supabase,
      ),
  })({ userId, language: TARGET_LANGUAGE })
  return Result.succeed(policy)
}
