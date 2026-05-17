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

type UserSet = { id: string; title: string }

type Props = {
  policy: ExercisePolicy.ExercisePolicy
  onPolicyChange: (policy: ExercisePolicy.ExercisePolicy) => void
  userSets: UserSet[]
}

export function PolicyEditor({ policy, onPolicyChange, userSets }: Props) {
  const vocabTypes = new Set(policy.vocab.map((v) => v.type))
  const vocabSpecificSetIds = new Set<string>(
    policy.vocab.find((v) => v.type === 'specific_sets')?.setIds ?? [],
  )

  const grammarTypes = new Set(policy.grammar.map((g) => g.type))
  const grammarSpecificSetIds = new Set<string>(
    policy.grammar.find((g) => g.type === 'specific_sets')?.setIds ?? [],
  )

  function toggleVocabType(
    type: ExercisePolicy.VocabSource['type'],
    checked: boolean,
  ) {
    if (!checked && policy.vocab.length <= 1) {
      return
    }
    const newVocab: ExercisePolicy.VocabSource[] = checked
      ? [
          ...policy.vocab,
          type === 'specific_sets' ? { type, setIds: [] } : { type },
        ]
      : policy.vocab.filter((v) => v.type !== type)
    onPolicyChange(
      ExercisePolicy.dangerouslyCast({ ...policy, vocab: newVocab }),
    )
  }

  function toggleGrammarType(
    type: ExercisePolicy.GrammarSource['type'],
    checked: boolean,
  ) {
    if (!checked && policy.grammar.length <= 1) {
      return
    }
    const newGrammar: ExercisePolicy.GrammarSource[] = checked
      ? [
          ...policy.grammar,
          type === 'specific_sets' ? { type, setIds: [] } : { type },
        ]
      : policy.grammar.filter((g) => g.type !== type)
    onPolicyChange(
      ExercisePolicy.dangerouslyCast({ ...policy, grammar: newGrammar }),
    )
  }

  function toggleVocabSpecificSet(setId: string, checked: boolean) {
    const newSetIds = checked
      ? [...Array.from(vocabSpecificSetIds), setId]
      : Array.from(vocabSpecificSetIds).filter((id) => id !== setId)
    const newVocab = policy.vocab.map((v) =>
      v.type === 'specific_sets' ? { ...v, setIds: newSetIds } : v,
    )
    onPolicyChange(
      ExercisePolicy.dangerouslyCast({ ...policy, vocab: newVocab }),
    )
  }

  function toggleGrammarSpecificSet(setId: string, checked: boolean) {
    const newSetIds = checked
      ? [...Array.from(grammarSpecificSetIds), setId]
      : Array.from(grammarSpecificSetIds).filter((id) => id !== setId)
    const newGrammar = policy.grammar.map((g) =>
      g.type === 'specific_sets' ? { ...g, setIds: newSetIds } : g,
    )
    onPolicyChange(
      ExercisePolicy.dangerouslyCast({ ...policy, grammar: newGrammar }),
    )
  }

  return (
    <Popover>
      <PopoverTrigger
        className={cn(buttonVariants({ variant: 'ghost', size: 'icon-sm' }))}
        aria-label="Exercise sources"
      >
        <HugeiconsIcon icon={FilterIcon} strokeWidth={1.5} />
      </PopoverTrigger>
      <PopoverContent>
        <div className="flex flex-col gap-4">
          <SourceGroup label="Vocab">
            <CheckboxRow
              label="My imported vocab"
              checked={vocabTypes.has('imported_vocab')}
              disabled={
                vocabTypes.has('imported_vocab') && policy.vocab.length <= 1
              }
              onCheckedChange={(checked) =>
                toggleVocabType('imported_vocab', checked)
              }
            />
            <CheckboxRow
              label="My selected sets"
              checked={vocabTypes.has('selected_sets')}
              disabled={
                vocabTypes.has('selected_sets') && policy.vocab.length <= 1
              }
              onCheckedChange={(checked) =>
                toggleVocabType('selected_sets', checked)
              }
            />
            <CheckboxRow
              label="Specific sets"
              checked={vocabTypes.has('specific_sets')}
              disabled={
                vocabTypes.has('specific_sets') && policy.vocab.length <= 1
              }
              onCheckedChange={(checked) =>
                toggleVocabType('specific_sets', checked)
              }
            />
            {vocabTypes.has('specific_sets') && (
              <SetPicker
                sets={userSets}
                selectedIds={vocabSpecificSetIds}
                onToggle={toggleVocabSpecificSet}
              />
            )}
          </SourceGroup>

          <SourceGroup label="Grammar">
            <CheckboxRow
              label="My selected sets"
              checked={grammarTypes.has('selected_sets')}
              disabled={
                grammarTypes.has('selected_sets') && policy.grammar.length <= 1
              }
              onCheckedChange={(checked) =>
                toggleGrammarType('selected_sets', checked)
              }
            />
            <CheckboxRow
              label="Specific sets"
              checked={grammarTypes.has('specific_sets')}
              disabled={
                grammarTypes.has('specific_sets') && policy.grammar.length <= 1
              }
              onCheckedChange={(checked) =>
                toggleGrammarType('specific_sets', checked)
              }
            />
            {grammarTypes.has('specific_sets') && (
              <SetPicker
                sets={userSets}
                selectedIds={grammarSpecificSetIds}
                onToggle={toggleGrammarSpecificSet}
              />
            )}
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
      <span className="text-sm">{label}</span>
    </label>
  )
}

function SetPicker({
  sets,
  selectedIds,
  onToggle,
}: {
  sets: UserSet[]
  selectedIds: Set<string>
  onToggle: (id: string, checked: boolean) => void
}) {
  if (sets.length === 0) {
    return (
      <p className="pl-6 text-xs text-muted-foreground">No sets selected</p>
    )
  }
  return (
    <div className="flex flex-col gap-1.5 pl-6">
      {sets.map((set) => (
        <CheckboxRow
          key={set.id}
          label={set.title}
          checked={selectedIds.has(set.id)}
          onCheckedChange={(checked) => onToggle(set.id, checked)}
        />
      ))}
    </div>
  )
}
