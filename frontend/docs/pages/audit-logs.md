# Audit Logs (Admin)

## Status

`doc-complete`

## Summary

- **What:** Terminal-style live feed of system audit events.
- **Why:** Admin paper trail for security and debugging.
- **Route:** `/admin/audit`
- **Stitch reference:** `frontend/stitch-exports/system_audit_logs_admin_console/code.html`
- **Min role:** `admin`
- **Blueprint ref:** §4.12

## Element Inventory

| # | Element | Type | Text / Content | Purpose | Data source |
|---|---------|------|----------------|---------|-------------|
| 1 | Page H1 | h1 | System Audit Logs | Title | Static |
| 2 | Filter input | input | Filter by admin, event, or keyword... | Search | `?q=` |
| 3 | Export btn | button | Export to CSV | Download | `GET /admin/audit-logs/export.csv` |
| 4 | Terminal chrome | div | red/yellow/green dots | Window chrome | Static |
| 5 | Live badge | span | Live Feed | SSE indicator | Static |
| 6 | Log line | pre | `[timestamp] [LEVEL] message` | Each entry | `AuditLog` |
| 7 | Level INFO | span | INFO | Info severity | `severity=info` |
| 8 | Level WARN | span | WARN | Warning | `severity=warn` |
| 9 | Level CRIT | span | CRIT | Critical | `severity=crit` |

## API Dependencies

| Endpoint | Method | When | Response |
|----------|--------|------|----------|
| `GET /admin/audit-logs` | GET | Load logs | `AuditLog[]` (T-005) |
| `GET /admin/audit-logs/stream` | GET SSE | Live | stream (future) |

## Milestones

### M1 — [x] Admin route
### M2 — [ ] Terminal UI with sample lines static
### M3 — [ ] Hook stub T-005
### M4 — [ ] Live stream + CSV export

## Test Plan

1. Admin sees monospace log viewer.
2. Filter narrows static sample lines.
3. Export button disabled until T-005.

## Open Questions / Blockers

- [T-005](../TRACKING.md)
