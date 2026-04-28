import { Quest } from '../../store/useSystemStore';

export function splitQuestsByState(quests: Quest[]) {
  const pending = quests.filter((q) => !q.completed && (!q.isProgressBased || !q.progress));
  const inProgress = quests.filter((q) => !q.completed && q.isProgressBased && q.progress && q.progress > 0);
  const completed = quests.filter((q) => q.completed);
  return { pending, inProgress, completed };
}
