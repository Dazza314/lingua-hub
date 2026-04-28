import type { Language, UserId } from '@lingua-hub/core'
import type { DeepPartial, LlmClient, LlmStreamError } from '@lingua-hub/llm'
import type { VocabItem, VocabRepository } from '@lingua-hub/vocab'
import { Result } from '@praha/byethrow'
import z from 'zod'
import { EmptyVocabError } from '../errors'
import * as Exercise from '../models/exercise'

const DEFAULT_VOCAB_COUNT = 5
const MAX_OUTPUT_TOKENS = 1024

// Schema for what the LLM generates — excludes `language`, which is injected from input
const exerciseLlmSchema = Exercise.exerciseSchema.omit({ language: true })

function buildSystemPrompt(targetLanguage: Language.Language): string {
  return `You are a language exercise generator. The learner is studying ${targetLanguage}. Given a list of vocabulary in ${targetLanguage}, produce a short, natural sentence in ${targetLanguage}, situated in a specific scenario (setting + situation). The scenario should be in English. The scenario should only provide additional context, not describe the sentence itself. The learner will translate your sentence into English as practice. Prefer sentences that naturally incorporate several of the provided vocab items. It does not need to include all of them - prioritise sounding natural.`
}

export type GenerateExerciseDeps = {
  streamObject: LlmClient['streamObject']
  getVocabItems: VocabRepository['getVocabItems']
}

export type GenerateExerciseInput = {
  userId: UserId.UserId
  targetLanguage: Language.Language
  count?: number
}

type GenerateExerciseResult = Result.ResultAsync<
  AsyncIterable<Result.Result<DeepPartial<Exercise.Exercise>, LlmStreamError>>,
  EmptyVocabError
>

export function generateExercise({
  getVocabItems,
  streamObject,
}: GenerateExerciseDeps) {
  return async ({
    userId,
    targetLanguage,
    count = DEFAULT_VOCAB_COUNT,
  }: GenerateExerciseInput): GenerateExerciseResult => {
    const allItems = await getVocabItems({ userId, language: targetLanguage })

    if (allItems.length === 0) {
      return Result.fail(new EmptyVocabError('No vocabulary items found'))
    }

    const sampled = sampleRandom(allItems, count)
    const stream = await streamObject({
      schema: exerciseLlmSchema,
      system: buildSystemPrompt(targetLanguage),
      messages: [{ role: 'user', content: buildUserPrompt(sampled) }],
      maxTokens: MAX_OUTPUT_TOKENS,
    })

    return Result.succeed(withLanguage(stream, targetLanguage))
  }
}

async function* withLanguage(
  stream: AsyncIterable<
    Result.Result<
      DeepPartial<z.infer<typeof exerciseLlmSchema>>,
      LlmStreamError
    >
  >,
  language: Language.Language,
): AsyncIterable<
  Result.Result<DeepPartial<Exercise.Exercise>, LlmStreamError>
> {
  for await (const chunk of stream) {
    if (Result.isSuccess(chunk)) {
      yield Result.succeed({ ...chunk.value, language })
    } else {
      yield chunk
    }
  }
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
