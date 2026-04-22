/**
 * Habits Screen — Minimalist habit tracker. Full dark mode support.
 */
import React, { useState } from 'react';
import { ScrollView, View, Text, Pressable, StyleSheet, TextInput, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue, useAnimatedStyle,
  withTiming, withSequence, FadeIn, FadeInDown, Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useSystemStore, Habit, HabitCategory } from '../../src/store/useSystemStore';
import { useTheme } from '../../src/theme/ThemeContext';
import { F } from '../../src/theme/fonts';
import { Flame, Heart, Brain, Briefcase, Zap, Plus, X, Trash2 } from 'lucide-react-native';
const CAT_META: Record<HabitCategory, { label: string; Icon: any; colorKey: 'habitHealth'|'habitMind'|'habitWork'|'habitSocial' }> = {
  health: { label:'Health', Icon:Heart,    colorKey:'habitHealth' },
  mind:   { label:'Mind',   Icon:Brain,    colorKey:'habitMind'   },
  work:   { label:'Work',   Icon:Briefcase,colorKey:'habitWork'   },
  social: { label:'Social', Icon:Zap,      colorKey:'habitSocial' },
};

const DAYS = ['M','T','W','T','F','S','S'];

function WeekDot({ done, isToday, color }: { done: boolean; isToday: boolean; color: string }) {
  const { colors: C } = useTheme();
  return (
    <View style={[
      styles.weekDot,
      { backgroundColor: C.surface2 },
      done && { backgroundColor: color },
      isToday && !done && { borderWidth: 1.5, borderColor: color, backgroundColor: 'transparent' },
    ]} />
  );
}

