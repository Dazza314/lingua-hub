import type { Evaluation } from '@lingua-hub/exercise'
import { useEffect, useRef, useState } from 'react'

type Props = {
  evaluation: Partial<Evaluation.Evaluation>
  status: 'streaming' | 'complete'
}

export function EvaluationCard({ evaluation, status }: Props) {
  const innerRef = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState<number | 'auto'>('auto')

  useEffect(() => {
    if (!innerRef.current) {
      return
    }
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        console.log(entry.contentRect.height, entry.borderBoxSize[0]?.blockSize)
        setHeight(
          entry.borderBoxSize[0]?.blockSize ?? entry.contentRect.height + 48,
        )
      }
    })
    observer.observe(innerRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      className="bg-card rounded-2xl border overflow-hidden transition-[height] duration-150 ease-out"
      style={{ height }}
    >
      <div ref={innerRef} className="p-6 gap-3 flex flex-col">
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
            <p className="text-muted-foreground text-xs">
              Suggested translation
            </p>
            <p className="text-sm">
              {evaluation.suggestedTranslation}
              {status === 'streaming' && (
                <span className="ml-0.5 w-0.5 h-3.5 bg-foreground animate-blink inline-block align-[center]" />
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
