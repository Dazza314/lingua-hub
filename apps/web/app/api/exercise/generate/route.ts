import { getAuthenticatedUserId } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { Language } from '@lingua-hub/core'
import { generateExercise } from '@lingua-hub/exercise'
import { supabaseVocabRepositoryFactories } from '@lingua-hub/vocab'
import { Result } from '@praha/byethrow'
import { NextResponse } from 'next/server'

// TODO: derive targetLanguage from the authenticated user's study profile
const TARGET_LANGUAGE = Language.languageSchema.parse('ja')

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

  // TODO: replace with a real generateObject built from `claudeLlmClientFactories`
  // in the follow-up LLM-wiring slice.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const generateObject = {} as any

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
