// <TacticalMap> — the Deck.gl root. Owns the OrthographicView state, assembles the
// layer array, and provides MapContext. Phase 1 renders only the procedural-grid
// base map; later phases append DEM, icon, line, polygon, viewshed and selection
// layers (Ultra Plan §4.3). Deck owns all entity rendering — React never draws
// per-entity DOM — which is what holds 60 fps with hundreds of slots.

import { useCallback, useMemo } from 'react'
import DeckGL from '@deck.gl/react'
import { getTerrain } from './coords/terrains'
import { useOrthographicView } from './view/useOrthographicView'
import { useBaseMapLayer } from './layers/useBaseMapLayer'
import { MapContextProvider, createMapContextValue } from './context/MapContext'
import { worldToPixel } from './coords/projection'
import type { MapViewState, TacticalMapProps } from './types'

export function TacticalMap({ terrain: terrainId, className }: TacticalMapProps) {
  const terrain = useMemo(() => getTerrain(terrainId), [terrainId])
  const { view, viewState, onViewStateChange } = useOrthographicView(terrain)
  const baseMap = useBaseMapLayer(terrain)

  const flyTo = useCallback(
    (world: { x: number; y: number }) => {
      const [px, py] = worldToPixel(terrain, world.x, world.y)
      onViewStateChange({ viewState: { ...viewState, target: [px, py] } })
    },
    [terrain, viewState, onViewStateChange],
  )

  const ctx = useMemo(
    () => createMapContextValue(terrain, flyTo),
    [terrain, flyTo],
  )

  return (
    <MapContextProvider value={ctx}>
      <div className={className ?? 'absolute inset-0'}>
        <DeckGL
          views={view}
          viewState={viewState}
          onViewStateChange={(params) =>
            onViewStateChange({ viewState: params.viewState as MapViewState })
          }
          controller={{ doubleClickZoom: false }}
          layers={[baseMap]}
          style={{ position: 'absolute', width: '100%', height: '100%' }}
        />
      </div>
    </MapContextProvider>
  )
}
