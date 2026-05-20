import { env } from '@/lib/env'
import type { ExerciseScope } from '@/lib/exercise-scope'
import { createClient } from '@/lib/supabase/server'
import { Language, UserId } from '@lingua-hub/core'
import {
  evaluateExercisePolicy,
  ExercisePolicy,
  generateExercise as generateExerciseCommand,
  getExercisePolicy,
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
import { requireAuthenticatedUserId } from './auth'

// TODO: derive targetLanguage from the authenticated user's study profile
const TARGET_LANGUAGE = Language.languageSchema.parse('ja')

type SupabaseClient = Awaited<ReturnType<typeof createClient>>

const { streamObject } = createGoogleLlmClient(
  env.GOOGLE_GENERATIVE_AI_API_KEY,
  GoogleModel.Gemma4_31B,
)

export async function generateExercise(scope?: ExerciseScope) {
  const userId = await requireAuthenticatedUserId()

  const supabase = await createClient()

  const policyResult = await resolveExercisePolicy(supabase, userId, scope)
  if (Result.isFailure(policyResult)) {
    return policyResult
  }

  const repo = supabaseCuratedContentRepositoryFactories
  return generateExerciseCommand({
    streamObject,
    evaluateExercisePolicy: evaluateExercisePolicy({
      findSetWithItemsById: repo.createFindSetWithItemsById(supabase),
      getImportedVocabItems:
        supabaseImportedVocabRepositoryFactories.createGetImportedVocabItems(
          supabase,
        ),
    }),
  })({
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
