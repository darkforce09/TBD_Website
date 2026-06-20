// Mission Y.Doc lifecycle for the mounted route :id (precursor to the Phase-9
// useMissionEditor, which adds backend hydrate/autosave). Phase 4 is local-only:
// create the doc, make it durable via y-indexeddb, attach undo, and bind it to the
// Zustand mirror — tearing all of it down on unmount / id change. When the IndexedDB
// snapshot loads, its inserts flow through observeDeep into the store automatically,
// so no extra "ready" plumbing is needed.

import { useEffect, useMemo } from 'react'
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

export function useMissionDoc(missionId: string | undefined): MissionDocHandle {
  // One doc + undo manager per mission id; recreated if the id changes.
  const { md, undo, dbName } = useMemo(() => {
    const md = createMissionDoc()
    return {
      md,
      undo: createUndoManager(md),
      dbName: `tbd-mission-${missionId ?? 'draft'}`,
    }
  }, [missionId])

  useEffect(() => {
    const unbind = bindStoreToDoc(md)
    const persistence = new IndexeddbPersistence(dbName, md.doc)
    // Once the local snapshot has loaded, seed defaults if this is a fresh mission
    // (non-tracked origin → not an undo step). New keys flow in via observeDeep.
    persistence.once('synced', () => {
      seedMeta(md, { id: missionId ?? 'draft', title: 'Untitled Mission' })
      seedDefaultLayer(md)
    })

    return () => {
      unbind()
      undo.destroy()
      persistence.destroy()
      md.doc.destroy()
      useMapStore.getState().reset()
    }
  }, [md, undo, dbName, missionId])

  return { md, undo }
}
