import type { Comment, Sentiment } from "@/types/comment";

// Module-level Map persists across requests within the same process.
// NOTE: Data resets on server restart (next dev restart or next start restart).
// This is acceptable for a development/demo fan site.
const store = new Map<string, Comment[]>();

export function getCommentsByPlayer(playerId: string): Comment[] {
  return store.get(playerId) ?? [];
}

export function addComment(
  playerId: string,
  text: string,
  sentiment: Sentiment
): Comment {
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
