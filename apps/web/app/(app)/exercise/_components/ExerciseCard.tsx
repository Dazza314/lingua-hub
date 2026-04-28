import { motionTokens, transitions } from '@/lib/animations'
import type { Exercise } from '@lingua-hub/exercise'
import { motion } from 'framer-motion'

type Props = {
  exercise: Partial<Exercise.Exercise>
}

export function ExerciseCard({ exercise }: Props) {
  const setting = exercise.scenarioFrame?.setting ?? ''
  const situation = exercise.scenarioFrame?.situation ?? ''
  const sentence = exercise.sentence ?? ''

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -motionTokens.distance.sm }}
      animate={{ opacity: 1, y: 0 }}
      transition={transitions.slow}
      className="relative bg-card rounded-2xl border p-6"
    >
      <motion.p layout className="text-muted-foreground mb-4 text-sm min-h-5">
        {setting}
        {setting && situation ? ' — ' : ''}
        {situation}
      </motion.p>
      <p className="text-2xl leading-snug font-medium">{sentence}</p>
    </motion.div>
  )
}
