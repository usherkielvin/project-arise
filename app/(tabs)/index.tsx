/**
 * Home — Today's Protocol. Command Center. Themed (light + dark).
 */
import React, { useState } from 'react';
import { ScrollView, View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue, useAnimatedStyle,
  withTiming, withSequence, withRepeat, FadeIn, FadeInDown, Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { LevelUpModal } from '../../src/components/LevelUpModal';
import { useTheme } from '../../src/theme/ThemeContext';
import { useSystemStore, xpForLevel } from '../../src/store/useSystemStore';
import { F } from '../../src/theme/fonts';
import { Check, ChevronRight } from 'lucide-react-native';
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

const RANK_COLORS_LIGHT: Record<string, string> = {
  E:'#94A3B8', D:'#10B981', C:'#0891B2', B:'#4F46E5', A:'#7C3AED', S:'#D97706',
};
const RANK_COLORS_DARK: Record<string, string> = {
  E:'#64748B', D:'#34D399', C:'#22D3EE', B:'#818CF8', A:'#A78BFA', S:'#FBBF24',
};

const TOP_QUESTS = [
  { id:1, title:'XAUUSD Market Study',      description:'Study the 1H + 4H chart. Identify key S/R zones before the NY session.', category:'Perception',   xp:50,  completed:false },
  { id:2, title:'Ashcol API Refactor',       description:'Implement JWT refresh tokens and role-based route guards in Spring.',      category:'Intelligence', xp:100, completed:false },
  { id:3, title:'NU MOA: Web Systems Quiz',  description:'Complete the online assessment for Module 4. Review lecture slides first.', category:'Intelligence', xp:75,  completed:false },
];

function PriorityCard({
  title, description, category, xp, completed, onPress,
}: { title: string; description: string; category: string; xp: number; completed: boolean; onPress: () => void }) {
  const { colors: C } = useTheme();
  const scale      = useSharedValue(1);
  const checkScale = useSharedValue(completed ? 1 : 0);

  React.useEffect(() => {
    checkScale.value = withTiming(completed ? 1 : 0, { duration: 180, easing: Easing.out(Easing.cubic) });
  }, [completed]);

  const handlePress = () => {
    if (completed) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    scale.value = withSequence(
      withTiming(0.97, { duration: 70, easing: Easing.out(Easing.cubic) }),
      withTiming(1.0,  { duration: 120, easing: Easing.out(Easing.cubic) })
    );
    onPress();
  };

  const cardAnim  = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const checkAnim = useAnimatedStyle(() => ({ transform: [{ scale: checkScale.value }] }));

  return (
    <Pressable onPress={handlePress}>
      <Animated.View style={[
        styles.priorityCard,
        { backgroundColor: C.void, borderColor: C.border },
        completed && styles.priorityCardDone,
        cardAnim,
      ]}>
        <View style={styles.priorityTop}>
          <Text style={[styles.priorityCategory, { color: C.textMut }]}>{category}</Text>
          <View style={[
            styles.checkbox,
            { borderColor: completed ? C.blue : C.borderMid },
            completed && { backgroundColor: C.blue },
          ]}>
            <Animated.View style={checkAnim}>
              <Check size={11} color="#fff" strokeWidth={3} />
            </Animated.View>
          </View>
        </View>
        <Text style={[
          styles.priorityTitle,
          { color: C.text },
          completed && { color: C.textMut, textDecorationLine: 'line-through' },
        ]}>
          {title}
        </Text>
        {!completed && (
          <Text style={[styles.priorityDesc, { color: C.textMut }]} numberOfLines={2}>{description}</Text>
        )}
        <View style={styles.priorityFooter}>
          <Text style={[styles.priorityXP, { color: completed ? C.textMut : C.blue }]}>+{xp} XP</Text>
          {completed && <Text style={[styles.completedLabel, { color: C.success }]}>Completed</Text>}
        </View>
      </Animated.View>
    </Pressable>
  );
}

export default function HomeScreen() {
  const { colors: C, isDark } = useTheme();
  const store = useSystemStore();
  const [showLvlUp, setShowLvlUp] = useState(false);
  const [modalLevel, setModalLevel] = useState(1);
  const router = useRouter();

  // Get active quests (top 3 pending)
  const activeQuests = store.quests.filter(q => !q.completed).slice(0, 3);
  
  // Also get some completed ones if we want to show them, or just use all for the progress math
  const todayDailies = store.quests; // Or filter by date if needed. Let's use all for now
  const done = todayDailies.filter(q => q.completed).length;
  const pct = todayDailies.length ? Math.round((done / todayDailies.length) * 100) : 0;

  const nextXP = xpForLevel(store.level + 1);
  const curXP = xpForLevel(store.level);
  const progress = Math.min(((store.totalXP - curXP) / (nextXP - curXP)) * 100, 100);

  const handleToggleQuest = (id: number) => {
    const result = store.toggleQuest(id);
    if (result && result.leveledUp) {
      setModalLevel(result.newLevel);
      setShowLvlUp(true);
    }
  };

  const HABIT_SNAP = store.habits.slice(0, 3).map(h => ({
    label: h.title,
    streak: h.streak,
    done: h.week[6]
  }));

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: C.surface }]}>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.statusRow}>
            <PulsingDot color={C.success} />
            <Text style={[styles.statusText, { color: C.textMut }]}>System: Active</Text>
          </View>
          <Text style={[styles.heroTitle, { color: C.text }]}>Today's{'\n'}Protocol</Text>
          <Text style={[styles.heroDate, { color: C.textMut }]}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </Text>
        </View>

        {/* Level strip */}
        <View style={styles.levelStrip}>
          <View style={styles.levelStripRow}>
            <Text style={[styles.levelStripLabel, { color: C.text }]}>Level {String(store.level).padStart(2, '0')}</Text>
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
                    title={q.title}
                    description={q.description}
                    category={q.category}
                    xp={q.xp}
                    completed={q.completed}
                    onPress={() => handleToggleQuest(q.id)}
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
          <Text style={[styles.sectionEyebrow, { color: C.textMut }]}>Habit Streak</Text>
          <View style={[styles.habitSnapshot, { borderTopColor: C.border }]}>
            {HABIT_SNAP.map((h, i) => (
              <Animated.View
                key={i}
                entering={FadeIn.delay(200 + i * 30).duration(220)}
                style={[styles.habitRow, { borderBottomColor: C.border }]}
              >
                <View style={[styles.habitDot, { backgroundColor: h.done ? C.success : C.borderMid }]} />
                <Text style={[
                  styles.habitLabel,
                  { color: h.done ? C.textMut : C.text },
                  h.done && { textDecorationLine: 'line-through' },
                ]}>
                  {h.label}
                </Text>
                <View style={{ flex: 1 }} />
                <Text style={[styles.habitStreak, h.streak >= 7 && styles.habitStreakHot, { color: C.textMut }]}>
                  {h.streak}d
                </Text>
              </Animated.View>
            ))}
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: C.textFnt }]}>ARISE · Command Center</Text>
        </View>
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
  topBar: { height: 1, width: '100%' },
  topBarFill: { height: '100%' },
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
  habitStreak: { fontFamily: F.mono, fontSize: 12 },
  habitStreakHot: { color: '#F97316' },
  footer: { paddingTop: 40, paddingBottom: 8, alignItems: 'center' },
  footerText: { fontFamily: F.mono, fontSize: 9, letterSpacing: 3 },
});
