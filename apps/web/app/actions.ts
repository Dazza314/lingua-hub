'use server'

import { requireAuthenticatedUserId } from '@/lib/auth'
import { parseExerciseScope } from '@/lib/exercise-scope'
import { generateExercise as generateExerciseImpl } from '@/lib/generate-exercise'
import { createClient } from '@/lib/supabase/server'
import { Language } from '@lingua-hub/core'
import {
  Exercise,
  ExercisePolicy,
  makeSaveExercisePolicy,
  supabaseExercisePolicyRepositoryFactories,
} from '@lingua-hub/exercise'
import { Result } from '@praha/byethrow'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

const TARGET_LANGUAGE = Language.languageSchema.parse('ja')

export async function generateExercise(
  scope?: string,
): Promise<
  Result.Result<Exercise.Exercise, { type: string; message: string }>
> {
  const result = await generateExerciseImpl(parseExerciseScope(scope))
  return Result.pipe(
    result,
    Result.mapError((error) => ({
      type: error.type,
      message: error.message,
    })),
  )
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function saveExercisePolicy(
  policy: ExercisePolicy.ExercisePolicy,
) {
  const userId = await requireAuthenticatedUserId()

  const supabase = await createClient()
  const saveExercisePolicy = makeSaveExercisePolicy({
    upsert: supabaseExercisePolicyRepositoryFactories.createUpsert(supabase),
  })
  await saveExercisePolicy({ userId, language: TARGET_LANGUAGE, policy })

  revalidatePath('/exercise')
}
