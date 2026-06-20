// Left panel — "Placed Entities" as an Eden-style recursive tree (Ultra Plan §5.1),
// now bound to the live Y.Doc store. It renders the `editorLayers` folder hierarchy
// with the real slots filed inside each folder. Selecting a slot row selects it in
// global state and flies the camera to it; selecting a folder makes it the active
// drop target for new assets; the header "+" creates a new folder. Reparent drag-and-
// drop between folders is the remaining piece for a later pass.

import { useMemo } from 'react'
import { Folder, FolderPlus, User } from 'lucide-react'
import { addEditorLayer, useMapStore } from '@/features/tactical-map'
import type { EditorLayer, ID, MissionDoc, Slot } from '@/features/tactical-map'
import { cn } from '@/lib/utils'
import { overlayPanel } from '../overlay'
import { TreeView, type TreeNodeData } from '../tree/TreeView'

interface OutlinerPanelProps {
  md: MissionDoc
  /** Centre the camera on a world position (from the map's imperative API). */
  flyTo: (world: { x: number; y: number }) => void
  /** Double-click a slot row → open its Attributes modal. */
  onActivateSlot?: (id: ID) => void
}

/** Build the recursive tree: each EditorLayer → a folder node containing its child
 *  folders then its placed slots. Layers nest via parentId; null = root. */
function buildTree(
  layersById: Record<ID, EditorLayer>,
  slotsById: Record<ID, Slot>,
): TreeNodeData[] {
  const all = Object.values(layersById)
  const build = (layer: EditorLayer): TreeNodeData => {
    const childFolders = all
      .filter((l) => l.parentId === layer.id)
      .map(build)
    const entityNodes: TreeNodeData[] = layer.entityIds
      .map((eid) => slotsById[eid])
      .filter((s): s is Slot => Boolean(s))
      .map((s) => ({
        id: s.id,
        label: s.role || 'Unit',
        icon: User,
        ...(s.tag ? { badge: s.tag } : {}),
      }))
    return {
      id: layer.id,
      label: layer.name,
      icon: Folder,
      defaultExpanded: true,
      children: [...childFolders, ...entityNodes],
    }
  }
  return all.filter((l) => l.parentId === null).map(build)
}

export function OutlinerPanel({ md, flyTo, onActivateSlot }: OutlinerPanelProps) {
  const layersById = useMapStore((s) => s.editorLayersById)
  const slotsById = useMapStore((s) => s.slotsById)
  const selection = useMapStore((s) => s.selection)
  const activeLayerId = useMapStore((s) => s.activeLayerId)
  const setSelection = useMapStore((s) => s.setSelection)
  const setActiveLayer = useMapStore((s) => s.setActiveLayer)

  const nodes = useMemo(() => buildTree(layersById, slotsById), [layersById, slotsById])

  // Highlight the selected slot, or — when nothing is selected — the active folder.
  const selectedId = selection.kind === 'slot' ? selection.id : activeLayerId

  const onSelect = (id: string) => {
    if (layersById[id]) {
      setActiveLayer(id)
      return
    }
    const slot = slotsById[id]
    if (slot) {
      setSelection({ kind: 'slot', id })
      flyTo(slot.position)
    }
  }

  const onActivate = (id: string) => {
    if (slotsById[id]) onActivateSlot?.(id)
  }

  const newFolder = () => setActiveLayer(addEditorLayer(md))

  return (
    <div className={cn(overlayPanel, 'flex h-full w-60 flex-col overflow-hidden')}>
      <div className="flex shrink-0 items-center justify-between border-b border-white/5 px-3 py-2">
        <span className="text-label-sm uppercase tracking-wider text-outline">
          Placed Entities
        </span>
        <button
          type="button"
          aria-label="New folder"
          title="New folder"
          onClick={newFolder}
          className="rounded p-0.5 text-on-surface-variant transition-colors hover:bg-primary/15 hover:text-primary"
        >
          <FolderPlus className="size-3.5" />
        </button>
      </div>
      <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto p-2">
        {nodes.length === 0 ? (
          <p className="px-2 py-4 text-center text-label-sm normal-case text-outline">
            No entities yet. Drag an asset from the right panel onto the map.
          </p>
        ) : (
          <TreeView
            nodes={nodes}
            selectedId={selectedId}
            onSelect={onSelect}
            onActivate={onActivate}
          />
        )}
      </div>
    </div>
  )
}
