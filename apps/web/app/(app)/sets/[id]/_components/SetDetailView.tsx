'use client'

import { Button } from '@/components/ui/button'
import { motionTokens, transitions } from '@/lib/animations'
import { ArrowLeft01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import type { CuratedSet } from '@lingua-hub/vocab'
import { motion } from 'framer-motion'
import Link from 'next/link'

type Props = {
  set: CuratedSet.CuratedSet
  children?: React.ReactNode
}

export function SetDetailView({ set, children }: Props) {
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
          <p className="text-sm text-muted-foreground">
            {set.vocabCount} vocab · {set.grammarCount} grammar
          </p>
        </div>
        <Button size="sm">Start studying</Button>
      </div>

      {children}
    </div>
  )
}
