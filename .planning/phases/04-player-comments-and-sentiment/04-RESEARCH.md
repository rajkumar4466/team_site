# Phase 4: Player Comments and Sentiment - Research

**Researched:** 2026-02-25
**Domain:** Next.js static export constraints, HuggingFace Inference API, client-side comment storage
**Confidence:** HIGH (architecture blockers verified against official Next.js 16.1.6 docs)

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- No user login required — comments are fully anonymous
- No username, email, or session needed to submit a comment
- Comment form on each player profile page (`/players/[slug]`)
- User types a comment and submits
- On submission, the comment text is sent to the HuggingFace Inference API for sentiment classification
- HuggingFace model: `cardiffnlp/twitter-roberta-base-sentiment-latest`
- API endpoint: HuggingFace Inference API (POST to `https://router.huggingface.co/hf-inference/models/cardiffnlp/twitter-roberta-base-sentiment-latest`)
- Three classes: positive, negative, neutral
- Classification happens server-side (API route or Server Action) to keep API key secure
- Sentiment summary badge displayed **below the player's profile photo**
- Three counts shown side by side: Positive (green), Negative (red), Neutral (grey)
- Badge updates when new comments are added
- Existing comments listed on the player profile page
- Each comment shows the text and its sentiment label

### Claude's Discretion

- Storage implementation: in-memory store (API route) for simplicity, or localStorage for pure client-side; given static export convention, prefer API routes with in-memory store or file-based persistence
- Whether to show comment timestamps
- Exact UI layout of comment list and form
- HuggingFace API key management (environment variable)
- Error handling when HuggingFace API is unavailable

### Deferred Ideas (OUT OF SCOPE)

- User login / authenticated comments
- Comment moderation or reporting
- Comment editing or deletion
- Pagination of comments
- Real-time updates via WebSocket
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| COMM-01 | User (no login required) can submit a text comment on any player's profile page | Client component comment form pattern; localStorage or API-backed storage |
| COMM-02 | Each submitted comment is classified as positive, negative, or neutral via the BERT sentiment classifier (HuggingFace Inference API) | HuggingFace text-classification API verified; model substitution required (see Critical Finding) |
| COMM-03 | Player profile page shows a comment form and the list of existing comments with their sentiment label | Mixed server/client component pattern; comment state in client component |
| COMM-04 | Below each player's profile photo, display a sentiment summary badge showing counts of positive (green), negative (red), and neutral (grey) comments | Sentiment badge as client component reading from same comment state |
</phase_requirements>

---

## Summary

This phase adds anonymous commenting with AI sentiment classification to player profile pages. There are two critical blockers that must be resolved before planning can proceed to implementation tasks.

**Critical Finding 1 — Static export incompatibility:** The project currently uses `output: 'export'` in `next.config.ts`. This is officially confirmed by Next.js 16.1.6 docs to block ALL of: POST Route Handlers, Server Actions, and Request-reading Route Handlers. The CONTEXT.md decision that "classification happens server-side (API route or Server Action) to keep API key secure" is architecturally impossible without removing `output: 'export'`. The planner must choose between (A) removing `output: 'export'` to enable server-side features, or (B) using localStorage + browser-side HuggingFace calls (API key exposed in browser). Option A is the clean solution.

**Critical Finding 2 — HuggingFace model selection:** Use `cardiffnlp/twitter-roberta-base-sentiment-latest`, which is deployed via HF Inference API (via `router.huggingface.co`) and returns three labels: `positive`, `neutral`, `negative`. Note: The legacy `api-inference.huggingface.co` endpoint is deprecated; use `https://router.huggingface.co/hf-inference/models/...` instead.

**Primary recommendation:** Remove `output: 'export'` from next.config.ts (switch to default Next.js server mode), implement a POST Route Handler at `/api/comments/route.ts` for comment submission + HuggingFace calls, use in-memory store (Node.js module-level Map) for comment persistence during the server process, and use `cardiffnlp/twitter-roberta-base-sentiment-latest` as the sentiment model. This approach satisfies all four COMM requirements, keeps the API key server-side, and requires the fewest structural changes.

