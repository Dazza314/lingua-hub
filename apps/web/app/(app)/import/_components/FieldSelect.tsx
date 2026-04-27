import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useSafeAreaInsetBottom } from '@/hooks/use-safe-area-inset-bottom'

const DROPDOWN_SCREEN_MARGIN = 8

type Props = {
  label: string
  required?: boolean
  fields: string[]
  value: string
  sampleValues: Record<string, string>
  onChange: (value: string) => void
}

const NONE = '__none__'

export function FieldSelect({
  label,
  required,
  fields,
  value,
  sampleValues,
  onChange,
}: Props) {
  const safeAreaBottom = useSafeAreaInsetBottom()
  const sample = value ? sampleValues[value] : undefined
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </label>
      <Select
        value={value === '' ? NONE : value}
        onValueChange={(v) => onChange(!v || v === NONE ? '' : v)}
      >
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent
          collisionPadding={{ bottom: safeAreaBottom + DROPDOWN_SCREEN_MARGIN }}
        >
          {fields.map((f) => (
            <SelectItem key={f || NONE} value={f || NONE}>
              {f || '— none —'}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {sample && (
        <p className="text-muted-foreground truncate text-xs">e.g. {sample}</p>
      )}
    </div>
  )
}
