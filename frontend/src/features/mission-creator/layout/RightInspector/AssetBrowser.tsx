// Right-panel default (Ultra Plan §5.2): the Asset Browser as a nested, collapsible
// Eden-style tree (Faction → Category → Class), NOT flat pills. Leaves are draggable:
// dragging one onto the <TacticalMap> places a slot at the drop point (Phase 7). The
// catalog is still mock; the registry-backed feed (GET /api/v1/registry) lands later.

import { useState } from 'react'
import { ASSET_DND_MIME } from '@/features/tactical-map'
import type { AssetDropPayload } from '@/features/tactical-map'
import { TreeView, type TreeNodeData } from '../tree/TreeView'
import { ASSET_CATALOG } from './assetCatalogMock'

export function AssetBrowser() {
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const onNodeDragStart = (node: TreeNodeData, e: React.DragEvent) => {
    const payload: AssetDropPayload = { assetId: node.id, role: node.label, kind: 'slot' }
    e.dataTransfer.setData(ASSET_DND_MIME, JSON.stringify(payload))
    e.dataTransfer.effectAllowed = 'copy'
  }

  return (
    <div className="flex flex-col gap-2">
      <header>
        <h2 className="text-headline-sm text-on-surface">Asset Browser</h2>
        <p className="text-label-sm normal-case text-outline">
          Drag an asset onto the map to place it.
        </p>
      </header>
      <TreeView
        nodes={ASSET_CATALOG}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onNodeDragStart={onNodeDragStart}
      />
    </div>
  )
}
