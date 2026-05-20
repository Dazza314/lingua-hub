import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Page } from '@lingua-hub/core'
import type { CuratedSet, CuratedVocabItem } from '@lingua-hub/vocab'
import Link from 'next/link'

type Props = {
  set: CuratedSet.CuratedSet
  tab: 'vocab' | 'grammar'
  page: number
  pageSize: number
  vocabPage: Page<CuratedVocabItem.CuratedVocabItem> | null
  children?: React.ReactNode
}

export function SetDetailView({
  set,
  tab,
  page,
  pageSize,
  vocabPage,
  children,
}: Props) {
  const baseUrl = `/sets/${set.id}`
  const totalPages = Math.ceil((vocabPage?.totalCount ?? 0) / pageSize)

  return (
    <div className="px-4 py-6">
      <nav className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/sets" className="hover:text-foreground">
          Sets
        </Link>
        <span>/</span>
        <span className="text-foreground">{set.title}</span>
      </nav>

      <div className="mb-6">
        <p className="mb-1 text-[10px] uppercase tracking-widest text-muted-foreground">
          {set.category}
        </p>
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="mb-1.5 text-xl font-semibold">{set.title}</h1>
            <p className="text-sm text-muted-foreground">
              {set.vocabCount} vocab · {set.grammarCount} grammar
            </p>
          </div>
          <Button size="sm">Start studying</Button>
        </div>
      </div>

      <div className="mb-4 inline-flex rounded-full bg-muted p-1">
        <Link
          href={`${baseUrl}?tab=vocab&page=1`}
          className={cn(
            'flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
            tab === 'vocab'
              ? 'bg-background text-foreground shadow-xs'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          Vocab{' '}
          <span className="font-normal text-muted-foreground">
            {set.vocabCount}
          </span>
        </Link>
        <Link
          href={`${baseUrl}?tab=grammar&page=1`}
          className={cn(
            'flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
            tab === 'grammar'
              ? 'bg-background text-foreground shadow-xs'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          Grammar{' '}
          <span className="font-normal text-muted-foreground">
            {set.grammarCount}
          </span>
        </Link>
      </div>

      {tab === 'vocab' && vocabPage && (
        <>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(80px,1fr))] gap-2">
            {vocabPage.items.map((item) => (
              <div
                key={item.id}
                className="rounded-lg border border-border px-2 py-3 text-center text-lg"
              >
                {item.term}
              </div>
            ))}
          </div>
          {totalPages > 1 && (
            <Pagination
              baseUrl={baseUrl}
              tab={tab}
              current={page}
              total={totalPages}
            />
          )}
        </>
      )}

      {tab === 'grammar' && children}
    </div>
  )
}

function Pagination({
  baseUrl,
  tab,
  current,
  total,
}: {
  baseUrl: string
  tab: string
  current: number
  total: number
}) {
  const pages = buildPageList(current, total)

  const pageUrl = (p: number) => `${baseUrl}?tab=${tab}&page=${p}`
  const isFirst = current === 1
  const isLast = current === total

  return (
    <div className="mt-5 flex items-center justify-center gap-1">
      <NavLink href={pageUrl(1)} disabled={isFirst} title="First page">
        «
      </NavLink>
      <NavLink
        href={pageUrl(current - 1)}
        disabled={isFirst}
        title="Previous page"
      >
        ‹
      </NavLink>

      {pages.map((p, i) =>
        p === '…' ? (
          <span key={i} className="px-1 text-xs text-muted-foreground">
            …
          </span>
        ) : (
          <Link
            key={i}
            href={pageUrl(p)}
            className={cn(
              'flex h-7 min-w-7 items-center justify-center rounded-md border px-2 text-xs transition-colors',
              p === current
                ? 'border-border bg-background font-medium'
                : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground',
            )}
          >
            {p}
          </Link>
        ),
      )}

      <NavLink href={pageUrl(current + 1)} disabled={isLast} title="Next page">
        ›
      </NavLink>
      <NavLink href={pageUrl(total)} disabled={isLast} title="Last page">
        »
      </NavLink>
    </div>
  )
}

function NavLink({
  href,
  disabled,
  title,
  children,
}: {
  href: string
  disabled: boolean
  title: string
  children: React.ReactNode
}) {
  return disabled ? (
    <span
      title={title}
      className="flex h-7 w-7 items-center justify-center text-sm text-muted-foreground/30"
    >
      {children}
    </span>
  ) : (
    <Link
      href={href}
      title={title}
      className="flex h-7 w-7 items-center justify-center rounded-md text-sm text-muted-foreground transition-colors hover:border hover:border-border hover:text-foreground"
    >
      {children}
    </Link>
  )
}

function buildPageList(current: number, total: number): (number | '…')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }
  const pages: (number | '…')[] = [1]
  if (current > 3) {
    pages.push('…')
  }
  for (
    let p = Math.max(2, current - 1);
    p <= Math.min(total - 1, current + 1);
    p++
  ) {
    pages.push(p)
  }
  if (current < total - 2) {
    pages.push('…')
  }
  pages.push(total)
  return pages
}
