import { Checkbox } from '@/components/ui/checkbox'

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
          className="flex cursor-pointer items-center gap-2.5"
        >
          <Checkbox
            checked={selectedIds.has(set.id)}
            onCheckedChange={(checked) => onToggle(set.id, checked)}
          />
          <span className="text-sm">{set.title}</span>
        </label>
      ))}
    </div>
  )
}
