import { env } from '@/lib/env'
import { createClient } from '@/lib/supabase/server'
import { Language } from '@lingua-hub/core'
import { generateExercise as generateExerciseCommand } from '@lingua-hub/exercise'
import { createGoogleLlmClient, GoogleModel } from '@lingua-hub/llm'
import { supabaseVocabRepositoryFactories } from '@lingua-hub/vocab'
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

  return generateExerciseCommand({
    streamObject,
    getVocabItems:
      supabaseVocabRepositoryFactories.createGetVocabItems(supabase),
  })({
    userId: authResult.value,
    targetLanguage: TARGET_LANGUAGE,
  })
}
