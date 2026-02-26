# Phase 4: Player Comments and Sentiment - Context

**Gathered:** 2026-02-25
**Status:** Ready for planning
**Source:** User specification (PRD Express Path)

<domain>
## Phase Boundary

This phase adds anonymous player commenting with AI-powered sentiment classification to the KKR fan site. Each player profile page gains a comment form, a comment list, and a sentiment summary badge (positive/negative/neutral counts) shown below the player's profile photo. The HuggingFace sentiment model at `cardiffnlp/twitter-roberta-base-sentiment-latest` is the classifier.

</domain>

<decisions>
## Implementation Decisions

### Authentication
- No user login required — comments are fully anonymous
- No username, email, or session needed to submit a comment

### Comment Submission
- Comment form on each player profile page (`/players/[slug]`)
- User types a comment and submits
- On submission, the comment text is sent to the HuggingFace Inference API for sentiment classification

### Sentiment Classification
- HuggingFace model: `cardiffnlp/twitter-roberta-base-sentiment-latest`
- API endpoint: HuggingFace Inference API (POST to `https://router.huggingface.co/hf-inference/models/cardiffnlp/twitter-roberta-base-sentiment-latest`)
- Three classes: positive, negative, neutral
- Classification happens server-side (API route or Server Action) to keep API key secure

### Comment Storage
- Comments must persist across page loads (localStorage, API route + in-memory store, or a lightweight DB)
- Claude's Discretion: storage mechanism — prefer simplest option that works with Next.js static export or hybrid output

### Sentiment Display
- Sentiment summary badge displayed **below the player's profile photo**
- Three counts shown side by side:
  - Positive count — green color
  - Negative count — red color
  - Neutral count — grey color
- Badge updates when new comments are added

### Comment Display
- Existing comments listed on the player profile page
- Each comment shows the text and its sentiment label

### Claude's Discretion
- Storage implementation: in-memory store (API route) for simplicity, or localStorage for pure client-side; given static export convention, prefer API routes with in-memory store or file-based persistence
- Whether to show comment timestamps
- Exact UI layout of comment list and form
- HuggingFace API key management (environment variable)
- Error handling when HuggingFace API is unavailable

</decisions>

<specifics>
## Specific Ideas

- HuggingFace model: `cardiffnlp/twitter-roberta-base-sentiment-latest`
- API URL: `https://router.huggingface.co/hf-inference/models/cardiffnlp/twitter-roberta-base-sentiment-latest`
- Sentiment badge placement: directly below the player's profile photo (the colored placeholder div or image)
- Positive count: green text/badge
- Negative count: red text/badge
- Neutral count: grey text/badge
- Comment form: simple textarea + submit button on the player profile page

</specifics>

<deferred>
## Deferred Ideas

- User login / authenticated comments (explicitly out of scope for this phase)
- Comment moderation or reporting
- Comment editing or deletion
- Pagination of comments
- Real-time updates via WebSocket

</deferred>

---

*Phase: 04-player-comments-and-sentiment*
*Context gathered: 2026-02-25 via User Specification*
