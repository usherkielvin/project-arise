/**
 * Home — Today's Protocol. Command Center. Themed (light + dark).
 */
import React, { useState } from 'react';
import { ScrollView, View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue, useAnimatedStyle,
  withTiming, withSequence, withRepeat, FadeIn, Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { LevelUpModal } from '../../src/components/LevelUpModal';
import { useTheme } from '../../src/theme/ThemeContext';
import { useSystemStore, Quest, xpForLevel } from '../../src/store/useSystemStore';
import { F } from '../../src/theme/fonts';
import { Check, ChevronRight, Flame, BookOpen, PenLine } from 'lucide-react-native';
import { useRouter } from 'expo-router';

// ─── Pulsing dot ────────────────────────────────────────────────────────────────
function PulsingDot({ color }: { color: string }) {
  const pulse = useSharedValue(0);
  React.useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 900, easing: Easing.out(Easing.cubic) }),
        withTiming(0, { duration: 700, easing: Easing.in(Easing.cubic) })
      ), -1, false
    );
  }, []);
  const ring = useAnimatedStyle(() => ({
    opacity: 0.45 * (1 - pulse.value),
    transform: [{ scale: 1 + pulse.value * 1.5 }],
  }));
  return (
    <View style={{ width: 10, height: 10, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View style={[{ position:'absolute', width:10, height:10, borderRadius:5, backgroundColor: color }, ring]} />
      <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: color }} />
    </View>
  );
}

