import { Language } from '@lingua-hub/core'
import { EmptyVocabError, Exercise } from '@lingua-hub/exercise'
import { LlmStreamError } from '@lingua-hub/llm'
import { Result } from '@praha/byethrow'
import { setTimeout as sleep } from 'timers/promises'

const LANGUAGE = Language.languageSchema.parse('ja')
const CONTEXT_TAG = '[someone, in a café]'
const SENTENCE = '私はりんごを食べます。'
const INITIAL_DELAY_MS = 700
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
  await sleep(INITIAL_DELAY_MS)
  let contextTag = ''
  for (const word of CONTEXT_TAG.split(' ')) {
    await sleep(WORD_DELAY_MS)
    contextTag += (contextTag ? ' ' : '') + word
    yield Result.succeed({
      language: LANGUAGE,
      contextTag,
    })
  }

  let sentence = ''
  for (const ch of SENTENCE) {
    await sleep(WORD_DELAY_MS)
    sentence += ch
    yield Result.succeed({
      language: LANGUAGE,
      contextTag: CONTEXT_TAG,
      sentence,
    })
  }
}