function HabitRow({ habit, onComplete, onDelete, index }: {
  habit: Habit; onComplete: (id: number) => void;
  onDelete?: (id: number) => void; index: number;
}) {
  const { colors: C } = useTheme();
  const meta     = CAT_META[habit.category];
  const color    = C[meta.colorKey];
  const Icon     = meta.Icon;
  const todayDone = habit.week[6];
  const scale    = useSharedValue(1);

  const handlePress = () => {
    if (todayDone) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    scale.value = withSequence(
      withTiming(0.97, { duration: 70, easing: Easing.out(Easing.cubic) }),
      withTiming(1.0,  { duration: 120, easing: Easing.out(Easing.cubic) })
    );
    onComplete(habit.id);
  };

  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View entering={FadeIn.delay(index * 35).duration(220)}>
      <Pressable onPress={handlePress} onLongPress={() => onDelete && onDelete(habit.id)}>
        <Animated.View style={[
          styles.habitRow,
          { backgroundColor: C.surface, borderBottomColor: C.border },
          todayDone && { opacity: 0.6 },
          animStyle,
        ]}>
          <View style={[styles.habitIconWrap, { backgroundColor: color + '16' }]}>
            <Icon size={18} color={color} strokeWidth={1.8} />
          </View>

          <View style={styles.habitInfo}>
            <View style={styles.habitTitleRow}>
              <Text style={[
                styles.habitTitle,
                { color: C.text },
                todayDone && { color: C.textMut, textDecorationLine: 'line-through' },
              ]} numberOfLines={1}>
                {habit.title}
              </Text>
              {todayDone && (
                <View style={[styles.donePill, { backgroundColor: color + '18' }]}>
                  <Text style={[styles.doneText, { color }]}>Done</Text>
                </View>
              )}
            </View>
            <View style={styles.weekGrid}>
              {DAYS.map((day, i) => (
                <View key={i} style={styles.weekCell}>
                  <Text style={[styles.weekDayLabel, { color: C.textFnt }]}>{day}</Text>
                  <WeekDot done={habit.week[i]} isToday={i === 6} color={color} />
                </View>
              ))}
            </View>
          </View>

          <View style={styles.streakCol}>
            <Flame
              size={14}
              color={habit.streak > 0 ? '#F97316' : C.textFnt}
              strokeWidth={2}
              fill={habit.streak >= 7 ? '#F97316' : 'transparent'}
            />
            <Text style={[
              styles.streakNum,
              { color: C.textMut },
              habit.streak > 0 && { color: '#F97316' },
            ]}>
              {habit.streak}
            </Text>
          </View>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

export default function HabitsScreen() {
  const { colors: C } = useTheme();
  const store = useSystemStore();
  const habits = store.habits;

  const [addMode, setAddMode]           = useState(false);
  const [newHabitTitle, setNewHabitTitle] = useState('');
  const [newHabitCat, setNewHabitCat]   = useState<HabitCategory>('work');
  const [newHabitXP, setNewHabitXP]     = useState(30);

  const completeToday = (id: number) => { store.toggleHabit(id); };

  const deleteHabit = (id: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    store.deleteHabit(id);
  };

  const addHabit = () => {
    if (!newHabitTitle.trim()) return;
    store.addHabit({ title: newHabitTitle.trim(), category: newHabitCat, xpPerDay: newHabitXP });
    setNewHabitTitle(''); setAddMode(false); Keyboard.dismiss();
  };

  const doneToday      = habits.filter(h => h.week[6]).length;
  const totalXP        = habits.filter(h => h.week[6]).reduce((s, h) => s + h.xpPerDay, 0);
  const longestStreak  = Math.max(...habits.map(h => h.streak));
  const pct            = Math.round((doneToday / habits.length) * 100);

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: C.void }]}>
      <ScrollView showsVerticalScrollIndicator={false}>

        <View style={styles.header}>
          <View style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'flex-start' }}>
            <View>
              <Text style={[styles.title, { color: C.text }]}>Habits</Text>
              <Text style={[styles.subtitle, { color: C.textMut }]}>Build your identity, one day at a time.</Text>
            </View>
            <Pressable
              style={[styles.iconBtn, { backgroundColor: addMode ? C.blueDim : C.surface, borderColor: addMode ? C.blue : C.border }]}
              onPress={() => setAddMode(v => !v)}
            >
              {addMode ? <X size={16} color={C.blue} strokeWidth={2} /> : <Plus size={16} color={C.textMut} strokeWidth={2} />}
            </Pressable>
          </View>

          {addMode && (
            <Animated.View entering={FadeIn.duration(180)} style={{ gap: 10, marginTop: 8 }}>
              <TextInput
                style={{ height:42, borderRadius:10, borderWidth:1.5, paddingHorizontal:13, fontFamily:F.regular, fontSize:14, backgroundColor:C.surface, borderColor:C.borderFocus, color:C.text }}
                placeholder="Habit name…"
                placeholderTextColor={C.textMut}
                value={newHabitTitle}
                onChangeText={setNewHabitTitle}
                autoFocus
              />
              <View style={{ flexDirection:'row', gap:6 }}>
                {(['health','mind','work','social'] as HabitCategory[]).map(cat => {
                  const active = cat === newHabitCat;
                  const color  = C[CAT_META[cat].colorKey];
                  return (
                    <Pressable key={cat} onPress={() => setNewHabitCat(cat)}
                      style={{ flex:1, paddingVertical:8, borderRadius:8, borderWidth:1, alignItems:'center',
                               backgroundColor: active ? color+'18' : C.surface, borderColor: active ? color : C.border }}>
                      <Text style={{ fontFamily: F.medium, fontSize:11, color: active ? color : C.textMut }}>{CAT_META[cat].label}</Text>
                    </Pressable>
                  );
                })}
              </View>
              <View style={{ flexDirection:'row', gap:6 }}>
                {[20,30,40,50].map(xp => (
                  <Pressable key={xp} onPress={() => setNewHabitXP(xp)}
                    style={{ flex:1, paddingVertical:8, borderRadius:8, borderWidth:1, alignItems:'center',
                             backgroundColor: newHabitXP===xp ? C.blueDim : C.surface, borderColor: newHabitXP===xp ? C.blue : C.border }}>
                    <Text style={{ fontFamily:F.medium, fontSize:12, color: newHabitXP===xp ? C.blue : C.textMut }}>+{xp}</Text>
                  </Pressable>
                ))}
              </View>
              <Pressable style={{ backgroundColor:C.blue, borderRadius:10, paddingVertical:12, alignItems:'center' }} onPress={addHabit}>
                <Text style={{ fontFamily:F.semiBold, fontSize:14, color:'#fff' }}>Add Habit</Text>
              </Pressable>
            </Animated.View>
          )}
        </View>

        {/* Summary row */}
        <View style={styles.summaryRow}>
          {[
            { val: `${doneToday}/${habits.length}`, label: 'Done Today', accent: C.blue, bar: true },
            { val: `🔥 ${longestStreak}`,            label: 'Best Streak', accent: '#F97316' },
            { val: `+${totalXP} XP`,                 label: 'Earned',     accent: C.gold },
          ].map((card, i) => (
            <Animated.View
              key={i}
              entering={FadeIn.delay(i * 50).duration(220)}
              style={[styles.summaryCard, { backgroundColor: C.surface, borderColor: C.border }]}
            >
              <Text style={[styles.summaryVal, { color: card.accent }]}>{card.val}</Text>
              <Text style={[styles.summaryLabel, { color: C.textMut }]}>{card.label}</Text>
              {card.bar && (
                <View style={[styles.miniBar, { backgroundColor: C.surface2 }]}>
                  <View style={[styles.miniBarFill, { width: `${pct}%`, backgroundColor: C.blue }]} />
                </View>
              )}
            </Animated.View>
          ))}
        </View>

        {/* Habit list */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: C.text }]}>Today's Habits</Text>
          <View style={[styles.habitList, { borderTopColor: C.border }]}>
            {habits.map((h, i) => (
              <HabitRow key={h.id} habit={h} onComplete={completeToday} onDelete={deleteHabit} index={i} />
            ))}
          </View>
        </View>

        {/* Category breakdown */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: C.text }]}>By Category</Text>
          <View style={styles.categoryGrid}>
            {(Object.entries(CAT_META) as [HabitCategory, typeof CAT_META[HabitCategory]][]).map(([key, meta]) => {
              const Icon       = meta.Icon;
              const color      = C[meta.colorKey];
              const catHabits  = habits.filter(h => h.category === key);
              if (!catHabits.length) return null;
              const catDone    = catHabits.filter(h => h.week[6]).length;
              const catPct     = catHabits.length ? (catDone / catHabits.length) * 100 : 0;
              return (
                <View key={key} style={[styles.catCard, { backgroundColor: C.surface, borderColor: C.border }]}>
                  <View style={[styles.catIcon, { backgroundColor: color + '16' }]}>
                    <Icon size={16} color={color} strokeWidth={1.8} />
                  </View>
                  <Text style={[styles.catLabel, { color: C.text }]}>{meta.label}</Text>
                  <Text style={[styles.catCount, { color: C.text }]}>{catDone}/{catHabits.length}</Text>
                  <View style={[styles.catBar, { backgroundColor: C.surface2 }]}>
                    <View style={[styles.catBarFill, { width: `${catPct}%`, backgroundColor: color }]} />
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        <View style={{ height: 110 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 4, gap: 4 },
  title: { fontFamily: F.bold, fontSize: 28, letterSpacing: -0.8 },
  subtitle: { fontFamily: F.regular, fontSize: 13 },
  iconBtn: {
    width: 34, height: 34, borderRadius: 9, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },

  summaryRow: { flexDirection: 'row', paddingHorizontal: 16, paddingTop: 18, gap: 10 },
  summaryCard: {
    flex: 1, borderRadius: 12, borderWidth: 1, padding: 14, gap: 4,
    shadowColor: '#000', shadowOffset: { width:0, height:1 }, shadowOpacity:0.04, shadowRadius:4, elevation:1,
  },
  summaryVal: { fontFamily: F.bold, fontSize: 20, letterSpacing: -0.5 },
  summaryLabel: { fontFamily: F.regular, fontSize: 11 },
  miniBar: { height: 3, borderRadius: 2, marginTop: 6, overflow: 'hidden' },
  miniBarFill: { height: '100%', borderRadius: 2 },

  section: { marginTop: 28 },
  sectionLabel: { fontFamily: F.semiBold, fontSize: 15, letterSpacing: -0.2, paddingHorizontal: 20, marginBottom: 12 },

  habitList: { borderTopWidth: 1 },
  habitRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, gap: 12,
  },
  habitIconWrap: { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  habitInfo: { flex: 1, gap: 8 },
  habitTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  habitTitle: { fontFamily: F.medium, fontSize: 14, flex: 1 },
  donePill: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, flexShrink: 0 },
  doneText: { fontFamily: F.semiBold, fontSize: 10 },
  weekGrid: { flexDirection: 'row', gap: 4 },
  weekCell: { alignItems: 'center', gap: 3 },
  weekDayLabel: { fontFamily: F.mono, fontSize: 8 },
  weekDot: { width: 10, height: 10, borderRadius: 3 },
  streakCol: { alignItems: 'center', gap: 2, flexShrink: 0, minWidth: 28 },
  streakNum: { fontFamily: F.monoBold, fontSize: 14, letterSpacing: -0.5 },

  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 10 },
  catCard: {
    width: '47%', borderRadius: 12, borderWidth: 1, padding: 14, gap: 6,
    shadowColor: '#000', shadowOffset: { width:0, height:1 }, shadowOpacity:0.03, shadowRadius:4, elevation:1,
  },
  catIcon: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  catLabel: { fontFamily: F.medium, fontSize: 13, marginTop: 2 },
  catCount: { fontFamily: F.semiBold, fontSize: 18, letterSpacing: -0.5 },
  catBar: { height: 3, borderRadius: 2, overflow: 'hidden', marginTop: 2 },
  catBarFill: { height: '100%', borderRadius: 2 },
});
