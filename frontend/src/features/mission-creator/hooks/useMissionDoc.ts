// Mission Y.Doc lifecycle for the mounted route :id (precursor to the Phase-9
// useMissionEditor, which adds backend hydrate/autosave). Phase 4 is local-only:
// create the doc, make it durable via y-indexeddb, attach undo, and bind it to the
// Zustand mirror — tearing all of it down on unmount / id change. When the IndexedDB
// snapshot loads, its inserts flow through observeDeep into the store automatically,
// so no extra "ready" plumbing is needed.

import { useEffect, useMemo, useRef, useState } from 'react'
import { IndexeddbPersistence } from 'y-indexeddb'
import {
  bindStoreToDoc,
  createMissionDoc,
  createUndoManager,
  seedDefaultLayer,
  seedMeta,
  useMapStore,
  type MissionDoc,
  type UndoController,
} from '@/features/tactical-map'

export interface MissionDocHandle {
  md: MissionDoc
  undo: UndoController
}

export interface UseMissionDocOptions {
  /** Fired once after the IndexedDB snapshot has synced and defaults are seeded — the
   *  hook point for backend hydrate / conflict checks (Phase 9 useMissionEditor). */
  onSynced?: (md: MissionDoc) => void
}

export function useMissionDoc(
  missionId: string | undefined,
  options?: UseMissionDocOptions,
): MissionDocHandle {
  // Keep the latest onSynced without re-running the lifecycle effect.
  const onSyncedRef = useRef(options?.onSynced)
  useEffect(() => {
    onSyncedRef.current = options?.onSynced
  })

  // One doc + undo manager per mission id; recreated if the id changes — or if `instanceKey`
  // is bumped on teardown (StrictMode fix below).
  const missionKey = missionId ?? 'draft'
  const [instanceKey, setInstanceKey] = useState(0)
  // Bump-once guard: the effect below depends on the recreated `md`/`undo`, so an unconditional
  // bump in cleanup would re-trigger itself forever. StrictMode's single setup→cleanup→setup
  // needs exactly one fresh instance, so allow the bump at most once per mount.
  const recreatedRef = useRef(false)
  const { md, undo, dbName } = useMemo(() => {
    const md = createMissionDoc()
    return {
      md,
      undo: createUndoManager(md),
      dbName: `tbd-mission-${missionKey}`,
    }
    // `instanceKey` is intentionally a dep with no body reference: bumping it on teardown is
    // how we force a fresh doc/undo after StrictMode destroys the previous one.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [missionKey, instanceKey])

  useEffect(() => {
    const unbind = bindStoreToDoc(md)
    const persistence = new IndexeddbPersistence(dbName, md.doc)
    // Once the local snapshot has loaded, seed defaults if this is a fresh mission
    // (non-tracked origin → not an undo step). New keys flow in via observeDeep.
    persistence.once('synced', () => {
      seedMeta(md, { id: missionKey, title: 'Untitled Mission' })
      seedDefaultLayer(md)
      onSyncedRef.current?.(md)
    })

    return () => {
      unbind()
      undo.destroy()
      persistence.destroy()
      md.doc.destroy()
      useMapStore.getState().reset()
      // React 19 StrictMode (dev) double-invokes this effect setup→cleanup→setup WITHOUT
      // re-running the useMemo above, so the second setup would re-bind this now-destroyed
      // doc + UndoManager (undo silently dead → canUndo() always false). Bump instanceKey so
      // useMemo allocates a fresh md + UndoController before the next setup. Once per mount:
      // a real missionKey change already recreates via the memo dep; on true unmount the guard
      // avoids a setState-after-unmount.
      if (!recreatedRef.current) {
        recreatedRef.current = true
        setInstanceKey((k) => k + 1)
      }
    }
  }, [md, undo, dbName, missionKey])

  return { md, undo }
}
