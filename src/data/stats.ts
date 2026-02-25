import { SeasonRecord, TopPerformer } from "../types/stats";

export const seasonRecords: SeasonRecord[] = [
  { year: 2008, wins: 6,  losses: 8, noResult: 0, position: 8, title: false },
  { year: 2009, wins: 5,  losses: 8, noResult: 1, position: 7, title: false },
  { year: 2010, wins: 7,  losses: 7, noResult: 0, position: 6, title: false },
  { year: 2011, wins: 8,  losses: 6, noResult: 0, position: 5, title: false },
  { year: 2012, wins: 12, losses: 4, noResult: 0, position: 1, title: true  },
  { year: 2013, wins: 11, losses: 5, noResult: 0, position: 2, title: false },
  { year: 2014, wins: 11, losses: 3, noResult: 0, position: 1, title: true  },
  { year: 2015, wins: 8,  losses: 6, noResult: 0, position: 5, title: false },
  { year: 2016, wins: 7,  losses: 7, noResult: 0, position: 7, title: false },
  { year: 2017, wins: 5,  losses: 9, noResult: 0, position: 8, title: false },
  { year: 2018, wins: 6,  losses: 8, noResult: 0, position: 7, title: false },
  { year: 2019, wins: 6,  losses: 8, noResult: 0, position: 5, title: false },
  { year: 2020, wins: 7,  losses: 7, noResult: 0, position: 7, title: false },
  { year: 2021, wins: 7,  losses: 7, noResult: 0, position: 6, title: false },
  { year: 2022, wins: 6,  losses: 8, noResult: 0, position: 7, title: false },
  { year: 2023, wins: 7,  losses: 7, noResult: 0, position: 5, title: false },
  { year: 2024, wins: 11, losses: 3, noResult: 0, position: 1, title: true  },
];

export const topPerformers: TopPerformer[] = [
  // Top run-scorers
  { name: "Sunil Narine",      category: "runs",    total: 3500, seasons: 13 },
  { name: "Robin Uthappa",     category: "runs",    total: 3145, seasons: 8  },
  { name: "Gautam Gambhir",    category: "runs",    total: 2982, seasons: 7  },
  { name: "Rinku Singh",       category: "runs",    total: 1280, seasons: 5  },
  { name: "Brendon McCullum",  category: "runs",    total: 1217, seasons: 3  },
  // Top wicket-takers
  { name: "Sunil Narine",      category: "wickets", total: 178,  seasons: 13 },
  { name: "Umesh Yadav",       category: "wickets", total: 82,   seasons: 5  },
  { name: "Andre Russell",     category: "wickets", total: 80,   seasons: 11 },
  { name: "Kuldeep Yadav",     category: "wickets", total: 67,   seasons: 4  },
  { name: "Varun Chakravarthy",category: "wickets", total: 58,   seasons: 4  },
];
