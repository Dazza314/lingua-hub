'use client'

import { Radio } from '@base-ui/react/radio'
import { RadioGroup as RadioGroupPrimitive } from '@base-ui/react/radio-group'

import { cn } from '@/lib/utils'

function RadioGroup<Value>({
  className,
  ...props
}: RadioGroupPrimitive.Props<Value>) {
  return (
    <RadioGroupPrimitive
      data-slot="radio-group"
      className={cn('flex flex-col gap-2', className)}
      {...props}
    />
  )
}

function RadioGroupItem({ className, ...props }: Radio.Root.Props) {
  return (
    <Radio.Root
      data-slot="radio-group-item"
      className={cn(
        'flex size-4 shrink-0 items-center justify-center rounded-full border border-input bg-input/30 outline-none transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 data-checked:border-primary data-checked:bg-primary disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    >
      <Radio.Indicator>
        <div className="size-1.5 rounded-full bg-primary-foreground" />
      </Radio.Indicator>
    </Radio.Root>
  )
}

export { RadioGroup, RadioGroupItem }
