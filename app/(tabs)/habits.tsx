/**
 * Habits Screen — Minimalist habit tracker. Full dark mode support.
 */
import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, Pressable, StyleSheet, TextInput, Keyboard, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue, useAnimatedStyle,
  withTiming, withSequence, FadeIn, Easing,
} from 'react-native-reanimated';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useSystemStore, Habit, HabitCategory, computeHabitTotalXP } from '../../src/store/useSystemStore';
import { useTheme } from '../../src/theme/ThemeContext';
import { F } from '../../src/theme/fonts';
import { Flame, Heart, Brain, Briefcase, Zap, Plus, X, Check, ChevronLeft, ChevronRight, Trash2, Sparkles } from 'lucide-react-native';
import { normalizeHabitPrompt } from '../../src/utils/aiRouting';
import { getMonthCells } from '../../src/features/habits/calendar';

const CAT_META: Record<HabitCategory, { label: string; Icon: any; colorKey: 'habitHealth'|'habitMind'|'habitWork'|'habitSocial' }> = {
  health: { label:'Health', Icon:Heart,     colorKey:'habitHealth' },
  mind:   { label:'Mind',   Icon:Brain,     colorKey:'habitMind'   },
  work:   { label:'Work',   Icon:Briefcase, colorKey:'habitWork'   },
  social: { label:'Social', Icon:Zap,       colorKey:'habitSocial' },
};

const DAYS       = ['M','T','W','T','F','S','S'];
const DAY_LABELS = ['Su','Mo','Tu','We','Th','Fr','Sa'];

