# Frontend — ROADMAP

**Start here.** Planning view for the React SPA — what is **shipped**, what is **deferred**, and links to every surface doc.

**Code:** [`frontend/src/`](../../frontend/src/) · **Routes:** [`frontend/src/router.tsx`](../../frontend/src/router.tsx)

---

## Documentation (read from here)

| Doc | When to open it |
|-----|-----------------|
| **[`frontend/docs/INDEX.md`](../../frontend/docs/INDEX.md)** | Per-route surface specs (28 pages) |
| **[`frontend/docs/TRACKING.md`](../../frontend/docs/TRACKING.md)** | FD-0xx deferred backlog |
| **[`frontend/docs/THEME.md`](../../frontend/docs/THEME.md)** | Aegis tokens in use |
| **[`frontend/docs/_template.md`](../../frontend/docs/_template.md)** | Template for new page docs |
| **[Mission Creator ROADMAP](../../Design_Docs/Mission_Creator_Architecture/ROADMAP.md)** | 2D editor Tracks A/B/C |
| **[`docs/platform/macos_ux_architecture.md`](../platform/macos_ux_architecture.md)** | Split-pane / frictionlessness methodology |
| **[`CLAUDE.md`](../../CLAUDE.md)** | Agent runtime, T-0xx status, doc-on-commit rule |
| **[Archive](../archive/README.md)** | Historical stitch/blueprint HTML (reference only) |

---

## DONE — shipped surfaces

All routes below have a surface spec unless noted. Live UI = `frontend/src/pages` + `features/`.

| Route | Doc | Notes |
|-------|-----|-------|
| `/` | [dashboard.md](../../frontend/docs/pages/dashboard.md) | Glass bento home |
| `/login`, `/auth/callback` | [login.md](../../frontend/docs/auth/login.md), [auth-callback.md](../../frontend/docs/auth/auth-callback.md) | Discord OAuth + dev-login |
| `/server-intel` | [server-intel.md](../../frontend/docs/pages/server-intel.md) | |
| `/announcements` | [announcements.md](../../frontend/docs/pages/announcements.md) | Live: `operations.tsx` |
| `/deployments` | [deployments.md](../../frontend/docs/pages/deployments.md) | Live: `operations.tsx` |
| `/leaderboards` | [leaderboards.md](../../frontend/docs/pages/leaderboards.md) | Live: `operations.tsx` |
| `/missions` | [mission-library.md](../../frontend/docs/pages/mission-library.md) | |
| `/missions/:id` | [mission-overview.md](../../frontend/docs/pages/mission-overview.md) | Sheet dossier |
| `/missions/create` | [mission-creator.md](../../frontend/docs/pages/mission-creator.md) | Setup wizard → edit route |
| `/missions/:id/edit` | [mission-editor.md](../../frontend/docs/pages/mission-editor.md) | **in-progress** — Eden editor shipped; DEM/registry blocked |
| `/events` | [event-schedule.md](../../frontend/docs/pages/event-schedule.md) | SplitPane; Live: `operations.tsx` |
| `/events/:id` | [event-hub.md](../../frontend/docs/pages/event-hub.md) | Inline ORBAT |
| `/events/:id/missions/:emid/orbat` | [event-hub.md § ORBAT deep-link](../../frontend/docs/pages/event-hub.md) | |
| `/wiki`, `/wiki/:slug` | [wiki.md](../../frontend/docs/pages/wiki.md) | Doctrine SOPs |
| `/vehicles` | [vehicle-database.md](../../frontend/docs/pages/vehicle-database.md) | Split from wiki |
| `/modpacks` | [modpacks.md](../../frontend/docs/pages/modpacks.md) | |
| `/tools/mortar` | [mortar-calculator.md](../../frontend/docs/pages/mortar-calculator.md) | |
| `/settings` | [settings.md](../../frontend/docs/pages/settings.md) | |
| `/admin/events` | [event-manager.md](../../frontend/docs/pages/event-manager.md) | |
| `/admin/approvals` | [mission-approvals.md](../../frontend/docs/pages/mission-approvals.md) | |
| `/admin/server` | [server-control.md](../../frontend/docs/pages/server-control.md) | **stub** — FD-001 |
| `/admin/personnel` | [personnel-roster.md](../../frontend/docs/pages/personnel-roster.md) | Live API |
| `/admin/content` | [content-manager.md](../../frontend/docs/pages/content-manager.md) | Nav: Comms Broadcaster |
| `/admin/audit` | [audit-logs.md](../../frontend/docs/pages/audit-logs.md) | Live API |
| `*` | [not-found.md](../../frontend/docs/pages/not-found.md) | |
| (shell) | [sidebar.md](../../frontend/docs/shell/sidebar.md), [topnav.md](../../frontend/docs/shell/topnav.md), [app-layout.md](../../frontend/docs/shell/app-layout.md) | |

---

## NOT DONE — deferred (FD-0xx)

| ID | Item | Doc | Blocked by |
|----|------|-----|------------|
| FD-001 | Server Control `/admin/server` | [server-control.md](../../frontend/docs/pages/server-control.md) | RCON/admin API |
| FD-003 | Mission editor completion | [mission-editor.md](../../frontend/docs/pages/mission-editor.md) | MC Track A/B (DEM, registry) |
| FD-007 | CMS rich text | [content-manager.md](../../frontend/docs/pages/content-manager.md) | WYSIWYG choice |
| FD-008 | Wiki markdown renderer | [wiki.md](../../frontend/docs/pages/wiki.md) | react-markdown |
| FD-009 | Multi-server picker | [server-intel.md](../../frontend/docs/pages/server-intel.md) | UI for `GET /servers` |

Full table: [`frontend/docs/TRACKING.md`](../../frontend/docs/TRACKING.md).

---

## Recommended next work

1. **FD-001** — when backend exposes server/RCON endpoints
2. **Mission editor Track A** — follow [MC ROADMAP](../../Design_Docs/Mission_Creator_Architecture/ROADMAP.md) phases 1–4 (terrain, DEM, Z)
3. **FD-008** — wiki markdown (low risk, high UX)
4. **FD-007** — CMS editor (admin-only)

---

## Design system

- **Live tokens:** [`frontend/src/index.css`](../../frontend/src/index.css)
- **Reference YAML:** [`Design_Docs/Mission_Creator_Mock_Up/aegis_tokens/DESIGN.md`](../../Design_Docs/Mission_Creator_Mock_Up/aegis_tokens/DESIGN.md)
- **Methodology:** [`docs/platform/macos_ux_architecture.md`](../platform/macos_ux_architecture.md)

Do not implement from archived stitch `code.html`.
