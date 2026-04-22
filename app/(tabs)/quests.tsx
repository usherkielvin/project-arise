/**
 * Quests Screen — Polished quest journal with category filters, counts,
 * sort options, grouped sections, and full dark-mode support.
 */
import React, { useState, useRef, useCallback } from 'react';
import {
  ScrollView, View, Text, Pressable, TextInput,
  StyleSheet, Keyboard,
} from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle,
  withTiming, withSequence, FadeIn, FadeInDown, Easing,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../src/theme/ThemeContext';
import { F } from '../../src/theme/fonts';
import { Trash2, Check, Plus, X, ArrowUpDown, SlidersHorizontal, ChevronRight } from 'lucide-react-native';

// ─── Types ────────────────────────────────────────────────────────────────────
import { useSystemStore, Quest, QuestRank, CATEGORY_STAT, xpForLevel } from '../../src/store/useSystemStore';
import { LevelUpModal } from '../../src/components/LevelUpModal';
type SortKey = 'default' | 'xp' | 'rank';
const RANK_ORDER: Record<QuestRank, number> = { E:0, D:1, C:2, B:3, A:4, S:5 };
// Categories are now managed in the store — no hardcoded list here.

// ─── Quest Row ────────────────────────────────────────────────────────────────
const RANK_COLORS: Record<QuestRank, string> = {
  E:'#94A3B8', D:'#10B981', C:'#0891B2', B:'#6366F1', A:'#7C3AED', S:'#D97706',
};
const RANK_COLORS_DARK: Record<QuestRank, string> = {
  E:'#64748B', D:'#34D399', C:'#22D3EE', B:'#818CF8', A:'#A78BFA', S:'#FBBF24',
};

function QuestRow({
  quest, onToggle, onDelete, isDeleting, onLongPress, index,
}: {
  quest: Quest; onToggle: (id: number) => void;
  onDelete: (id: number) => void; isDeleting: boolean;
  onLongPress: (id: number) => void; index: number;
}) {
  const { colors: C, isDark } = useTheme();
  const rankColor = (isDark ? RANK_COLORS_DARK : RANK_COLORS)[quest.rank];
  const scale = useSharedValue(1);
  const checkScale = useSharedValue(quest.completed ? 1 : 0);

  React.useEffect(() => {
    checkScale.value = withTiming(quest.completed ? 1 : 0, { duration: 180, easing: Easing.out(Easing.cubic) });
  }, [quest.completed]);

  const handlePress = () => {
    if (quest.completed || isDeleting) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    scale.value = withSequence(
      withTiming(0.97, { duration: 70, easing: Easing.out(Easing.cubic) }),
      withTiming(1.0,  { duration: 120, easing: Easing.out(Easing.cubic) })
    );
    onToggle(quest.id);
  };

  const rowStyle  = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const checkAnim = useAnimatedStyle(() => ({ transform: [{ scale: checkScale.value }] }));

  return (
    <Animated.View entering={FadeIn.delay(index * 30).duration(220)}>
      <Pressable
        onPress={handlePress}
        onLongPress={() => !quest.completed && onLongPress(quest.id)}
      >
        <Animated.View style={[
          styles.questRow,
          { backgroundColor: C.surface, borderBottomColor: C.border },
          isDeleting && { backgroundColor: '#FFF5F5' },
          rowStyle,
        ]}>
          {/* Rank accent bar */}
          <View style={[styles.rankBar, { backgroundColor: isDeleting ? '#EF4444' : rankColor }]} />

          {/* Checkbox */}
          <View style={[
            styles.checkbox,
            { borderColor: quest.completed ? C.blue : C.borderMid },
            quest.completed && { backgroundColor: C.blue },
          ]}>
            <Animated.View style={checkAnim}>
              <Check size={11} color="#fff" strokeWidth={3} />
            </Animated.View>
          </View>

          {/* Content */}
          <View style={styles.questContent}>
            <Text
              numberOfLines={1}
              style={[
                styles.questTitle,
                { color: C.text },
                quest.completed && { color: C.textMut, textDecorationLine: 'line-through' },
                isDeleting && { color: '#EF4444' },
              ]}
            >
              {quest.title}
            </Text>

            {!quest.completed && !isDeleting && quest.description ? (
              <Text style={[styles.questDesc, { color: C.textMut }]} numberOfLines={1}>
                {quest.description}
              </Text>
            ) : null}

            {isDeleting ? (
              <Text style={[styles.questDesc, { color: '#EF4444' }]}>Hold to confirm delete</Text>
            ) : (
              <View style={styles.questMeta}>
                <View style={[
                  styles.rankPill,
                  { backgroundColor: rankColor + (isDark ? '20' : '14'), borderColor: rankColor + (isDark ? '40' : '28') },
                ]}>
                  <View style={[styles.rankDot, { backgroundColor: rankColor }]} />
                  <Text style={[styles.rankLabel, { color: rankColor }]}>
                    {quest.rank}-Rank · {quest.category}
                  </Text>
                </View>
                <View style={{ flex: 1 }} />
                <Text style={[styles.xpLabel, { color: quest.completed ? C.textMut : C.blue }]}>
                  +{quest.xp} XP
                </Text>
              </View>
            )}
          </View>

          {/* Delete confirm / Trash */}
          {isDeleting && (
            <View style={styles.deleteActions}>
              <Pressable
                onPress={() => onLongPress(quest.id)}
                style={[styles.deleteCancelBtn, { borderColor: C.border, backgroundColor: C.surface }]}
              >
                <Text style={[styles.deleteBtnText, { color: C.textMut }]}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                  onDelete(quest.id);
                }}
                style={styles.deleteConfirmBtn}
              >
                <Trash2 size={12} color="#fff" strokeWidth={2} />
                <Text style={styles.deleteBtnText}>Delete</Text>
              </Pressable>
            </View>
          )}
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

