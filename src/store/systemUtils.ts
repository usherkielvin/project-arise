export const xpForLevel = (lvl: number) => Math.floor(100 * Math.pow(lvl, 1.5));

export const localDateKey = (d: Date) =>
  new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split('T')[0];

interface PenaltyQuest {
  completed: boolean;
  dateCreated: string;
}

export const shouldEnablePenaltyForDateChange = (quests: PenaltyQuest[], previousDate: string) =>
  quests.some((q) => {
    if (q.completed) return false;
    const created = q.dateCreated ? localDateKey(new Date(q.dateCreated)) : null;
    return created === previousDate;
  });
