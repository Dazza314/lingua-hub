import type { UserId } from '@lingua-hub/core'
import type { LlmClient } from '@lingua-hub/llm'
import type { VocabItem, VocabRepository } from '@lingua-hub/vocab'
import { Result } from '@praha/byethrow'
import { UnexpectedExerciseError } from '../errors'
import { type Exercise, exerciseSchema } from '../models/exercise'

// Language-agnostic: the LLM infers the target language from the vocab items
// (their terms are in the target language). A future change will introduce a
// Language model and parameterize this prompt explicitly — see
// docs/exercise-mvp/exercise-module.md "Deferred: language generalization".
const SYSTEM_PROMPT = `You are a language exercise generator. Given a list of vocabulary in the learner's target language, produce a short, natural sentence in their target language, situated in a specific scenario (setting + situation). The learner will translate your sentence into English as practice. Prefer sentences that naturally incorporate several of the provided vocab items and that a learner at this vocabulary level can plausibly decode.`

const DEFAULT_VOCAB_COUNT = 5
const MAX_OUTPUT_TOKENS = 1024

export type GenerateExerciseDeps = {
  llmClient: LlmClient
  vocabRepository: VocabRepository
}

export type GenerateExerciseInput = {
  userId: UserId.UserId
  count?: number
}

export function generateExercise(deps: GenerateExerciseDeps) {
  return ({
    userId,
    count = DEFAULT_VOCAB_COUNT,
  }: GenerateExerciseInput): Result.ResultAsync<
    Exercise,
    UnexpectedExerciseError
  > =>
    Result.pipe(
      deps.vocabRepository.getVocabItems(userId),
      Result.andThen((allItems) => {
        const sampled = sampleRandom(allItems, count)
        return deps.llmClient.generateObject({
          schema: exerciseSchema,
          system: SYSTEM_PROMPT,
          messages: [{ role: 'user', content: buildUserPrompt(sampled) }],
          maxTokens: MAX_OUTPUT_TOKENS,
        })
      }),
      Result.mapError(
        (err) =>
          new UnexpectedExerciseError('Failed to generate exercise', {
            cause: err,
          }),
      ),
    )
}

function buildUserPrompt(vocabItems: VocabItem[]): string {
  if (vocabItems.length === 0) {
    return 'The learner has no vocabulary yet. Produce a very simple beginner-level sentence.'
  }
  const list = vocabItems
    .map(
      (v) =>
        `- ${v.term}${v.reading ? ` (${v.reading})` : ''}: ${v.definition}`,
    )
    .join('\n')
  return `Vocabulary the learner knows:\n${list}\n\nGenerate one exercise.`
}

function sampleRandom<T>(items: T[], n: number): T[] {
  if (items.length <= n) {
    return items
  }
  return items
    .map((item) => ({ item, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .slice(0, n)
    .map(({ item }) => item)
}
