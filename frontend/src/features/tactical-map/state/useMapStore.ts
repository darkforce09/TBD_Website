// Zustand read-mirror of the Y.Doc (Ultra Plan §2.2). Components read via
// useMapStore(selector); they NEVER setState entity data directly — mutations flow
// through the Y.Doc (state/ydoc.ts) and are reflected here by state/bindings.ts.
// Only UI/runtime state (selection, activeTool) is set on the store directly.

import { create } from 'zustand'
import type {
  EditorLayer,
  Faction,
  ID,
  InventoryItem,
  Loadout,
  MapMarker,
  MissionMeta,
  Objective,
  Selection,
  Slot,
  Squad,
  ToolId,
  Vehicle,
} from './schema'

/** The entity-dictionary slice produced from the Y.Doc by bindings. */
export interface MapSnapshot {
  meta: MissionMeta | null
  factionsById: Record<ID, Faction>
  squadsById: Record<ID, Squad>
  slotsById: Record<ID, Slot>
  loadoutsById: Record<ID, Loadout>
  itemsById: Record<ID, InventoryItem>
  objectivesById: Record<ID, Objective>
  vehiclesById: Record<ID, Vehicle>
  markersById: Record<ID, MapMarker>
  editorLayersById: Record<ID, EditorLayer>
}

/** Transient drag-move preview (Phase 7b): the dragging ids + world delta. Lives in the
 *  store so the IconLayer can offset previews live, but is NEVER written to the Y.Doc —
 *  the move is committed once on pointer-up. */
export interface DragState {
  ids: ID[]
  dx: number
  dy: number
}

/** Transient marquee box in world meters (Phase 7b); null when not box-selecting. */
export interface MarqueeRect {
  x0: number
  y0: number
  x1: number
  y1: number
}

export interface MapStoreState extends MapSnapshot {
  // UI / runtime (not persisted to json_payload)
  selection: Selection
  activeTool: ToolId
  /** Outliner folder new entities are filed into (drop target). null → fallback. */
  activeLayerId: ID | null
  /** Live drag-move preview offset; null when not dragging. */
  drag: DragState | null
  /** Live marquee box (world meters); null when not box-selecting. */
  marquee: MarqueeRect | null

  // Internal: bindings push a fresh snapshot here on every Y.Doc change.
  _applySnapshot: (snapshot: MapSnapshot) => void
  setSelection: (selection: Selection) => void
  setActiveTool: (tool: ToolId) => void
  setActiveLayer: (id: ID | null) => void
  setDrag: (drag: DragState | null) => void
  setMarquee: (marquee: MarqueeRect | null) => void
  reset: () => void
}

const EMPTY_SNAPSHOT: MapSnapshot = {
  meta: null,
  factionsById: {},
  squadsById: {},
  slotsById: {},
  loadoutsById: {},
  itemsById: {},
  objectivesById: {},
  vehiclesById: {},
  markersById: {},
  editorLayersById: {},
}

const NO_SELECTION: Selection = { kind: 'none', ids: [] }

export const useMapStore = create<MapStoreState>()((set) => ({
  ...EMPTY_SNAPSHOT,
  selection: NO_SELECTION,
  activeTool: 'select',
  activeLayerId: null,
  drag: null,
  marquee: null,
  _applySnapshot: (snapshot) => set(snapshot),
  setSelection: (selection) => set({ selection }),
  setActiveTool: (activeTool) => set({ activeTool }),
  setActiveLayer: (activeLayerId) => set({ activeLayerId }),
  setDrag: (drag) => set({ drag }),
  setMarquee: (marquee) => set({ marquee }),
  reset: () =>
    set({ ...EMPTY_SNAPSHOT, selection: NO_SELECTION, activeLayerId: null, drag: null, marquee: null }),
}))
