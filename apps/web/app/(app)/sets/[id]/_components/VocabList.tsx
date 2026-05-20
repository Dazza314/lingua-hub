'use client'

import { useInfinitePagedList } from '@/hooks/use-infinite-paged-list'
import { CuratedSetId } from '@lingua-hub/vocab'
import { loadVocabPage } from '../actions'

type Props = {
  setId: CuratedSetId.CuratedSetId
  pageSize: number
}

export function VocabList({ setId, pageSize }: Props) {
  const {
    items,
    scrollRef,
    sentinelRef,
    status,
    hasNextPage,
    isFetchingNextPage,
  } = useInfinitePagedList({
    queryKey: ['set', setId, 'vocab'],
    load: ({ page, pageSize }) => loadVocabPage({ id: setId, page, pageSize }),
    pageSize,
  })

  if (status === 'pending') {
    return <p className="text-sm text-muted-foreground">Loading…</p>
  }
  if (status === 'error') {
    return (
      <p className="text-sm text-muted-foreground">Something went wrong.</p>
    )
  }

  return (
    <div ref={scrollRef} className="h-[70vh] overflow-auto contain:strict">
      <div className="flex flex-wrap gap-2 justify-between">
        {items.map((item) => (
          <div
            key={item.id}
            className="rounded-lg border border-border px-3 py-2 text-lg"
            style={{
              contentVisibility: 'auto',
              containIntrinsicSize: 'auto 60px 36px',
            }}
          >
            {item.term}
          </div>
        ))}
      </div>
      <div ref={sentinelRef} className="p-3 text-xs text-muted-foreground">
        {hasNextPage && isFetchingNextPage ? 'Loading more…' : ''}
      </div>
    </div>
  )
}
