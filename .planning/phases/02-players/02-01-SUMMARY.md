---
phase: 02-players
plan: "01"
subsystem: player-data-layer
tags: [player, data, types, components, squad]
dependency_graph:
  requires: [01-02-SUMMARY]
  provides: [player-type, player-data, player-card, squad-page]
  affects: [02-02-PLAN]
tech_stack:
  added: []
  patterns: [static-data-array, server-component, named-export, kkr-brand-colors]
key_files:
  created:
    - src/types/player.ts
    - src/data/players.ts
    - src/components/PlayerCard.tsx
  modified:
    - src/app/players/page.tsx
key_decisions:
  - "Used colored placeholder div (bg-kkr-purple-light with initials) instead of img tag — player photos do not exist yet"
  - "getInitials helper derives 2-letter initials from player name for placeholder display"
  - "jerseyNumber displayed as gold badge (bg-kkr-gold text-kkr-purple-dark) in top-right of card image area"
  - "Players page is pure server component (no use client) with static data import"
metrics:
  duration: "2 min"
  completed: "2026-02-25"
  tasks_completed: 2
  files_created: 3
  files_modified: 1
---

# Phase 2 Plan 1: Player Data Layer and Squad Listing Page Summary

**One-liner:** Typed Player interface with 16 KKR 2025 squad members, KKR-branded PlayerCard component, and responsive 4-column squad grid replacing the placeholder /players page.

## What Was Built

### Task 1: Player Type and Static Squad Data (commit: 3ea25aa)

Created the shared `Player` interface in `src/types/player.ts`:
- Fields: `id` (URL slug), `name`, `jerseyNumber`, `role` (union type), `nationality`, `age`, `imageUrl`, `bio`
- Role union: `"Batsman" | "Bowler" | "All-rounder" | "Wicket-keeper"`

Created `src/data/players.ts` with 16 KKR 2025 squad members:
- Mix of batsmen (Shreyas Iyer, Rinku Singh, Angkrish Raghuvanshi, Manish Pandey), bowlers (Varun Chakravarthy, Harshit Rana, Suyash Sharma, Mitchell Starc, Spencer Johnson), all-rounders (Sunil Narine, Andre Russell, Venkatesh Iyer, Moeen Ali, Ramandeep Singh), and wicket-keepers (Phil Salt, Rahmanullah Gurbaz)
- Exported `players: Player[]` array and `getPlayerBySlug(slug)` helper

### Task 2: PlayerCard Component and Squad Grid Page (commit: d7a9d69)

Created `src/components/PlayerCard.tsx`:
- Server component (no `use client`) with named export `PlayerCard`
- KKR brand colors: `border-t-4 border-kkr-purple`, `bg-kkr-purple-light` placeholder, gold jersey badge
- Initials display using helper function that extracts 2 letters from player name
- Hover effects: `shadow-lg`, `scale-105` transform on image area
- Clickable `Link` to `/players/[slug]` for future profile pages

Replaced `src/app/players/page.tsx` placeholder:
- Header: "KKR Squad 2025" + "IPL 2025 Season" subtitle
- Responsive grid: `grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6`
- Maps all 16 players to `PlayerCard` components with `key={player.id}`

## Verification Results

- `npx tsc --noEmit`: PASS — zero TypeScript errors
- `npm run build`: PASS — static export succeeds
- `out/players/index.html`: EXISTS — contains "Shreyas" text
- `src/types/player.ts`: exports `Player` interface
- `src/data/players.ts`: exports `players` (16 entries) and `getPlayerBySlug`
- `src/components/PlayerCard.tsx`: exports `PlayerCard` with named export

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check: PASSED

Files verified:
- FOUND: src/types/player.ts
- FOUND: src/data/players.ts
- FOUND: src/components/PlayerCard.tsx
- FOUND: src/app/players/page.tsx (modified)
- FOUND: out/players/index.html

Commits verified:
- FOUND: 3ea25aa (Task 1 — Player type and squad data)
- FOUND: d7a9d69 (Task 2 — PlayerCard and squad page)
