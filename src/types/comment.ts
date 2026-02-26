export type Sentiment = "positive" | "neutral" | "negative";

export interface Comment {
  id: string;
  playerId: string;
  text: string;
  sentiment: Sentiment;
  createdAt: string; // ISO 8601 string
}
