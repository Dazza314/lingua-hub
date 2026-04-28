import { motionTokens, transitions } from '@/lib/animations'
import type { Exercise } from '@lingua-hub/exercise'
import { motion } from 'framer-motion'

type Props = {
  exercise: Exercise.Exercise
  isLoading?: boolean
}

export function ExerciseCard({ exercise, isLoading }: Props) {
  const { sentence, scenarioFrame } = exercise
  return (
    <motion.div
      initial={{ opacity: 0, y: -motionTokens.distance.sm }}
      animate={{ opacity: 1, y: 0 }}
      transition={transitions.ease}
      className="relative bg-card rounded-2xl border p-6"
    >
      <div className={isLoading ? 'opacity-50 pointer-events-none' : ''}>
        <p className="text-muted-foreground mb-4 text-sm">
          {scenarioFrame.setting} — {scenarioFrame.situation}
        </p>
        <p className="text-2xl leading-snug font-medium">{sentence}</p>
      </div>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={transitions.ease}
          className="absolute inset-0 flex items-center justify-center rounded-2xl bg-card/50 backdrop-blur-sm"
        >
          <p className="text-muted-foreground text-sm">Loading…</p>
        </motion.div>
      )}
    </motion.div>
  )
}
