// Shared inspector field primitives — a label + control row in the Aegis glass
// style, reused by the Global Settings and Slot inspectors.

import type { ReactNode } from 'react'
import { Switch } from '@/components/ui/switch'

const controlClass =
  'w-full rounded-md border border-outline-variant/40 bg-surface-container-lowest/60 px-2.5 py-1.5 text-label-md text-on-surface outline-none transition-colors focus:border-primary/60'

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-label-sm uppercase tracking-wider text-outline">{label}</span>
      {children}
    </label>
  )
}

export function TextField({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  label: string
  value: string | number
  onChange: (v: string) => void
  placeholder?: string
  type?: 'text' | 'time' | 'number'
}) {
  return (
    <Field label={label}>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={controlClass}
      />
    </Field>
  )
}

export function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: { value: string; label: string }[]
  onChange: (v: string) => void
}) {
  return (
    <Field label={label}>
      <select value={value} onChange={(e) => onChange(e.target.value)} className={controlClass}>
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-surface-container">
            {o.label}
          </option>
        ))}
      </select>
    </Field>
  )
}

export function ToggleField({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between py-0.5">
      <span className="text-label-md text-on-surface-variant">{label}</span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  )
}

export function ReadonlyField({ label, value }: { label: string; value: string }) {
  return (
    <Field label={label}>
      <div className="rounded-md border border-outline-variant/20 bg-surface-container-lowest/30 px-2.5 py-1.5 font-mono text-code-md text-on-surface-variant">
        {value}
      </div>
    </Field>
  )
}
