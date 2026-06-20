// Public barrel — the engine's only import surface. Consumers (the Mission Creator
// today, the Mission Planner later) import from here, never from internal paths.

export { TacticalMap } from './TacticalMap'
export { useMapContext } from './context/MapContext'
export { getTerrain, TERRAINS, DEFAULT_TERRAIN } from './coords/terrains'
export type { TerrainDef, TerrainId } from './coords/terrains'
export type { MapViewState, TacticalMapProps } from './types'
