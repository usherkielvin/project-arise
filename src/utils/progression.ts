import { xpForLevel } from '../store/useSystemStore';

export function getLevelProgress(totalXP: number, level: number) {
  const currentLevelXP = xpForLevel(level);
  const nextLevelXP = xpForLevel(level + 1);
  const span = Math.max(1, nextLevelXP - currentLevelXP);
  const progressPercent = Math.min(Math.max(((totalXP - currentLevelXP) / span) * 100, 0), 100);
  return {
    currentLevelXP,
    nextLevelXP,
    progressPercent,
    xpToNext: Math.max(0, nextLevelXP - totalXP),
  };
}
