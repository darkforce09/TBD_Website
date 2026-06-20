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

export interface MapStoreState extends MapSnapshot {
  // UI / runtime (not persisted to json_payload)
  selection: Selection
  activeTool: ToolId
  /** Outliner folder new entities are filed into (drop target). null → fallback. */
  activeLayerId: ID | null

  // Internal: bindings push a fresh snapshot here on every Y.Doc change.
  _applySnapshot: (snapshot: MapSnapshot) => void
  setSelection: (selection: Selection) => void
  setActiveTool: (tool: ToolId) => void
  setActiveLayer: (id: ID | null) => void
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

const NO_SELECTION: Selection = { kind: 'none', id: null }

export const useMapStore = create<MapStoreState>()((set) => ({
  ...EMPTY_SNAPSHOT,
  selection: NO_SELECTION,
  activeTool: 'select',
  activeLayerId: null,
  _applySnapshot: (snapshot) => set(snapshot),
  setSelection: (selection) => set({ selection }),
  setActiveTool: (activeTool) => set({ activeTool }),
  setActiveLayer: (activeLayerId) => set({ activeLayerId }),
  reset: () => set({ ...EMPTY_SNAPSHOT, selection: NO_SELECTION, activeLayerId: null }),
}))
