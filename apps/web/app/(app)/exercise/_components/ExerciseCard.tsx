import type { Exercise } from '@lingua-hub/exercise'
import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

type Props = {
  exercise: Exercise.Exercise | null
  status: 'loading' | 'complete'
}

export function ExerciseCard({ exercise, status }: Props) {
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
          {status === 'loading' ? (
            <div className="h-3.5 w-28 bg-muted animate-pulse rounded" />
          ) : (
            exercise?.contextTag
          )}
        </div>
        <div className="text-2xl leading-snug font-medium">
          {status === 'loading' ? (
            <div className="h-7 w-3/5 bg-muted animate-pulse rounded" />
          ) : (
            exercise?.sentence
          )}
        </div>
      </div>
    </motion.div>
  )
}
