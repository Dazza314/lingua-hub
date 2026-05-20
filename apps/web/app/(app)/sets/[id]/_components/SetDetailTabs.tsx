'use client'

import { cn } from '@/lib/utils'
import { CuratedSetId } from '@lingua-hub/vocab'
import { useState } from 'react'
import { GrammarList } from './GrammarList'
import { VocabList } from './VocabList'

type Tab = 'vocab' | 'grammar'

type Props = {
  setId: CuratedSetId.CuratedSetId
  initialTab: Tab
  pageSize: number
  vocabCount: number
  grammarCount: number
  setUrl: string
}

export function SetDetailTabs({
  setId,
  initialTab,
  pageSize,
  vocabCount,
  grammarCount,
  setUrl,
}: Props) {
  const [tab, setTab] = useState<Tab>(initialTab)

  const switchTo = (next: Tab) => {
    if (next === tab) {
      return
    }
    setTab(next)
    window.history.replaceState({}, '', `${setUrl}?tab=${next}`)
  }

  return (
    <>
      <div className="mb-4 inline-flex rounded-full bg-muted p-1">
        <TabButton
          active={tab === 'vocab'}
          onClick={() => switchTo('vocab')}
          label="Vocab"
          count={vocabCount}
        />
        <TabButton
          active={tab === 'grammar'}
          onClick={() => switchTo('grammar')}
          label="Grammar"
          count={grammarCount}
        />
      </div>
      {tab === 'vocab' ? (
        <VocabList setId={setId} pageSize={pageSize} />
      ) : (
        <GrammarList setId={setId} pageSize={pageSize} />
      )}
    </>
  )
}

function TabButton({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean
  onClick: () => void
  label: string
  count: number
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
        active
          ? 'bg-background text-foreground shadow-xs'
          : 'text-muted-foreground hover:text-foreground',
      )}
    >
      {label} <span className="font-normal text-muted-foreground">{count}</span>
    </button>
  )
}
