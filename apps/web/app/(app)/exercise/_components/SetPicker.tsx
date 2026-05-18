import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'

import { CuratedSetId } from '@lingua-hub/vocab'

type UserSet = { id: CuratedSetId.CuratedSetId; title: string }

export function SetPicker({
  sets,
  selectedIds,
  onToggle,
}: {
  sets: UserSet[]
  selectedIds: Set<CuratedSetId.CuratedSetId>
  onToggle: (id: CuratedSetId.CuratedSetId, checked: boolean) => void
}) {
  return (
    <div className="flex flex-col gap-1.5 pl-6">
      {sets.map((set) => (
        <label
          key={set.id}
          className={cn(
            'flex items-center gap-2.5',
            selectedIds.has(set.id) && selectedIds.size === 1
              ? 'cursor-not-allowed opacity-50'
              : 'cursor-pointer',
          )}
        >
          <Checkbox
            checked={selectedIds.has(set.id)}
            disabled={selectedIds.has(set.id) && selectedIds.size === 1}
            onCheckedChange={(checked) => onToggle(set.id, checked)}
          />
          <span className="text-sm">{set.title}</span>
        </label>
      ))}
    </div>
  )
}
