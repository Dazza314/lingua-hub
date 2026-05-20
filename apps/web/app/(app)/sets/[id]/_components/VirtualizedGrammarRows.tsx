import { CuratedGrammarPoint } from '@lingua-hub/vocab'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useEffect, useRef } from 'react'

type Props = {
  items: CuratedGrammarPoint.CuratedGrammarPoint[]
  hasNextPage: boolean
  isFetchingNextPage: boolean
  onLoadMore: () => void
}

export function VirtualizedGrammarRows({
  items,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
}: Props) {
  const parentRef = useRef<HTMLDivElement>(null)

  // eslint-disable-next-line react-hooks/incompatible-library
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
      onLoadMore()
    }
  }, [virtualItems, items.length, hasNextPage, isFetchingNextPage, onLoadMore])

  return (
    <div ref={parentRef} className="h-[70vh] overflow-auto contain:strict">
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
              className="absolute left-0 top-0 w-full pb-2"
            >
              {isLoader ? (
                <div className="p-3 text-xs text-muted-foreground">
                  {hasNextPage ? 'Loading more…' : 'End of list'}
                </div>
              ) : point ? (
                <div className="rounded-lg border border-border p-3">
                  <p className="mb-0.5 font-medium">{point.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {point.explanation}
                  </p>
                </div>
              ) : null}
            </div>
          )
        })}
      </div>
    </div>
  )
}
