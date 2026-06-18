# Wiki (SOPs & Manuals)

## Status

`doc-complete`

## Summary

- **What:** Two-column wiki with category nav and markdown content.
- **Why:** Community doctrine, vehicle DB, IFF, medical flowcharts.
- **Route:** `/wiki` and `/wiki/:slug`
- **Stitch reference:** `frontend/stitch-exports/sop_wiki_vehicle_database_iff/code.html`
- **Min role:** `public-nav`
- **Blueprint ref:** §4.6

## Element Inventory

| # | Element | Type | Text / Content | Purpose | Data source |
|---|---------|------|----------------|---------|-------------|
| 1 | Nav H2 | h2 | SOP Categories | Sidebar title | Static |
| 2 | Nav link | link | Rules of Engagement (ROE) | Category | `GET /wiki` slug `roe` |
| 3 | Nav link | link | Radio Protocol & Comms | Category | slug `radio` |
| 4 | Nav link | link | Medical Flowchart ACE | Category | slug `medical` |
| 5 | Nav link | link | Vehicle Database & IFF | Active example | slug `vehicles` |
| 6 | Nav link | link | Infantry Spacing & Formations | Category | slug `formations` |
| 7 | Content H1 | h1 | Vehicle Database & IFF | Page title | `WikiPage.title` |
| 8 | Warning callout | div | CRITICAL IFF Directive | Safety | `WikiPage` body |
| 9 | Vehicle table | table | Name, Faction, Armor, Amphibious, Threat | Data | `GET /vehicle-database` |
| 10 | Gallery section | h4 | Visual ID Guide Gallery | Images | Static/ future |
| 11 | Gallery btn | button | View Full Gallery | Expand | Client |

## API Dependencies

| Endpoint | Method | When | Response |
|----------|--------|------|----------|
| `GET /wiki` | GET | Auth | nav list |
| `GET /wiki/:slug` | GET | Auth | `WikiPage` |
| `GET /vehicle-database` | GET | Auth | vehicles for table |

## Milestones

### M1 — [x] Routes `/wiki`, `/wiki/:slug`
### M2 — [ ] Stitch layout static HTML content
### M3 — [ ] `useWiki(slug)`
### M4 — [ ] Markdown render T-008

## Test Plan

1. `/wiki` → nav + default content.
2. Click ROE → slug changes content area.
3. Vehicle table renders rows.

## Open Questions / Blockers

- [T-008](TRACKING.md): react-markdown for M4.