---

## Critical Architecture Blockers

### Blocker 1: `output: 'export'` Blocks Server-Side Comment Handling

**Source:** [Next.js 16.1.6 Static Exports Guide](https://nextjs.org/docs/app/guides/static-exports) — verified against the production docs last updated 2026-02-24.

The current `next.config.ts`:
```typescript
const nextConfig: NextConfig = {
  output: 'export',      // ← THIS blocks everything server-side
  trailingSlash: true,
  images: { unoptimized: true },
}
```

What `output: 'export'` blocks (from official docs — these are hard build errors, not warnings):
- **POST Route Handlers** — only GET is supported and only for static generation at build time
- **Server Actions** — "Server Actions are not supported with static export"
- **Route Handlers that read from Request** — no dynamic request handling

**Solution: Remove `output: 'export'`** (change to default Next.js server mode). The site's existing pages (pure server components with `generateStaticParams`) will continue to work exactly as before. Next.js automatically statically optimizes pages with no server-side data needs. The only change is that the build output no longer goes to `/out/` — it goes to `.next/` and runs via `next start`.

```typescript
// next.config.ts after change
const nextConfig: NextConfig = {
  // output: 'export' removed — enables Route Handlers and Server Actions
  trailingSlash: true,
  images: { unoptimized: true },
}
```

### Blocker 2: HuggingFace Model and API Endpoint

**Source:** HuggingFace Inference API migration (2025).

**Solution: Use `cardiffnlp/twitter-roberta-base-sentiment-latest`** via the current HF Inference API:
- Endpoint: `https://router.huggingface.co/hf-inference/models/cardiffnlp/twitter-roberta-base-sentiment-latest` (legacy `api-inference.huggingface.co` is deprecated)
- Returns exactly three labels: `positive`, `neutral`, `negative`
- Uses standard text-classification API format: `{ inputs: "text" }`
- Production-quality RoBERTa model trained on tweets

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 16.1.6 (already installed) | App Router, Route Handlers | Project requirement |
| React | 19.2.3 (already installed) | Client component state management | Project requirement |
| fetch (built-in) | native | Call HuggingFace Inference API from Route Handler | No extra deps needed |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| No additional packages needed | — | localStorage (browser built-in) or in-memory Map (Node.js built-in) | Comment storage handled without deps |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| In-memory Map (default) | better-sqlite3 or file-based JSON | SQLite persists across restarts but requires native binary; file-based requires fs access; in-memory is simplest for fan site dev context |
| cardiffnlp/twitter-roberta-base-sentiment-latest | Other 3-class sentiment models | cardiffnlp is deployed on HF Inference API via router.huggingface.co; returns positive/neutral/negative |
| Route Handler POST | Server Action | Server Actions also blocked by `output: 'export'`; both require removing static export; Route Handler is more explicit and testable |

**Installation:** No new packages required. The existing stack handles everything.

---

## Architecture Patterns

### Recommended Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── comments/
│   │       └── route.ts      # POST: submit comment + classify; GET: fetch comments for player
│   ├── players/
│   │   └── [slug]/
│   │       └── page.tsx      # Server component shell (existing)
│   └── ...
├── components/
│   ├── CommentForm.tsx        # "use client" — textarea + submit, calls POST /api/comments
│   ├── CommentList.tsx        # "use client" — displays comment array with sentiment badge
│   └── SentimentBadge.tsx    # "use client" — green/red/grey counts, receives counts as prop
├── data/
│   └── comments.ts           # Module-level Map<string, Comment[]> for in-memory store
└── types/
    └── comment.ts            # Comment interface
```

### Pattern 1: Server Component + Client Component Island

The player profile page (`/players/[slug]/page.tsx`) remains a pure server component. It imports the `CommentSection` client component and passes the `slug` as a prop. The client component handles all interactivity.

**What:** Server component renders static player data; client component handles dynamic comment state.
**When to use:** When a page has both static data (player bio) and dynamic interactive data (comments).

```typescript
// Source: https://nextjs.org/docs/app/getting-started/server-and-client-components
// src/app/players/[slug]/page.tsx (server component — NO "use client")
import { CommentSection } from "@/components/CommentSection";

export default async function PlayerPage({ params }) {
  const { slug } = await params;
  const player = getPlayerBySlug(slug);
  if (!player) notFound();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* ... existing player profile JSX ... */}

      {/* Sentiment badge placed below the profile photo — passed as child to server component area */}
      {/* CommentSection is a client component that fetches its own data */}
      <CommentSection playerId={slug} />
    </div>
  );
}
```

### Pattern 2: Route Handler for Comment Submission

```typescript
// Source: https://nextjs.org/docs/app/getting-started/route-handlers
// src/app/api/comments/route.ts

