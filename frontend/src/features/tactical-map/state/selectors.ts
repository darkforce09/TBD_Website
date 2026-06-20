// Pure, memoized transforms: store slices -> per-layer data arrays (Ultra Plan
// §4.4). Memoize on input refs — bindings.ts replaces a dictionary object only when
// it actually changes, so ref-equality caching avoids rebuilding a layer's data
// (and thus the layer) when an unrelated slice mutates.

import type { Faction, ID, Selection, Slot, Squad } from './schema'

export interface SlotIcon {
  id: ID
  x: number
  y: number
  selected: boolean
}

function memo1<A, R>(fn: (a: A) => R): (a: A) => R {
  let lastA: A | undefined
  let lastR: R | undefined
  let primed = false
  return (a) => {
    if (primed && a === lastA) return lastR as R
    lastA = a
    lastR = fn(a)
    primed = true
    return lastR
  }
}

function memo2<A, B, R>(fn: (a: A, b: B) => R): (a: A, b: B) => R {
  let lastA: A | undefined
  let lastB: B | undefined
  let lastR: R | undefined
  let primed = false
  return (a, b) => {
    if (primed && a === lastA && b === lastB) return lastR as R
    lastA = a
    lastB = b
    lastR = fn(a, b)
    primed = true
    return lastR
  }
}

export const selectSlotIcons = memo2(
  (slotsById: Record<ID, Slot>, selection: Selection): SlotIcon[] =>
    Object.values(slotsById).map((s) => ({
      id: s.id,
      x: s.position.x,
      y: s.position.y,
      selected: selection.kind === 'slot' && selection.id === s.id,
    })),
)

// ── Outliner (Miller columns) ───────────────────────────────────────────────
// The Outliner shows one faction's squads and one squad's slots at a time, so a
// last-call memo (memo2) is sufficient even though the parent id varies.

export const selectFactionList = memo1(
  (factionsById: Record<ID, Faction>): Faction[] => Object.values(factionsById),
)

export const selectSquadsOf = memo2(
  (squadsById: Record<ID, Squad>, factionId: ID | null): Squad[] =>
    factionId
      ? Object.values(squadsById).filter((s) => s.factionId === factionId)
      : [],
)

export const selectSlotsOf = memo2(
  (slotsById: Record<ID, Slot>, squadId: ID | null): Slot[] =>
    squadId
      ? Object.values(slotsById)
          .filter((s) => s.squadId === squadId)
          .sort((a, b) => a.index - b.index)
      : [],
)
