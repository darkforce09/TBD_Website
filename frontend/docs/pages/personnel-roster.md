# Personnel Roster (Admin)

## Status

`doc-complete`

## Summary

- **What:** Admin user management table with search, edit, ban.
- **Why:** Manage Discord/Arma linked accounts, roles, warnings.
- **Route:** `/admin/personnel`
- **Stitch reference:** `frontend/stitch-exports/personnel_roster_admin_management/code.html`
- **Min role:** `admin`
- **Blueprint ref:** §4.10

## Element Inventory

| # | Element | Type | Text / Content | Purpose | Data source |
|---|---------|------|----------------|---------|-------------|
| 1 | Page H1 | h1 | Personnel Roster | Title | Static |
| 2 | Search input | input | Search Discord ID or Arma Name... | Filter | `?q=` |
| 3 | Col | th | Discord Account | Table | `discord_handle` |
| 4 | Col | th | Arma Character | Table | `arma_character` or Unlinked |
| 5 | Col | th | Rank/Role | Table | `role` badge |
| 6 | Col | th | Warnings | Table | warning count |
| 7 | Col | th | Actions | Table | Static |
| 8 | Edit btn | button | Edit User | Edit modal | Future PATCH |
| 9 | Ban btn | button | Ban | Ban user | Future POST ban |
| 10 | Role badge | span | Platform Admin / Enlisted | Visual | `user.role` |
| 11 | Pagination | span | Showing x of y entries | Footer | offset |

## API Dependencies

| Endpoint | Method | When | Response |
|----------|--------|------|----------|
| `GET /admin/users` | GET | Load roster | `User[]` (T-004 stub empty) |

## Milestones

### M1 — [x] Admin route
### M2 — [ ] Table static
### M3 — [ ] Hook stub until T-004
### M4 — [ ] Edit/ban when API exists

## Test Plan

1. Admin page renders table with sample rows (static).
2. Search input filters client-side on static data.
3. When T-004 resolved → live data.

## Open Questions / Blockers

- [T-004](../TRACKING.md)