function HabitRow({ habit, onComplete, onUncheck, onOpen, onDelete, index }: {
  habit: Habit; onComplete: (id: number) => void;
  onUncheck: (id: number) => void;
  onOpen: (id: number) => void;
  onDelete?: (id: number) => void; index: number;
}) {
  const { colors: C } = useTheme();
  const meta      = CAT_META[habit.category];
  const color     = C[meta.colorKey];
  const todayDone = habit.week[6];
  const scale     = useSharedValue(1);

  const handleCheckPress = () => {
    scale.value = withSequence(
      withTiming(0.97, { duration: 60, easing: Easing.out(Easing.cubic) }),
      withTiming(1.0,  { duration: 120, easing: Easing.out(Easing.cubic) }),
    );
    if (todayDone) {
      onUncheck(habit.id);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onComplete(habit.id);
    }
  };

  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View entering={FadeIn.delay(index * 35).duration(200)}>
      <Pressable onPress={() => onOpen(habit.id)} onLongPress={() => onDelete && onDelete(habit.id)}>
        <Animated.View style={[
          styles.habitRow,
          { backgroundColor: C.surface, borderBottomColor: C.border },
          animStyle,
        ]}>
          {/* Left: category accent bar */}
          <View style={[styles.accentBar, { backgroundColor: color }]} />

          {/* Center: meta/checks on top, title below */}
          <View style={{ flex: 1, gap: 10, paddingVertical: 2 }}>
            
            {/* Row 1: Meta (Left) and Checks (Right) */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              
              {/* Streak and XP */}
              <View style={styles.habitMeta}>
                <View style={styles.trackMetaRow}>
                  <View style={styles.streakPill}>
                    <Flame size={12} color={habit.streak >= 3 ? '#F97316' : C.textFnt} strokeWidth={2} fill={habit.streak >= 3 ? '#F97316' : 'transparent'} />
                    <Text style={[styles.streakText, { color: habit.streak >= 3 ? '#F97316' : C.textMut, fontSize: 12 }]}>{habit.streak}</Text>
                  </View>
                  <Text style={[styles.xpMini, { color: C.textMut, fontSize: 12 }]}>
                    {computeHabitTotalXP(habit.checkedDates || [])} XP
                  </Text>
                </View>
              </View>

              {/* Checks */}
              <View style={styles.checkTrackRow}>
                {DAYS.map((_, i) => (
                  i === 6 ? (
                    <Pressable
                      key={i}
                      onPress={(e) => {
                        e.stopPropagation();
                        handleCheckPress();
                      }}
                      style={styles.checkSlot}
                    >
                      {habit.week[i]
                        ? <Check size={20} color={C.text} strokeWidth={3} />
                        : <View style={[styles.uncheckedCircle, { backgroundColor: C.surface, borderColor: C.borderMid }]} />}
                    </Pressable>
                  ) : (
                    <View key={i} style={styles.checkSlot}>
                      {habit.week[i]
                        ? <Check size={18} color={C.text} strokeWidth={3} />
                        : <View style={[styles.uncheckedCircle, { backgroundColor: C.surface, borderColor: C.borderMid }]} />}
                    </View>
                  )
                ))}
              </View>
            </View>

            {/* Row 2: Title and Unit */}
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
              <Text style={[
                styles.habitTitle,
                { color: todayDone ? C.textMut : C.text, flex: 1 },
              ]} numberOfLines={2}>
                {habit.title}
              </Text>
              {!!habit.unit && (
                <View style={{ backgroundColor: C.surface2, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginTop: 2 }}>
                  <Text style={{ fontFamily: F.medium, fontSize: 11, color: C.textMut }}>{habit.unit}</Text>
                </View>
              )}
            </View>
          </View>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

export default function HabitsScreen() {
  const { colors: C } = useTheme();
  const insets = useSafeAreaInsets();
  const habits = useSystemStore((s) => s.habits);
  const addHabitToStore = useSystemStore((s) => s.addHabit);
  const toggleHabit = useSystemStore((s) => s.toggleHabit);
  const uncheckHabit = useSystemStore((s) => s.uncheckHabit);
  const deleteHabit = useSystemStore((s) => s.deleteHabit);
  const updateHabitTitle = useSystemStore((s) => s.updateHabitTitle);
  const toggleHabitDate = useSystemStore((s) => s.toggleHabitDate);

  const [addMode, setAddMode]         = useState(false);
  const [newHabitTitle, setNewHabitTitle] = useState('');
  const [newHabitUnit, setNewHabitUnit]   = useState('');
  const [newHabitCat, setNewHabitCat] = useState<HabitCategory>('work');
  const [selectedHabitId, setSelectedHabitId] = useState<number | null>(null);
  const [calendarMonthOffset, setCalendarMonthOffset] = useState(0);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const params = useLocalSearchParams<{ aiCreate?: string; aiPrompt?: string }>();
  const router = useRouter();

  const now        = new Date();
  const weekDates  = [...Array(7)].map((_, i) => {
    const d = new Date(now);
    d.setDate(now.getDate() - (6 - i));
    return { day: d.getDate(), label: DAY_LABELS[d.getDay()] };
  });
  const addHabit = () => {
    if (!newHabitTitle.trim()) return;
    addHabitToStore({ 
      title: newHabitTitle.trim(), 
      category: newHabitCat, 
      xpPerDay: 1,
      unit: newHabitUnit.trim() || undefined
    });
    setNewHabitTitle(''); 
    setNewHabitUnit('');
    setAddMode(false); 
    Keyboard.dismiss();
  };

  const habitTotalXP  = habits.reduce((acc, h) => acc + computeHabitTotalXP(h.checkedDates || []), 0);
  const doneToday     = habits.filter(h => h.week[6]).length;
  const pct           = habits.length ? Math.round((doneToday / habits.length) * 100) : 0;
  const selectedHabit = selectedHabitId ? habits.find((h) => h.id === selectedHabitId) ?? null : null;
  const calendarDate = new Date(now.getFullYear(), now.getMonth() + calendarMonthOffset, 1);

  useEffect(() => {
    if (params.aiCreate === '1') {
      setSelectedHabitId(null);
      setAddMode(true);
      router.setParams({ aiCreate: undefined });
    }
  }, [params.aiCreate, router]);

  useEffect(() => {
    if (typeof params.aiPrompt === 'string' && params.aiPrompt.trim()) {
      setNewHabitTitle(normalizeHabitPrompt(params.aiPrompt));
      setSelectedHabitId(null);
      setAddMode(true);
      router.setParams({ aiPrompt: undefined });
    }
  }, [params.aiPrompt, router]);

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: C.void }]}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <View style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'flex-start' }}>
            <View>
              <Text style={[styles.title, { color: C.text }]}>Habits</Text>
              <Text style={[styles.subtitle, { color: C.textMut }]}>Keep the chain alive every day.</Text>
            </View>
            <Pressable
              style={[styles.iconBtn, { backgroundColor: addMode ? C.blueDim : C.surface, borderColor: addMode ? C.blue : C.border }]}
              onPress={() => setAddMode(v => !v)}
            >
              {addMode
                ? <X size={16} color={C.blue} strokeWidth={2} />
                : <Plus size={16} color={C.textMut} strokeWidth={2} />}
            </Pressable>
          </View>

        </View>

        {/* Daily Progress */}
        <Animated.View entering={FadeIn.duration(220)} style={{ marginHorizontal: 20, marginTop: 12 }}>
          <View style={[{ borderRadius: 16, borderWidth: 1, padding: 18, backgroundColor: C.surface, borderColor: C.border }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <View>
                <Text style={{ fontFamily: F.medium, fontSize: 13, color: C.textMut, marginBottom: 2 }}>Daily Progress</Text>
                <Text style={{ fontFamily: F.bold, fontSize: 24, letterSpacing: -0.5, color: C.text }}>
                  <Text style={{ color: C.blue }}>{doneToday}</Text> / {habits.length} Done
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end', backgroundColor: C.void, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: C.border }}>
                <Text style={{ fontFamily: F.mono, fontSize: 9, textTransform: 'uppercase', letterSpacing: 1, color: C.textMut, marginBottom: 2 }}>Habit XP</Text>
                <Text style={{ fontFamily: F.bold, fontSize: 15, color: C.gold }}>{habitTotalXP} XP</Text>
              </View>
            </View>
            <View style={{ height: 6, borderRadius: 3, backgroundColor: C.surface2, overflow: 'hidden' }}>
              <Animated.View style={{ height: '100%', borderRadius: 3, backgroundColor: C.blue, width: `${pct}%` }} />
            </View>
          </View>
        </Animated.View>

        {/* Habit list */}
        <View style={styles.section}>
          <View style={styles.trackHeaderRow}>
            <View style={styles.trackHeaderSpacer} />
            <View style={styles.trackHeaderDays}>
              {weekDates.map((d, i) => (
                <View key={i} style={styles.trackHeaderDayCell}>
                  <Text style={[styles.trackHeaderDateNum, { color: i === 6 ? C.text : C.textMut }]}>{d.day}</Text>
                  <Text style={[styles.trackHeaderDayText, { color: i === 6 ? C.text : C.textMut }]}>{d.label}</Text>
                </View>
              ))}
            </View>
          </View>
          <View style={[styles.habitList, { borderColor: C.border }]}>
            {habits.length === 0 ? (
              <View style={[styles.emptyCard, { borderColor: C.border, backgroundColor: C.surface }]}>
                <View style={[styles.emptyIconWrap, { backgroundColor: C.surface2 }]}>
                  <Sparkles size={16} color={C.textMut} strokeWidth={2} />
                </View>
                <Text style={[styles.emptyTitle, { color: C.text }]}>No habits yet</Text>
                <Text style={[styles.emptyText, { color: C.textMut }]}>Start with one small daily action. Tap + to create your first habit.</Text>
              </View>
            ) : (
              habits.map((h, i) => (
                <HabitRow
                  key={h.id} habit={h} index={i}
                  onComplete={id => toggleHabit(id)}
                  onUncheck={id => uncheckHabit(id)}
                  onOpen={(id) => {
                    setSelectedHabitId(id);
                    setCalendarMonthOffset(0);
                  }}
                  onDelete={id => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); deleteHabit(id); }}
                />
              ))
            )}
          </View>
        </View>



        <View style={{ height: 120 }} />
      </ScrollView>

      <Modal
        visible={!!selectedHabit}
        transparent
        animationType="slide"
        presentationStyle="overFullScreen"
        statusBarTranslucent
        onRequestClose={() => setSelectedHabitId(null)}
      >
        {selectedHabit && (
          <View style={[styles.modalBackdrop, { backgroundColor: C.void }]}>
            <SafeAreaView edges={['bottom']} style={[styles.fullModal, { backgroundColor: C.surface }]}>
            <View
              style={[
                styles.modalTop,
                {
                  backgroundColor: `${C[CAT_META[selectedHabit.category].colorKey]}30`,
                  paddingTop: Math.max(14, insets.top + 6),
                },
              ]}
            >
              <View style={styles.modalTopTextWrap}>
                <Text style={[styles.modalEyebrow, { color: C.textMut }]}>Habit Detail (Tap to edit)</Text>
                <TextInput 
                  style={[styles.modalTitle, { color: C.text, padding: 0, margin: 0 }]} 
                  defaultValue={selectedHabit.title}
                  onEndEditing={(e) => {
                    const t = e.nativeEvent.text.trim();
                    if (t && t !== selectedHabit.title) {
                      updateHabitTitle(selectedHabit.id, t);
                    }
                  }}
                  returnKeyType="done"
                  selectTextOnFocus
                />
              </View>
              <Pressable onPress={() => setSelectedHabitId(null)} style={[styles.modalCloseBtn, { backgroundColor: C.surface }]}>
                <X size={28} color={C.text} />
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={[styles.modalBody, { paddingBottom: Math.max(44, insets.bottom + 20) }]}>
              <View style={styles.modalSectionHead}>
                <Text style={[styles.modalSectionTitle, { color: C.text }]}>Activity</Text>
              </View>
              <View style={styles.modalMonthRow}>
                <Pressable onPress={() => setCalendarMonthOffset((m) => m - 1)} style={styles.monthNavBtn}>
                  <ChevronLeft size={16} color={C.textMut} />
                </Pressable>
                <Text style={[styles.modalSectionDate, { color: C.text }]}>
                  {getMonthCells(calendarDate, selectedHabit.checkedDates ?? []).monthLabel}
                </Text>
                <Pressable
                  onPress={() => setCalendarMonthOffset((m) => Math.min(0, m + 1))}
                  style={[styles.monthNavBtn, calendarMonthOffset === 0 && { opacity: 0.35 }]}
                  disabled={calendarMonthOffset === 0}
                >
                  <ChevronRight size={16} color={C.textMut} />
                </Pressable>
              </View>

              <View style={[styles.calendarCard, { backgroundColor: C.void }]}>
                <View style={styles.calendarWeekHead}>
                  {DAY_LABELS.map((d) => (
                    <Text key={d} style={[styles.calendarWeekLabel, { color: C.text }]}>{d}</Text>
                  ))}
                </View>

                <View style={styles.calendarGrid}>
                  {getMonthCells(calendarDate, selectedHabit.checkedDates ?? []).cells.map((cell, idx) => (
                    <View key={idx} style={styles.calendarCell}>
                      {cell.day ? (
                        <Pressable
                          onPress={() => {
                            if (!cell.isFuture && cell.dateKey) toggleHabitDate(selectedHabit.id, cell.dateKey);
                          }}
                          disabled={cell.isFuture || !cell.dateKey}
                          style={styles.calendarCellInner}
                        >
                            <View style={styles.todayBadge}>
                              {cell.done ? (
                                <Check size={20} color={C.text} strokeWidth={3.2} />
                              ) : (
                              <Text style={[styles.calendarDayNum, { color: cell.isFuture ? C.textFnt : C.text }]}>{cell.day}</Text>
                            )}
                          </View>
                        </Pressable>
                      ) : null}
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.modalStatsRow}>
                <Text style={[styles.modalStat, { color: C.textMut }]}>Count <Text style={[styles.modalStatStrong, { color: C.text }]}>{selectedHabit.checkedDates.length}</Text></Text>
                <Text style={[styles.modalStat, { color: C.textMut }]}>Streak <Text style={[styles.modalStatStrong, { color: C.text }]}>{selectedHabit.streak}</Text></Text>
                <Text style={[styles.modalStat, { color: C.textMut }]}>XP <Text style={[styles.modalStatStrong, { color: C.text }]}>{computeHabitTotalXP(selectedHabit.checkedDates)}</Text></Text>
              </View>

              <Pressable
                style={styles.modalDeleteBtn}
                onPress={() => setConfirmDeleteOpen(true)}
              >
                <Trash2 size={14} color={C.textMut} strokeWidth={2} />
                <Text style={[styles.modalDeleteText, { color: C.textMut }]}>Delete habit</Text>
              </Pressable>
            </ScrollView>

            {confirmDeleteOpen && (
              <View style={styles.confirmOverlay}>
                <Pressable style={StyleSheet.absoluteFill} onPress={() => setConfirmDeleteOpen(false)} />
                <View style={[styles.confirmPopup, { backgroundColor: C.surface, borderColor: C.border }]}>
                  <Text style={[styles.confirmTitle, { color: C.text }]}>Delete this habit?</Text>
                  <Text style={[styles.confirmText, { color: C.textMut }]}>
                    This removes the habit and its history from your list.
                  </Text>
                  <View style={styles.confirmActions}>
                    <Pressable
                      style={[styles.confirmBtn, { borderColor: C.border }]}
                      onPress={() => setConfirmDeleteOpen(false)}
                    >
                      <Text style={[styles.confirmBtnText, { color: C.textMut }]}>Cancel</Text>
                    </Pressable>
                    <Pressable
                      style={[styles.confirmBtnDanger, { backgroundColor: C.text }]}
                      onPress={() => {
                        if (!selectedHabit) return;
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                        deleteHabit(selectedHabit.id);
                        setConfirmDeleteOpen(false);
                        setSelectedHabitId(null);
                      }}
                    >
                      <Text style={[styles.confirmBtnDangerText, { color: C.void }]}>Delete</Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            )}
            </SafeAreaView>
          </View>
        )}
      </Modal>

      <Modal
        visible={addMode}
        transparent
        animationType="slide"
        presentationStyle="overFullScreen"
        statusBarTranslucent
        onRequestClose={() => setAddMode(false)}
      >
        <View style={[styles.modalBackdrop, { backgroundColor: C.void }]}>
          <SafeAreaView edges={['bottom']} style={[styles.fullModal, { backgroundColor: C.surface }]}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
            <View
              style={[
                styles.modalTop,
                {
                  backgroundColor: `${C[CAT_META[newHabitCat].colorKey]}30`,
                  paddingTop: Math.max(14, insets.top + 6),
                  marginBottom: 16,
                },
              ]}
            >
              <View style={styles.modalTopTextWrap}>
                <Text style={[styles.modalEyebrow, { color: C.textMut }]}>Create Protocol</Text>
                <Text style={[styles.modalTitle, { color: C.text }]}>New Habit</Text>
              </View>
              <Pressable onPress={() => setAddMode(false)} style={[styles.modalCloseBtn, { backgroundColor: C.surface }]}>
                <X size={28} color={C.text} />
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={{ gap: 24, paddingHorizontal: 20, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
              <View style={{ flexDirection: 'row', gap: 12 }}>
                 <View style={{ flex: 2 }}>
                   <Text style={{ fontFamily: F.medium, fontSize: 13, color: C.textMut, marginBottom: 8 }}>Action / Name</Text>
                   <TextInput
                     style={{ height: 52, borderRadius: 12, borderWidth: 1.5, paddingHorizontal: 16, fontFamily: F.regular, fontSize: 16, backgroundColor: C.void, borderColor: C.borderFocus, color: C.text }}
                     placeholder="e.g. Meditate"
                     placeholderTextColor={C.textMut}
                     value={newHabitTitle}
                     onChangeText={setNewHabitTitle}
                     autoFocus
                   />
                 </View>
                 <View style={{ flex: 1.2 }}>
                   <Text style={{ fontFamily: F.medium, fontSize: 13, color: C.textMut, marginBottom: 8 }}>Target / Unit</Text>
                   <TextInput
                     style={{ height: 52, borderRadius: 12, borderWidth: 1.5, paddingHorizontal: 16, fontFamily: F.regular, fontSize: 16, backgroundColor: C.void, borderColor: C.borderFocus, color: C.text }}
                     placeholder="10 mins"
                     placeholderTextColor={C.textMut}
                     value={newHabitUnit}
                     onChangeText={setNewHabitUnit}
                   />
                 </View>
              </View>

              <View style={{ marginBottom: 12 }}>
                 <Text style={{ fontFamily: F.medium, fontSize: 13, color: C.textMut, marginBottom: 8 }}>Category</Text>
                 <View style={{ flexDirection: 'row', gap: 8 }}>
                   {(['health','mind','work','social'] as HabitCategory[]).map(cat => {
                     const active = cat === newHabitCat;
                     const color  = C[CAT_META[cat].colorKey];
                     return (
                       <Pressable key={cat} onPress={() => setNewHabitCat(cat)}
                         style={{ flex: 1, paddingVertical: 12, borderRadius: 10, borderWidth: 1.5, alignItems: 'center',
                                  backgroundColor: active ? color+'18' : C.void, borderColor: active ? color : C.border }}>
                         <Text style={{ fontFamily: F.semiBold, fontSize: 12, color: active ? color : C.textMut }}>{CAT_META[cat].label}</Text>
                       </Pressable>
                     );
                   })}
                 </View>
              </View>
              
              <Pressable style={{ backgroundColor: C.blue, borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 12 }} onPress={addHabit}>
                 <Text style={{ fontFamily: F.bold, fontSize: 16, color: '#fff' }}>Create Habit</Text>
              </Pressable>
            </ScrollView>
            </KeyboardAvoidingView>
          </SafeAreaView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root:     { flex: 1 },
  modalBackdrop: { flex: 1 },
  header:   { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 4, gap: 12 },
  title:    { fontFamily: F.bold,    fontSize: 28, letterSpacing: -0.8 },
  subtitle: { fontFamily: F.regular, fontSize: 13 },
  iconBtn:  { width: 34, height: 34, borderRadius: 9, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },

  summaryRow:  { flexDirection: 'row', paddingHorizontal: 16, paddingTop: 10, gap: 10 },
  summaryCard: { flex: 1, borderRadius: 12, borderWidth: 1, padding: 14, gap: 4, elevation: 1 },
  summaryVal:  { fontFamily: F.bold,    fontSize: 20, letterSpacing: -0.5 },
  summaryLabel:{ fontFamily: F.regular, fontSize: 11 },
  miniBar:     { height: 3, borderRadius: 2, marginTop: 6, overflow: 'hidden' },
  miniBarFill: { height: '100%', borderRadius: 2 },

  section:      { marginTop: 28 },
  sectionLabel: { fontFamily: F.semiBold, fontSize: 15, letterSpacing: -0.2, paddingHorizontal: 20, marginBottom: 12 },
  emptyCard: {
    marginHorizontal: 20,
    marginTop: 8,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  emptyIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  emptyTitle: { fontFamily: F.semiBold, fontSize: 16, letterSpacing: -0.2 },
  emptyText:    { fontFamily: F.regular,  fontSize: 13, textAlign: 'center', marginTop: 4 },

  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 0 },
  trackHeaderRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginBottom: 8 },
  trackHeaderSpacer: { flex: 1 },
  trackHeaderDays: { width: 232, flexDirection: 'row', justifyContent: 'space-between' },
  trackHeaderDayCell: { width: 28, alignItems: 'center', gap: 1 },
  trackHeaderDateNum: { fontFamily: F.semiBold, fontSize: 13, lineHeight: 15 },
  trackHeaderDayText: { textAlign: 'center', fontFamily: F.mono, fontSize: 8, letterSpacing: 0.2 },
  habitList: { marginTop: 10 },
  habitRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 14,
    gap: 12,
  },
  accentBar: { width: 3, height: 36, borderRadius: 2, flexShrink: 0 },
  habitContent: { flex: 1, gap: 5 },
  habitTitle: { fontFamily: F.medium, fontSize: 15, letterSpacing: -0.2 },
  habitMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  rightRow: { alignItems: 'flex-end', gap: 4, marginLeft: 8 },
  checkTrackRow: { flexDirection: 'row', gap: 6, alignItems: 'center', justifyContent: 'center' },
  checkSlot: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  uncheckedCircle: { width: 14, height: 14, borderRadius: 7, borderWidth: 1.5 },
  trackMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  streakPill: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  streakText: { fontFamily: F.mono, fontSize: 11 },
  xpMini: { fontFamily: F.mono, fontSize: 11 },
  fullModal: { flex: 1 },
  modalTop: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
  },
  modalTopTextWrap: { flex: 1, marginRight: 10, gap: 2 },
  modalEyebrow: { fontFamily: F.mono, fontSize: 9, letterSpacing: 1.4, textTransform: 'uppercase' },
  modalTitle: { fontFamily: F.bold, fontSize: 30, letterSpacing: -0.6, lineHeight: 34 },
  modalCloseBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBody: { paddingHorizontal: 20, paddingTop: 16, gap: 14, paddingBottom: 44 },
  modalSectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalSectionTitle: { fontFamily: F.semiBold, fontSize: 24, letterSpacing: -0.4 },
  modalMonthRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: -4 },
  monthNavBtn: { width: 22, height: 22, alignItems: 'center', justifyContent: 'center' },
  modalSectionDate: { fontFamily: F.medium, fontSize: 12 },
  calendarCard: { borderRadius: 16, paddingVertical: 16, paddingHorizontal: 16, width: '100%', maxWidth: 400 },
  calendarWeekHead: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  calendarWeekLabel: { width: '14.2%', textAlign: 'center', fontFamily: F.mono, fontSize: 10, letterSpacing: 0.3 },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 0 },
  calendarCell: { width: '14.2%', minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  calendarCellInner: { alignItems: 'center', justifyContent: 'center' },
  todayBadge: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  calendarDayNum: { fontFamily: F.semiBold, fontSize: 16 },
  modalStatsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  modalStat: { fontFamily: F.medium, fontSize: 13 },
  modalStatStrong: { fontFamily: F.bold, fontSize: 15 },
  modalDeleteBtn: {
    marginTop: 8,
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  modalDeleteText: { fontFamily: F.medium, fontSize: 13 },
  confirmOverlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.20)', paddingHorizontal: 24 },
  confirmPopup: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 14,
    gap: 10,
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  confirmTitle: { fontFamily: F.semiBold, fontSize: 18, letterSpacing: -0.2 },
  confirmText: { fontFamily: F.regular, fontSize: 13, lineHeight: 18 },
  confirmActions: { flexDirection: 'row', gap: 10, marginTop: 6 },
  confirmBtn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBtnText: { fontFamily: F.medium, fontSize: 13 },
  confirmBtnDanger: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBtnDangerText: { fontFamily: F.semiBold, fontSize: 13 },

});
