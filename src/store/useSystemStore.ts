import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';

export type QuestRank     = 'E' | 'D' | 'C' | 'B' | 'A' | 'S';
export type HabitCategory = 'health' | 'mind' | 'work' | 'social';

export interface StatPoints { INT: number; PER: number; STR: number; VIT: number; }

export interface Quest {
  id: number; title: string; description: string;
  category: string; stat: string; xp: number;
  rank: QuestRank; completed: boolean; dateCreated: string;
}

export interface Habit {
  id: number; title: string; category: HabitCategory;
  streak: number; bestStreak: number; xpPerDay: number; week: boolean[];
}

export interface JournalEntry {
  date: string; // YYYY-MM-DD
  content: string;
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
  categories: string[];           // user-managed quest categories
  lastLoginDate: string | null;
  penaltyMode: boolean;

  addQuest:    (q: Omit<Quest, 'id' | 'completed' | 'dateCreated'>) => void;
  deleteQuest: (id: number) => void;
  toggleQuest: (id: number) => { leveledUp: boolean; newLevel: number };

  addHabit:    (h: Pick<Habit, 'title' | 'category' | 'xpPerDay'>) => void;
  deleteHabit: (id: number) => void;
  toggleHabit: (id: number) => { leveledUp: boolean; newLevel: number };

  addCategory:    (name: string) => void;
  deleteCategory: (name: string) => void;

  saveJournal:    (date: string, content: string) => void;

  checkMidnightReset: () => void;
  clearPenalty: () => void;
}

const INITIAL_QUESTS: Quest[] = [
  { id:1, title:'XAUUSD Market Study',    description:'Study the 1H + 4H chart. Identify key S/R zones.', category:'Trading',     stat:'PER', xp:50,  rank:'D', completed:false, dateCreated:new Date().toISOString() },
  { id:2, title:'Ashcol API Refactor',     description:'Implement JWT refresh tokens and role-based guards.', category:'Development', stat:'INT', xp:100, rank:'C', completed:false, dateCreated:new Date().toISOString() },
  { id:3, title:'NU MOA: Web Systems Quiz',description:'Complete Module 4 assessment. Review slides first.',  category:'NU MOA',      stat:'INT', xp:75,  rank:'D', completed:false, dateCreated:new Date().toISOString() },
  { id:4, title:'Physical: 3km Run',       description:'Complete a 3km outdoor run before 9AM.',              category:'Health',      stat:'STR', xp:60,  rank:'D', completed:false, dateCreated:new Date().toISOString() },
];

const INITIAL_HABITS: Habit[] = [
  { id:1, title:'3km Morning Run',   category:'health', streak:5,  bestStreak:14, xpPerDay:40, week:[true,false,true,true,true,true,false] },
  { id:2, title:'Daily Chart Study', category:'mind',   streak:12, bestStreak:30, xpPerDay:35, week:[true,true,true,true,true,true,false] },
  { id:3, title:'Code for 2 Hours',  category:'work',   streak:8,  bestStreak:21, xpPerDay:50, week:[true,true,false,true,true,true,false] },
];

export const xpForLevel = (lvl: number) => Math.floor(100 * Math.pow(lvl, 1.5));

function computeLevelUp(currentLevel: number, newTotalXP: number) {
  let lvl = currentLevel;
  let leveled = false;
  while (xpForLevel(lvl + 1) <= newTotalXP) { lvl++; leveled = true; }
  return { newLevel: lvl, leveledUp: leveled };
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
      categories: ['Trading', 'Development', 'NU MOA', 'Health'],
      lastLoginDate: null,
      penaltyMode: false,

      // ── Quests ──────────────────────────────────────────────────────────────
      addQuest: (questData) => set((state) => ({
        quests: [...state.quests, {
          ...questData,
          id: Date.now(),
          completed: false,
          dateCreated: new Date().toISOString(),
        }],
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
        // Move orphaned quests to first remaining category or keep as-is
      })),

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
            quests: state.quests.map((q) => q.id === id ? { ...q, completed: true } : q),
            totalXP: newXP,
            level: newLevel,
            statPoints: newStatPoints,
          };
        });
        return result;
      },

      // ── Habits ──────────────────────────────────────────────────────────────
      addHabit: (habitData) => set((state) => ({
        habits: [...state.habits, {
          ...habitData,
          id: Date.now(),
          streak: 0,
          bestStreak: 0,
          week: [false, false, false, false, false, false, false],
        }],
      })),

      deleteHabit: (id) => set((state) => ({
        habits: state.habits.filter((h) => h.id !== id),
      })),

      toggleHabit: (id) => {
        let result = { leveledUp: false, newLevel: get().level };
        set((state) => {
          const habit = state.habits.find((h) => h.id === id);
          if (!habit || habit.week[6]) return state;

          const newXP = state.totalXP + habit.xpPerDay;
          const { newLevel, leveledUp } = computeLevelUp(state.level, newXP);

          const newStatPoints = { ...state.statPoints };
          const sk = HABIT_STAT_MAP[habit.category];
          newStatPoints[sk] += habit.xpPerDay;

          const newWeek = [...habit.week];
          newWeek[6] = true;

          result = { leveledUp, newLevel };
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

          return {
            habits: state.habits.map((h) => h.id === id ? {
              ...h,
              week: newWeek,
              streak: h.streak + 1,
              bestStreak: Math.max(h.bestStreak, h.streak + 1),
            } : h),
            totalXP: newXP,
            level: newLevel,
            statPoints: newStatPoints,
          };
        });
        return result;
      },

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

      // ── Reset ────────────────────────────────────────────────────────────────
      checkMidnightReset: () => set((state) => {
        const today = new Date().toISOString().split('T')[0];
        const last  = state.lastLoginDate?.split('T')[0];
        if (!last) return { lastLoginDate: today };
        if (last === today) return state;

        // New day — shift habit weeks, check penalty
        const hadUnfinished = state.quests.some((q) => !q.completed);
        const newHabits = state.habits.map((h) => ({
          ...h,
          week: [...h.week.slice(1), false],
          streak: h.week[6] ? h.streak : 0,
        }));

        return {
          lastLoginDate: today,
          habits: newHabits,
          penaltyMode: hadUnfinished,
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