// ─── Filter Chip ──────────────────────────────────────────────────────────────
function FilterChip({
  label, count, active, onPress, onLongPress,
}: {
  label: string; count: number; active: boolean;
  onPress: () => void; onLongPress?: () => void;
}) {
  const { colors: C } = useTheme();
  const scale = useSharedValue(1);

  const handlePress = () => {
    Haptics.selectionAsync();
    scale.value = withSequence(
      withTiming(0.95, { duration: 70, easing: Easing.out(Easing.cubic) }),
      withTiming(1.0,  { duration: 120, easing: Easing.out(Easing.cubic) })
    );
    onPress();
  };

  const chipStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Pressable onPress={handlePress} onLongPress={onLongPress}>
      <Animated.View style={[
        styles.chip,
        {
          backgroundColor: active ? C.blue : C.surface,
          borderColor: active ? C.blue : C.border,
        },
        chipStyle,
      ]}>
        <Text style={[styles.chipText, { color: active ? '#fff' : C.textSub }]}>
          {label}
        </Text>
        {count > 0 && (
          <View style={[
            styles.chipBadge,
            { backgroundColor: active ? 'rgba(255,255,255,0.22)' : C.surface2 },
          ]}>
            <Text style={[styles.chipBadgeText, { color: active ? '#fff' : C.textMut }]}>
              {count}
            </Text>
          </View>
        )}
      </Animated.View>
    </Pressable>
  );
}

