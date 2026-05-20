import { Button } from '@/components/ui/button'
import type { CuratedSet } from '@lingua-hub/vocab'
import Link from 'next/link'

type Props = {
  set: CuratedSet.CuratedSet
  children?: React.ReactNode
}

export function SetDetailView({ set, children }: Props) {
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

      {children}
    </div>
  )
}