function PriorityCard({
  quest, onToggle, onAddProgress,
}: { 
  quest: Quest; 
  onToggle: (id: number) => void;
  onAddProgress: (id: number, amt: number) => void;
}) {
  const { colors: C } = useTheme();
  const scale      = useSharedValue(1);
  const checkScale = useSharedValue(quest.completed ? 1 : 0);
  const [expanded, setExpanded] = useState(false);

  React.useEffect(() => {
    checkScale.value = withTiming(quest.completed ? 1 : 0, { duration: 180, easing: Easing.out(Easing.cubic) });
  }, [quest.completed]);

  const handleCardPress = () => {
    if (quest.completed) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    scale.value = withSequence(
      withTiming(0.97, { duration: 70, easing: Easing.out(Easing.cubic) }),
      withTiming(1.0,  { duration: 120, easing: Easing.out(Easing.cubic) })
    );
    setExpanded(!expanded);
  };

  const handleCheckPress = () => {
    Haptics.selectionAsync();
    onToggle(quest.id);
  };

  const cardAnim  = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const checkAnim = useAnimatedStyle(() => ({ transform: [{ scale: checkScale.value }] }));

  return (
    <Pressable onPress={handleCardPress}>
      <Animated.View style={[
        styles.priorityCard,
        { backgroundColor: C.void, borderColor: C.border },
        quest.completed && styles.priorityCardDone,
        cardAnim,
      ]}>
        <View style={styles.priorityTop}>
          <Text style={[styles.priorityCategory, { color: C.textMut }]}>{quest.category}</Text>
          <Pressable onPress={handleCheckPress} hitSlop={12} style={[
            styles.checkbox,
            { borderColor: quest.completed ? C.blue : C.borderMid },
            quest.completed && { backgroundColor: C.blue },
          ]}>
            <Animated.View style={checkAnim}>
              <Check size={11} color="#fff" strokeWidth={3} />
            </Animated.View>
          </Pressable>
        </View>
        <Text style={[
          styles.priorityTitle,
          { color: C.text },
          quest.completed && { color: C.textMut, textDecorationLine: 'line-through' },
        ]}>
          {quest.title}
        </Text>
        {!quest.completed && quest.description ? (
          <Text style={[styles.priorityDesc, { color: C.textMut }]} numberOfLines={expanded ? undefined : 2}>{quest.description}</Text>
        ) : null}
        
        <View style={styles.priorityFooter}>
          {quest.isProgressBased && !quest.completed && (
            <View style={{ backgroundColor: C.blueDim, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, borderWidth: 1, borderColor: C.blueBorder }}>
              <Text style={{ color: C.blue, fontFamily: F.bold, fontSize: 10 }}>
                {quest.progress ?? 0}%
              </Text>
            </View>
          )}
          <Text style={[styles.priorityXP, { color: quest.completed ? C.textMut : C.blue }]}>+{quest.xp} XP</Text>
          {quest.completed && <Text style={[styles.completedLabel, { color: C.success }]}>Completed</Text>}
        </View>

        {/* Expanded Progress Options */}
        {expanded && quest.isProgressBased && !quest.completed && (
          <Animated.View entering={FadeIn.duration(150)} style={{ marginTop: 6, gap: 10, borderTopWidth: 1, borderTopColor: C.border, paddingTop: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={{ fontFamily: F.medium, fontSize: 12, color: C.textMut }}>
                Update Progress
              </Text>
              <Text style={{ fontFamily: F.bold, fontSize: 12, color: C.blue }}>
                {quest.progress ?? 0}%
              </Text>
            </View>
            <View style={{ height: 6, backgroundColor: C.surface2, borderRadius: 3, overflow: 'hidden' }}>
              <View style={{ height: '100%', width: `${quest.progress ?? 0}%`, backgroundColor: C.blue, borderRadius: 3 }} />
            </View>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
              {[3, 5, 10, 25].map(amt => (
                <Pressable 
                  key={amt} 
                  style={{ flex: 1, paddingVertical: 8, backgroundColor: C.blueDim, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: C.blueBorder }}
                  onPress={() => onAddProgress(quest.id, amt)}
                >
                  <Text style={{ color: C.blue, fontFamily: F.semiBold, fontSize: 13 }}>+{amt}%</Text>
                </Pressable>
              ))}
            </View>
          </Animated.View>
        )}
      </Animated.View>
    </Pressable>
  );
}

export default function HomeScreen() {
  const { colors: C } = useTheme();
  const quests = useSystemStore((s) => s.quests);
  const habits = useSystemStore((s) => s.habits);
  const journals = useSystemStore((s) => s.journals);
  const level = useSystemStore((s) => s.level);
  const totalXP = useSystemStore((s) => s.totalXP);
  const toggleQuest = useSystemStore((s) => s.toggleQuest);
  const uncheckQuest = useSystemStore((s) => s.uncheckQuest);
  const addQuestProgress = useSystemStore((s) => s.addQuestProgress);
  const [showLvlUp, setShowLvlUp] = useState(false);
  const [modalLevel, setModalLevel] = useState(1);
  const router = useRouter();

  // Get active quests (top 3 pending)
  const openQuests = quests.filter(q => !q.completed);
  const activeQuests = openQuests.slice(0, 3);
  
  // Also get some completed ones if we want to show them, or just use all for the progress math
  const todayDailies = quests; // Or filter by date if needed. Let's use all for now
  const done = todayDailies.filter(q => q.completed).length;
  
  let earnedQuestScore = 0;
  let totalQuestScore = todayDailies.length * 100;
  todayDailies.forEach(q => {
    if (q.completed) earnedQuestScore += 100;
    else if (q.isProgressBased && q.progress) earnedQuestScore += q.progress;
  });

  const pct = totalQuestScore > 0 ? Math.round((earnedQuestScore / totalQuestScore) * 100) : 0;

  // Journal for today
  const todayStr = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0];
  const todayJournal = journals.find(j => j.date === todayStr)?.content || '';

  const nextXP = xpForLevel(level + 1);
  const curXP = xpForLevel(level);
  const progress = Math.min(((totalXP - curXP) / (nextXP - curXP)) * 100, 100);

  const handleToggleQuest = (id: number) => {
    const q = quests.find(x => x.id === id);
    if (q?.completed) {
      uncheckQuest(id);
    } else {
      const result = toggleQuest(id);
      if (result && result.leveledUp) {
        setModalLevel(result.newLevel);
        setShowLvlUp(true);
      }
    }
  };

  const handleAddProgress = (id: number, amt: number) => {
    const result = addQuestProgress(id, amt);
    if (result && result.leveledUp) {
      setModalLevel(result.newLevel);
      setShowLvlUp(true);
    }
  };

  const HABIT_SNAP = habits.slice(0, 2).map(h => ({
    label: h.title,
    streak: h.streak,
    done: h.week[6]
  }));
  const habitsDoneToday = habits.filter((h) => h.week[6]).length;
  const totalHabits = habits.length;
  const habitPct = totalHabits > 0 ? Math.round((habitsDoneToday / totalHabits) * 100) : 0;

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: C.surface }]}>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.statusRow}>
            <PulsingDot color={C.success} />
            <Text style={[styles.statusText, { color: C.textMut }]}>System: Active</Text>
          </View>
          <Text style={[styles.heroTitle, { color: C.text }]}>{`Today's\nProtocol`}</Text>
          <Text style={[styles.heroDate, { color: C.textMut }]}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </Text>
        </View>

        {/* Level strip */}
        <View style={styles.levelStrip}>
          <View style={styles.levelStripRow}>
            <Text style={[styles.levelStripLabel, { color: C.text }]}>Level {String(level).padStart(2, '0')}</Text>
            <Text style={[styles.levelStripPct, { color: C.textMut }]}>{Math.round(progress)}% to next</Text>
          </View>
          <View style={[styles.levelBar, { backgroundColor: C.surface2 }]}>
            <View style={[styles.levelBarFill, { width: `${progress}%`, backgroundColor: C.blue }]} />
          </View>
        </View>

        {/* Completion strip */}
        <View style={styles.completionStrip}>
          <Text style={[styles.completionText, { color: C.textMut }]}>
            {done === 0 ? 'No objectives cleared yet. Begin.' :
             done === todayDailies.length ? '✦  All objectives cleared.' :
             `${done} of ${todayDailies.length} objectives cleared`}
          </Text>
          <Text style={[styles.completionPct, { color: C.blue }]}>{pct}%</Text>
        </View>

        {/* Daily quick metrics */}
        <View style={styles.metricsRow}>
          <View style={[styles.metricCard, { backgroundColor: C.void, borderColor: C.border, justifyContent: 'space-between' }]}>
            <Text style={[styles.metricLabel, { color: C.textMut }]}>Open Quests</Text>
            <View style={{ marginTop: 4 }}>
              <Text style={[styles.metricValue, { color: C.text, marginTop: 0 }]}>{openQuests.length}</Text>
            </View>
          </View>
          <View style={[styles.metricCard, { backgroundColor: C.void, borderColor: C.border, justifyContent: 'space-between' }]}>
            <Text style={[styles.metricLabel, { color: C.textMut }]}>Habits Today</Text>
            <View style={{ marginTop: 4 }}>
              <Text style={[styles.metricValue, { color: C.text, marginTop: 0 }]}>
                {totalHabits > 0 ? `${habitPct}%` : '0%'}
              </Text>
              {totalHabits > 0 && (
                <View style={{ height: 4, backgroundColor: C.surface2, borderRadius: 2, marginTop: 8, overflow: 'hidden' }}>
                  <View style={{ height: '100%', width: `${habitPct}%`, backgroundColor: C.blue, borderRadius: 2 }} />
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Active Objectives */}
        <View style={styles.section}>
          <Text style={[styles.sectionEyebrow, { color: C.textMut }]}>Active Objectives</Text>
          <View style={styles.cardStack}>
            {activeQuests.length === 0 ? (
               <Text style={[styles.priorityDesc, { color: C.textMut }]}>No active quests. You are clear.</Text>
            ) : (
              activeQuests.map((q, i) => (
                <Animated.View key={q.id} entering={FadeIn.delay(i * 40).duration(220)}>
                  <PriorityCard
                    quest={q}
                    onToggle={handleToggleQuest}
                    onAddProgress={handleAddProgress}
                  />
                </Animated.View>
              ))
            )}
          </View>
        </View>

        {/* View all quests */}
        <Pressable style={styles.viewAllBtn} onPress={() => router.push('/(tabs)/quests')}>
          <Text style={[styles.viewAllText, { color: C.blue }]}>View all quests</Text>
          <ChevronRight size={14} color={C.blue} strokeWidth={2} />
        </Pressable>

        {/* Habit snapshot */}
        <View style={styles.section}>
          <Text style={[styles.sectionEyebrow, { color: C.textMut }]}>Habits Preview</Text>
          <View style={[styles.habitSnapshot, { borderTopColor: C.border }]}>
            {HABIT_SNAP.length ? HABIT_SNAP.map((h, i) => (
              <Animated.View
                key={i}
                entering={FadeIn.delay(200 + i * 30).duration(220)}
                style={[styles.habitRow, { borderBottomColor: C.border }]}
              >
                <View style={[styles.habitDot, { backgroundColor: h.done ? C.success : C.borderMid }]} />
                <Text style={[
                  styles.habitLabel,
                  { color: h.done ? C.textMut : C.text },
                ]}>
                  {h.label}
                </Text>
                <View style={{ flex: 1 }} />
                <View style={[
                  styles.habitStreakPill,
                  {
                    backgroundColor: h.streak >= 7 ? 'rgba(249, 115, 22, 0.14)' : C.surface2,
                    borderColor: h.streak >= 7 ? 'rgba(249, 115, 22, 0.35)' : C.border,
                  },
                ]}>
                  <Flame
                    size={12}
                    color={h.streak >= 7 ? '#F97316' : C.textMut}
                    strokeWidth={2}
                    fill={h.streak >= 7 ? '#F97316' : 'transparent'}
                  />
                  <Text style={[
                    styles.habitStreak,
                    { color: h.streak >= 7 ? '#F97316' : C.textMut },
                  ]}>
                    {h.streak}
                  </Text>
                </View>
              </Animated.View>
            )) : (
              <Text style={[styles.priorityDesc, { color: C.textMut, paddingVertical: 12 }]}>No habits yet. Add one in Habits tab.</Text>
            )}
          </View>
        </View>

        {/* Quick Journal */}
        <View style={styles.section}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <Text style={[styles.sectionEyebrow, { color: C.textMut, marginBottom: 0 }]}>Journal</Text>
            <Pressable onPress={() => router.push('/(tabs)/journal')} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <BookOpen size={12} color={C.blue} />
              <Text style={{ fontFamily: F.medium, fontSize: 11, color: C.blue }}>Open Logs</Text>
            </Pressable>
          </View>
          <Pressable
            style={({ pressed }) => [
              styles.journalPanel,
              { backgroundColor: C.void, borderColor: C.border, transform: [{ scale: pressed ? 0.98 : 1 }] }
            ]}
            onPress={() => router.push({ pathname: '/(tabs)/journal', params: { openDate: todayStr } })}
          >
            {todayJournal.trim().length ? (
              <View style={styles.journalPreview}>
                <Text style={[styles.journalInput, { color: C.text }]} numberOfLines={4}>
                  {todayJournal.trim()}
                </Text>
                <View style={[styles.journalFooter, { borderTopColor: C.border, justifyContent: 'flex-end' }]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Text style={{ fontFamily: F.medium, fontSize: 11, color: C.textMut }}>Edit</Text>
                    <ChevronRight size={14} color={C.textMut} />
                  </View>
                </View>
              </View>
            ) : (
              <View style={styles.journalEmpty}>
                <View style={[styles.journalIconBg, { backgroundColor: C.blueDim, borderColor: C.blueBorder }]}>
                  <PenLine size={20} color={C.blue} />
                </View>
                <Text style={[styles.journalEmptyTitle, { color: C.text }]}>Write today&apos;s entry</Text>
                <Text style={[styles.journalEmptyDesc, { color: C.textMut }]}>Log your thoughts, achievements, and reflections.</Text>
              </View>
            )}
          </Pressable>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      <LevelUpModal
        visible={showLvlUp}
        newLevel={modalLevel}
        statGains={[
          { label: 'INT', value: '+2' },
          { label: 'PER', value: '+1' },
          { label: 'Next Threshold', value: `${xpForLevel(modalLevel + 1)} XP` },
        ]}
        onDismiss={() => setShowLvlUp(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingBottom: 130 },
  header: { paddingHorizontal: 24, paddingTop: 32, paddingBottom: 8, gap: 8 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  activeDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontFamily: F.mono, fontSize: 10, letterSpacing: 2, textTransform: 'uppercase' },
  heroTitle: { fontFamily: F.bold, fontSize: 38, letterSpacing: -1.5, lineHeight: 44, marginTop: 6 },
  heroDate: { fontFamily: F.regular, fontSize: 13, marginTop: 2 },
  levelStrip: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 4, gap: 8 },
  levelStripRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  levelStripLabel: { fontFamily: F.semiBold, fontSize: 13 },
  levelStripPct: { fontFamily: F.regular, fontSize: 12 },
  levelBar: { height: 2, borderRadius: 1, overflow: 'hidden' },
  levelBarFill: { height: '100%', borderRadius: 1 },
  completionStrip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingTop: 16, paddingBottom: 4 },
  completionText: { flex: 1, fontFamily: F.regular, fontSize: 13 },
  completionPct: { fontFamily: F.semiBold, fontSize: 13 },
  metricsRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 24, paddingTop: 14 },
  metricCard: { flex: 1, borderWidth: 1, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 10 },
  metricLabel: { fontFamily: F.mono, fontSize: 9, letterSpacing: 1.4, textTransform: 'uppercase' },
  metricValue: { fontFamily: F.semiBold, fontSize: 16, marginTop: 4 },
  section: { marginTop: 28, paddingHorizontal: 24 },
  sectionEyebrow: { fontFamily: F.mono, fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 14 },
  cardStack: { gap: 10 },
  priorityCard: { borderRadius: 16, borderWidth: 1, padding: 18, gap: 10 },
  priorityCardDone: { opacity: 0.5 },
  priorityTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  priorityCategory: { fontFamily: F.mono, fontSize: 9, letterSpacing: 2, textTransform: 'uppercase' },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  priorityTitle: { fontFamily: F.semiBold, fontSize: 17, letterSpacing: -0.3, lineHeight: 24 },
  priorityDesc: { fontFamily: F.regular, fontSize: 13, lineHeight: 19 },
  priorityFooter: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 2 },
  priorityXP: { fontFamily: F.semiBold, fontSize: 12 },
  completedLabel: { fontFamily: F.mono, fontSize: 9, letterSpacing: 1.5, textTransform: 'uppercase' },
  viewAllBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 24, paddingTop: 14 },
  viewAllText: { fontFamily: F.medium, fontSize: 13 },
  habitSnapshot: { gap: 0, borderTopWidth: 1 },
  habitRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13, borderBottomWidth: 1 },
  habitDot: { width: 8, height: 8, borderRadius: 4 },
  habitLabel: { fontFamily: F.medium, fontSize: 14 },
  habitStreakPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  habitStreak: { fontFamily: F.mono, fontSize: 10, letterSpacing: 0.3 },
  journalPanel: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  journalPreview: {
    padding: 16,
    paddingBottom: 0,
  },
  journalInput: {
    fontFamily: F.regular,
    fontSize: 14,
    lineHeight: 22,
    minHeight: 60,
  },
  journalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 12,
    borderTopWidth: 1,
  },
  journalWordCount: {
    fontFamily: F.mono,
    fontSize: 10,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  journalEmpty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  journalIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
  },
  journalEmptyTitle: {
    fontFamily: F.semiBold,
    fontSize: 16,
    marginBottom: 6,
  },
  journalEmptyDesc: {
    fontFamily: F.regular,
    fontSize: 13,
    textAlign: 'center',
  },
});
