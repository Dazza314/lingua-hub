import { buttonVariants } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { FilterIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { ExercisePolicy } from '@lingua-hub/exercise'
import { CuratedSetId } from '@lingua-hub/vocab'
import { SetPicker } from './SetPicker'

type UserSet = { id: CuratedSetId.CuratedSetId; title: string }

type Props = {
  policy: ExercisePolicy.ExercisePolicy
  onPolicyChange: (policy: ExercisePolicy.ExercisePolicy) => void
  sets: UserSet[]
}

export function PolicyEditor({ policy, onPolicyChange, sets }: Props) {
  const vocabSetIds = new Set<CuratedSetId.CuratedSetId>(policy.vocab.setIds)
  const grammarSetIds = new Set<CuratedSetId.CuratedSetId>(
    policy.grammar.setIds,
  )

  function toggleVocabSet(setId: CuratedSetId.CuratedSetId, checked: boolean) {
    const setIds = checked
      ? [...policy.vocab.setIds, setId]
      : policy.vocab.setIds.filter((id) => id !== setId)
    onPolicyChange({ ...policy, vocab: { ...policy.vocab, setIds } })
  }

  function toggleGrammarSet(
    setId: CuratedSetId.CuratedSetId,
    checked: boolean,
  ) {
    const setIds = checked
      ? [...policy.grammar.setIds, setId]
      : policy.grammar.setIds.filter((id) => id !== setId)
    onPolicyChange({ ...policy, grammar: { setIds } })
  }

  function toggleImportedVocab(checked: boolean) {
    onPolicyChange({
      ...policy,
      vocab: { ...policy.vocab, importedVocab: checked },
    })
  }

  const activeFilterCount =
    policy.vocab.setIds.length +
    (policy.vocab.importedVocab ? 1 : 0) +
    policy.grammar.setIds.length

  return (
    <Popover>
      <PopoverTrigger
        className={cn(
          buttonVariants({ variant: 'ghost', size: 'icon-sm' }),
          'relative',
        )}
        aria-label="Exercise sources"
      >
        <HugeiconsIcon icon={FilterIcon} strokeWidth={1.5} />
        {activeFilterCount > 0 && (
          <span
            aria-hidden
            className="absolute -right-1 -top-1 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-primary px-0.5 text-[10px] font-medium leading-none text-primary-foreground"
          >
            {activeFilterCount}
          </span>
        )}
      </PopoverTrigger>
      <PopoverContent>
        <div className="flex flex-col gap-4">
          <SourceGroup label="Vocab">
            <SetPicker
              sets={sets}
              selectedIds={vocabSetIds}
              onToggle={toggleVocabSet}
            />
            <div className="border-t border-border pt-2">
              <CheckboxRow
                label="Also include imported vocab"
                checked={policy.vocab.importedVocab}
                onCheckedChange={toggleImportedVocab}
              />
            </div>
          </SourceGroup>

          <SourceGroup label="Grammar">
            <SetPicker
              sets={sets}
              selectedIds={grammarSetIds}
              onToggle={toggleGrammarSet}
            />
          </SourceGroup>
        </div>
      </PopoverContent>
    </Popover>
  )
}

function SourceGroup({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      {children}
    </div>
  )
}

function CheckboxRow({
  label,
  checked,
  disabled,
  onCheckedChange,
}: {
  label: string
  checked: boolean
  disabled?: boolean
  onCheckedChange: (checked: boolean) => void
}) {
  return (
    <label
      className={cn(
        'flex items-center gap-2.5',
        disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
      )}
    >
      <Checkbox
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
      />
      <span className="text-sm select-none">{label}</span>
    </label>
  )
}
