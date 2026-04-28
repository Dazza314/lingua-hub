import { Evaluation, Exercise } from '@lingua-hub/exercise'
import { Result } from '@praha/byethrow'
import { setTimeout } from 'timers/promises'

const FEEDBACK = 'Good attempt, but the word order is off.'
const SUGGESTED = 'Je mange une pomme.'
const WORD_DELAY_MS = 60

export async function* mockEvaluateExercise(
  _exercise: Exercise.Exercise,
  _userTranslation: string,
): AsyncGenerator<Result.Result<Partial<Evaluation.Evaluation>, Error>> {
  yield Result.succeed({ isCorrect: false })

  let feedback = ''
  for (const word of FEEDBACK.split(' ')) {
    await setTimeout(WORD_DELAY_MS)
    feedback += (feedback ? ' ' : '') + word
    yield Result.succeed({ isCorrect: false, feedback })
  }

  let suggestedTranslation = ''
  for (const word of SUGGESTED.split(' ')) {
    await setTimeout(WORD_DELAY_MS)
    suggestedTranslation += (suggestedTranslation ? ' ' : '') + word
    yield Result.succeed({
      isCorrect: false,
      feedback: FEEDBACK,
      suggestedTranslation,
    })
  }
}
