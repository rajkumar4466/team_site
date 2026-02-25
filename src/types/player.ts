export interface Player {
  id: string;          // URL-safe slug, e.g. "shreyas-iyer"
  name: string;
  jerseyNumber: number;
  role: "Batsman" | "Bowler" | "All-rounder" | "Wicket-keeper";
  nationality: string; // e.g. "India", "Australia", "West Indies"
  age: number;         // age as of 2025 IPL season
  imageUrl: string;    // relative path e.g. "/images/players/shreyas-iyer.jpg"
  bio: string;         // 1-2 sentence description
}
