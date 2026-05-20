import type { Page } from '@lingua-hub/core'
import { QueryKey, useInfiniteQuery } from '@tanstack/react-query'
import { useEffect, useMemo, useRef } from 'react'

type Params<TData, TQueryKey extends QueryKey> = {
  queryKey: TQueryKey
  load: (params: { page: number; pageSize: number }) => Promise<Page<TData>>
  pageSize: number
}

export function useInfinitePagedList<T, TQueryKey extends QueryKey>({
  queryKey,
  load,
  pageSize,
}: Params<T, TQueryKey>) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useInfiniteQuery({
      queryKey,
      queryFn: ({ pageParam }) => load({ page: pageParam, pageSize }),
      initialPageParam: 1,
      getNextPageParam: (lastPage, allPages) => {
        const loaded = allPages.reduce((sum, p) => sum + p.items.length, 0)
        return loaded < lastPage.totalCount ? allPages.length + 1 : undefined
      },
    })

  const items = useMemo(() => data?.pages.flatMap((p) => p.items) ?? [], [data])

  const scrollRef = useRef<HTMLDivElement>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const sentinel = sentinelRef.current
    const root = scrollRef.current
    if (!sentinel || !root || !hasNextPage || isFetchingNextPage) {
      return
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          fetchNextPage()
        }
      },
      { root, rootMargin: '1200px' },
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [fetchNextPage, hasNextPage, isFetchingNextPage])

  return {
    items,
    scrollRef,
    sentinelRef,
    status,
    hasNextPage,
    isFetchingNextPage,
  }
}
