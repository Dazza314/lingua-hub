import { env } from '@/lib/env'
import { getAuthenticatedUserId } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { Language } from '@lingua-hub/core'
import { generateExercise } from '@lingua-hub/exercise'
import { createGoogleLlmClient, GoogleModel } from '@lingua-hub/llm'
import { supabaseVocabRepositoryFactories } from '@lingua-hub/vocab'
import { Result } from '@praha/byethrow'
import { NextResponse } from 'next/server'

// TODO: derive targetLanguage from the authenticated user's study profile
const TARGET_LANGUAGE = Language.languageSchema.parse('ja')

const { generateObject } = createGoogleLlmClient(env.GOOGLE_GENERATIVE_AI_API_KEY, GoogleModel.Gemini20Flash)

export async function POST() {
  const authResult = await getAuthenticatedUserId()
  if (Result.isFailure(authResult)) {
    return NextResponse.json(
      { error: authResult.error.message },
      { status: 401 },
    )
  }
  const userId = authResult.value

  const supabase = await createClient()

  const result = await generateExercise({
    generateObject,
    getVocabItems:
      supabaseVocabRepositoryFactories.createGetVocabItems(supabase),
  })({
    userId,
    targetLanguage: TARGET_LANGUAGE,
  })

  if (Result.isFailure(result)) {
    return NextResponse.json({ error: result.error.message }, { status: 500 })
  }
  return NextResponse.json(result.value)
}
