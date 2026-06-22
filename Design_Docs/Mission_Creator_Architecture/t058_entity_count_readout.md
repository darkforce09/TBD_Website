# T-058 — Toolbelt entity count readout (total + selected)

**Status:** planned (T-058 — next slice)
**Git tag on ship:** T-058
**Authority:** [MC ROADMAP](ROADMAP.md) §Map performance · [agent_execution.md](agent_execution.md)

---

## Goal

Show **how many slot entities are on the map** and **how many are selected** in the bottom toolbelt — scale-test telemetry before the T-059..T-063 performance program (100k+ north star). Without live counts, paste-doubling and scale verification are guesswork.

**Acceptance:**
- Bottom toolbelt displays **OBJ** `{total}` = count of entries in `slotsById` (all placed map slots).
- **SEL** `{n}` = `selection.ids.length` when `selection.kind === 'slot'`, else `0`.
- JetBrains Mono / `tabular-nums`, same glass toolbelt row as CUR/SEL X/Y/Z (T-049/T-050/T-057).
- Updates when slots are added/removed/pasted or selection changes; **does not** update on cursor move alone.
- `cd frontend && npm run build && npm run lint` clean.

**Scope:** slots only (vehicles/markers land in later P0 slices). No backend/schema change.

---

## Locked decisions

| Decision | Choice |
|----------|--------|
| Entity type | **Slots** in `slotsById` only — the only map-placed entity type today |
| Count source | Memoized `selectSlotCount(slotsById)` in `state/selectors.ts` (O(n) on snapshot change, not per frame) |
| Selection | Reuse existing `selection` slice — no new store field |
| Placement | Right of the X/Y/Z readout on `BottomToolbelt`, separated by a divider |
| Labels | **OBJ** (total on map) · **SEL** (selected count) — short mono labels matching CUR/SEL coord prefix pattern |

---

## Implementation

- `state/selectors.ts` — export `selectSlotCount` (memo1 over `slotsById` ref).
- `index.ts` — re-export `selectSlotCount`.
- `layout/BottomToolbelt.tsx` — subscribe to `slotsById` + `selection`; render OBJ/SEL block.

---

## After T-058

**T-059** — Scale-A: typed-array `IconLayer` data (5k–10k target). Proceed only when OBJ readout confirms entity totals during scale tests.