// ─── Sort Sheet (simple inline picker) ───────────────────────────────────────
function SortPicker({
  sort, onChange,
}: {
  sort: SortKey; onChange: (s: SortKey) => void;
}) {
  const { colors: C } = useTheme();
  const opts: { key: SortKey; label: string }[] = [
    { key: 'default', label: 'Default' },
    { key: 'xp',      label: 'Highest XP' },
    { key: 'rank',    label: 'Rank' },
  ];
  return (
    <View style={[styles.sortPicker, { backgroundColor: C.surface, borderColor: C.border }]}>
      {opts.map((o, i) => (
        <React.Fragment key={o.key}>
          {i > 0 && <View style={[styles.sortDivider, { backgroundColor: C.border }]} />}
          <Pressable
            onPress={() => onChange(o.key)}
            style={styles.sortOption}
          >
            <Text style={[
              styles.sortOptionText,
              { color: sort === o.key ? C.blue : C.textSub },
            ]}>
              {o.label}
            </Text>
            {sort === o.key && (
              <View style={[styles.sortActiveDot, { backgroundColor: C.blue }]} />
            )}
          </Pressable>
        </React.Fragment>
      ))}
    </View>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function QuestsScreen() {
  const { colors: C } = useTheme();
  const store = useSystemStore();
  const quests = store.quests;
  const CATEGORIES = ['All', ...store.categories];  // dynamic from store

  const [filter, setFilter]       = useState('All');
  const [sort, setSort]           = useState<SortKey>('default');
  const [showSort, setShowSort]   = useState(false);
  const [addMode, setAddMode]     = useState(false);
  const [newTitle, setNewTitle]   = useState('');
  const [newDesc, setNewDesc]     = useState('');
  const [newCat, setNewCat]       = useState('Development');
  const [newRank, setNewRank]     = useState<QuestRank>('E');
  const [newXP, setNewXP]         = useState(50);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [showLvlUp, setShowLvlUp] = useState(false);
  const [lvlUpNum, setLvlUpNum]   = useState(1);
  const [addCatMode, setAddCatMode] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [deletingCat, setDeletingCat] = useState<string | null>(null);

  const toggle = useCallback((id: number) => {
    const result = store.toggleQuest(id);
    if (result?.leveledUp) { setLvlUpNum(result.newLevel); setShowLvlUp(true); }
  }, [store]);

  const addQuest = () => {
    if (!newTitle.trim()) return;
    const cat  = newCat;
    const stat = CATEGORY_STAT[cat] ?? 'INT';
    store.addQuest({ title: newTitle.trim(), description: newDesc.trim(), category: cat, stat, xp: newXP, rank: newRank });
    setNewTitle(''); setNewDesc(''); setNewRank('E'); setNewXP(50); setNewCat('Development');
    setAddMode(false); Keyboard.dismiss();
  };

  const openAddModal = () => {
    // Sync default category to current filter
    if (filter !== 'All') setNewCat(filter);
    setAddMode(true);
    setShowSort(false);
  };

  // Counts per category (pending only, for badges)
  const pendingCounts: Record<string, number> = { All: 0 };
  store.categories.forEach(c => { pendingCounts[c] = 0; });
  quests.forEach(q => {
    if (!q.completed) {
      pendingCounts['All'] = (pendingCounts['All'] || 0) + 1;
      pendingCounts[q.category] = (pendingCounts[q.category] || 0) + 1;
    }
  });

  const submitNewCategory = () => {
    const name = newCatName.trim();
    if (!name) return;
    store.addCategory(name);
    setNewCatName('');
    setAddCatMode(false);
    Keyboard.dismiss();
  };

  const handleDeleteCategory = (cat: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    store.deleteCategory(cat);
    if (filter === cat) setFilter('All');
    setDeletingCat(null);
  };

  const filtered = filter === 'All' ? quests : quests.filter(q => q.category === filter);

  const sortFn = (a: Quest, b: Quest) => {
    if (sort === 'xp')   return b.xp - a.xp;
    if (sort === 'rank')  return RANK_ORDER[b.rank] - RANK_ORDER[a.rank];
    return 0;
  };

  const pending   = filtered.filter(q => !q.completed).sort(sortFn);
  const completed = filtered.filter(q => q.completed).sort(sortFn);

  const totalXP   = quests.filter(q => q.completed).reduce((s, q) => s + q.xp, 0);
  const doneCount = quests.filter(q => q.completed).length;

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: C.void }]}>

      {/* ── Header ── */}
      <View style={[styles.header, { borderBottomColor: C.border }]}>
        <View style={styles.headerTop}>
          <View>
            <Text style={[styles.title, { color: C.text }]}>Quest Journal</Text>
            <Text style={[styles.subtitle, { color: C.textMut }]}>
              {doneCount} done · +{totalXP} XP earned today
            </Text>
          </View>

          <View style={styles.headerActions}>
            {/* Sort toggle */}
            <Pressable
              style={[
                styles.iconBtn,
                { backgroundColor: showSort ? C.blueDim : C.surface, borderColor: showSort ? C.blue : C.border },
              ]}
              onPress={() => { setShowSort(v => !v); setDeletingId(null); }}
            >
              <SlidersHorizontal size={16} color={showSort ? C.blue : C.textMut} strokeWidth={2} />
            </Pressable>

            {/* Add toggle — rotates to X when open */}
            <Pressable
              style={[
                styles.iconBtn,
                { backgroundColor: addMode ? C.blueDim : C.surface, borderColor: addMode ? C.blue : C.border },
              ]}
              onPress={() => {
                if (addMode) { setAddMode(false); Keyboard.dismiss(); }
                else { openAddModal(); }
              }}
            >
              {addMode
                ? <X size={16} color={C.blue} strokeWidth={2.5} />
                : <Plus size={16} color={C.textMut} strokeWidth={2} />
              }
            </Pressable>
          </View>
        </View>

        {/* Sort picker */}
        {showSort && (
          <Animated.View entering={FadeIn.duration(180)}>
            <SortPicker sort={sort} onChange={s => { setSort(s); setShowSort(false); }} />
          </Animated.View>
        )}

        {/* ── Add Quest inline panel ── */}
        {addMode && (
          <Animated.View
            entering={FadeInDown.duration(200).easing(Easing.out(Easing.cubic))}
            style={[styles.addPanel, { backgroundColor: C.surface, borderColor: C.border }]}
          >
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ gap: 12, paddingBottom: 4 }}
            >
              {/* Title */}
              <TextInput
                style={[styles.modalInput, { backgroundColor: C.void, borderColor: C.borderFocus, color: C.text }]}
                placeholder="Quest title…"
                placeholderTextColor={C.textMut}
                value={newTitle}
                onChangeText={setNewTitle}
                autoFocus
              />

              {/* Description */}
              <TextInput
                style={[styles.modalInput, styles.modalInputMulti, { backgroundColor: C.void, borderColor: C.border, color: C.text }]}
                placeholder="Description (optional)…"
                placeholderTextColor={C.textMut}
                value={newDesc}
                onChangeText={setNewDesc}
                multiline
                numberOfLines={2}
              />

              {/* Category */}
              <Text style={[styles.panelLabel, { color: C.textMut }]}>Category</Text>
              <View style={styles.modalPickerRow}>
                {CATEGORIES.slice(1).map(cat => {
                  const active = newCat === cat;
                  return (
                    <Pressable key={cat} onPress={() => setNewCat(cat)}
                      style={[styles.modalCatBtn, { borderColor: active ? C.blue : C.border, backgroundColor: active ? C.blueDim : C.void }]}>
                      <Text style={[styles.modalCatText, { color: active ? C.blue : C.textMut }]}>{cat}</Text>
                    </Pressable>
                  );
                })}
              </View>

              {/* Rank */}
              <Text style={[styles.panelLabel, { color: C.textMut }]}>Rank</Text>
              <View style={styles.modalPickerRow}>
                {(Object.entries(RANK_COLORS) as [QuestRank, string][]).map(([r, color]) => {
                  const active = newRank === r;
                  return (
                    <Pressable key={r} onPress={() => setNewRank(r)}
                      style={[styles.modalRankBtn, {
                        borderColor: active ? color : C.border,
                        backgroundColor: active ? color + '22' : C.void,
                      }]}>
                      <Text style={[styles.modalRankText, { color: active ? color : C.textMut }]}>{r}</Text>
                    </Pressable>
                  );
                })}
              </View>

              {/* XP + Stat affinity row */}
              <Text style={[styles.panelLabel, { color: C.textMut }]}>XP Reward</Text>
              <View style={styles.modalPickerRow}>
                {[25, 50, 75, 100, 150].map(xp => (
                  <Pressable key={xp} onPress={() => setNewXP(xp)}
                    style={[styles.modalXPBtn, {
                      borderColor: newXP === xp ? C.blue : C.border,
                      backgroundColor: newXP === xp ? C.blueDim : C.void,
                    }]}>
                    <Text style={[styles.modalXPText, { color: newXP === xp ? C.blue : C.textMut }]}>+{xp}</Text>
                  </Pressable>
                ))}
              </View>

              {/* Stat affinity + Submit in same row */}
              <View style={styles.panelFooter}>
                <View style={[styles.statAffinityBadge, { backgroundColor: C.blueDim, borderColor: C.blueBorder }]}>
                  <Text style={[styles.statAffinityVal, { color: C.blue }]}>
                    [{CATEGORY_STAT[newCat] ?? 'INT'}]
                  </Text>
                  <Text style={[styles.statAffinityLabel, { color: C.blue }]}>affinity</Text>
                </View>
                <Pressable
                  style={[styles.panelSubmit, { backgroundColor: newTitle.trim() ? C.blue : C.surface2, flex: 1 }]}
                  onPress={addQuest}
                  disabled={!newTitle.trim()}
                >
                  <Text style={[styles.panelSubmitText, { color: newTitle.trim() ? '#fff' : C.textMut }]}>Add Quest</Text>
                </Pressable>
              </View>
            </ScrollView>
          </Animated.View>
        )}
      </View>

      {/* ── Filter chips ── */}
      <View style={[styles.filterWrapper, { borderBottomColor: C.border }]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterBar}
        >
          {/* "All" chip — never deletable */}
          <FilterChip
            label="All"
            count={pendingCounts['All'] ?? 0}
            active={'All' === filter}
            onPress={() => { setFilter('All'); setDeletingCat(null); }}
          />

          {/* Dynamic category chips */}
          {store.categories.map(cat => {
            const isDeleteMode = deletingCat === cat;
            return (
              <View key={cat} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <FilterChip
                  label={cat}
                  count={pendingCounts[cat] ?? 0}
                  active={cat === filter && !isDeleteMode}
                  onPress={() => {
                    if (isDeleteMode) { setDeletingCat(null); return; }
                    setFilter(cat);
                  }}
                  onLongPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    setDeletingCat(prev => prev === cat ? null : cat);
                  }}
                />
                {isDeleteMode && (
                  <Animated.View entering={FadeIn.duration(150)} style={{ flexDirection: 'row', gap: 3 }}>
                    <Pressable
                      onPress={() => setDeletingCat(null)}
                      style={[styles.catActionBtn, { backgroundColor: C.surface, borderColor: C.border }]}
                    >
                      <X size={10} color={C.textMut} strokeWidth={2.5} />
                    </Pressable>
                    <Pressable
                      onPress={() => handleDeleteCategory(cat)}
                      style={[styles.catActionBtn, { backgroundColor: '#FEE2E2', borderColor: '#FCA5A5' }]}
                    >
                      <Trash2 size={10} color="#EF4444" strokeWidth={2.5} />
                    </Pressable>
                  </Animated.View>
                )}
              </View>
            );
          })}

          {/* Add category button / inline input */}
          {addCatMode ? (
            <Animated.View entering={FadeIn.duration(150)} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <TextInput
                style={[styles.catInput, { backgroundColor: C.surface, borderColor: C.borderFocus, color: C.text }]}
                placeholder="Category name…"
                placeholderTextColor={C.textMut}
                value={newCatName}
                onChangeText={setNewCatName}
                autoFocus
                returnKeyType="done"
                onSubmitEditing={submitNewCategory}
              />
              <Pressable
                onPress={submitNewCategory}
                style={[styles.catActionBtn, { backgroundColor: C.blue, borderColor: C.blue }]}
              >
                <ChevronRight size={10} color="#fff" strokeWidth={2.5} />
              </Pressable>
              <Pressable
                onPress={() => { setAddCatMode(false); setNewCatName(''); Keyboard.dismiss(); }}
                style={[styles.catActionBtn, { backgroundColor: C.surface, borderColor: C.border }]}
              >
                <X size={10} color={C.textMut} strokeWidth={2.5} />
              </Pressable>
            </Animated.View>
          ) : (
            <Pressable
              onPress={() => { setAddCatMode(true); setDeletingCat(null); }}
              style={[styles.catAddBtn, { borderColor: C.border, backgroundColor: C.surface }]}
            >
              <Plus size={11} color={C.textMut} strokeWidth={2} />
            </Pressable>
          )}
        </ScrollView>

        {/* Active sort indicator */}
        {sort !== 'default' && (
          <Pressable
            style={[styles.sortTag, { backgroundColor: C.blueDim, borderColor: C.blueBorder }]}
            onPress={() => setSort('default')}
          >
            <ArrowUpDown size={11} color={C.blue} strokeWidth={2} />
            <Text style={[styles.sortTagText, { color: C.blue }]}>
              {sort === 'xp' ? 'XP' : 'Rank'}
            </Text>
            <X size={10} color={C.blue} strokeWidth={2.5} />
          </Pressable>
        )}
      </View>

      {/* ── Quest list ── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
      >
        {pending.length === 0 && completed.length === 0 ? (
          <Animated.View entering={FadeIn} style={styles.emptyState}>
            <Text style={[styles.emptyIcon]}>✦</Text>
            <Text style={[styles.emptyTitle, { color: C.text }]}>All clear.</Text>
            <Text style={[styles.emptyText, { color: C.textMut }]}>
              No quests in this category.{'\n'}Tap + to add one.
            </Text>
          </Animated.View>
        ) : (
          <>
            {/* Pending */}
            {pending.length > 0 && (
              <View style={styles.group}>
                <View style={[styles.groupHeader, { borderBottomColor: C.border }]}>
                  <Text style={[styles.groupLabel, { color: C.textMut }]}>
                    Pending
                  </Text>
                  <View style={[styles.groupBadge, { backgroundColor: C.surface2 }]}>
                    <Text style={[styles.groupBadgeText, { color: C.textMut }]}>
                      {pending.length}
                    </Text>
                  </View>
                </View>
                <View style={[styles.groupList, { borderTopColor: C.border }]}>
                  {pending.map((q, i) => (
                    <QuestRow
                      key={q.id} quest={q} onToggle={toggle} index={i}
                      onDelete={store.deleteQuest}
                      isDeleting={deletingId === q.id}
                      onLongPress={(id) => setDeletingId(prev => prev === id ? null : id)}
                    />
                  ))}
                </View>
              </View>
            )}

            {/* Completed */}
            {completed.length > 0 && (
              <View style={styles.group}>
                <View style={[styles.groupHeader, { borderBottomColor: C.border }]}>
                  <Text style={[styles.groupLabel, { color: C.textMut }]}>
                    Completed
                  </Text>
                  <View style={[styles.groupBadge, { backgroundColor: C.surface2 }]}>
                    <Text style={[styles.groupBadgeText, { color: C.textMut }]}>
                      {completed.length}
                    </Text>
                  </View>
                </View>
                <View style={[styles.groupList, { borderTopColor: C.border }]}>
                  {completed.map((q, i) => (
                    <QuestRow
                      key={q.id} quest={q} onToggle={toggle} index={i}
                      onDelete={store.deleteQuest}
                      isDeleting={false}
                      onLongPress={() => {}}
                    />
                  ))}
                </View>
              </View>
            )}
          </>
        )}
        <View style={{ height: 110 }} />
      </ScrollView>

      <LevelUpModal
        visible={showLvlUp}
        newLevel={lvlUpNum}
        statGains={[{ label: 'Next Threshold', value: `${xpForLevel(lvlUpNum + 1)} XP` }]}
        onDismiss={() => setShowLvlUp(false)}
      />
    </SafeAreaView>
  );
}