import { NextRequest, NextResponse } from "next/server";
import { addComment, getCommentsByPlayer } from "@/data/comments";

// GET /api/comments?playerId=rohit-sharma
export async function GET(request: NextRequest) {
  const playerId = request.nextUrl.searchParams.get("playerId");
  if (!playerId) return NextResponse.json({ error: "playerId required" }, { status: 400 });
  return NextResponse.json({ comments: getCommentsByPlayer(playerId) });
}

// POST /api/comments — body: { playerId: string, text: string }
export async function POST(request: NextRequest) {
  const { playerId, text } = await request.json();

  // Call HuggingFace Inference API server-side (API key stays secret)
  const hfResponse = await fetch(
    "https://router.huggingface.co/hf-inference/models/cardiffnlp/twitter-roberta-base-sentiment-latest",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputs: text }),
    }
  );

  const hfData = await hfResponse.json();
  // hfData format: [[{label: "positive", score: 0.97}, {label: "neutral", ...}, {label: "negative", ...}]]
  // Pick highest-scoring label
  const scores: Array<{ label: string; score: number }> = hfData[0];
  const sentiment = scores.reduce((a, b) => (a.score > b.score ? a : b)).label;
  // sentiment is "positive" | "neutral" | "negative"

  const comment = addComment(playerId, text, sentiment);
  return NextResponse.json({ comment }, { status: 201 });
}
```

### Pattern 3: In-Memory Comment Store

```typescript
// src/data/comments.ts
export type Sentiment = "positive" | "neutral" | "negative";

export interface Comment {
  id: string;
  playerId: string;
  text: string;
  sentiment: Sentiment;
  createdAt: string;
}

// Module-level Map persists across requests (within same Node.js process)
const store = new Map<string, Comment[]>();

export function getCommentsByPlayer(playerId: string): Comment[] {
  return store.get(playerId) ?? [];
}

export function addComment(playerId: string, text: string, sentiment: Sentiment): Comment {
  const comment: Comment = {
    id: crypto.randomUUID(),
    playerId,
    text,
    sentiment,
    createdAt: new Date().toISOString(),
  };
  const existing = store.get(playerId) ?? [];
  store.set(playerId, [...existing, comment]);
  return comment;
}
```

### Pattern 4: Client Component Comment Form

```typescript
// src/components/CommentSection.tsx
"use client";

import { useState, useEffect } from "react";
import type { Comment } from "@/types/comment";

