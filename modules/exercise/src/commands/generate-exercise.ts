import type { Language, UserId } from '@lingua-hub/core'
import type { LlmClient } from '@lingua-hub/llm'
import type { VocabItem, VocabRepository } from '@lingua-hub/vocab'
import { Result } from '@praha/byethrow'
import { EmptyVocabError, UnexpectedExerciseError } from '../errors'
import { type Exercise, exerciseSchema } from '../models/exercise'

const DEFAULT_VOCAB_COUNT = 5
const MAX_OUTPUT_TOKENS = 1024

// Schema for what the LLM generates — excludes `language`, which is known from input
const exerciseLlmSchema = exerciseSchema.omit({ language: true })

function buildSystemPrompt(targetLanguage: Language.Language): string {
  return `You are a language exercise generator. The learner is studying ${targetLanguage}. Given a list of vocabulary in ${targetLanguage}, produce a short, natural sentence in ${targetLanguage}, situated in a specific scenario (setting + situation). The learner will translate your sentence into English as practice. Prefer sentences that naturally incorporate several of the provided vocab items and that a learner at this vocabulary level can plausibly decode.`
}

export type GenerateExerciseDeps = {
  generateObject: LlmClient['generateObject']
  getVocabItems: VocabRepository['getVocabItems']
}

export type GenerateExerciseInput = {
  userId: UserId.UserId
  targetLanguage: Language.Language
  count?: number
}

export function generateExercise({
  getVocabItems,
  generateObject,
}: GenerateExerciseDeps) {
  return ({
    userId,
    targetLanguage,
    count = DEFAULT_VOCAB_COUNT,
  }: GenerateExerciseInput): Result.ResultAsync<
    Exercise,
    UnexpectedExerciseError | EmptyVocabError
  > =>
    Result.pipe(
      getVocabItems({ userId, language: targetLanguage }),
      Result.andThen((allItems) => {
        if (allItems.length === 0) {
          return Result.fail(new EmptyVocabError('No vocabulary items found'))
        }
        const sampled = sampleRandom(allItems, count)
        return generateObject({
          schema: exerciseLlmSchema,
          system: buildSystemPrompt(targetLanguage),
          messages: [{ role: 'user', content: buildUserPrompt(sampled) }],
          maxTokens: MAX_OUTPUT_TOKENS,
        })
      }),
      Result.andThen((draft) => Result.succeed({ ...draft, language: targetLanguage })),
      Result.mapError((err) =>
        err instanceof EmptyVocabError
          ? err
          : new UnexpectedExerciseError('Failed to generate exercise', { cause: err }),
      ),
    )
}

function buildUserPrompt(vocabItems: VocabItem[]): string {
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
