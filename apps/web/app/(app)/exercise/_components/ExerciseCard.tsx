import type { Exercise } from '@lingua-hub/exercise'
import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

type Props = {
  exercise: Partial<Exercise.Exercise>
  status: Status
}

type Status = 'loading' | 'streaming' | 'complete'

export function ExerciseCard({ exercise, status }: Props) {
  const contextTag = exercise.contextTag ?? ''
  const sentence = exercise.sentence ?? ''

  const innerRef = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState<number | 'auto'>('auto')

  useEffect(() => {
    if (!innerRef.current) {
      return
    }
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setHeight(
          entry.borderBoxSize[0]?.blockSize ?? entry.contentRect.height + 48,
        )
      }
    })
    observer.observe(innerRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <motion.div
      className="relative bg-card rounded-2xl border overflow-hidden transition-[height] duration-150 ease-out"
      style={{ height }}
    >
      <div ref={innerRef} className="p-6">
        <div className="text-muted-foreground mb-4 text-sm min-h-5">
          {contextTag}
          {(status === 'loading' || status === 'streaming') && !sentence ? (
            <span className="ml-0.5 w-0.5 h-3.5 bg-muted-foreground animate-blink inline-block align-[center]" />
          ) : null}
        </div>
        <div className="text-2xl leading-snug font-medium">
          {sentence}
          {(status === 'loading' || status === 'streaming') && !!sentence ? (
            <span className="ml-0.5 w-0.5 h-6 bg-black animate-blink inline-block align-[center]" />
          ) : null}
        </div>
      </div>
    </motion.div>
  )
}