export function CommentSection({ playerId }: { playerId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/comments?playerId=${playerId}`)
      .then((r) => r.json())
      .then((data) => setComments(data.comments));
  }, [playerId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId, text }),
      });
      if (!res.ok) throw new Error("Submission failed");
      const data = await res.json();
      setComments((prev) => [...prev, data.comment]);
      setText("");
    } catch {
      setError("Could not submit comment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  // Derive sentiment counts for badge
  const counts = { positive: 0, neutral: 0, negative: 0 };
  for (const c of comments) {
    counts[c.sentiment]++;
  }

  return (
    <section className="mt-10">
      {/* Sentiment badge */}
      <div className="flex gap-4 mb-6">
        <span className="text-green-600 font-bold">+{counts.positive} Positive</span>
        <span className="text-gray-400 font-bold">~{counts.neutral} Neutral</span>
        <span className="text-red-600 font-bold">-{counts.negative} Negative</span>
      </div>

      {/* Comment form */}
      <form onSubmit={handleSubmit} className="mb-8">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Leave a comment about this player..."
          className="w-full border border-gray-300 rounded-lg p-3 text-sm resize-none"
          rows={3}
        />
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        <button
          type="submit"
          disabled={submitting || !text.trim()}
          className="mt-2 bg-kkr-purple text-white px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50"
        >
          {submitting ? "Submitting..." : "Post Comment"}
        </button>
      </form>

      {/* Comment list */}
      <ul className="space-y-3">
        {comments.map((c) => (
          <li key={c.id} className="border rounded-lg p-3 text-sm">
            <span
              className={
                c.sentiment === "positive"
                  ? "text-green-600 font-semibold"
                  : c.sentiment === "negative"
                  ? "text-red-600 font-semibold"
                  : "text-gray-400 font-semibold"
              }
            >
              {c.sentiment}
            </span>
            <p className="mt-1 text-gray-700">{c.text}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
```

### Anti-Patterns to Avoid

- **Calling HuggingFace from the browser:** Exposes the API key in client-side JavaScript. Always call HuggingFace from the Route Handler.
- **Making CommentSection a Server Component:** It needs `useState`, `useEffect`, and event handlers — it MUST be a client component.
- **Using Server Actions:** Blocked by `output: 'export'`. Even after removing static export, use Route Handlers for clarity and testability.
- **Keeping `output: 'export'` and adding a Route Handler:** The build will succeed for GET-only handlers but fail or silently break for POST handlers. This is not a workable hybrid.
- **Blocking the UI on HuggingFace latency:** BERT inference can take 2-10 seconds on cold start. Show a loading state; don't disable the form indefinitely.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Sentiment classification | Custom regex/keyword matching for "positive"/"negative"/"neutral" | HuggingFace Inference API | Keyword matching fails on sarcasm, context; BERT handles nuance properly |
| Unique comment IDs | Custom incrementing counter | `crypto.randomUUID()` (Node.js built-in) | Built-in, collision-free, available in Node.js 15+ |
| HTTP client for HuggingFace | Custom fetch wrapper with retry logic | Native `fetch` with simple error boundary | fetch is built into Next.js Route Handlers; avoid adding axios/got |
| Label normalization | String manipulation on arbitrary labels | Check HF response structure and take highest-score label | Models return scores; take argmax, don't string-match |

**Key insight:** The entire complexity of this phase is in the routing architecture (static export constraint), not in the NLP or UI — the HuggingFace API handles all sentiment complexity.

---

## Common Pitfalls

### Pitfall 1: HuggingFace Model Loading Delay ("cold start")

**What goes wrong:** First request to a HuggingFace model after it's been idle returns HTTP 503 with `{"error": "Loading...", "estimated_time": 20}` and takes 20-60 seconds.
**Why it happens:** HF Inference API "warms up" idle models on first request.
**How to avoid:** Check for `estimated_time` in the response and return a user-friendly error message (e.g., "Sentiment service is warming up, try again in 30 seconds"). Do not let this propagate as an unhandled error that breaks the comment submission.
**Warning signs:** 503 response with JSON body containing `"estimated_time"` key.

```typescript
if (hfResponse.status === 503) {
  // Model is loading — return graceful error; comment can be stored without sentiment
  return NextResponse.json({ error: "Sentiment service loading, try again shortly" }, { status: 503 });
}
```

### Pitfall 2: HuggingFace Response Shape for Text Classification

**What goes wrong:** The response for text-classification is an array-of-arrays: `[[{label, score}, ...]]`, NOT `[{label, score}]`. Treating it as a flat array will fail.
**Why it happens:** The API batches inputs; even a single input is wrapped in an outer array.
**How to avoid:** Always index `hfData[0]` to get the scores array for the first (only) input.

```typescript
const hfData: Array<Array<{ label: string; score: number }>> = await hfResponse.json();
const scores = hfData[0]; // The scores for input[0]
const topLabel = scores.reduce((a, b) => (a.score > b.score ? a : b)).label;
```

### Pitfall 3: In-Memory Store Loses Data on Server Restart

**What goes wrong:** Comments disappear when `next dev` restarts (e.g., after code change) or when the production server process restarts.
**Why it happens:** The module-level `Map` is heap memory; it does not survive process restarts.
**How to avoid:** This is acceptable for a fan site development phase. Document it clearly. If persistence is needed in production, upgrade to a JSON file store or SQLite — that is a future concern.
**Warning signs:** Comments reset to zero after any `Ctrl+C` and re-run.

### Pitfall 4: Keeping `output: 'export'` and Expecting POST to Work

**What goes wrong:** `next build` succeeds but POST requests to the Route Handler return 405 Method Not Allowed or are simply not included in the export.
**Why it happens:** Static export only bundles GET handlers into static files at build time; POST has no static equivalent.
**How to avoid:** Remove `output: 'export'` entirely before adding the Route Handler. Verify with `next build && next start` (not `next build` + serving the `out/` folder).
**Warning signs:** 404 or 405 on POST to `/api/comments` in production.

### Pitfall 5: HuggingFace API Key in `.env.local` Not Available in Production

**What goes wrong:** Works in `next dev` but the Route Handler returns 401 from HuggingFace in production because the env var isn't set.
**Why it happens:** `.env.local` is for local development; production deployments require env vars set in the platform (e.g., Vercel dashboard, Docker env).
**How to avoid:** Store the key as `HUGGINGFACE_API_KEY` in `.env.local` for dev. Document that production requires this env var. Never commit `.env.local` to git.

### Pitfall 6: `CommentSection` Placed Inside the LEFT Column Instead of Below the Photo

**What goes wrong:** The sentiment badge appears on the side of the photo rather than directly below it.
**Why it happens:** The player profile uses a two-column grid (`grid-cols-1 md:grid-cols-2`). If `CommentSection` is placed inside the left column div, it appears beside the photo rather than spanning full width below.
**How to avoid:** Add `CommentSection` AFTER the closing `</div>` of the two-column grid, as a full-width sibling element. Place the sentiment badge INSIDE `CommentSection` directly above the comment form (so it appears below the photo area when the page is read top-to-bottom).

---

## HuggingFace Inference API — Verified Details

### Standard Text Classification Request

```typescript
// Source: https://huggingface.co/docs/api-inference/tasks/text-classification (verified 2026-02-25)

const response = await fetch(
  "https://router.huggingface.co/hf-inference/models/cardiffnlp/twitter-roberta-base-sentiment-latest",
  {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ inputs: "This player is absolutely brilliant!" }),
  }
);

// Response shape for text-classification:
// [[{label: "positive", score: 0.973}, {label: "neutral", score: 0.016}, {label: "negative", score: 0.010}]]
// Note: outer array wraps the batch; [0] is for the first (only) input

const data: [[{ label: string; score: number }]] = await response.json();
const scores = data[0];
const winner = scores.reduce((a, b) => a.score > b.score ? a : b);
// winner.label is "positive" | "neutral" | "negative"
```

### Model Labels

The `cardiffnlp/twitter-roberta-base-sentiment-latest` model returns:
- `"positive"` — fan approval, praise, excitement
- `"neutral"` — factual, balanced, ambiguous statements
- `"negative"` — criticism, disappointment, negative sentiment

Labels are lowercase strings. Map to display: green (positive), grey (neutral), red (negative).

### API Key Requirements

- **Required:** Yes, a HuggingFace User Access Token with "Inference Providers" permission
- **Free tier:** $0.10/month credits for free users (as of 2026-02)
- **Token generation:** `https://huggingface.co/settings/tokens/new?ownUserPermissions=inference.serverless.write&tokenType=fineGrained`
- **Header:** `Authorization: Bearer hf_xxxx`
- **Environment variable:** Store as `HUGGINGFACE_API_KEY` in `.env.local`

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `next export` CLI command | `output: 'export'` in next.config | Next.js v14.0.0 | `next export` removed; same constraints apply |
| HuggingFace `api-inference.huggingface.co/pipeline/...` | `api-inference.huggingface.co/models/...` | ~2023 | New URL format; same underlying API |
| Free unlimited HF Inference API | Credit-based free tier ($0.10/month) | ~2024-2025 | Token required; rate limits apply |
| Server Actions (React 19+) | Route Handlers (stable) | Next.js 13.4+ | Both valid; Server Actions blocked by static export |

**Deprecated/outdated:**
- `api-inference.huggingface.co`: Use `router.huggingface.co/hf-inference/models/...` instead.
- `output: 'export'` for this phase: Must be removed to support POST Route Handlers.

---

## Open Questions

1. **Persistence across restarts**
   - What we know: In-memory Map loses data on `next dev` restart or server restart
   - What's unclear: Does the user need persistence across restarts for dev/demo?
   - Recommendation: Use in-memory for now (simplest); document the limitation. If persistence is required, write comments to a JSON file in `/tmp` or use better-sqlite3 — but that is out of scope for this phase per CONTEXT.md deferred list.

2. **Sentiment model**
   - What we know: `cardiffnlp/twitter-roberta-base-sentiment-latest` is deployed on HF Inference API via router.huggingface.co and returns positive/neutral/negative
   - Recommendation: Use this model; API key in `HUGGINGFACE_API_KEY` env var.

3. **Sentiment badge placement specifics**
   - What we know: CONTEXT.md says "below the player's profile photo"; the profile photo is in the LEFT column of a two-column grid
   - What's unclear: Should the badge appear immediately below the photo (inside the left column) or spanning full width between the two-column hero and the comments section?
   - Recommendation: Place `CommentSection` as a full-width block after the two-column grid. Include the sentiment badge as the first element of `CommentSection`. On desktop the badge will appear below the photo area visually due to page flow.

---

## Sources

### Primary (HIGH confidence)
- [Next.js 16.1.6 Static Exports Guide](https://nextjs.org/docs/app/guides/static-exports) — confirmed static export blocks POST Route Handlers and Server Actions; verified version 16.1.6 last updated 2026-02-24
- [Next.js text-classification API spec](https://huggingface.co/docs/api-inference/tasks/text-classification) — request/response format for HF Inference API text-classification task
- [HuggingFace Inference Providers Pricing](https://huggingface.co/docs/inference-providers/en/pricing) — $0.10/month free tier; token required; as of 2026-02

### Secondary (MEDIUM confidence)
- [cardiffnlp/twitter-roberta-base-sentiment-latest](https://huggingface.co/cardiffnlp/twitter-roberta-base-sentiment-latest) — model page confirming 3-class output (positive/neutral/negative), HF Inference API deployed
- [Next.js Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components) — confirmed server/client component island pattern

### Tertiary (LOW confidence)
- Multiple WebSearch results confirming static export limitations — consistent with official docs, elevated to MEDIUM

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — no new packages needed; project already has all dependencies
- Architecture (static export blocker): HIGH — verified against official Next.js 16.1.6 docs, last updated 2026-02-24
- HuggingFace API format: HIGH — verified against official HF docs; response shape confirmed
- Model: HIGH — cardiffnlp/twitter-roberta-base-sentiment-latest deployed on HF Inference API via router.huggingface.co
- Pitfalls: MEDIUM — cold start behavior and array-of-arrays response shape from HF community knowledge + official API spec pattern

**Research date:** 2026-02-25
**Valid until:** 2026-03-25 (Next.js stable; HF Inference API stable; model deployments change less frequently than APIs)
