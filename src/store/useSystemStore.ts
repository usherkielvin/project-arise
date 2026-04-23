import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { localDateKey, shouldEnablePenaltyForDateChange, xpForLevel } from './systemUtils';

export { xpForLevel } from './systemUtils';

export type QuestRank     = 'E' | 'D' | 'C' | 'B' | 'A' | 'S';
export type HabitCategory = 'health' | 'mind' | 'work' | 'social';
export type ProtocolMode  = 'MONARCH' | 'FINANCE';

export interface StatPoints { INT: number; PER: number; STR: number; VIT: number; }

export interface Quest {
  id: number; title: string; description: string;
  category: string; stat: string; xp: number;
  rank: QuestRank; completed: boolean; dateCreated: string;
  isProgressBased?: boolean;
  progress?: number; // 0-100
}

export interface Habit {
  id: number; title: string; category: HabitCategory;
  streak: number; bestStreak: number; xpPerDay: number; week: boolean[]; checkedDates: string[];
}

export interface JournalEntry {
  date: string; // YYYY-MM-DD
  content: string;
}

export interface TradeLog {
  id: number;
  timestamp: string;
  instrument: string;
  entryPrice: number;
  exitPrice: number;
  pips: number;
  notes: string;
}

export interface PreparedNewsEvent {
  id: string;
  title: string;
  date: string;
  prepared: boolean;
}

// Category → stat affinity mapping (exported for screens)
export const CATEGORY_STAT: Record<string, keyof StatPoints> = {
  'Trading': 'PER', 'Development': 'INT', 'NU MOA': 'INT', 'Health': 'STR',
};
export const HABIT_STAT_MAP: Record<HabitCategory, keyof StatPoints> = {
  health: 'VIT', mind: 'INT', work: 'INT', social: 'PER',
};

interface SystemState {
  level: number;
  totalXP: number;
  statPoints: StatPoints;
  quests: Quest[];
  habits: Habit[];
  journals: JournalEntry[];       // daily logs
  activeProtocol: ProtocolMode;
  tradeLogs: TradeLog[];
  preparedNewsEvents: PreparedNewsEvent[];
  financeGold: number;
  categories: string[];           // user-managed quest categories
  lastLoginDate: string | null;
  penaltyMode: boolean;
  profileImage: string | null;

  addQuest:    (q: Omit<Quest, 'id' | 'completed' | 'dateCreated' | 'progress'> & { isProgressBased?: boolean }) => void;
  updateQuest: (id: number, updates: Partial<Quest>) => void;
  deleteQuest: (id: number) => void;
  toggleQuest: (id: number) => { leveledUp: boolean; newLevel: number };
  uncheckQuest: (id: number) => void;
  addQuestProgress: (id: number, amount: number) => { leveledUp: boolean; newLevel: number };

  addHabit:     (h: Pick<Habit, 'title' | 'category' | 'xpPerDay'>) => void;
  deleteHabit:  (id: number) => void;
  toggleHabit:  (id: number) => { leveledUp: boolean; newLevel: number };
  uncheckHabit: (id: number) => void;
  toggleHabitDate: (id: number, date: string) => void;
  updateHabitTitle: (id: number, title: string) => void;

  addCategory:    (name: string) => void;
  deleteCategory: (name: string) => void;
  editCategory:   (oldName: string, newName: string) => void;

  saveJournal:    (date: string, content: string) => void;
  setActiveProtocol: (mode: ProtocolMode) => void;
  setProfileImage: (uri: string | null) => void;
  addTradeLog: (payload: Omit<TradeLog, 'id' | 'timestamp' | 'pips'>) => void;
  togglePreparedNewsEvent: (event: Omit<PreparedNewsEvent, 'prepared'>) => void;

  checkMidnightReset: () => void;
  clearPenalty: () => void;
}

const INITIAL_QUESTS: Quest[] = [];

const INITIAL_HABITS: Habit[] = [];

function computeLevelUp(currentLevel: number, newTotalXP: number) {
  let lvl = currentLevel;
  let leveled = false;
  while (xpForLevel(lvl + 1) <= newTotalXP) { lvl++; leveled = true; }
  return { newLevel: lvl, leveledUp: leveled };
}

function dateKeyDaysAgo(baseDateKey: string, daysAgo: number) {
  const d = new Date(baseDateKey);
  d.setDate(d.getDate() - daysAgo);
  return localDateKey(d);
}

