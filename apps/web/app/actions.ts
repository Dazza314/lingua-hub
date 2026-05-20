'use server'

import { requireAuthenticatedUserId } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { Language } from '@lingua-hub/core'
import {
  ExercisePolicy,
  saveExercisePolicy as saveExercisePolicyCommand,
  supabaseExercisePolicyRepositoryFactories,
} from '@lingua-hub/exercise'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

const TARGET_LANGUAGE = Language.languageSchema.parse('ja')

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
  await saveExercisePolicyCommand({
    upsert: supabaseExercisePolicyRepositoryFactories.createUpsert(supabase),
  })({
    userId,
    language: TARGET_LANGUAGE,
    policy,
  })

  revalidatePath('/exercise')
}
