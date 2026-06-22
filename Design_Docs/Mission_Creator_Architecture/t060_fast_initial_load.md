# T-060 — Fast load + save at scale (hydrate gate + progress UX)

**Status:** planned (T-060 — next slice)
**Git tag on ship:** T-060
**Authority:** [MC ROADMAP](ROADMAP.md) §Map performance · [agent_execution.md](agent_execution.md) §ACTIVE SLICE

**Prerequisites:** **T-057–T-059** shipped. **Validated (2026-06):** **360k objects @ 100+ fps** pan; repeat **6k paste** smooth.

**Active blockers:**
1. **Load** — opening `/missions/:id/edit` with **10k+** slots is slow; **no loading bar**; shell looks frozen.
2. **Save** — **Save Version** runs synchronous `compileMission` + `JSON.stringify` + POST on the main thread; likely slow at **100k+** with no progress UX (only `"Saving…"` text in the dialog today).

**North-star targets (ideal — design toward these):**

| Operation | Entity scale | Target |
|-----------|--------------|--------|
| **Open editor** (IndexedDB → interactive) | **1M** slots | **≤10 s** with **determinate progress bar** |
| **Save Version** (compile → POST) | **1M** slots | **≤10 s** with **determinate progress bar** |

T-060 delivers the **UX + main-thread quick wins** (coalesce, gate, progress). Hitting **1M in ≤10 s** may require **T-062** (incremental bindings) + **T-066** (worker compile) — T-060 must not block on those but must **spec the progress contract** and measure baseline.

---

## Goal

Make **load** and **Save Version** **visible and fast enough** at scale — user always sees a **progress bar** (not a frozen shell), and boot/save time improves for **10k–360k** immediately.

**Acceptance (T-060 — minimum ship):**

**Load**
- **10k+** slots: **loading overlay + progress bar** appears on first paint (before map is interactive).
- Progress shows phase + count — e.g. `Loading mission…` + **OBJ** rising and/or bar percent when measurable.
- **bindings** coalesces IndexedDB replay → **one** `docToSnapshot` flush (not N during Yjs replay).
- `hydrateMissionDoc` (server) wrapped in same bulk coalesce.
- Optional: defer `LeftSidebar` until `docReady`.
- After load: pan **≥55 fps** at loaded count (regression guard).

**Save**
- **Save Version** shows **determinate or staged progress bar** (not just `"Saving…"` label) — phases: `Compiling…` → `Uploading…`.
- Save runs without **hard-freezing** the tab at **50k+** (yield between compile chunks if needed, or move compile to worker stub with progress callbacks — prefer chunked main-thread first).
- Export download uses same compile path — show progress if compile > ~500 ms.

**Engineering**
- `cd frontend && npm run build && npm run lint` clean.

**Stretch (document measured baseline; follow-up T-062/T-066 if missed):**
- **360k** load: target **≤5 s** to interactive on dev hardware.
- **1M** load/save: **≤10 s** ideal (may need worker + incremental snapshot in later tags).

---

## Root cause — load

Boot ([`useMissionDoc.ts`](../../frontend/src/features/mission-creator/hooks/useMissionDoc.ts)):

- `bindStoreToDoc` → immediate `docToSnapshot` + `observeDeep` flushes during IndexedDB replay.
- Each flush: `slots.toJSON()` → 360k plain objects on main thread.
- Full shell mounts with no `docReady` gate.

## Root cause — save

Save ([`useMissionEditor.ts`](../../frontend/src/features/mission-creator/hooks/useMissionEditor.ts) + [`compile.ts`](../../frontend/src/features/mission-creator/compiler/compile.ts)):

- `compileMission(useMapStore.getState())` — `Object.values` over all factions/squads/slots; builds full `orbat[]` + `editor.slots[]` (**O(n)** allocations).
- `api.post(..., { payload })` — axios serializes entire payload (**O(n)** JSON.stringify on main thread).
- **No progress** — `TopCommandStrip` only toggles `saving` boolean + button text.

At **1M** slots, compile + stringify alone can exceed **10 s** on main thread without worker/chunking.

---

## Locked decisions

| Decision | Choice |
|----------|--------|
| Load gate | `docStatus: 'loading' \| 'ready'` from `useMissionDoc`; overlay blocks interaction until `ready` |
| Load progress | **Progress bar** (Aegis glass) + mono count (`OBJ` / `Loading… N objects`) |
| IDB coalesce | `beginBulkSync` / `endBulkSync` in `bindings.ts` — one flush after `persistence.once('synced')` |
| Save progress | Store slice `saveProgress: { phase: 'compile' \| 'upload'; percent: number } \| null` — **TopCommandStrip** Save dialog shows bar |
| Save compile | Phase A: chunked compile with `requestAnimationFrame` yields + progress updates; Phase B (if still >10s @ 360k): **Comlink worker** (pairs with T-066, optional in T-060 if Phase A insufficient) |
| Do not block load on API | Local IndexedDB `ready` → interactive; server hydrate async with existing conflict dialog |
| 1M ≤10 s ideal | Document as **north-star**; T-060 ships UX + coalesce; worker/incremental in T-062/T-066 if benchmarks miss |

---

## Implementation specification

### Load (same as prior spec)

**a.** `bindings.ts` — `beginBulkSync` / `endBulkSync`; skip observer flush while `bulkDepth > 0`.

**b.** `useMissionDoc.ts` — bulk wrap IDB lifecycle; export `docStatus`.

**c.** `MissionCreatorPage.tsx` — `MissionLoadOverlay` with **progress bar** + count.

**d.** `useMissionEditor.ts` — bulk-wrap `hydrateMissionDoc`.

**e.** Optional defer `LeftSidebar` until `docReady`.

### Save (new)

**f.** `useMapStore` or editor-local state — `saveProgress` for overlay/bar.

**g.** `compileMission` — export `compileMissionWithProgress(state, onProgress)` that reports percent (e.g. by squad batches) and yields every N slots via `queueMicrotask`/`rAF` so UI updates.

**h.** `useMissionEditor.saveVersion` — set progress phases; compile → upload; clear on done/error.

**i.** `TopCommandStrip` Save dialog — replace text-only `Saving…` with **progress bar** bound to `saveProgress`.

**j.** Optional: `exportJson` reuses compile progress for large missions.

---

## Verification

1. `npm run build && npm run lint` — clean.
2. **360k** mission: load overlay + bar immediately; completes; OBJ correct; pan ≥55 fps.
3. **Save Version** on **50k+**: progress bar visible; tab responsive; version POST succeeds.
4. Small mission: load/save feel instant (bar may flash).
5. Record baseline timings in spec §Shipped when done (load ms, save ms @ 360k).

---

## Documentation sync (same commit — T-060)

| Doc | Update |
|-----|--------|
| [`CLAUDE.md`](../../CLAUDE.md) §Status | T-060 bullet (load + save); Next → T-061 |
| [`ROADMAP.md`](ROADMAP.md) | T-060 row (load + save, ≤10s @ 1M ideal); Next → T-061 |
| [`agent_execution.md`](agent_execution.md) | Decisions log; ACTIVE SLICE → T-061 |
| [`feature_inventory.md`](feature_inventory.md) | PERF-LOAD-001 + PERF-SAVE-001 |
| [`mission-editor.md`](../../frontend/docs/pages/mission-editor.md) | M3.15; PERF-003 load + PERF-004 save |

---

## After T-060

**T-061:** typed-array IconLayer. **T-062:** incremental bindings (load path). **T-066:** worker compile (save @ 1M). **Eden T-068+.**
