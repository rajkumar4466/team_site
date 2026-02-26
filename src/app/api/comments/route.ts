import { NextRequest, NextResponse } from "next/server";
import { addComment, getCommentsByPlayer } from "@/data/comments";
import type { Sentiment } from "@/types/comment";

const HF_MODEL_URL =
  "https://router.huggingface.co/hf-inference/models/cardiffnlp/twitter-roberta-base-sentiment-latest";

// GET /api/comments?playerId=rohit-sharma
export async function GET(request: NextRequest) {
  const playerId = request.nextUrl.searchParams.get("playerId");
  if (!playerId) {
    return NextResponse.json(
      { error: "playerId query parameter is required" },
      { status: 400 }
    );
  }
  const comments = getCommentsByPlayer(playerId);
  return NextResponse.json({ comments });
}

// POST /api/comments
// Body: { playerId: string, text: string }
export async function POST(request: NextRequest) {
  let playerId: string;
  let text: string;

  try {
    const body = await request.json();
    playerId = body.playerId;
    text = body.text;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!playerId || !text || typeof playerId !== "string" || typeof text !== "string") {
    return NextResponse.json(
      { error: "playerId and text are required strings" },
      { status: 400 }
    );
  }

  if (!text.trim()) {
    return NextResponse.json({ error: "Comment text cannot be empty" }, { status: 400 });
  }

  // Call HuggingFace Inference API server-side — API key never reaches the browser
  let sentiment: Sentiment = "neutral"; // fallback if HF call fails
  try {
    const hfResponse = await fetch(HF_MODEL_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputs: text.trim() }),
    });

    const rawBody = await hfResponse.text();

    // Handle cold start: HF returns 503 with estimated_time when model is loading
    if (hfResponse.status === 503) {
      const errBody = (() => {
        try {
          return JSON.parse(rawBody || "{}");
        } catch {
          return {};
        }
      })();
      if ("estimated_time" in errBody) {
        return NextResponse.json(
          {
            error:
              "Sentiment service is warming up. Please try again in 30 seconds.",
            estimated_time: errBody.estimated_time,
          },
          { status: 503 }
        );
      }
    }

    if (hfResponse.ok) {
      const hfData = JSON.parse(rawBody);
      // HF API can return:
      // - [[{label, score}, ...]] (batch with all class scores)
      // - [{label, score}] (single top prediction)
      const scores: Array<{ label: string; score: number }> = Array.isArray(hfData[0])
        ? hfData[0]
        : hfData;
      const winner = scores.reduce((a, b) => (a.score > b.score ? a : b));
      const label = winner.label.toLowerCase();
      if (label === "positive" || label === "negative" || label === "neutral") {
        sentiment = label as Sentiment;
      }
    }
    // If HF call fails for any other reason, fall through with "neutral" sentiment
  } catch {
    // Network error or JSON parse error — store comment with "neutral" sentiment
    // rather than failing the entire submission
  }

  const comment = addComment(playerId, text.trim(), sentiment);
  return NextResponse.json({ comment }, { status: 201 });
}
