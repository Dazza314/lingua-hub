import { Button } from '@/components/ui/button'
import { useState } from 'react'

type Props = {
  onSubmit: (answer: string) => void
  disabled: boolean
}

export function TranslationForm({ onSubmit, disabled }: Props) {
  const [answer, setAnswer] = useState('')

  const isEmpty = !answer

  function handleSubmit() {
    if (disabled || isEmpty) {
      return
    }
    onSubmit(answer)
    setAnswer('')
  }

  return (
    <div className="flex flex-col gap-3">
      <textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSubmit()
          }
        }}
        rows={1}
        autoFocus
        placeholder="Your translation…"
        className="border-input bg-background placeholder:text-muted-foreground focus-visible:ring-ring/50 field-sizing-content w-full resize-none rounded-xl border px-4 py-3 text-sm outline-none focus-visible:ring-[3px]"
      />
      <Button
        size="lg"
        className="w-full"
        onClick={handleSubmit}
        disabled={disabled || isEmpty}
      >
        Submit
      </Button>
    </div>
  )
}
