// Left Outliner — cascading Miller columns (Faction → Squad → Slot, Ultra Plan §5.1).
// Reads the Y.Doc-backed store via memoized selectors; selecting a slot centers the
// map (flyTo) and drives the shared selection (which tints its icon). Structural
// edits go through the ydoc action helpers (one undoable transaction each).

import { useState } from 'react'
import {
  addFaction,
  addSlot,
  addSquad,
  getTerrain,
  removeEntity,
  selectFactionList,
  selectSlotsOf,
  selectSquadsOf,
  useMapStore,
  type MissionDoc,
  type TacticalMapApi,
} from '@/features/tactical-map'
import { cn } from '@/lib/utils'
import { overlayPanel } from '../overlay'
import { OutlinerColumn } from './OutlinerColumn'

interface OutlinerPanelProps {
  md: MissionDoc
  flyTo: TacticalMapApi['flyTo'] | undefined
}

const TERRAIN = getTerrain('everon')

export function OutlinerPanel({ md, flyTo }: OutlinerPanelProps) {
  const factionsById = useMapStore((s) => s.factionsById)
  const squadsById = useMapStore((s) => s.squadsById)
  const slotsById = useMapStore((s) => s.slotsById)
  const selection = useMapStore((s) => s.selection)
  const setSelection = useMapStore((s) => s.setSelection)

  const [openFactionId, setOpenFactionId] = useState<string | null>(null)
  const [openSquadId, setOpenSquadId] = useState<string | null>(null)

  const factions = selectFactionList(factionsById)
  const squads = selectSquadsOf(squadsById, openFactionId)
  const slots = selectSlotsOf(slotsById, openSquadId)

  const selectedSlotId = selection.kind === 'slot' ? selection.id : null

  return (
    <div className={cn(overlayPanel, 'flex h-full overflow-hidden')}>
      <OutlinerColumn
        title="Factions"
        items={factions.map((f) => ({ id: f.id, label: f.name }))}
        activeId={openFactionId}
        onSelect={(id) => {
          setOpenFactionId(id)
          setOpenSquadId(null)
        }}
        onAdd={() => setOpenFactionId(addFaction(md))}
        onRemove={(id) => {
          removeEntity(md, 'factions', id)
          if (id === openFactionId) {
            setOpenFactionId(null)
            setOpenSquadId(null)
          }
        }}
        emptyHint="No factions yet"
      />

      {openFactionId && (
        <OutlinerColumn
          title="Squads"
          items={squads.map((s) => ({ id: s.id, label: s.name }))}
          activeId={openSquadId}
          onSelect={(id) => {
            setOpenSquadId(id)
            setSelection({ kind: 'squad', id })
          }}
          onAdd={() => setOpenSquadId(addSquad(md, openFactionId))}
          onRemove={(id) => {
            removeEntity(md, 'squads', id)
            if (id === openSquadId) setOpenSquadId(null)
          }}
          emptyHint="No squads yet"
        />
      )}

      {openSquadId && (
        <OutlinerColumn
          title="Slots"
          items={slots.map((s) => ({ id: s.id, label: s.role, tag: s.tag }))}
          activeId={selectedSlotId}
          onSelect={(id) => {
            setSelection({ kind: 'slot', id })
            const pos = slotsById[id]?.position
            if (pos) flyTo?.({ x: pos.x, y: pos.y })
          }}
          onAdd={() => {
            const jitter = () => (Math.random() - 0.5) * 400
            const pos = {
              x: TERRAIN.width / 2 + jitter(),
              y: TERRAIN.height / 2 + jitter(),
            }
            const id = addSlot(md, pos, { squadId: openSquadId })
            setSelection({ kind: 'slot', id })
            flyTo?.(pos)
          }}
          onRemove={(id) => removeEntity(md, 'slots', id)}
          emptyHint="No slots yet"
        />
      )}
    </div>
  )
}
