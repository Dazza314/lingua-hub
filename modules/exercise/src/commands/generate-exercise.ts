import type { Language, UserId } from '@lingua-hub/core'
import type { DeepPartial, LlmClient, LlmStreamError } from '@lingua-hub/llm'
import type { ImportedVocabItem, VocabRepository } from '@lingua-hub/vocab'
import { Result } from '@praha/byethrow'
import z from 'zod'
import { EmptyVocabError } from '../errors'
import * as Exercise from '../models/exercise'

const DEFAULT_VOCAB_COUNT = 10
const MAX_OUTPUT_TOKENS = 1024

// Schema for what the LLM generates — excludes `language`, which is injected from input
const exerciseLlmSchema = Exercise.exerciseSchema.omit({ language: true })

function buildSystemPrompt(targetLanguage: Language.Language): string {
  return `You are a language exercise generator. The learner is studying ${targetLanguage}. Given a list of vocabulary in ${targetLanguage}, produce a natural sentence in ${targetLanguage} using a subset of the vocabularly provided. Also provide a "scenario" in English. This is to provide additional required context, not describe the sentence itself (avoid using words which are present in the sentence as these will inadvertently help the leaner). The learner will translate your sentence into English as practice. Try to avoid using complex vocabularly not included in the list`
}

export type GenerateExerciseDeps = {
  streamObject: LlmClient['streamObject']
  getImportedVocabItems: VocabRepository['getImportedVocabItems']
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
  getImportedVocabItems,
  streamObject,
}: GenerateExerciseDeps) {
  return async ({
    userId,
    targetLanguage,
    count = DEFAULT_VOCAB_COUNT,
  }: GenerateExerciseInput): GenerateExerciseResult => {
    const allItems = await getImportedVocabItems({
      userId,
      language: targetLanguage,
    })

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

function buildUserPrompt(vocabItems: ImportedVocabItem[]): string {
  const list = vocabItems.map((v) => `- ${v.term}`).join('\n')
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
