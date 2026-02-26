# Roadmap: KKR Fan Website

## Overview

Three phases take the KKR fan site from zero to fully shipped. Phase 1 builds the branded shell with navigation and responsive layout. Phase 2 fills it with player content — the squad page and individual profiles. Phase 3 completes the site with season stats and the action photo gallery.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Foundation** - Branded site shell with navigation and responsive layout (completed 2026-02-25)
- [x] **Phase 2: Players** - Squad listing and individual player profile pages (completed 2026-02-25)
- [x] **Phase 3: Stats and Gallery** - Season records, top performers, and player action photo gallery (completed 2026-02-25)
- [ ] **Phase 4: Player Comments and Sentiment** - Anonymous commenting on player profiles with AI-powered sentiment classification and visual summary badges

## Phase Details

### Phase 1: Foundation
**Goal**: Users can land on a polished KKR-branded site and navigate to every section
**Depends on**: Nothing (first phase)
**Requirements**: SITE-01, SITE-02, SITE-03
**Success Criteria** (what must be TRUE):
  1. User sees a homepage with KKR purple/gold branding and a clear hero section
  2. User can navigate between Players, Stats, and Gallery sections from any page
  3. Site is readable and usable on both desktop and mobile screen sizes
**Plans**: 2 plans

Plans:
- [x] 01-01-PLAN.md — Next.js + Tailwind scaffold with KKR color tokens and static export
- [x] 01-02-PLAN.md — Root layout, responsive Navbar, homepage hero, placeholder section pages

### Phase 2: Players
**Goal**: Users can browse the full KKR squad and dive into individual player profiles
**Depends on**: Phase 1
**Requirements**: PLAY-01, PLAY-02, PLAY-03
**Success Criteria** (what must be TRUE):
  1. User can view a squad page listing all current KKR players
  2. User can click a player and see their bio (name, nationality, age, role)
  3. User can see each player's jersey number and photo on their profile page
**Plans**: 2 plans

Plans:
- [x] 02-01-PLAN.md — Player type definitions, static squad data (16 players), PlayerCard component, and squad grid page
- [x] 02-02-PLAN.md — Individual player profile pages with generateStaticParams for static export + human verification

### Phase 3: Stats and Gallery
**Goal**: Users can explore KKR's historical performance and browse player action photography
**Depends on**: Phase 2
**Requirements**: STAT-01, STAT-02, GALL-01
**Success Criteria** (what must be TRUE):
  1. User can view KKR's season-by-season record with wins, losses, and titles for each IPL year
  2. User can view a list of KKR's all-time top run-scorers and wicket-takers
  3. User can browse a gallery of action shots with multiple photos per player
**Plans**: 4 plans

Plans:
- [x] 03-01-PLAN.md — Stats and gallery type definitions + static data (season records, top performers, gallery entries)
- [x] 03-02-PLAN.md — Stats page only: /stats with season table + top performers section
- [x] 03-03-PLAN.md — Gallery page only: /gallery with player photo grids
- [x] 03-04-PLAN.md — Human verification of /stats and /gallery pages

### Phase 4: Player Comments and Sentiment
**Goal**: Users can comment on any player profile and see a live sentiment breakdown (positive/negative/neutral) powered by HuggingFace BERT classification
**Depends on**: Phase 2 (player profiles)
**Requirements**: COMM-01, COMM-02, COMM-03, COMM-04
**Success Criteria** (what must be TRUE):
  1. User can submit a text comment on any player profile page without logging in
  2. Comment is classified as positive, negative, or neutral via lxyuan/distilbert-base-multilingual-cased-sentiments-student (HuggingFace Inference API)
  3. Comments and their sentiment labels appear on the player profile page
  4. Below the player's profile photo, a sentiment badge shows green/red/grey counts for positive/negative/neutral comments
**Plans**: 3 plans

Plans:
- [x] 04-01-PLAN.md — Remove static export, create Comment types + in-memory store + /api/comments Route Handler with HuggingFace classification
- [x] 04-02-PLAN.md — CommentSection client component + integrate into player profile page
- [ ] 04-03-PLAN.md — Human verification of commenting, sentiment classification, and badge display

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 2/2 | Complete   | 2026-02-25 |
| 2. Players | 2/2 | Complete   | 2026-02-25 |
| 3. Stats and Gallery | 4/4 | Complete   | 2026-02-25 |
| 4. Player Comments and Sentiment | 2/3 | In Progress| |
