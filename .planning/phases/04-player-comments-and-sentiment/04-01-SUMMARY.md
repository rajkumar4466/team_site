---
phase: 04-player-comments-and-sentiment
plan: 01
subsystem: api
tags: [nextjs, huggingface, sentiment-analysis, server-side, route-handler, typescript]

# Dependency graph
requires:
  - phase: 03-stats-and-gallery
    provides: Completed KKR fan site v1.0 with players, stats, and gallery pages
provides:
  - Server mode enabled (output: 'export' removed from next.config.ts)
  - Comment type definitions (Comment interface + Sentiment union type)
  - In-memory comment store with getCommentsByPlayer and addComment
  - GET /api/comments?playerId=X route handler
  - POST /api/comments route handler with HuggingFace sentiment classification
  - .env.local.example documenting HUGGINGFACE_API_KEY
affects:
  - 04-player-comments-and-sentiment (plan 02 onwards: UI comment components consume this API)

# Tech tracking
tech-stack:
  added: [HuggingFace Inference API (cardiffnlp/twitter-roberta-base-sentiment-latest)]
  patterns:
    - Server-side only API key usage via process.env in Route Handlers
    - Module-level Map as in-memory store (persists across requests, resets on restart)
    - HF cold start 503 handling with estimated_time propagation
    - Graceful fallback to "neutral" sentiment on HF call failure

key-files:
  created:
    - src/types/comment.ts
    - src/data/comments.ts
    - src/app/api/comments/route.ts
    - .env.local.example
  modified:
    - next.config.ts

key-decisions:
  - "Removed output: 'export' from next.config.ts — static export blocks POST Route Handlers; pages retain static optimization via generateStaticParams"
  - "In-memory Map store (not database) — acceptable for demo/dev fan site; data resets on server restart"
  - "HuggingFace API key is server-side only — read from process.env.HUGGINGFACE_API_KEY, never exposed to browser"
  - "Use cardiffnlp/twitter-roberta-base-sentiment-latest (HF Inference API via router.huggingface.co)"
  - "Cold start 503 returns user-friendly error with estimated_time; other HF failures fall back to 'neutral' sentiment rather than rejecting comment"

patterns-established:
  - "API Route Handler pattern: src/app/api/{resource}/route.ts with named GET/POST exports"
  - "Type-safe sentiment classification: Sentiment union type guards HF label into 'positive'|'neutral'|'negative'"
  - "Server-side env var pattern: process.env.HUGGINGFACE_API_KEY only accessed in Route Handler, never passed to client"

requirements-completed: [COMM-01, COMM-02]

# Metrics
duration: 2min
completed: 2026-02-26
---

# Phase 4 Plan 01: Comment Infrastructure Summary

**Server-side comment API with HuggingFace distilbert sentiment classification, in-memory store, and static export removed to enable POST Route Handlers**

## Performance

- **Duration:** 2 min
- **Started:** 2026-02-26T03:09:37Z
- **Completed:** 2026-02-26T03:10:43Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments
- Removed `output: 'export'` from next.config.ts, enabling POST Route Handlers while preserving static optimization for existing pages
- Created type-safe Comment/Sentiment definitions and module-level in-memory store
- Implemented GET and POST /api/comments handlers with full HuggingFace sentiment integration, cold start handling, and graceful fallback

## Task Commits

Each task was committed atomically:

1. **Task 1: Remove static export and create Comment types + in-memory store** - `f3bfd67` (feat)
2. **Task 2: Create /api/comments Route Handler with HuggingFace sentiment classification** - `d536566` (feat)

## Files Created/Modified
- `next.config.ts` - Removed `output: 'export'`; server mode now enabled with trailingSlash and unoptimized images retained
- `src/types/comment.ts` - Exports `Sentiment` union type and `Comment` interface
- `src/data/comments.ts` - Module-level Map store with `getCommentsByPlayer` and `addComment` exports
- `src/app/api/comments/route.ts` - GET (retrieve by playerId) and POST (classify via HuggingFace + store) Route Handlers
- `.env.local.example` - Documents `HUGGINGFACE_API_KEY` with token generation URL

## Decisions Made
- Used `cardiffnlp/twitter-roberta-base-sentiment-latest` — deployed on HF Inference API via router.huggingface.co
- HF cold start (503 + `estimated_time`) returns a 503 to the client with a user-friendly message rather than silently falling back, since the caller needs to know to retry
- All other HF failures (network error, non-503 error) fall back to `"neutral"` sentiment so the comment is still stored

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required

Before using the comment API, add your HuggingFace token to `.env.local`:

```
HUGGINGFACE_API_KEY=hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Generate token at: https://huggingface.co/settings/tokens/new?ownUserPermissions=inference.serverless.write&tokenType=fineGrained

Required permission: "Inference Providers" (serverless write)

## Next Phase Readiness
- /api/comments endpoint is live and ready for UI integration
- Plan 02 can build comment submission form and display UI on player profile pages
- No blockers

---
*Phase: 04-player-comments-and-sentiment*
*Completed: 2026-02-26*
