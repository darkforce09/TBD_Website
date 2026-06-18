# Auth Callback

## Status

`doc-complete`

## Summary

- **What:** OAuth return URL that parses tokens and establishes session.
- **Why:** Completes Discord login flow in the SPA.
- **Route:** `/auth/callback`
- **Stitch reference:** none
- **Min role:** `public-nav`
- **Blueprint ref:** —

## Element Inventory

| # | Element | Type | Text / Content | Purpose | Data source |
|---|---------|------|----------------|---------|-------------|
| 1 | Loading state | div | Completing sign in... | Spinner while parsing | Static |
| 2 | Error title | h1 | Sign in failed | OAuth error | Query/hash params |
| 3 | Error message | p | Dynamic error text | User feedback | API error |
| 4 | Retry button | button | Try again | Re-login | Link `/login` |
| 5 | Success redirect | — | — | Navigate to `/` | After `setSession` |

## Behavior

### Primary flow (when T-002 implemented)
1. Backend redirects to `http://localhost:5173/auth/callback#access_token=...&refresh_token=...` (or query).
2. Parse hash/query → `useAuthStore.setSession()`.
3. Redirect to `/` or `returnUrl`.

### Current scaffold
- Show message: "OAuth callback ready — backend redirect pending (T-002)."

## API Dependencies

| Endpoint | Method | When called | Response shape |
|----------|--------|-------------|----------------|
| `POST /auth/refresh` | POST | Later token refresh | tokens |

## Milestones

### M1 — Shell
- [x] Route exists outside AppLayout

### M2 — Static Stitch
- [ ] Loading and error UI

### M3 — API wired
- [ ] Parse tokens and set session (blocked T-002)

### M4 — Complete
- [ ] Full OAuth round trip

## Test Plan

### Manual
1. Visit `/auth/callback` → loading or scaffold message shown.
2. Simulate hash with mock tokens in dev → session stored.
3. Invalid callback → error + retry link.

### Automated (future)
- `describe('AuthCallback', () => { ... })`

## Open Questions / Blockers

- [T-002](TRACKING.md): Backend JSON callback must become frontend redirect.
