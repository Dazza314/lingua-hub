import type { Language, UserId } from '@lingua-hub/core'
import type { DeepPartial, LlmClient, LlmStreamError } from '@lingua-hub/llm'
import type { CuratedGrammarPoint } from '@lingua-hub/vocab'
import { CuratedSetNotFoundError } from '@lingua-hub/vocab'
import { Result } from '@praha/byethrow'
import z from 'zod'
import { EmptyVocabError } from '../errors'
import * as Exercise from '../models/exercise'
import * as ExercisePolicy from '../models/exercise-policy'
import type { evaluateExercisePolicy } from './evaluate-exercise-policy'

const DEFAULT_VOCAB_COUNT = 10
const DEFAULT_GRAMMAR_COUNT = 3
const MAX_OUTPUT_TOKENS = 1024

const exerciseLlmSchema = Exercise.exerciseSchema.omit({ language: true })

function buildSystemPrompt(targetLanguage: Language.Language): string {
  return `You are a language exercise generator. The learner is studying ${targetLanguage}. Given a list of vocabulary and grammar points in ${targetLanguage}, produce a natural sentence in ${targetLanguage} using a subset of the vocabulary provided, incorporating the grammar points where appropriate. Also provide a "scenario" in English. This is to provide additional required context, not describe the sentence itself (avoid using words which are present in the sentence as these will inadvertently help the learner). The learner will translate your sentence into English as practice. Try to avoid using complex vocabulary not included in the list.`
}

export type GenerateExerciseDeps = {
  evaluateExercisePolicy: ReturnType<typeof evaluateExercisePolicy>
  streamObject: LlmClient['streamObject']
}

export type GenerateExerciseInput = {
  userId: UserId.UserId
  targetLanguage: Language.Language
  policy: ExercisePolicy.ExercisePolicy
  vocabItemCount?: number
  grammarPointCount?: number
}

type GenerateExerciseResult = Result.ResultAsync<
  AsyncIterable<Result.Result<DeepPartial<Exercise.Exercise>, LlmStreamError>>,
  EmptyVocabError | CuratedSetNotFoundError
>

export function generateExercise({
  evaluateExercisePolicy,
  streamObject,
}: GenerateExerciseDeps) {
  return async ({
    userId,
    targetLanguage,
    policy,
    vocabItemCount = DEFAULT_VOCAB_COUNT,
    grammarPointCount = DEFAULT_GRAMMAR_COUNT,
  }: GenerateExerciseInput): GenerateExerciseResult => {
    const contentResult = await evaluateExercisePolicy({
      policy,
      userId,
      language: targetLanguage,
    })
    if (Result.isFailure(contentResult)) {
      return contentResult
    }

    const { vocabTerms, grammarPoints } = contentResult.value

    if (vocabTerms.length === 0) {
      return Result.fail(new EmptyVocabError('No vocabulary items found'))
    }

    const sampledVocab = sampleRandom(vocabTerms, vocabItemCount)
    const sampledGrammar = sampleRandom(grammarPoints, grammarPointCount)
    const stream = await streamObject({
      schema: exerciseLlmSchema,
      system: buildSystemPrompt(targetLanguage),
      messages: [
        {
          role: 'user',
          content: buildUserPrompt(sampledVocab, sampledGrammar),
        },
      ],
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

function buildUserPrompt(
  vocabTerms: string[],
  grammarPoints: CuratedGrammarPoint.CuratedGrammarPoint[],
): string {
  const vocabList = vocabTerms.map((term) => `- ${term}`).join('\n')
  const grammarSection =
    grammarPoints.length > 0
      ? `\n\nGrammar points to consider:\n${grammarPoints.map((g) => `- ${g.title}: ${g.explanation}`).join('\n')}`
      : ''
  return `Vocabulary the learner knows:\n${vocabList}${grammarSection}\n\nGenerate one exercise.`
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
