import type { Language, UserId } from '@lingua-hub/core'
import type { LlmClient } from '@lingua-hub/llm'
import type { CuratedGrammarPoint } from '@lingua-hub/vocab'
import { Result } from '@praha/byethrow'
import z from 'zod'
import { EmptyVocabError, ExerciseGenerationError } from '../errors'
import * as Exercise from '../models/exercise'
import * as ExercisePolicy from '../models/exercise-policy'
import type { evaluateExercisePolicy } from './evaluate-exercise-policy'

const DEFAULT_VOCAB_COUNT = 20
const DEFAULT_GRAMMAR_COUNT = 3
const DEFAULT_CANDIDATE_COUNT = 3
const MAX_TOKENS_GENERATE = 2048
const MAX_TOKENS_JUDGE = 512

const exerciseLlmSchema = Exercise.exerciseSchema.omit({ language: true })

const candidatesSchema = z.object({
  candidates: z.array(exerciseLlmSchema),
})

const judgeSchema = z.object({
  chosenIndex: z.number().int().min(0),
})

function buildGeneratorSystemPrompt(targetLanguage: Language.Language): string {
  return `You are a language exercise generator. The learner is studying ${targetLanguage}. Given a list of vocabulary and grammar points in ${targetLanguage}, produce:

1. A SENTENCE in ${targetLanguage} that:
   - Sounds natural and idiomatic — the kind of thing a native speaker would actually say in context, not a textbook construction
   - Uses a subset of the provided vocabulary
   - Incorporates as many of the grammar points as can be done naturally — prioritize naturalness over coverage
   - Avoids complex vocabulary not in the list where possible
   - May freely use common function words (articles, prepositions, pronouns, basic conjunctions) even if not listed, as needed for naturalness

2. A CONTEXT TAG in English that:
   - Identifies who is speaking, and optionally who they're speaking to and/or the setting
   - Is written as a brief structural tag, not a narrative description
   - Provides only enough information to disambiguate the sentence (e.g., register, relationship, speaker identity) — never previews the sentence's content
   - Slots are flexible: include whichever of speaker / listener / setting are needed; omit the rest
   - Must not name roles or settings whose typical context overlaps with the sentence's content. If the sentence mentions a workplace hierarchy, don't identify the speaker as "a subordinate" or "an employee." If the sentence is about school, don't identify the speaker as "a student." If the sentence mentions driving, don't identify the listener as "a driver." Use a more generic role ("someone," "a friend") or omit the slot.

Format the tag like: [speaker, to listener, in setting] — with any slot optional.

Examples (sentences shown in English for illustration; your actual sentence will be in ${targetLanguage}):

  Tag: [a parent, to a young child at bedtime]
  Sentence: "We can read one more, then it's time to sleep."

  Tag: [two coworkers, chatting after work]
  Sentence: "I can't believe she said that in front of everyone."

  Tag: [a technician, to a customer]
  Sentence: "Please don't touch this part."

  Tag: [someone, on the phone]
  Sentence: "I'll be there in about twenty minutes."

The tag should feel like a stage direction before a line of dialogue — it sets the scene but does not summarize the line. The learner will translate the sentence into English as practice.
`
}

function buildJudgeSystemPrompt(targetLanguage: Language.Language): string {
  return `You are evaluating candidate language exercise sentences in ${targetLanguage}. Given a list of candidates, each with a context tag and sentence, choose the best one based on:

1. Grammatical correctness
2. Idiomatic naturalness — sounds like something a native speaker would actually say, not a textbook construction
3. Register consistency — the sentence's formality matches the context tag
4. Tag quality — disambiguates the sentence without previewing its content

Return the 0-based index of the best candidate.`
}

function buildJudgeUserPrompt(
  candidates: z.infer<typeof candidatesSchema>['candidates'],
): string {
  const formatted = candidates
    .map(
      (candidate, index) =>
        `${index}. Tag: ${candidate.contextTag}\n   Sentence: "${candidate.sentence}"`,
    )
    .join('\n\n')
  return `Candidates:\n\n${formatted}\n\nChoose the best candidate.`
}

export type GenerateExerciseDeps = {
  evaluateExercisePolicy: ReturnType<typeof evaluateExercisePolicy>
  generateObject: LlmClient['generateObject']
}

export type GenerateExerciseInput = {
  userId: UserId.UserId
  targetLanguage: Language.Language
  policy: ExercisePolicy.ExercisePolicy
  vocabItemCount?: number
  grammarPointCount?: number
  candidateCount?: number
}

type GenerateExerciseResult = Result.ResultAsync<
  Exercise.Exercise,
  EmptyVocabError | ExerciseGenerationError
>

export function generateExercise({
  evaluateExercisePolicy,
  generateObject,
}: GenerateExerciseDeps) {
  return async ({
    userId,
    targetLanguage,
    policy,
    vocabItemCount = DEFAULT_VOCAB_COUNT,
    grammarPointCount = DEFAULT_GRAMMAR_COUNT,
    candidateCount = DEFAULT_CANDIDATE_COUNT,
  }: GenerateExerciseInput): GenerateExerciseResult => {
    const { vocabTerms, grammarPoints } = await evaluateExercisePolicy({
      policy,
      userId,
      language: targetLanguage,
    })

    if (vocabTerms.length === 0) {
      return Result.fail(new EmptyVocabError('No vocabulary items found'))
    }

    const sampledVocab = sampleRandom(vocabTerms, vocabItemCount)
    const sampledGrammar = sampleRandom(grammarPoints, grammarPointCount)

    const { candidates } = await generateObject({
      schema: candidatesSchema,
      system: buildGeneratorSystemPrompt(targetLanguage),
      messages: [
        {
          role: 'user',
          content: buildGeneratorUserPrompt(
            sampledVocab,
            sampledGrammar,
            candidateCount,
          ),
        },
      ],
      maxTokens: MAX_TOKENS_GENERATE,
      thinkingBudget: 0,
    })

    const { chosenIndex } = await generateObject({
      schema: judgeSchema,
      system: buildJudgeSystemPrompt(targetLanguage),
      messages: [
        {
          role: 'user',
          content: buildJudgeUserPrompt(candidates),
        },
      ],
      maxTokens: MAX_TOKENS_JUDGE,
      thinkingBudget: 0,
    })

    const chosen = candidates[chosenIndex] ?? candidates[0]
    if (!chosen) {
      return Result.fail(new ExerciseGenerationError('No available candidates'))
    }
    return Result.succeed({ ...chosen, language: targetLanguage })
  }
}

function buildGeneratorUserPrompt(
  vocabTerms: string[],
  grammarPoints: CuratedGrammarPoint.CuratedGrammarPoint[],
  candidateCount: number,
): string {
  const vocabList = vocabTerms.map((term) => `- ${term}`).join('\n')
  const grammarSection =
    grammarPoints.length > 0
      ? `\n\nGrammar points to consider:\n${grammarPoints.map((g) => `- ${g.title}: ${g.explanation}`).join('\n')}`
      : ''
  return `Vocabulary the learner knows:\n${vocabList}${grammarSection}\n\nGenerate ${candidateCount} candidate exercises. Vary the vocabulary subset, grammar usage, and context for each — they should represent meaningfully different sentences, not minor paraphrases of each other.`
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
