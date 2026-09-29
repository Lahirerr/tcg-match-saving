import type { Match, MatchResult, MatchupRow, OverallStats } from "@/lib/types";

export function idsForDeck(m: Match, prefix: "my" | "opp"): number[] {
  const arr = prefix === "my" ? m.myDeckIds : m.oppDeckIds;
  if (Array.isArray(arr) && arr.length) return arr;
  return [];
}

export function computeOverallStats(list: Match[]): OverallStats {
  let wins = 0;
  let losses = 0;
  let bricks = 0;
  list.forEach((m) => {
    if (m.result === "W") wins++;
    else if (m.result === "L") losses++;
    if (m.brick) bricks++;
  });
  const total = list.length;
  const winRate = total > 0 ? Math.round((wins / total) * 100) : null;
  const brickRate = total > 0 ? Math.round((bricks / total) * 100) : null;

  const sorted = list.slice().sort((a, b) => b.createdAt - a.createdAt);
  let streakCount = 0;
  let streakResult: MatchResult | null = null;
  if (sorted.length > 0) {
    streakResult = sorted[0].result;
    for (const m of sorted) {
      if (m.result === streakResult) streakCount++;
      else break;
    }
  }

  return { total, wins, losses, winRate, streakCount, streakResult, bricks, brickRate };
}

export function computeMatchupStats(list: Match[]): MatchupRow[] {
  const byOpp = new Map<string, MatchupRow>();
  list.forEach((m) => {
    let row = byOpp.get(m.oppDeck);
    if (!row) {
      row = { deck: m.oppDeck, deckIds: idsForDeck(m, "opp"), games: 0, wins: 0, losses: 0, winRate: 0 };
      byOpp.set(m.oppDeck, row);
    }
    row.games++;
    if (m.result === "W") row.wins++;
    else if (m.result === "L") row.losses++;
  });
  const rows = Array.from(byOpp.values());
  rows.forEach((r) => {
    r.winRate = r.games > 0 ? Math.round((r.wins / r.games) * 100) : 0;
  });
  rows.sort((a, b) => b.games - a.games);
  return rows;
}

export function streakLabel(stats: OverallStats): string {
  if (stats.total === 0) return "—";
  const word = stats.streakResult === "W" ? "ชนะ" : "แพ้";
  return `${word} × ${stats.streakCount}`;
}
