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
import * as slotIconCache from './slotIconCache'

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

/** Transient marquee box in world meters (Phase 7b); null when not box-selecting. */
export interface MarqueeRect {
  x0: number
  y0: number
  x1: number
  y1: number
}

/** Live cursor world position (meters) for the toolbelt read-out; null off-map. Transient
 *  UI state, never written to the Y.Doc. Set rAF-throttled from TacticalMap so the cursor
 *  read-out never re-renders the editor page on pointer move (T-057). */
export interface CursorPos {
  x: number
  y: number
  z: number
}

export interface MapStoreState extends MapSnapshot {
  // UI / runtime (not persisted to json_payload)
  selection: Selection
  activeTool: ToolId
  /** Outliner folder new entities are filed into (drop target). null → fallback. */
  activeLayerId: ID | null
  /** IDs being drag-previewed (Phase 7b / T-061): set once at drag start, cleared on
   *  pointer-up. Stable during the move so the base IconLayer does not re-subscribe per
   *  frame. NEVER written to the Y.Doc — the move is committed once on pointer-up. */
  dragPreviewIds: ID[] | null
  /** Live world-meter drag-preview offset; rAF-coalesced during the move (T-061). */
  dragPreviewDelta: { dx: number; dy: number } | null
  /** Live marquee box (world meters); null when not box-selecting. */
  marquee: MarqueeRect | null
  /** Live cursor world position (meters); null off-map. Drives the toolbelt read-out. */
  cursor: CursorPos | null
  /** Bumped whenever the slotIconCache changes (T-061.0.1). The base IconLayer subscribes
   *  this instead of `slotsById`, so drag boundaries refresh the layer without an O(n)
   *  re-derive from the dictionary. */
  iconCacheVersion: number

  // Internal: bindings push a fresh snapshot here on every Y.Doc change.
  _applySnapshot: (snapshot: MapSnapshot) => void
  /** Bindings fast path (T-061.0.1): shallow-merge changed slots without replacing the
   *  whole snapshot, and patch the icon cache positions in lockstep. */
  _patchSlots: (patches: Record<ID, Slot>) => void
  /** Publish the icon cache's current version after a direct cache mutation made outside
   *  the store (drag exclude/restore/patch in useSelectTool), so the base layer refreshes. */
  _syncIconCache: () => void
  setSelection: (selection: Selection) => void
  setActiveTool: (tool: ToolId) => void
  setActiveLayer: (id: ID | null) => void
  setDragPreview: (ids: ID[] | null) => void
  setDragPreviewDelta: (delta: { dx: number; dy: number } | null) => void
  clearDragPreview: () => void
  setMarquee: (marquee: MarqueeRect | null) => void
  setCursor: (cursor: CursorPos | null) => void
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

export const useMapStore = create<MapStoreState>()((set, get) => ({
  ...EMPTY_SNAPSHOT,
  selection: NO_SELECTION,
  activeTool: 'select',
  activeLayerId: null,
  dragPreviewIds: null,
  dragPreviewDelta: null,
  marquee: null,
  cursor: null,
  iconCacheVersion: 0,
  _applySnapshot: (snapshot) => {
    set(snapshot)
    slotIconCache.rebuildFromSlots(snapshot.slotsById, get().selection)
    set({ iconCacheVersion: slotIconCache.getVersion() })
  },
  _patchSlots: (patches) => {
    set({ slotsById: { ...get().slotsById, ...patches } })
    const positions: Record<ID, { x: number; y: number }> = {}
    for (const id in patches) positions[id] = { x: patches[id].position.x, y: patches[id].position.y }
    slotIconCache.setPositions(positions)
    set({ iconCacheVersion: slotIconCache.getVersion() })
  },
  _syncIconCache: () => set({ iconCacheVersion: slotIconCache.getVersion() }),
  setSelection: (selection) => {
    set({ selection })
    slotIconCache.setSelectionFlags(selection)
    set({ iconCacheVersion: slotIconCache.getVersion() })
  },
  setActiveTool: (activeTool) => set({ activeTool }),
  setActiveLayer: (activeLayerId) => set({ activeLayerId }),
  setDragPreview: (dragPreviewIds) => set({ dragPreviewIds }),
  setDragPreviewDelta: (dragPreviewDelta) => set({ dragPreviewDelta }),
  clearDragPreview: () => set({ dragPreviewIds: null, dragPreviewDelta: null }),
  setMarquee: (marquee) => set({ marquee }),
  setCursor: (cursor) => set({ cursor }),
  reset: () => {
    slotIconCache.clearSlotIconCache()
    set({
      ...EMPTY_SNAPSHOT,
      selection: NO_SELECTION,
      activeLayerId: null,
      dragPreviewIds: null,
      dragPreviewDelta: null,
      marquee: null,
      cursor: null,
      iconCacheVersion: slotIconCache.getVersion(),
    })
  },
}))
