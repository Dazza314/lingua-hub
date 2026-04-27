import type { LlmClient } from '@lingua-hub/llm'
import { evaluationSchema } from '../models/evaluation'
import type { Exercise } from '../models/exercise'

const MAX_OUTPUT_TOKENS = 1024

function buildSystemPrompt(): string {
  return `You are evaluating a learner's translation of a sentence. Assess whether the translation is correct. Correctness should be determined by whether the full meaning is conveyed and how natural the translation sounds. Phrase the response by addressing the learner directly. When isCorrect is true, set suggestedTranslation to null. When isCorrect is false, always provide a suggestedTranslation.`
}

function buildUserPrompt(exercise: Exercise, userTranslation: string): string {
  return `Sentence: ${exercise.sentence}
Scenario: ${exercise.scenarioFrame.setting} — ${exercise.scenarioFrame.situation}
Learner's translation: ${userTranslation}`
}

export type EvaluateExerciseDeps = {
  streamObject: LlmClient['streamObject']
}

export type EvaluateExerciseInput = {
  exercise: Exercise
  userTranslation: string
}

export function evaluateExercise({ streamObject }: EvaluateExerciseDeps) {
  return ({ exercise, userTranslation }: EvaluateExerciseInput) => {
    return streamObject({
      schema: evaluationSchema,
      system: buildSystemPrompt(),
      messages: [
        { role: 'user', content: buildUserPrompt(exercise, userTranslation) },
      ],
      maxTokens: MAX_OUTPUT_TOKENS,
    })
  }
}
