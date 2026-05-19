import { env } from '@/lib/env'
import { createClient } from '@/lib/supabase/server'
import { Language } from '@lingua-hub/core'
import {
  evaluateExercisePolicy,
  generateExercise as generateExerciseCommand,
  getExercisePolicy,
  supabaseExercisePolicyRepositoryFactories,
} from '@lingua-hub/exercise'
import { createGoogleLlmClient, GoogleModel } from '@lingua-hub/llm'
import {
  supabaseCuratedContentRepositoryFactories,
  supabaseImportedVocabRepositoryFactories,
} from '@lingua-hub/vocab'
import { Result } from '@praha/byethrow'
import { getAuthenticatedUserId } from './auth'

// TODO: derive targetLanguage from the authenticated user's study profile
const TARGET_LANGUAGE = Language.languageSchema.parse('ja')

const { streamObject } = createGoogleLlmClient(
  env.GOOGLE_GENERATIVE_AI_API_KEY,
  GoogleModel.Gemma4_31B,
)

export async function generateExercise() {
  const authResult = await getAuthenticatedUserId()
  if (Result.isFailure(authResult)) {
    throw authResult.error
  }

  const supabase = await createClient()
  const userId = authResult.value

  const policy = await getExercisePolicy({
    findByUserIdAndLanguage:
      supabaseExercisePolicyRepositoryFactories.createFindByUserIdAndLanguage(
        supabase,
      ),
  })({ userId, language: TARGET_LANGUAGE })

  return generateExerciseCommand({
    streamObject,
    evaluateExercisePolicy: evaluateExercisePolicy({
      findSetWithItemsById:
        supabaseCuratedContentRepositoryFactories.createFindSetWithItemsById(
          supabase,
        ),
      getImportedVocabItems:
        supabaseImportedVocabRepositoryFactories.createGetImportedVocabItems(
          supabase,
        ),
    }),
  })({
    userId,
    targetLanguage: TARGET_LANGUAGE,
    policy,
  })
}
