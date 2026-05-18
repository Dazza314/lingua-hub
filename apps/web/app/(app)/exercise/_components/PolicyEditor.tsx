import { buttonVariants } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { transitions } from '@/lib/animations'
import { cn } from '@/lib/utils'
import { FilterIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { ExercisePolicy } from '@lingua-hub/exercise'
import { CuratedSetId } from '@lingua-hub/vocab'
import { AnimatePresence, motion } from 'framer-motion'
import { SetPicker } from './SetPicker'

type UserSet = { id: CuratedSetId.CuratedSetId; title: string }

type Props = {
  policy: ExercisePolicy.ExercisePolicy
  onPolicyChange: (policy: ExercisePolicy.ExercisePolicy) => void
  userSets: UserSet[]
}

export function PolicyEditor({ policy, onPolicyChange, userSets }: Props) {
  const vocabSourceType = policy.vocab.source.type
  const vocabSpecificSetIds = new Set<CuratedSetId.CuratedSetId>(
    vocabSourceType === 'specificSets' ? policy.vocab.source.setIds : [],
  )

  const grammarSourceType = policy.grammar.source.type
  const grammarSpecificSetIds = new Set<CuratedSetId.CuratedSetId>(
    grammarSourceType === 'specificSets' ? policy.grammar.source.setIds : [],
  )

  function setVocabSource(type: ExercisePolicy.VocabSource['type']) {
    if (type === 'specificSets') {
      const firstSetId = userSets[0]?.id
      if (firstSetId === undefined) {
        return
      }
      onPolicyChange({
        ...policy,
        vocab: { ...policy.vocab, source: { type, setIds: [firstSetId] } },
      })
    } else {
      onPolicyChange({
        ...policy,
        vocab: { ...policy.vocab, source: { type } },
      })
    }
  }

  function toggleImportedVocab(checked: boolean) {
    onPolicyChange({
      ...policy,
      vocab: { ...policy.vocab, importedVocab: checked },
    })
  }

  function setGrammarSource(type: ExercisePolicy.GrammarSource['type']) {
    if (type === 'specificSets') {
      const firstSetId = userSets[0]?.id
      if (firstSetId === undefined) {
        return
      }
      onPolicyChange({
        ...policy,
        grammar: { source: { type, setIds: [firstSetId] } },
      })
    } else {
      onPolicyChange({ ...policy, grammar: { source: { type } } })
    }
  }

  function toggleVocabSpecificSet(
    setId: CuratedSetId.CuratedSetId,
    checked: boolean,
  ) {
    const newSetIds = checked
      ? [...Array.from(vocabSpecificSetIds), setId]
      : Array.from(vocabSpecificSetIds).filter((id) => id !== setId)
    onPolicyChange({
      ...policy,
      vocab: {
        ...policy.vocab,
        source: { type: 'specificSets', setIds: newSetIds },
      },
    })
  }

  function toggleGrammarSpecificSet(
    setId: CuratedSetId.CuratedSetId,
    checked: boolean,
  ) {
    const newSetIds = checked
      ? [...Array.from(grammarSpecificSetIds), setId]
      : Array.from(grammarSpecificSetIds).filter((id) => id !== setId)
    onPolicyChange({
      ...policy,
      grammar: { source: { type: 'specificSets', setIds: newSetIds } },
    })
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
            <RadioGroup
              value={vocabSourceType}
              onValueChange={(v) => setVocabSource(v)}
            >
              <RadioRow value="selectedSets" label="My selected sets" />
              <RadioRow
                value="specificSets"
                label="Specific sets"
                disabled={userSets.length === 0}
              />
              <AnimatePresence>
                {vocabSourceType === 'specificSets' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={transitions.spring}
                    className="overflow-hidden"
                  >
                    <SetPicker
                      sets={userSets}
                      selectedIds={vocabSpecificSetIds}
                      onToggle={toggleVocabSpecificSet}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </RadioGroup>
            <div className="border-t border-border pt-2">
              <CheckboxRow
                label="Also include imported vocab"
                checked={policy.vocab.importedVocab}
                onCheckedChange={toggleImportedVocab}
              />
            </div>
          </SourceGroup>

          <SourceGroup label="Grammar">
            <RadioGroup
              value={grammarSourceType}
              onValueChange={(v) => setGrammarSource(v)}
            >
              <RadioRow value="selectedSets" label="My selected sets" />
              <RadioRow
                value="specificSets"
                label="Specific sets"
                disabled={userSets.length === 0}
              />
              <AnimatePresence>
                {grammarSourceType === 'specificSets' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={transitions.spring}
                    className="overflow-hidden"
                  >
                    <SetPicker
                      sets={userSets}
                      selectedIds={grammarSpecificSetIds}
                      onToggle={toggleGrammarSpecificSet}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </RadioGroup>
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

function RadioRow({
  value,
  label,
  disabled,
}: {
  value: string
  label: string
  disabled?: boolean
}) {
  return (
    <label
      className={cn(
        'flex items-center gap-2.5',
        disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
      )}
    >
      <RadioGroupItem value={value} disabled={disabled} />
      <span className="text-sm select-none">{label}</span>
    </label>
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
