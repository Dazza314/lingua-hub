'use client'

import { CuratedSetId } from '@lingua-hub/vocab'
import { useInfiniteQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { loadGrammarPage } from '../actions'
import { VirtualizedGrammarRows } from './VirtualizedGrammarRows'

type Props = {
  setId: CuratedSetId.CuratedSetId
  pageSize: number
}

export function GrammarList({ setId, pageSize }: Props) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useInfiniteQuery({
      queryKey: ['set', setId, 'grammar'],
      queryFn: ({ pageParam }) =>
        loadGrammarPage({ id: setId, page: pageParam, pageSize }),
      initialPageParam: 1,
      getNextPageParam: (lastPage, allPages) => {
        const loaded = allPages.reduce((sum, p) => sum + p.items.length, 0)
        return loaded < lastPage.totalCount ? allPages.length + 1 : undefined
      },
    })

  const items = useMemo(() => data?.pages.flatMap((p) => p.items) ?? [], [data])

  if (status === 'pending') {
    return <p className="text-sm text-muted-foreground">Loading…</p>
  }
  if (status === 'error') {
    return (
      <p className="text-sm text-muted-foreground">Something went wrong.</p>
    )
  }

  return (
    <VirtualizedGrammarRows
      items={items}
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
      onLoadMore={fetchNextPage}
    />
  )
}
