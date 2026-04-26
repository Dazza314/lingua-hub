import { Button } from '@/components/ui/button'
import { useState } from 'react'

type Props = {
  onSubmit: (answer: string) => void
}

export function TranslationForm({ onSubmit }: Props) {
  const [answer, setAnswer] = useState('')

  function handleSubmit() {
    onSubmit(answer)
    setAnswer('')
  }

  return (
    <div className="flex flex-col gap-3">
      <textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        autoFocus
        placeholder="Your translation…"
        className="border-input bg-background placeholder:text-muted-foreground focus-visible:ring-ring/50 min-h-28 w-full resize-none rounded-xl border px-4 py-3 text-sm outline-none focus-visible:ring-[3px]"
      />
      <Button size="lg" className="w-full" onClick={handleSubmit}>
        Submit
      </Button>
    </div>
  )
}
