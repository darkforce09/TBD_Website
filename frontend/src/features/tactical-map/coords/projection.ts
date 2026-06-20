// World (Arma meters) <-> canvas pixel conversions for the OrthographicView.
//
// Under COORDINATE_SYSTEM.CARTESIAN the Deck.gl "common space" already *is* the
// world space in meters, so an entity at world (x, y) is drawn at common (x, y).
// The only mismatch is the Y axis: Deck's screen-space Y grows downward, while
// Arma world Y (north) grows upward. We render with positions whose Y is flipped
// against the terrain height so that +Y on screen visually points north.
//
// These helpers are pure and allocation-light; they feed flyTo() and the live
// cursor read-out in later phases.

import type { TerrainDef } from './terrains'

/** World meters -> Deck common/pixel space (Y flipped so north is up on screen). */
export function worldToPixel(
  terrain: TerrainDef,
  x: number,
  y: number,
): [number, number] {
  return [x, terrain.height - y]
}

/** Inverse of worldToPixel: Deck common/pixel space -> world meters. */
export function pixelToWorld(
  terrain: TerrainDef,
  px: number,
  py: number,
): [number, number] {
  return [px, terrain.height - py]
}

/** Center of the terrain in pixel space — the default camera target. */
export function terrainCenterPixel(terrain: TerrainDef): [number, number] {
  return [terrain.width / 2, terrain.height / 2]
}
