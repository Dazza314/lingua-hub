'use client'

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Book01Icon, LanguageSquareIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

type Props = {
  type: 'vocab' | 'grammar'
}

const config = {
  vocab: { icon: Book01Icon, label: 'In vocab practice' },
  grammar: { icon: LanguageSquareIcon, label: 'In grammar practice' },
} as const

export function PracticeTypeIndicator({ type }: Props) {
  const { icon, label } = config[type]
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger className="text-primary">
          <HugeiconsIcon icon={icon} size={13} strokeWidth={1.5} />
        </TooltipTrigger>
        <TooltipContent>{label}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
