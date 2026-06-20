// Full-bleed route shell for the 2D Mission Creator. Phase 3 frames the live map
// with the Aegis-glass application shell (Ultra Plan §5): Top Command Strip,
// Left Outliner, Right Inspector, Bottom Toolbelt — all wired to the Phase-4 Y.Doc
// state. The route carries the `fullBleed` handle so AppLayout runs it full-height.

import { useCallback, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  TacticalMap,
  moveEntity,
  useMapStore,
  type TacticalMapApi,
} from '@/features/tactical-map'
import { useMissionDoc } from './hooks/useMissionDoc'
import { TopCommandStrip } from './layout/TopCommandStrip'
import { BottomToolbelt } from './layout/BottomToolbelt'
import { OutlinerPanel } from './layout/LeftOutliner/OutlinerPanel'
import { InspectorPanel } from './layout/RightInspector/InspectorPanel'
import { FpsCounter } from './FpsCounter'

export default function MissionCreatorPage() {
  const { id } = useParams<{ id: string }>()
  const { md, undo } = useMissionDoc(id)

  const [mapApi, setMapApi] = useState<TacticalMapApi | null>(null)
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null)

  // Click empty map with a slot selected → reposition it. (Placement is via the
  // Asset Browser; the Toolbelt no longer places — Ultra Plan §5.3.)
  const onMapClick = useCallback(
    (world: { x: number; y: number }) => {
      const { selection } = useMapStore.getState()
      if (selection.kind === 'slot' && selection.id) {
        moveEntity(md, 'slots', selection.id, world)
      }
    },
    [md],
  )

  return (
    <div className="relative h-full w-full overflow-hidden bg-background">
      {/* Full-bleed map behind everything. */}
      <TacticalMap
        terrain="everon"
        className="absolute inset-0 z-0"
        onMapClick={onMapClick}
        onCursorMove={setCursor}
        onReady={setMapApi}
      />

      {/* Floating overlay layer: spans the screen and ignores pointer events so
          empty space (incl. the padded gaps) pans the map; each panel re-enables
          hits via `pointer-events-auto` in the `overlayPanel` recipe. */}
      <div className="pointer-events-none absolute inset-0 z-10">
        <div className="absolute inset-x-4 top-4">
          <TopCommandStrip md={md} undo={undo} />
        </div>

        <div className="absolute bottom-[5.5rem] left-4 top-[4.75rem]">
          <OutlinerPanel md={md} flyTo={mapApi?.flyTo} />
        </div>

        <div className="absolute bottom-[5.5rem] right-4 top-[4.75rem]">
          <InspectorPanel md={md} flyTo={mapApi?.flyTo} />
        </div>

        <div className="absolute bottom-5 left-1/2 -translate-x-1/2">
          <BottomToolbelt cursorWorld={cursor} />
        </div>

        <FpsCounter />
      </div>
    </div>
  )
}
