# Infinite scroll — grammar tab of `/sets/[id]`

## Goal

Replace the numbered-page pagination on the **grammar tab** of `/sets/[id]` with
client-side infinite scroll backed by virtualization. Vocab tab and the sets
list page stay on the current SSR + `?page=` flow until a follow-up.

## Current state (brief)

`apps/web/app/(app)/sets/[id]/page.tsx` reads `?page=` from `searchParams`,
calls `getSetGrammarPage({ findGrammarPointsBySetId })({ id, page, pageSize })`
on the server, and hands the resulting `Page<CuratedGrammarPoint>` to
`SetDetailView`, which renders the items plus a `Pagination` control. Each page
change is a full server round trip.

The data layer (`getSetGrammarPage` command, `CuratedContentRepository.findGrammarPointsBySetId`
port, Supabase adapter, `Page<T>` shape) is reused as-is.

## New dependencies

- `@tanstack/react-query`
- `@tanstack/react-virtual`

A `QueryClient` provider is shared infra; the grammar list owns introducing it,
but it should be wired into `app/(app)/layout.tsx` so subsequent client
data-fetching consumers can use it.

## Components

### 1. `QueryClient` provider (one-time)

A client component that constructs a single `QueryClient` per request and
exposes it via `QueryClientProvider`. Wired into the existing
`app/(app)/layout.tsx`.

```tsx
// apps/web/components/QueryProvider.tsx
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => new QueryClient())
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}
```

### 2. Server action

Wraps the existing `getSetGrammarPage` command. Lives next to the route so the
client component can call it directly.

```ts
// apps/web/app/(app)/sets/[id]/actions.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import {
  CuratedSetId,
  getSetGrammarPage,
  supabaseCuratedContentRepositoryFactories,
} from '@lingua-hub/vocab'

export async function loadGrammarPage(params: {
  id: CuratedSetId.CuratedSetId
  page: number
  pageSize: number
}) {
  const supabase = await createClient()
  return getSetGrammarPage({
    findGrammarPointsBySetId:
      supabaseCuratedContentRepositoryFactories.createFindGrammarPointsBySetId(
        supabase,
      ),
  })(params)
}
```

### 3. RSC change in `page.tsx`

Vocab tab keeps the existing `?page=` behaviour. When `tab === 'grammar'`, the
page prefetches the first grammar page into a `QueryClient` and hands a
dehydrated state to the new client component.

```tsx
// apps/web/app/(app)/sets/[id]/page.tsx (grammar branch only)
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query'

const GRAMMAR_PAGE_SIZE = 24

// ...inside the grammar branch, after `set` has been resolved:
const queryClient = new QueryClient()

await queryClient.prefetchInfiniteQuery({
  queryKey: ['set', set.id, 'grammar'],
  queryFn: () =>
    loadGrammarPage({ id: set.id, page: 1, pageSize: GRAMMAR_PAGE_SIZE }),
  initialPageParam: 1,
})

return (
  <SetDetailView set={set} tab="grammar" /* vocab props omitted */>
    <HydrationBoundary state={dehydrate(queryClient)}>
      <GrammarList setId={set.id} pageSize={GRAMMAR_PAGE_SIZE} />
    </HydrationBoundary>
  </SetDetailView>
)
```

`SetDetailView` loses its grammar grid + `Pagination` block; the grammar branch
now renders `children` (the hydrated `GrammarList`). The `?page=` searchParam
still drives the vocab tab.

### 4. `GrammarList` client component

```tsx
// apps/web/app/(app)/sets/[id]/_components/GrammarList.tsx
'use client'

import { useInfiniteQuery } from '@tanstack/react-query'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useEffect, useMemo, useRef } from 'react'
import type { CuratedSetId } from '@lingua-hub/vocab'
import { loadGrammarPage } from '../actions'

type Props = {
  setId: CuratedSetId.CuratedSetId
  pageSize: number
}

export function GrammarList({ setId, pageSize }: Props) {
  const parentRef = useRef<HTMLDivElement>(null)

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

  const virtualizer = useVirtualizer({
    count: hasNextPage ? items.length + 1 : items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 96,
    overscan: 5,
  })

  const virtualItems = virtualizer.getVirtualItems()

  useEffect(() => {
    const last = virtualItems[virtualItems.length - 1]
    if (!last) {
      return
    }
    if (last.index >= items.length - 1 && hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [
    virtualItems,
    items.length,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  ])

  if (status === 'pending') {
    return <p>Loading…</p>
  }
  if (status === 'error') {
    return <p>Something went wrong.</p>
  }

  return (
    <div ref={parentRef} className="h-[70vh] overflow-auto [contain:strict]">
      <div
        style={{ height: virtualizer.getTotalSize() }}
        className="relative w-full"
      >
        {virtualItems.map((row) => {
          const isLoader = row.index > items.length - 1
          const point = items[row.index]
          return (
            <div
              key={row.key}
              data-index={row.index}
              ref={virtualizer.measureElement}
              style={{ transform: `translateY(${row.start}px)` }}
              className="absolute left-0 top-0 w-full"
            >
              {isLoader ? (
                <div className="p-3 text-xs text-muted-foreground">
                  {hasNextPage ? 'Loading more…' : 'End of list'}
                </div>
              ) : (
                <div className="rounded-lg border border-border p-3">
                  <p className="mb-0.5 font-medium">{point.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {point.explanation}
                  </p>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

Row markup mirrors the current grammar card in `SetDetailView` so the visual
diff is limited to the scroll container and loader row.

## Out of scope (follow-ups)

- Vocab tab — still uses `?page=` SSR pagination. Same shape (`Page<T>` +
  `getSetVocabPage`) so the migration mirrors this one.
- Sets list page (`/sets`) — currently unpaginated, separate decision.
- Restoring scroll position when navigating back from `/sets/[id]` → `/sets`.
- Showing a total count somewhere (current detail header already shows
  `set.grammarCount`, so `totalCount` on the page payload is used only for
  `getNextPageParam`).
