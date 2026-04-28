const RANKS = ['E', 'D', 'C', 'B', 'A', 'S'];

export function getRankScale() {
  return RANKS;
}

export function rankFromLevel(level: number) {
  if (level >= 101) return { rank: 'S', title: 'Shadow Monarch' };
  if (level >= 71) return { rank: 'A', title: 'A-Rank Specialist' };
  if (level >= 46) return { rank: 'B', title: 'B-Rank Developer' };
  if (level >= 26) return { rank: 'C', title: 'C-Rank Apprentice' };
  if (level >= 11) return { rank: 'D', title: 'D-Rank Hunter' };
  return { rank: 'E', title: 'E-Rank Hunter' };
}
