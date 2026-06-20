# Dev Runbook — spin up the stack

Quick steps to bring up DB + API + Vite locally. See `CLAUDE.md` for full context.

## Start everything

```bash
# 1. Postgres (port 5434) — quick, run in foreground
make db-up

# 2. Go API on :8080 — IMPORTANT: go is NOT on PATH, prepend it.
#    Run in background; it compiles + migrates on boot.
PATH="/var/home/Samuel/.local/go/bin:$PATH" make api

# 3. Vite dev server on :5173 (proxies /api -> :8080) — run in background
make web
```

> **Gotcha:** plain `make api` fails with `make: go: No such file or directory`.
> Go lives at `/var/home/Samuel/.local/go/bin` and isn't on PATH — always prepend it.

## Confirm it's up

```bash
# API responds (200) once migrations finish (~few seconds)
curl -sf http://localhost:8080/api/v1/health
```

- API: http://localhost:8080
- Web: http://localhost:5173

## Log in (no Discord needed)

Open in browser (mints a real session, redirects to the SPA):

```
http://localhost:8080/api/v1/auth/dev-login?role=admin
```

Roles: `admin | mission_maker | leader | enlisted`.

## Stop

```bash
make db-down      # stops Postgres, keeps volume
# API + Vite: kill the background processes
```

## Notes

- A fresh DB only has the Discord role→permission mappings (`make seed`).
  Events/missions must be seeded via the API or `psql`.
- Frontend checks: `cd frontend && npm run build` (tsc+vite), `npm run lint`.
- Integration tests: `make test-it` (needs `make db-up`).
