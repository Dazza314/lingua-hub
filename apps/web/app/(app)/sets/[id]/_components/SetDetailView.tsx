'use client'

import { buttonVariants } from '@/components/ui/button'
import { motionTokens, transitions } from '@/lib/animations'
import { cn } from '@/lib/utils'
import { ArrowLeft01Icon, PlayIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { ExercisePolicy } from '@lingua-hub/exercise'
import type { CuratedSet } from '@lingua-hub/vocab'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { PracticeTypeIndicator } from '../../_components/PracticeTypeIndicator'

type Props = {
  set: CuratedSet.CuratedSet
  policy: ExercisePolicy.ExercisePolicy
  children?: React.ReactNode
}

export function SetDetailView({ set, policy, children }: Props) {
  const isEmpty = set.vocabCount === 0 && set.grammarCount === 0
  const hasVocab = policy.vocab.setIds.includes(set.id)
  const hasGrammar = policy.grammar.setIds.includes(set.id)
  return (
    <div className="px-4 py-6">
      <motion.div
        initial={{ opacity: 0, y: -motionTokens.distance.sm }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -motionTokens.distance.sm }}
        transition={transitions.springSnappy}
        className="mb-4"
      >
        <Link
          href="/sets"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} size={14} strokeWidth={1.5} />
          Sets
        </Link>
      </motion.div>
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h1 className="mb-1 text-lg font-semibold">{set.title}</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              {set.vocabCount} vocab
              {hasVocab && <PracticeTypeIndicator type="vocab" />}
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              {set.grammarCount} grammar
              {hasGrammar && <PracticeTypeIndicator type="grammar" />}
            </span>
          </div>
        </div>
        <Link
          href={`/exercise?scope=set:${set.id}`}
          className={cn(
            buttonVariants({ size: 'sm' }),
            isEmpty && 'pointer-events-none opacity-50',
          )}
          aria-disabled={isEmpty}
          tabIndex={isEmpty ? -1 : undefined}
        >
          <HugeiconsIcon icon={PlayIcon} size={14} strokeWidth={2} />
          Start studying
        </Link>
      </div>

      {children}
    </div>
  )
}
