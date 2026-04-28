import { Language } from '@lingua-hub/core'
import { EmptyVocabError, Exercise } from '@lingua-hub/exercise'
import { Result } from '@praha/byethrow'
import { setTimeout as sleep } from 'timers/promises'

export async function mockGenerateExercise(): Result.ResultAsync<
  Exercise.Exercise,
  EmptyVocabError
> {
  await sleep(800)
  return Result.succeed({
    language: Language.languageSchema.parse('ja'),
    scenarioFrame: {
      setting: 'A café in Tokyo',
      situation: 'Ordering breakfast',
    },
    sentence: '私はりんごを食べます。',
  })
}