// ─── Styles (layout only — colors applied inline) ────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1 },

  // Header
  header: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    gap: 12,
    borderBottomWidth: 1,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  title: {
    fontFamily: F.bold,
    fontSize: 26,
    letterSpacing: -0.8,
  },
  subtitle: {
    fontFamily: F.regular,
    fontSize: 13,
    marginTop: 3,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 2,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 9,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  addInput: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    borderWidth: 1.5,
    paddingHorizontal: 13,
    fontFamily: F.regular,
    fontSize: 14,
  },
  addConfirm: {
    height: 42,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addConfirmText: {
    fontFamily: F.semiBold,
    fontSize: 14,
    color: '#fff',
  },

  // Category Add / Edit inline
  catAddBtn: {
    width: 32, height: 32, borderRadius: 16, borderWidth: 1, borderStyle: 'dashed',
    alignItems: 'center', justifyContent: 'center', marginLeft: 4,
  },
  catInput: {
    height: 32, width: 120, borderRadius: 16, borderWidth: 1,
    paddingHorizontal: 12, fontFamily: F.regular, fontSize: 13,
  },
  catActionBtn: {
    width: 32, height: 32, borderRadius: 16, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },

  // Sort picker
  sortPicker: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 11,
  },
  sortOptionText: {
    flex: 1,
    fontFamily: F.medium,
    fontSize: 14,
  },
  sortActiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  sortDivider: {
    height: 1,
  },

  // Filter
  filterWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    paddingRight: 16,
  },
  filterBar: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 7,
    flexDirection: 'row',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  chipText: {
    fontFamily: F.medium,
    fontSize: 13,
  },
  chipBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  chipBadgeText: {
    fontFamily: F.monoBold,
    fontSize: 10,
  },
  sortTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    marginLeft: 'auto',
  },
  sortTagText: {
    fontFamily: F.medium,
    fontSize: 11,
  },

  // List
  listContent: {
    paddingTop: 6,
  },
  group: {
    marginTop: 10,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  groupLabel: {
    fontFamily: F.medium,
    fontSize: 11,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  groupBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  groupBadgeText: {
    fontFamily: F.monoBold,
    fontSize: 10,
  },
  groupList: {
    borderTopWidth: 1,
  },

  // Quest row
  questRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    gap: 13,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
    flexShrink: 0,
  },
  questContent: {
    flex: 1,
    gap: 5,
  },
  questTitle: {
    fontFamily: F.medium,
    fontSize: 15,
    lineHeight: 22,
    letterSpacing: -0.1,
  },
  questDesc: {
    fontFamily: F.regular,
    fontSize: 12,
    lineHeight: 17,
  },
  questMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  rankPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 5,
    borderWidth: 1,
  },
  rankDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  rankLabel: {
    fontFamily: F.mono,
    fontSize: 9,
    letterSpacing: 0.3,
  },
  xpLabel: {
    fontFamily: F.semiBold,
    fontSize: 12,
  },

  // Empty
  emptyState: {
    paddingTop: 80,
    alignItems: 'center',
    gap: 10,
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: 4,
  },
  emptyTitle: {
    fontFamily: F.semiBold,
    fontSize: 18,
    letterSpacing: -0.3,
  },
  emptyText: {
    fontFamily: F.regular,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
  },

  // Delete
  deleteActions: {
    flexDirection: 'row', gap: 6, alignItems: 'center', flexShrink: 0,
  },
  deleteCancelBtn: {
    height: 32, paddingHorizontal: 10, borderRadius: 8, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  deleteConfirmBtn: {
    height: 32, paddingHorizontal: 10, borderRadius: 8,
    backgroundColor: '#EF4444',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4,
  },
  deleteBtnText: { fontFamily: F.semiBold, fontSize: 11, color: '#fff' },
  rankBar: { width: 3, alignSelf: 'stretch', borderRadius: 2, marginRight: 2 },

  // Inline add panel
  addPanel: {
    borderRadius: 14, borderWidth: 1,
    marginTop: 10, padding: 14, maxHeight: 480,
  },
  panelLabel: {
    fontFamily: F.medium, fontSize: 10, letterSpacing: 0.8,
    textTransform: 'uppercase', marginBottom: -4,
  },
  panelFooter: { flexDirection: 'row', gap: 8, alignItems: 'center', marginTop: 2 },
  panelSubmit: {
    height: 44, borderRadius: 11,
    alignItems: 'center', justifyContent: 'center',
  },
  panelSubmitText: { fontFamily: F.semiBold, fontSize: 14 },
  statAffinityBadge: {
    height: 44, paddingHorizontal: 12, borderRadius: 11, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center', gap: 2,
  },
  statAffinityVal: { fontFamily: F.monoBold, fontSize: 12, letterSpacing: 1 },
  statAffinityLabel: { fontFamily: F.regular, fontSize: 9, letterSpacing: 0.3 },

  // Shared input / pickers (used by inline panel)
  modalInput: {
    height: 44, borderRadius: 10, borderWidth: 1.5,
    paddingHorizontal: 13, fontFamily: F.regular, fontSize: 15,
  },
  modalInputMulti: { height: 64, paddingTop: 10, textAlignVertical: 'top' },
  modalPickerRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  modalCatBtn: {
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1,
  },
  modalCatText: { fontFamily: F.medium, fontSize: 12 },
  modalRankBtn: {
    flex: 1, height: 34, borderRadius: 8, borderWidth: 1.5,
    alignItems: 'center', justifyContent: 'center',
  },
  modalRankText: { fontFamily: F.bold, fontSize: 12 },
  modalXPBtn: {
    flex: 1, height: 34, borderRadius: 8, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  modalXPText: { fontFamily: F.semiBold, fontSize: 12 },
});
