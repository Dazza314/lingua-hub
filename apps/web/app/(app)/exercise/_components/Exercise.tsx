import { generateExercise } from '@/lib/generate-exercise'
import { Result } from '@praha/byethrow'
import { ExerciseView } from './ExerciseView'

export async function Exercise() {
  const result = await generateExercise()

  if (Result.isFailure(result)) {
    if (result.error.type === 'EmptyVocabError') {
      return (
        <div className="flex flex-1 items-center justify-center px-6">
          <p className="text-muted-foreground text-center text-sm">
            No vocabulary synced yet. Open AnkiDroid and sync your deck.
          </p>
        </div>
      )
    }
    return (
      <div className="flex flex-1 items-center justify-center px-6">
        <p className="text-muted-foreground text-center text-sm">
          {result.error.message}
        </p>
      </div>
    )
  }

  return <ExerciseView initialExercise={result.value} />
}
