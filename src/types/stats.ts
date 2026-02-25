export interface SeasonRecord {
  year: number;          // IPL year, e.g. 2008
  wins: number;
  losses: number;
  noResult: number;      // ties or no-result matches
  position: number;      // final standings position that season (1 = champion)
  title: boolean;        // true if KKR won the IPL that year
}

export interface TopPerformer {
  name: string;          // Player's full name
  category: "runs" | "wickets";
  total: number;         // career total runs or wickets for KKR
  seasons: number;       // seasons played for KKR
}
