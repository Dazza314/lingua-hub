import type { Evaluation } from '@lingua-hub/exercise'

type Props = {
  evaluation: Partial<Evaluation.Evaluation>
  status: 'streaming' | 'complete'
}

export function EvaluationCard({ evaluation, status }: Props) {
  return (
    <div className="bg-card flex flex-col gap-3 rounded-2xl border p-6">
      {evaluation.isCorrect !== undefined && (
        <p
          className={
            evaluation.isCorrect
              ? 'font-medium text-green-600'
              : 'font-medium text-red-600'
          }
        >
          {evaluation.isCorrect ? 'Correct' : 'Not quite'}
        </p>
      )}
      {evaluation.feedback && (
        <p className="text-sm">
          {evaluation.feedback}
          {status === 'streaming' && !evaluation.suggestedTranslation && (
            <span className="ml-0.5 w-0.5 h-3.5 bg-foreground animate-blink inline-block align-[center]" />
          )}
        </p>
      )}
      {evaluation.suggestedTranslation && (
        <div className="flex flex-col gap-1">
          <p className="text-muted-foreground text-xs">Suggested translation</p>
          <p className="text-sm">
            {evaluation.suggestedTranslation}
            {status === 'streaming' && (
              <span className="ml-0.5 w-0.5 h-3.5 bg-foreground animate-blink inline-block align-[center]" />
            )}
          </p>
        </div>
      )}
    </div>
  )
}
