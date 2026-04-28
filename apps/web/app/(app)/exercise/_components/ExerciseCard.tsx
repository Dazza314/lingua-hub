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
      initial={{ opacity: 0, y: -motionTokens.distance.sm }}
      animate={{ opacity: 1, y: 0 }}
      transition={transitions.ease}
      className="relative bg-card rounded-2xl border p-6"
    >
      <p className="text-muted-foreground mb-4 text-sm">
        {setting}
        {setting && situation ? ' — ' : ''}
        {situation}
      </p>
      <p className="text-2xl leading-snug font-medium">{sentence}</p>
    </motion.div>
  )
}
