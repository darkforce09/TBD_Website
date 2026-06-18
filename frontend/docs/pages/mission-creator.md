# Mission Creator (Setup Wizard)

## Status

`doc-complete`

## Summary

- **What:** Wizard to initialize a new mission before 2D canvas editing.
- **Why:** Authors set terrain, time, weather before map work.
- **Route:** `/missions/create`
- **Stitch reference:** `frontend/stitch-exports/mission_creator_setup_wizard/code.html`
- **Min role:** `mission_maker`
- **Blueprint ref:** Handoff §3 Mission Library

## Element Inventory

| # | Element | Type | Text / Content | Purpose | Data source |
|---|---------|------|----------------|---------|-------------|
| 1 | Page H1 | h1 | Initialize New Mission | Title | Static |
| 2 | Subtitle | p | Define environment parameters before launching the 2D Editor Canvas. | Context | Static |
| 3 | Op name label | label | Operation Name | Form | Static |
| 4 | Op name input | input | Enter operation designation... | Title field | Form state |
| 5 | Terrain label | label | Select Terrain | Form | Static |
| 6 | Terrain card | radio | Everon 51 km² | Terrain option | `everon` |
| 7 | Terrain card | radio | Arland 16 km² | Terrain option | `arland` |
| 8 | Time label | label | Insertion Time | Form | Static |
| 9 | Time slider | range | 00:00–24:00 | Time of day | Form state |
| 10 | Time display | span | 14:00 | Current slider value | Computed |
| 11 | Weather label | label | Weather Conditions | Form | Static |
| 12 | Weather select | select | Clear / Overcast / Rain / Fog | Weather | `WeatherType` enum |
| 13 | Submit btn | button | Initialize 2D Canvas | Create + open editor | `POST /missions` T-003 |

## Behavior

- ProtectedRoute `mission_maker`.
- Submit creates draft mission then stubs editor (T-003).

## API Dependencies

| Endpoint | Method | When | Response |
|----------|--------|------|----------|
| `POST /missions` | POST | Submit wizard | `Mission` |

## Milestones

### M1 — [x] Route protected
### M2 — [ ] Wizard form static + zod validation
### M3 — [ ] POST /missions on submit
### M4 — [ ] Editor navigation (T-003)

## Test Plan

1. Enlisted user → cannot access route.
2. Mission maker → form renders all fields.
3. Submit with invalid name → validation errors.

## Open Questions / Blockers

- [T-003](TRACKING.md)
