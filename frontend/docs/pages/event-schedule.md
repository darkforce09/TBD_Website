# Event Schedule

## Status

`doc-complete`

## Summary

- **What:** Member view of upcoming operations with registration actions.
- **Why:** Players find and register for Tuesday events.
- **Route:** `/events`
- **Stitch reference:** `frontend/stitch-exports/upcoming_operations_event_schedule/code.html`
- **Min role:** `public-nav`
- **Blueprint ref:** —

## Element Inventory

| # | Element | Type | Text / Content | Purpose | Data source |
|---|---------|------|----------------|---------|-------------|
| 1 | Page H1 | h1 | Upcoming Operations | Title | Static |
| 2 | View toggle | button | List View | Active view | Static |
| 3 | View toggle | button | Calendar View | Future | Static |
| 4 | Col | th | Date/Time | Table | UTC→local |
| 5 | Col | th | Operation | Table | `event.name` |
| 6 | Col | th | Terrain | Table | `event.terrain` |
| 7 | Col | th | Registration | Progress bar | `registered/max` |
| 8 | Col | th | Status | Badge OPEN/FULL/LIVE | `event.status` |
| 9 | Col | th | Action | Buttons | Static |
| 10 | Action btn | button | View & Register | Register | `POST /events/:id/register` |
| 11 | Action btn | button | Waitlist | Waitlist | API |
| 12 | Action btn | button | Join Spectator | Spectate | Future |
| 13 | Pagination | nav | Showing x of y | Footer | `limit/offset` |

## API Dependencies

| Endpoint | Method | When | Response |
|----------|--------|------|----------|
| `GET /events` | GET | Auth | `Event[]` |
| `POST /events/:id/register` | POST | Register | registration |

## Milestones

### M1 — [x] Route `/events`
### M2 — [ ] Table static
### M3 — [ ] `useEvents()`
### M4 — [ ] Register flow

## Test Plan

1. Page shows event table.
2. OPEN row → Register enabled when logged in.
3. FULL row → Waitlist shown.

## Open Questions / Blockers

- Calendar view deferred past M2.
