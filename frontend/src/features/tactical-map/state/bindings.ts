// Reflect Y.Doc changes into the Zustand mirror (Ultra Plan §2.3). observeDeep on
// each top-level map → coalesce a burst of map events (one transaction fires many)
// into a single store update via queueMicrotask → push a plain snapshot. Returns an
// unbind fn. y-indexeddb durability is wired by the wrapper (useMissionDoc), not here.

import type {
  EditorLayer,
  Faction,
  ID,
  InventoryItem,
  Loadout,
  MapMarker,
  MissionMeta,
  Objective,
  Slot,
  Squad,
  Vehicle,
} from './schema'
import { trackedTypes, type MissionDoc } from './ydoc'
import { useMapStore, type MapSnapshot } from './useMapStore'
import { yieldToUi } from './yieldToUi'

export function docToSnapshot(md: MissionDoc): MapSnapshot {
  const e = md.entities
  return {
    meta: md.meta.size > 0 ? (md.meta.toJSON() as MissionMeta) : null,
    factionsById: e.factions.toJSON() as Record<ID, Faction>,
    squadsById: e.squads.toJSON() as Record<ID, Squad>,
    slotsById: e.slots.toJSON() as Record<ID, Slot>,
    loadoutsById: e.loadouts.toJSON() as Record<ID, Loadout>,
    itemsById: e.items.toJSON() as Record<ID, InventoryItem>,
    objectivesById: e.objectives.toJSON() as Record<ID, Objective>,
    vehiclesById: e.vehicles.toJSON() as Record<ID, Vehicle>,
    markersById: e.markers.toJSON() as Record<ID, MapMarker>,
    editorLayersById: e.editorLayers.toJSON() as Record<ID, EditorLayer>,
  }
}

/** Async variant for the boot flush (T-060.1): a one-shot `e.slots.toJSON()` over 300k+
 *  Y.Maps blocks the main thread for minutes. Convert `slots` (the large map) one entry at
 *  a time, yielding + reporting progress every `chunkSize` so the load overlay shows a real
 *  %; the small maps stay one-shot. Same shape as docToSnapshot. */
export async function docToSnapshotWithProgress(
  md: MissionDoc,
  onProgress?: (done: number, total: number) => void,
  chunkSize = 5000,
): Promise<MapSnapshot> {
  const e = md.entities
  const slotsById: Record<ID, Slot> = {}
  const total = e.slots.size
  let done = 0
  onProgress?.(0, total)
  for (const key of e.slots.keys()) {
    const slot = e.slots.get(key)
    if (slot) slotsById[key] = slot.toJSON() as Slot
    done++
    // Fine cadence early (every 1k for the first 10k) so the bar moves promptly, then
    // coarser (every chunkSize) to avoid flooding setState on huge docs.
    const step = done < 10_000 ? 1000 : chunkSize
    if (done % step === 0) {
      onProgress?.(done, total)
      await yieldToUi()
    }
  }
  onProgress?.(total, total)
  return {
    meta: md.meta.size > 0 ? (md.meta.toJSON() as MissionMeta) : null,
    factionsById: e.factions.toJSON() as Record<ID, Faction>,
    squadsById: e.squads.toJSON() as Record<ID, Squad>,
    slotsById,
    loadoutsById: e.loadouts.toJSON() as Record<ID, Loadout>,
    itemsById: e.items.toJSON() as Record<ID, InventoryItem>,
    objectivesById: e.objectives.toJSON() as Record<ID, Objective>,
    vehiclesById: e.vehicles.toJSON() as Record<ID, Vehicle>,
    markersById: e.markers.toJSON() as Record<ID, MapMarker>,
    editorLayersById: e.editorLayers.toJSON() as Record<ID, EditorLayer>,
  }
}

// Bulk-sync window (T-060): while open, observer flushes are deferred so a boot
// burst (IndexedDB replay + seed + hydrate) coalesces into ONE store snapshot at
// endBulkSync instead of pushing several full snapshots back-to-back (the 10k+
// load freeze). Module-level singletons are safe given the single-doc invariant
// (one mounted editor doc at a time, like LOCAL_ORIGIN). `activeFlush` is the sync
// flush for normal post-load edits; `activeBulkFlush` is the async, chunked flush
// used once at endBulkSync (T-060.1, so a 300k snapshot reports progress instead of
// blocking). Both cleared on unbind so a stray end is a no-op.
let bulkDepth = 0
let bulkPending = false
let activeFlush: (() => void) | null = null
let activeBulkFlush: ((onProgress?: (done: number, total: number) => void) => Promise<void>) | null =
  null

export function beginBulkSync(): void {
  bulkDepth++
}

/** Close the bulk window; on the final close with pending changes, run the ONE coalesced
 *  flush via the async chunked snapshot (reports progress for the load overlay). Returns a
 *  Promise so the caller can defer `docStatus: ready` until the snapshot is in the store. */
export function endBulkSync(onProgress?: (done: number, total: number) => void): Promise<void> {
  if (bulkDepth > 0) bulkDepth--
  if (bulkDepth === 0 && bulkPending) {
    bulkPending = false
    return activeBulkFlush?.(onProgress) ?? Promise.resolve()
  }
  return Promise.resolve()
}

export function bindStoreToDoc(md: MissionDoc): () => void {
  const maps = trackedTypes(md)

  let scheduled = false
  const flush = () => {
    scheduled = false
    useMapStore.getState()._applySnapshot(docToSnapshot(md))
  }
  const bulkFlush = async (onProgress?: (done: number, total: number) => void) => {
    useMapStore.getState()._applySnapshot(await docToSnapshotWithProgress(md, onProgress))
  }
  activeFlush = flush
  activeBulkFlush = bulkFlush
  const observer = () => {
    // Inside a bulk window, just mark dirty — endBulkSync does the single flush.
    if (bulkDepth > 0) {
      bulkPending = true
      return
    }
    if (scheduled) return
    scheduled = true
    queueMicrotask(flush)
  }

  for (const m of maps) m.observeDeep(observer)
  // Prime the store with whatever is already loaded — but respect an open bulk
  // window (the lifecycle effect opens it before binding) so an empty initial
  // prime doesn't flush mid-boot.
  if (bulkDepth > 0) bulkPending = true
  else flush()

  return () => {
    for (const m of maps) m.unobserveDeep(observer)
    if (activeFlush === flush) activeFlush = null
    if (activeBulkFlush === bulkFlush) activeBulkFlush = null
  }
}
