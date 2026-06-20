// Inspector shown when a slot is selected (Ultra Plan §5.2, `slot` state). Phase-3
// stub for the future ArsenalInspector: edits the slot's role/tag/stance; the
// gear/paper-doll Arsenal arrives in a later phase (shown here as a disabled CTA).

import { Shield } from 'lucide-react'
import {
  updateSlot,
  type MissionDoc,
  type Slot,
} from '@/features/tactical-map'
import { ReadonlyField, SelectField, TextField } from './fields'

const STANCE = [
  { value: 'stand', label: 'Standing' },
  { value: 'crouch', label: 'Crouched' },
  { value: 'prone', label: 'Prone' },
]

export function SlotInspector({ md, slot }: { md: MissionDoc; slot: Slot }) {
  return (
    <div className="flex flex-col gap-4">
      <header>
        <h2 className="text-headline-sm text-on-surface">{slot.role || 'Slot'}</h2>
        <p className="text-label-sm normal-case text-outline">
          Slot #{slot.index + 1}
        </p>
      </header>

      <TextField
        label="Role"
        value={slot.role}
        onChange={(role) => updateSlot(md, slot.id, { role })}
        placeholder="Rifleman"
      />
      <TextField
        label="Tag"
        value={slot.tag ?? ''}
        onChange={(tag) => updateSlot(md, slot.id, { tag })}
        placeholder="MED · ENG · SL…"
      />
      <SelectField
        label="Stance"
        value={slot.stance}
        options={STANCE}
        onChange={(stance) =>
          updateSlot(md, slot.id, { stance: stance as Slot['stance'] })
        }
      />
      <ReadonlyField
        label="Position"
        value={`${Math.round(slot.position.x)}, ${Math.round(slot.position.y)} · z ${Math.round(slot.position.z)}`}
      />

      <button
        type="button"
        disabled
        title="The Arsenal lands in a later phase"
        className="mt-1 inline-flex items-center justify-center gap-2 rounded-lg border border-outline-variant/30 bg-surface-container-high/40 px-3 py-2 text-label-md text-outline"
      >
        <Shield className="size-4" />
        Open Arsenal (soon)
      </button>
    </div>
  )
}