function checkedDatesFromWeek(week: boolean[], todayKey: string) {
  const checked: string[] = [];
  for (let i = 0; i < 7; i += 1) {
    if (week[i]) checked.push(dateKeyDaysAgo(todayKey, 6 - i));
  }
  return checked;
}

function buildWeekFromCheckedDates(checkedDates: string[], todayKey: string) {
  const s = new Set(checkedDates);
  return [...Array(7)].map((_, i) => s.has(dateKeyDaysAgo(todayKey, 6 - i)));
}

function computeCurrentStreakFromCheckedDates(checkedDates: string[], todayKey: string) {
  const s = new Set(checkedDates);
  let streak = 0;
  let cursor = new Date(todayKey);
  while (s.has(localDateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export const useSystemStore = create<SystemState>()(
  persist(
    (set, get) => ({
      level: 1,
      totalXP: 0,
      statPoints: { INT: 0, PER: 0, STR: 0, VIT: 0 },
      quests: INITIAL_QUESTS,
      habits: INITIAL_HABITS,
      journals: [],
      activeProtocol: 'MONARCH',
      tradeLogs: [],
      preparedNewsEvents: [],
      financeGold: 0,
      categories: ['Trading', 'Development', 'NU MOA', 'Health'],
      lastLoginDate: null,
      penaltyMode: false,
      profileImage: null,

      // ── Quests ──────────────────────────────────────────────────────────────
      addQuest: (questData) => set((state) => ({
        quests: [...state.quests, {
          ...questData,
          id: Date.now(),
          completed: false,
          dateCreated: new Date().toISOString(),
          progress: questData.isProgressBased ? 0 : undefined,
        }],
      })),

      updateQuest: (id, updates) => set((state) => ({
        quests: state.quests.map((q) => q.id === id ? { ...q, ...updates } : q),
      })),

      deleteQuest: (id) => set((state) => ({
        quests: state.quests.filter((q) => q.id !== id),
      })),

      // ── Categories ──────────────────────────────────────────────────────────
      addCategory: (name) => set((state) => {
        const trimmed = name.trim();
        if (!trimmed || state.categories.includes(trimmed)) return state;
        return { categories: [...state.categories, trimmed] };
      }),

      deleteCategory: (name) => set((state) => ({
        categories: state.categories.filter((c) => c !== name),
      })),

      editCategory: (oldName, newName) => set((state) => {
        const trimmed = newName.trim();
        if (!trimmed || state.categories.includes(trimmed)) return state;
        return {
          categories: state.categories.map((c) => c === oldName ? trimmed : c),
          quests: state.quests.map((q) => q.category === oldName ? { ...q, category: trimmed } : q)
        };
      }),

      addQuestProgress: (id, amount) => {
        let result = { leveledUp: false, newLevel: get().level };
        set((state) => {
          const quest = state.quests.find((q) => q.id === id);
          if (!quest || quest.completed || !quest.isProgressBased) return state;

          const oldProgress = quest.progress || 0;
          const newProgress = Math.min(100, Math.max(0, oldProgress + amount));
          
          if (newProgress === 100) {
            const newXP = state.totalXP + quest.xp;
            const { newLevel, leveledUp } = computeLevelUp(state.level, newXP);

            const newStatPoints = { ...state.statPoints };
            const sk = (quest.stat as keyof StatPoints);
            if (sk in newStatPoints) newStatPoints[sk] += quest.xp;

            result = { leveledUp, newLevel };
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

            return {
              quests: state.quests.map((q) => q.id === id ? { ...q, progress: 100, completed: true } : q),
              totalXP: newXP,
              level: newLevel,
              statPoints: newStatPoints,
            };
          } else {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            return {
              quests: state.quests.map((q) => q.id === id ? { ...q, progress: newProgress } : q),
            };
          }
        });
        return result;
      },

      toggleQuest: (id) => {
        let result = { leveledUp: false, newLevel: get().level };
        set((state) => {
          const quest = state.quests.find((q) => q.id === id);
          if (!quest || quest.completed) return state;

          const newXP = state.totalXP + quest.xp;
          const { newLevel, leveledUp } = computeLevelUp(state.level, newXP);

          // Increment stat affinity
          const newStatPoints = { ...state.statPoints };
          const sk = (quest.stat as keyof StatPoints);
          if (sk in newStatPoints) newStatPoints[sk] += quest.xp;

          result = { leveledUp, newLevel };
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

          return {
            quests: state.quests.map((q) => q.id === id ? { ...q, completed: true, progress: q.isProgressBased ? 100 : undefined } : q),
            totalXP: newXP,
            level: newLevel,
            statPoints: newStatPoints,
          };
        });
        return result;
      },

      uncheckQuest: (id) => set((state) => {
        const quest = state.quests.find((q) => q.id === id);
        if (!quest || !quest.completed) return state;

        const newXP = Math.max(0, state.totalXP - quest.xp);
        const { newLevel } = computeLevelUp(1, newXP);

        const newStatPoints = { ...state.statPoints };
        const sk = (quest.stat as keyof StatPoints);
        if (sk in newStatPoints) {
          newStatPoints[sk] = Math.max(0, newStatPoints[sk] - quest.xp);
        }

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        return {
          quests: state.quests.map((q) => q.id === id ? { ...q, completed: false, progress: q.isProgressBased ? 0 : undefined } : q),
          totalXP: newXP,
          level: newLevel,
          statPoints: newStatPoints,
        };
      }),

      // ── Habits ──────────────────────────────────────────────────────────────
      addHabit: (habitData) => set((state) => ({
        habits: [...state.habits, {
          ...habitData,
          id: Date.now(),
          streak: 0,
          bestStreak: 0,
          week: [false, false, false, false, false, false, false],
          checkedDates: [],
        }],
      })),

      deleteHabit: (id) => set((state) => ({
        habits: state.habits.filter((h) => h.id !== id),
      })),

      toggleHabit: (id) => {
        let result = { leveledUp: false, newLevel: get().level };
        set((state) => {
          const habit = state.habits.find((h) => h.id === id);
          if (!habit) return state;

          const todayKey = localDateKey(new Date());
          const checkedSet = new Set(
            (habit.checkedDates && habit.checkedDates.length > 0)
              ? habit.checkedDates
              : checkedDatesFromWeek(habit.week, todayKey)
          );
          if (checkedSet.has(todayKey)) return state;

          const newXP = state.totalXP + habit.xpPerDay;
          const { newLevel, leveledUp } = computeLevelUp(state.level, newXP);

          const newStatPoints = { ...state.statPoints };
          const sk = HABIT_STAT_MAP[habit.category];
          newStatPoints[sk] += habit.xpPerDay;

          checkedSet.add(todayKey);
          const checkedDates = [...checkedSet].sort();
          const newWeek = buildWeekFromCheckedDates(checkedDates, todayKey);
          const nextStreak = computeCurrentStreakFromCheckedDates(checkedDates, todayKey);

          result = { leveledUp, newLevel };
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

          return {
            habits: state.habits.map((h) => h.id === id ? {
              ...h,
              week: newWeek,
              checkedDates,
              streak: nextStreak,
              bestStreak: Math.max(h.bestStreak, nextStreak),
            } : h),
            totalXP: newXP,
            level: newLevel,
            statPoints: newStatPoints,
          };
        });
        return result;
      },

      uncheckHabit: (id) => set((state) => {
        const habit = state.habits.find((h) => h.id === id);
        if (!habit) return state;

        const todayKey = localDateKey(new Date());
        const checkedSet = new Set(
          (habit.checkedDates && habit.checkedDates.length > 0)
            ? habit.checkedDates
            : checkedDatesFromWeek(habit.week, todayKey)
        );
        if (!checkedSet.has(todayKey)) return state;

        const newXP = Math.max(0, state.totalXP - habit.xpPerDay);
        const { newLevel } = computeLevelUp(1, newXP);

        const newStatPoints = { ...state.statPoints };
        const sk = HABIT_STAT_MAP[habit.category];
        newStatPoints[sk] = Math.max(0, newStatPoints[sk] - habit.xpPerDay);

        checkedSet.delete(todayKey);
        const checkedDates = [...checkedSet].sort();
        const newWeek = buildWeekFromCheckedDates(checkedDates, todayKey);
        const nextStreak = computeCurrentStreakFromCheckedDates(checkedDates, todayKey);

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        return {
          habits: state.habits.map((h) => h.id === id ? {
            ...h,
            week: newWeek,
            checkedDates,
            streak: nextStreak,
          } : h),
          totalXP: newXP,
          level: newLevel,
          statPoints: newStatPoints,
        };
      }),

      toggleHabitDate: (id, date) => set((state) => {
        const habit = state.habits.find((h) => h.id === id);
        if (!habit) return state;

        const target = new Date(date);
        const endOfToday = new Date();
        endOfToday.setHours(23, 59, 59, 999);
        if (target.getTime() > endOfToday.getTime()) return state; // no future dates

        const todayKey = localDateKey(new Date());
        const checkedSet = new Set(
          (habit.checkedDates && habit.checkedDates.length > 0)
            ? habit.checkedDates
            : checkedDatesFromWeek(habit.week, todayKey)
        );

        const key = localDateKey(target);
        if (checkedSet.has(key)) checkedSet.delete(key);
        else checkedSet.add(key);

        const checkedDates = [...checkedSet].sort();
        const week = buildWeekFromCheckedDates(checkedDates, todayKey);
        const streak = computeCurrentStreakFromCheckedDates(checkedDates, todayKey);

        return {
          habits: state.habits.map((h) => h.id === id ? {
            ...h,
            checkedDates,
            week,
            streak,
            bestStreak: Math.max(h.bestStreak, streak),
          } : h),
        };
      }),

      updateHabitTitle: (id, title) => set((state) => ({
        habits: state.habits.map((h) => h.id === id ? { ...h, title: title.trim() } : h),
      })),

      // ── Journal ─────────────────────────────────────────────────────────────
      saveJournal: (date, content) => set((state) => {
        const existing = state.journals.findIndex(j => j.date === date);
        if (existing >= 0) {
          const next = [...state.journals];
          if (!content.trim()) next.splice(existing, 1); // remove if empty
          else next[existing] = { ...next[existing], content };
          return { journals: next };
        } else {
          if (!content.trim()) return state;
          return { journals: [...state.journals, { date, content }] };
        }
      }),

      setActiveProtocol: (mode) => set({ activeProtocol: mode }),

      setProfileImage: (uri) => set({ profileImage: uri }),

      addTradeLog: (payload) => set((state) => {
        const pips = Math.round((payload.exitPrice - payload.entryPrice) * 100);
        const positive = pips > 0;
        const xpGain = positive ? Math.abs(pips) : Math.max(5, Math.round(Math.abs(pips) * 0.25));
        const newXP = state.totalXP + xpGain;
        const { newLevel } = computeLevelUp(state.level, newXP);
        const newStatPoints = { ...state.statPoints, PER: state.statPoints.PER + xpGain };

        return {
          tradeLogs: [
            {
              id: Date.now(),
              timestamp: new Date().toISOString(),
              ...payload,
              pips,
            },
            ...state.tradeLogs,
          ],
          financeGold: state.financeGold + Math.max(0, pips),
          totalXP: newXP,
          level: newLevel,
          statPoints: newStatPoints,
        };
      }),

      togglePreparedNewsEvent: (event) => set((state) => {
        const existing = state.preparedNewsEvents.find((e) => e.id === event.id);
        const nextPrepared = existing ? !existing.prepared : true;
        const xpGain = nextPrepared ? 50 : -50;
        const boundedXpGain = Math.max(-state.totalXP, xpGain);
        const newXP = state.totalXP + boundedXpGain;
        const { newLevel } = computeLevelUp(1, newXP);
        const newStatPoints = {
          ...state.statPoints,
          PER: Math.max(0, state.statPoints.PER + boundedXpGain),
        };

        const nextEvents = existing
          ? state.preparedNewsEvents.map((e) => e.id === event.id ? { ...e, prepared: nextPrepared } : e)
          : [...state.preparedNewsEvents, { ...event, prepared: true }];

        return {
          preparedNewsEvents: nextEvents,
          totalXP: newXP,
          level: newLevel,
          statPoints: newStatPoints,
        };
      }),

      // ── Reset ────────────────────────────────────────────────────────────────
      checkMidnightReset: () => set((state) => {
        const today = localDateKey(new Date());
        const last  = state.lastLoginDate?.split('T')[0];
        if (!last) return { lastLoginDate: today };
        if (last === today) return state;

        // New day — shift habit weeks, and only penalize unfinished quests created "yesterday".
        const hadUnfinishedYesterday = shouldEnablePenaltyForDateChange(state.quests, last);
        const newHabits = state.habits.map((h) => ({
          ...h,
          week: [...h.week.slice(1), false],
          streak: h.week[6] ? h.streak : 0,
        }));

        return {
          lastLoginDate: today,
          habits: newHabits,
          penaltyMode: hadUnfinishedYesterday,
        };
      }),

      clearPenalty: () => set({ penaltyMode: false }),
    }),
    {
      name: 'monarch-system-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
