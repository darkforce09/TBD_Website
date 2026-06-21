# Backend — ROADMAP

**Start here.** Planning view for the Go API — what is **shipped**, what is **deferred**, and links to all backend documentation and code.

**Code:** [`cmd/api/`](../../cmd/api/) · **Contract:** [`internal/models/`](../../internal/models/) (GORM JSON tags = API shape)

---

## Documentation (read from here)

| Doc | When to open it |
|-----|-----------------|
| **[`docs/backend/architecture.md`](architecture.md)** | Target schema + design (verify vs live models post T-008) |
| **[`DEV_RUNBOOK.md`](../../DEV_RUNBOOK.md)** | db-up, api, web, dev-login, test-it, seeds |
| **[`docs/platform/registration_flow.md`](../platform/registration_flow.md)** | ORBAT registration design (**implemented** T-008–T-010) |
| **[`docs/platform/context_handoff.md`](../platform/context_handoff.md)** | Original product blueprint (§3 partially stale) |
| **[`CLAUDE.md`](../../CLAUDE.md)** | T-0xx milestones, auth tiers, doc-on-commit rule |
| **[`docs/TAGS.md`](../TAGS.md)** | T-0xx vs FD-0xx glossary |

---

## DONE — shipped API areas

| Area | Models | Handlers | Notes |
|------|--------|----------|-------|
| **Auth** | `user.go` | `auth.go`, `dev.go` | Discord OAuth2, JWT + rotating refresh |
| **Missions** | `mission.go` | `missions.go` | Library, versions, export, armory, approvals |
| **Events / ORBAT** | `event.go` | `events.go` | Campaign refactor T-008; `event_missions`, auto-ORBAT |
| **Registrations** | `event.go` | `events.go` | Per-mission slots, squad reserve T-010 |
| **Telemetry** | `telemetry.go` | `telemetry.go` | Service-token ingest |
| **Leaderboards** | — | `leaderboards.go` | Materialized view |
| **Wiki / CMS** | `content.go` | `wiki.go`, `content.go` | Doctrine + admin CMS |
| **Vehicles** | — | `vehicles.go` | Vehicle database |
| **Admin** | `admin.go` | `admin.go` | Personnel, audit logs |
| **Realtime** | — | SSE hub in `internal/realtime/` | |

**Migrations:** [`internal/db/migrations/`](../../internal/db/migrations/) · **Seeds:** [`internal/db/seeds/`](../../internal/db/seeds/) (`make seed` = Discord roles only)

---

## NOT DONE — deferred

| ID | Item | Blocked by | Notes |
|----|------|------------|-------|
| BE-001 | **`GET /api/v1/registry`** | Game/modpack ingest pipeline | MC Track B — classnames, icons, categories |
| BE-002 | **Server control / RCON API** | Game server bridge | Frontend FD-001 |
| BE-003 | **Per-handler API reference doc** | — | Deferred: future `docs/backend/api.md` |
| BE-004 | **Live game-server telemetry bridge** | Service deployment | Ingest endpoints exist; no bridge wired |

---

## Recommended next work

1. **BE-001** — minimal registry JSON endpoint (unblocks MC Track B)
2. **BE-002** — when RCON/game-server integration is scoped
3. Keep **`internal/models/`** as source of truth — update TS types in [`frontend/src/types/`](../../frontend/src/types/) when models change

---

## Verify changes

```bash
make db-up
PATH="/var/home/Samuel/.local/go/bin:$PATH" make api
curl -sf http://localhost:8080/api/v1/health
# dev-login: http://localhost:8080/api/v1/auth/dev-login?role=admin
make test-it
```

API contract smoke: hit endpoint, confirm JSON matches GORM tags + frontend types.
