import { Language } from '@lingua-hub/core'
import { EmptyVocabError, Exercise } from '@lingua-hub/exercise'
import { LlmStreamError } from '@lingua-hub/llm'
import { Result } from '@praha/byethrow'
import { setTimeout as sleep } from 'timers/promises'

const LANGUAGE = Language.languageSchema.parse('ja')
const SCENARIO = 'A café in Tokyo. Ordering breakfast'
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
  let scenario = ''
  for (const word of SCENARIO.split(' ')) {
    await sleep(WORD_DELAY_MS)
    scenario += (scenario ? ' ' : '') + word
    yield Result.succeed({
      language: LANGUAGE,
      scenario: scenario,
    })
  }

  let sentence = ''
  for (const ch of SENTENCE) {
    await sleep(WORD_DELAY_MS)
    sentence += ch
    yield Result.succeed({
      language: LANGUAGE,
      scenario: SCENARIO,
      sentence,
    })
  }
}
