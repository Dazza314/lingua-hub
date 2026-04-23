import type { Exercise } from '@lingua-hub/exercise'

type Props = {
  exercise: Exercise.Exercise
}

export function ExerciseCard({ exercise }: Props) {
  const { sentence, scenarioFrame } = exercise
  return (
    <div className="bg-card rounded-2xl border p-6">
      <p className="text-muted-foreground mb-4 text-sm">
        {scenarioFrame.setting} — {scenarioFrame.situation}
      </p>
      <p className="text-2xl leading-snug font-medium">{sentence}</p>
    </div>
  )
}
