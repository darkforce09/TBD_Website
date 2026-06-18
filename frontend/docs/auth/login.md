# Login

## Status

`doc-complete`

## Summary

- **What:** Entry point that redirects users to Discord OAuth.
- **Why:** TBD Reforger uses Discord as sole authentication; no local passwords.
- **Route:** `/login`
- **Stitch reference:** none
- **Min role:** `public-nav`
- **Blueprint ref:** Handoff §2.A

## Element Inventory

| # | Element | Type | Text / Content | Purpose | Data source |
|---|---------|------|----------------|---------|-------------|
| 1 | Page container | div | — | Centered full-screen card | Static |
| 2 | Logo text | h1 | TBD Reforger | Branding | Static |
| 3 | Subtitle | p | Sign in to register, deploy, and manage operations. | Context | Static |
| 4 | Discord button | button | Sign in with Discord | Starts OAuth | Redirect to `/api/v1/auth/discord/login` |
| 5 | Back link | link | Continue browsing without signing in | Guest browse | Link to `/` |

## Behavior

### Primary flow
1. User lands on `/login` (optional — CTAs across app also link here).
2. Click Discord → browser navigates to `GET /api/v1/auth/discord/login` → Discord consent.
3. On success (when T-002 fixed) → `/auth/callback` with tokens.

### States
- **Already authenticated:** Redirect to `/`.

## API Dependencies

| Endpoint | Method | When called | Response shape |
|----------|--------|-------------|----------------|
| `GET /auth/discord/login` | GET | Button click | 302 to Discord |

## Milestones

### M1 — Shell
- [x] Route `/login` renders outside AppLayout
- [x] Redirect to Discord on button click

### M2 — Static Stitch
- [ ] Styled per THEME.md dark card

### M3 — API wired
- [ ] Auto-redirect if session exists

### M4 — Complete
- [ ] End-to-end login when T-002 resolved

## Test Plan

### Manual
1. Visit `/login` → Discord button visible.
2. Click button → navigates to Discord OAuth URL (or API proxy).
3. While logged in, visit `/login` → redirect home.

### Automated (future)
- `describe('Login', () => { ... })`

## Open Questions / Blockers

- [T-002](TRACKING.md): Backend must redirect to frontend `/auth/callback` with tokens.
