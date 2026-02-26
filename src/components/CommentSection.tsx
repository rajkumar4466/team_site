"use client";

import { useState, useEffect } from "react";
import type { Comment } from "@/types/comment";

export function CommentSection({ playerId }: { playerId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load existing comments on mount
  useEffect(() => {
    fetch(`/api/comments?playerId=${encodeURIComponent(playerId)}`)
      .then((r) => r.json())
      .then((data: { comments: Comment[] }) => {
        setComments(data.comments ?? []);
      })
      .catch(() => {
        // Silently fail — empty list is acceptable fallback
      })
      .finally(() => setLoading(false));
  }, [playerId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId, text: text.trim() }),
      });
      if (res.status === 503) {
        const data = await res.json();
        setError(
          data.error ??
            "Sentiment service is warming up. Please try again in 30 seconds."
        );
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Could not submit comment. Please try again.");
        return;
      }
      const data: { comment: Comment } = await res.json();
      setComments((prev) => [...prev, data.comment]);
      setText("");
    } catch {
      setError("Could not submit comment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  // Derive sentiment counts for the badge
  const counts = { positive: 0, neutral: 0, negative: 0 };
  for (const c of comments) {
    counts[c.sentiment] = (counts[c.sentiment] ?? 0) + 1;
  }

  return (
    <section className="mt-10">
      {/* Sentiment summary badge — appears below photo area since this section
          follows the two-column hero grid in the page layout */}
      <div className="flex flex-wrap gap-4 mb-8 p-4 bg-gray-50 rounded-xl border border-gray-200">
        <h2 className="w-full text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">
          Fan Sentiment
        </h2>
        <span className="flex items-center gap-1.5 text-green-600 font-bold text-lg">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-green-500" />
          {counts.positive} Positive
        </span>
        <span className="flex items-center gap-1.5 text-gray-400 font-bold text-lg">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-gray-400" />
          {counts.neutral} Neutral
        </span>
        <span className="flex items-center gap-1.5 text-red-600 font-bold text-lg">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-500" />
          {counts.negative} Negative
        </span>
      </div>

      {/* Comment form */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-kkr-purple mb-4">
          Leave a Comment
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Share your thoughts about this player..."
            className="w-full border border-gray-300 rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-kkr-purple"
            rows={3}
            disabled={submitting}
          />
          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}
          <button
            type="submit"
            disabled={submitting || !text.trim()}
            className="self-start bg-kkr-purple text-white px-5 py-2 rounded-lg text-sm font-semibold disabled:opacity-50 hover:bg-kkr-purple-dark transition-colors"
          >
            {submitting ? "Posting..." : "Post Comment"}
          </button>
        </form>
      </div>

      {/* Comment list */}
      <div>
        <h2 className="text-xl font-bold text-kkr-purple mb-4">
          Comments {!loading && `(${comments.length})`}
        </h2>
        {loading ? (
          <p className="text-gray-400 text-sm">Loading comments...</p>
        ) : comments.length === 0 ? (
          <p className="text-gray-400 text-sm">
            No comments yet. Be the first to share your thoughts!
          </p>
        ) : (
          <ul className="space-y-3">
            {comments.map((c) => (
              <li
                key={c.id}
                className="border border-gray-200 rounded-xl p-4 text-sm bg-white"
              >
                <span
                  className={`inline-block font-semibold text-xs uppercase tracking-wider px-2 py-0.5 rounded-full mb-2 ${
                    c.sentiment === "positive"
                      ? "bg-green-100 text-green-700"
                      : c.sentiment === "negative"
                      ? "bg-red-100 text-red-700"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {c.sentiment}
                </span>
                <p className="text-gray-700 leading-relaxed">{c.text}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
