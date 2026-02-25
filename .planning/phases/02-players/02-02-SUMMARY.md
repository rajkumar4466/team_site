---
phase: 02-players
plan: "02"
subsystem: ui
tags: [player, profile, static-export, next.js, generateStaticParams, dynamic-routes]
dependency_graph:
  requires: [02-01-SUMMARY]
  provides: [player-profile-page, generateStaticParams, player-slug-route, bidirectional-navigation]
  affects: [03-stats]
tech_stack:
  added: []
  patterns: [generateStaticParams, async-params-promise, server-component, static-export, dynamic-route, kkr-brand-colors]
key_files:
  created:
    - src/app/players/[slug]/page.tsx
  modified: []
key_decisions:
  - "Player profile page awaits params as Promise — Next.js 15 App Router requirement for dynamic routes"
  - "generateStaticParams maps all 16 player IDs enabling full static export of /players/[slug] routes"
  - "Used <img> tag (not next/image) matching static export convention established in Phase 1"
  - "Profile page is a pure server component (no use client) — all data from static players array"
  - "Photo area uses img tag with bg-kkr-purple-light as color placeholder (images not yet on disk)"
  - "Jersey number badge rendered as absolute-positioned overlay in bottom-right corner of photo"
metrics:
  duration: "3 min"
  completed: "2026-02-25"
  tasks_completed: 2
  files_created: 1
  files_modified: 0
requirements-completed: [PLAY-02, PLAY-03]
---

# Phase 2 Plan 2: Player Profile Pages Summary

**Next.js 15 App Router dynamic route at /players/[slug] with generateStaticParams pre-rendering all 16 KKR player profiles as static HTML, featuring two-column hero layout with photo placeholder, jersey badge, role pill, and bio stats grid — human-verified and approved.**

## Performance

- **Duration:** 3 min
- **Started:** 2026-02-25T20:05:00Z
- **Completed:** 2026-02-25T20:08:00Z
- **Tasks:** 2 (1 auto + 1 checkpoint:human-verify)
- **Files modified:** 1

## Accomplishments
- Individual player profile pages at `/players/[slug]` for all 16 KKR squad members
- `generateStaticParams` exports all 16 player slugs — build produces `out/players/{slug}/index.html` for every player
- Full profile layout: player name (h1), jersey number badge, role pill (kkr-purple/gold), nationality, age, and bio
- Bidirectional navigation: squad grid cards link to profiles, "Back to Squad" returns to `/players`
- Per-player SEO metadata via `generateMetadata`
- Human verification approved: visual quality, navigation flow, and static build confirmed

## Task Commits

Each task was committed atomically:

1. **Task 1: Player profile page with static params generation** - `fad353c` (feat)
2. **Task 2: Verify squad grid and player profiles** - checkpoint:human-verify (approved by user)

**Plan metadata:** (docs commit — see state update below)

## What Was Built

### Task 1: Player profile page with static params generation (commit: fad353c)

Created `src/app/players/[slug]/page.tsx`:

- `generateStaticParams` exports all 16 player slugs from the players array — required for static export build
- `generateMetadata` provides per-player `<title>` tags: `${player.name} | KKR Squad`
- Both `generateMetadata` and the page component are `async` functions that `await params` (Next.js 15 requirement)
- Calls `getPlayerBySlug(slug)` from `src/data/players.ts` — returns 404 via `notFound()` if slug not found
- Pure server component — no `use client` directive

Profile layout (desktop: two-column grid, mobile: stacked):

**LEFT — Photo area:**
- `<img>` tag with `bg-kkr-purple-light` background acting as color placeholder when images are missing
- Absolute-positioned jersey number badge (bottom-right): `#${player.jerseyNumber}` in `text-kkr-gold font-black text-4xl` on `bg-kkr-purple-dark rounded-lg`

**RIGHT — Bio details:**
- Player name: `text-4xl font-extrabold text-kkr-purple` h1
- Role pill: `bg-kkr-purple text-kkr-gold text-sm font-semibold px-3 py-1 rounded-full`
- Bio paragraph: `text-gray-600 text-base leading-relaxed`
- Stats grid (2-column): Nationality, Age, Jersey Number — label in `text-xs text-gray-400 uppercase tracking-wider`, value in `text-xl font-bold text-kkr-purple`

Navigation: "← Back to Squad" link at top linking to `/players`

### Task 2: Verify squad grid and player profiles (checkpoint:human-verify)

Human verification approved. All checks passed:
1. Squad grid at `/players` — responsive card grid with all 16 players visible
2. Individual profile pages at `/players/{slug}` — full bio layout with all required fields
3. Bidirectional navigation confirmed working
4. Build clean with 16+ static routes under `/players/[slug]`

## Verification Results

- `npx tsc --noEmit`: PASS — zero TypeScript errors
- `npm run build`: PASS — static export succeeds, shows `● /players/[slug]` with `[+13 more paths]`
- `out/players/` directory: CONTAINS 16 player subdirectories
- `out/players/shreyas-iyer/index.html`: EXISTS and contains player data
- Human verification: APPROVED

## Files Created/Modified
- `src/app/players/[slug]/page.tsx` — Dynamic player profile page: generateStaticParams, generateMetadata, async PlayerPage component with two-column hero layout

## Decisions Made
- Player profile page uses `async function` and `await params` because Next.js 15 App Router passes `params` as a Promise
- `generateStaticParams` returns all 16 player IDs, ensuring static export generates one HTML file per player
- Used `<img>` tag (not `next/image`) consistent with the `images.unoptimized: true` static export config from Phase 1
- No `use client` — pure server component, all data from static `players` array

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Complete player browsing experience live: squad grid at `/players`, individual profiles at `/players/[slug]`
- All 16 player profile pages statically exported and human-verified
- Phase 3 (Stats) can consume `src/data/players.ts` and `src/types/player.ts` directly
- No blockers or concerns

---

## Self-Check: PASSED

Files verified:
- FOUND: src/app/players/[slug]/page.tsx

Commits verified:
- FOUND: fad353c (Task 1 — Player profile page with generateStaticParams)

---
*Phase: 02-players*
*Completed: 2026-02-25*
