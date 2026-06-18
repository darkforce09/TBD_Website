# Frontend Deferred Work — TRACKING

Open this file anytime to see what is blocked and what remains. Update when blockers are resolved.

| ID | Item | Blocked by | Owner | Doc link | Notes |
|----|------|------------|-------|----------|-------|
| T-001 | **Server Control** (`/admin/server`) | No Stitch export; no admin server/RCON API | Backend + Frontend | [pages/server-control.md](pages/server-control.md) | Sidebar link exists; stub page references this ID |
| T-002 | **Discord OAuth redirect** | Backend returns JSON at callback; needs `FRONTEND_URL` → `/auth/callback` | Backend | [auth/auth-callback.md](auth/auth-callback.md) | Login scaffold only until fixed |
| T-003 | **2D Mission Editor canvas** | No Stitch export; large feature | Frontend | [pages/mission-creator.md](pages/mission-creator.md), [pages/mission-overview.md](pages/mission-overview.md) | "Initialize 2D Canvas" / "Launch 2D Mission Editor" stubbed |
| T-004 | **Personnel Roster API** | `GET /admin/users` not in handlers.go | Backend | [pages/personnel-roster.md](pages/personnel-roster.md) | UI spec complete; hook returns empty |
| T-005 | **Audit Logs API** | `GET /admin/audit-logs` not in handlers.go | Backend | [pages/audit-logs.md](pages/audit-logs.md) | Terminal UI spec complete |
| T-006 | **Backend CORS** | No CORS middleware in Go | Backend | — | Dev uses Vite proxy; production needs CORS |
| T-007 | **CMS rich text editor** | WYSIWYG not chosen (Tiptap/Lexical) | Frontend | [pages/content-manager.md](pages/content-manager.md) | Stitch shows toolbar; textarea stub in M2 |
| T-008 | **Wiki markdown renderer** | `react-markdown` not integrated | Frontend | [pages/wiki.md](pages/wiki.md) | Static HTML in M2; markdown in M4 |
| T-009 | **Multi-server picker** | Single server `TBD Main` assumed | Frontend | [pages/server-intel.md](pages/server-intel.md) | `GET /servers` returns many; UI picks first |

## Resolution log

| Date | ID | Resolution |
|------|-----|------------|
| | | |
