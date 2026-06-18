# Mission Overview

## Status

`doc-complete`

## Summary

- **What:** Detail page for a single mission: lore, map, armory, ORBAT, actions.
- **Why:** Players and authors review mission before play or edit.
- **Route:** `/missions/:id`
- **Stitch reference:** `frontend/stitch-exports/operation_enduring_freedom_mission_overview/code.html`
- **Min role:** `public-nav`
- **Blueprint ref:** —

## Element Inventory

| # | Element | Type | Text / Content | Purpose | Data source |
|---|---------|------|----------------|---------|-------------|
| 1 | Page H1 | h1 | {mission.title} | Title | `GET /missions/:id` |
| 2 | Meta pill | span | by {author} | Author | `mission.author` |
| 3 | Meta pill | span | Terrain: {terrain} | Map | `mission.terrain` |
| 4 | Meta pill | span | v{version} | Version | `mission.version` |
| 5 | Lore paragraph | p | Briefing text | Narrative | `mission.description` |
| 6 | Map preview | div | Topographic image | 2D preview | `json_payload` thumb |
| 7 | Fullscreen btn | button | Fullscreen Map | Expand map | Client |
| 8 | Armory section | h2 | The Armory | Loadout | Static |
| 9 | Faction tabs | tabs | US / USSR / FIA | Armory filter | `GET /missions/:id/armory` |
| 10 | Armory item | row | Weapon + qty | Assets | `MissionArmory` |
| 11 | Command actions | h2 | Command Actions | Author tools | Static |
| 12 | Editor btn | button | Launch 2D Mission Editor | Open editor | T-003 stub |
| 13 | Planner btn | button | Open Tactical Planner | External | Future |
| 14 | AAR btn | button | View AAR Replay | Disabled until live | `aar_replay_url` |
| 15 | ORBAT section | h2 | Order of Battle | Slots | `GET /events/:id/orbat` or static |
| 16 | ORBAT row | row | Squad name fill | Slot status | `OrbatSlot` |

## API Dependencies

| Endpoint | Method | When | Response |
|----------|--------|------|----------|
| `GET /missions/:id` | GET | Auth | `Mission` |
| `GET /missions/:id/armory` | GET | Auth | `MissionArmory` |

## Milestones

### M1 — [x] Route `/missions/:id`
### M2 — [ ] Full Stitch layout static
### M3 — [ ] Mission + armory hooks
### M4 — [ ] Editor button gated by role

## Test Plan

1. Navigate to `/missions/1` → title and sections render.
2. Breadcrumb shows Mission Hub / {title}.
3. Editor button shows T-003 notice for non-makers.

## Open Questions / Blockers

- [T-003](TRACKING.md): 2D editor not built.
