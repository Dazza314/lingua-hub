import { Language } from '@lingua-hub/core'
import { EmptyVocabError, Exercise } from '@lingua-hub/exercise'
import { LlmStreamError } from '@lingua-hub/llm'
import { Result } from '@praha/byethrow'
import { setTimeout as sleep } from 'timers/promises'

const LANGUAGE = Language.languageSchema.parse('ja')
const SETTING = 'A café in Tokyo'
const SITUATION = 'Ordering breakfast'
const SENTENCE = '私はりんごを食べます。'
const WORD_DELAY_MS = 60

export async function mockGenerateExercise(): Promise<
  Result.Result<
    AsyncIterable<Result.Result<Partial<Exercise.Exercise>, LlmStreamError>>,
    EmptyVocabError
  >
> {
  return Result.succeed(stream())
}

async function* stream(): AsyncIterable<
  Result.Result<Partial<Exercise.Exercise>, LlmStreamError>
> {
  let setting = ''
  for (const word of SETTING.split(' ')) {
    await sleep(WORD_DELAY_MS)
    setting += (setting ? ' ' : '') + word
    yield Result.succeed({
      language: LANGUAGE,
      scenarioFrame: { setting, situation: '' },
    })
  }

  let situation = ''
  for (const word of SITUATION.split(' ')) {
    await sleep(WORD_DELAY_MS)
    situation += (situation ? ' ' : '') + word
    yield Result.succeed({
      language: LANGUAGE,
      scenarioFrame: { setting: SETTING, situation },
    })
  }

  let sentence = ''
  for (const ch of SENTENCE) {
    await sleep(WORD_DELAY_MS)
    sentence += ch
    yield Result.succeed({
      language: LANGUAGE,
      scenarioFrame: { setting: SETTING, situation: SITUATION },
      sentence,
    })
  }
}
