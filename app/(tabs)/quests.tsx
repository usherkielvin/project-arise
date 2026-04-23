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
import { Swipeable } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../src/theme/ThemeContext';
import { F } from '../../src/theme/fonts';
import { Trash2, Check, Plus, X, ArrowUpDown, SlidersHorizontal, ChevronRight } from 'lucide-react-native';

import { useSystemStore, Quest, QuestRank, CATEGORY_STAT, xpForLevel } from '../../src/store/useSystemStore';
import { LevelUpModal } from '../../src/components/LevelUpModal';
type FilterKey = 'all' | 'pending' | 'in_progress' | 'completed';
// Categories are now managed in the store — no hardcoded list here.

// ─── Quest Row ────────────────────────────────────────────────────────────────
const RANK_COLORS: Record<QuestRank, string> = {
  E:'#94A3B8', D:'#10B981', C:'#0891B2', B:'#6366F1', A:'#7C3AED', S:'#D97706',
};
const RANK_COLORS_DARK: Record<QuestRank, string> = {
  E:'#64748B', D:'#34D399', C:'#22D3EE', B:'#818CF8', A:'#A78BFA', S:'#FBBF24',
};

function QuestRow({
  quest, onToggle, onUncheck, onEdit, onDelete, onAddProgress, isDeleting, onLongPress, index,
}: {
  quest: Quest; onToggle: (id: number) => void;
  onUncheck: (id: number) => void;
  onEdit: (q: Quest) => void;
  onDelete: (id: number) => void; 
  onAddProgress: (id: number, amt: number) => void;
  isDeleting: boolean;
  onLongPress: (id: number) => void; index: number;
}) {
  const { colors: C, isDark } = useTheme();
  const rankColor = (isDark ? RANK_COLORS_DARK : RANK_COLORS)[quest.rank];
  const scale = useSharedValue(1);
  const checkScale = useSharedValue(quest.completed ? 1 : 0);
  const [expanded, setExpanded] = useState(false);

  React.useEffect(() => {
    checkScale.value = withTiming(quest.completed ? 1 : 0, { duration: 180, easing: Easing.out(Easing.cubic) });
  }, [quest.completed]);

  const handlePress = () => {
    if (isDeleting) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    scale.value = withSequence(
      withTiming(0.97, { duration: 70, easing: Easing.out(Easing.cubic) }),
      withTiming(1.0,  { duration: 120, easing: Easing.out(Easing.cubic) })
    );

    setExpanded(!expanded);
  };

  const rowStyle  = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const checkAnim = useAnimatedStyle(() => ({ transform: [{ scale: checkScale.value }] }));

  return (
    <Animated.View entering={FadeIn.delay(index * 30).duration(220)}>
      <Swipeable
        renderRightActions={() => (
          <Pressable 
            style={{ backgroundColor: '#EF4444', justifyContent: 'center', alignItems: 'flex-end', width: 80 }}
            onPress={() => {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
              onDelete(quest.id);
            }}
          >
            <View style={{ paddingRight: 24 }}>
              <Trash2 size={24} color="#fff" />
            </View>
          </Pressable>
        )}
        renderLeftActions={() => (
          <Pressable 
            style={{ backgroundColor: quest.completed ? C.surface2 : C.blue, justifyContent: 'center', alignItems: 'flex-start', width: 80 }}
            onPress={() => quest.completed ? onUncheck(quest.id) : onToggle(quest.id)}
          >
            <View style={{ paddingLeft: 24 }}>
              {quest.completed ? <X size={24} color={C.textMut} /> : <Check size={24} color="#fff" />}
            </View>
          </Pressable>
        )}
      >
        <Pressable
          onPress={handlePress}
          onLongPress={() => !quest.completed && onLongPress(quest.id)}
        >
          <Animated.View style={[
            styles.questRow,
            { backgroundColor: C.surface, borderBottomColor: C.border },
            isDeleting && { backgroundColor: '#FFF5F5' },
            quest.completed && { opacity: 0.65 },
            rowStyle,
          ]}>
            {/* Rank accent bar */}
            <View style={[styles.rankBar, { backgroundColor: isDeleting ? '#EF4444' : rankColor }]} />

            {/* Checkbox */}
            <Pressable
              onPress={() => {
                Haptics.selectionAsync();
                quest.completed ? onUncheck(quest.id) : onToggle(quest.id);
              }}
              hitSlop={12}
              style={[
                styles.checkbox,
                { borderColor: quest.completed ? C.blue : C.borderMid },
                quest.completed && { backgroundColor: C.blue },
              ]}
            >
              <Animated.View style={checkAnim}>
                <Check size={11} color="#fff" strokeWidth={3} />
              </Animated.View>
            </Pressable>

            {/* Content */}
            <View style={styles.questContent}>
              <Text
                numberOfLines={1}
                style={[
                  styles.questTitle,
                  { color: C.text },
                  quest.completed && { color: C.textMut },
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
                  
                  {quest.isProgressBased && !quest.completed && (
                    <View style={{ backgroundColor: C.blueDim, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginRight: 8, borderWidth: 1, borderColor: C.blueBorder }}>
                      <Text style={{ color: C.blue, fontFamily: F.bold, fontSize: 10 }}>
                        {quest.progress ?? 0}%
                      </Text>
                    </View>
                  )}

                  <Text style={[styles.xpLabel, { color: quest.completed ? C.textMut : C.blue }]}>
                    +{quest.xp} XP
                  </Text>
                </View>
              )}
              
              {/* Expanded Action Bar (Edit & Progress) */}
              {expanded && !isDeleting && (
                <Animated.View entering={FadeInDown.duration(150)} style={{ marginTop: 12, gap: 10 }}>
                  
                  {quest.isProgressBased && !quest.completed && (
                    <>
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Text style={{ fontFamily: F.medium, fontSize: 12, color: C.textMut }}>
                          Progress
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
                    </>
                  )}

                  {/* Edit Button */}
                  <Pressable 
                    onPress={() => onEdit(quest)}
                    style={{ 
                      paddingVertical: 10, backgroundColor: C.surface2, borderRadius: 8, 
                      alignItems: 'center', borderWidth: 1, borderColor: C.border, marginTop: 4 
                    }}
                  >
                    <Text style={{ color: C.text, fontFamily: F.medium, fontSize: 13 }}>Edit Quest</Text>
                  </Pressable>

                </Animated.View>
              )}
            </View>
          </Animated.View>
        </Pressable>
      </Swipeable>
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

// ─── Filter Sheet ──────────────────────────────────────────────────────────────
function FilterPicker({
  filter, onFilterChange
}: {
  filter: FilterKey; onFilterChange: (f: FilterKey) => void;
}) {
  const { colors: C } = useTheme();
  const filterOpts: { key: FilterKey; label: string }[] = [
    { key: 'all', label: 'All Quests' },
    { key: 'pending', label: 'Pending' },
    { key: 'in_progress', label: 'In Progress' },
    { key: 'completed', label: 'Completed' },
  ];

  return (
    <View style={[styles.sortPicker, { backgroundColor: C.surface, borderColor: C.border }]}>
      {filterOpts.map((o, i) => (
        <React.Fragment key={o.key}>
          {i > 0 && <View style={[styles.sortDivider, { backgroundColor: C.border }]} />}
          <Pressable
            onPress={() => onFilterChange(o.key)}
            style={styles.sortOption}
          >
            <Text style={[
              styles.sortOptionText,
              { color: filter === o.key ? C.blue : C.textSub },
            ]}>
              {o.label}
            </Text>
            {filter === o.key && (
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
  const CATEGORIES = store.categories;  // dynamic from store

  const [filter, setFilter]       = useState<FilterKey>('all');
  const [showFilter, setShowFilter] = useState(false);
  const [addMode, setAddMode]     = useState(false);
  const [manageCatMode, setManageCatMode] = useState(false);
  const [editingQuest, setEditingQuest] = useState<Quest | null>(null);
  const [newTitle, setNewTitle]   = useState('');
  const [newDesc, setNewDesc]     = useState('');
  const [newCat, setNewCat]       = useState('Development');
  const [newRank, setNewRank]     = useState<QuestRank>('E');
  const [newXP, setNewXP]         = useState(50);
  const [isProgress, setIsProgress] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [showLvlUp, setShowLvlUp] = useState(false);
  const [lvlUpNum, setLvlUpNum]   = useState(1);
  const [addCatMode, setAddCatMode] = useState(false);

  const toggle = useCallback((id: number) => {
    const result = store.toggleQuest(id);
    if (result?.leveledUp) { setLvlUpNum(result.newLevel); setShowLvlUp(true); }
  }, [store]);

  const submitQuest = () => {
    if (!newTitle.trim()) return;
    const cat  = newCat;
    const stat = CATEGORY_STAT[cat] ?? 'INT';

    if (editingQuest) {
      store.updateQuest(editingQuest.id, {
        title: newTitle.trim(),
        description: newDesc.trim(),
        category: cat, stat, xp: newXP, rank: newRank,
        isProgressBased: isProgress
      });
    } else {
      store.addQuest({ 
        title: newTitle.trim(), 
        description: newDesc.trim(), 
        category: cat, stat, xp: newXP, rank: newRank,
        isProgressBased: isProgress
      });
    }
    
    setNewTitle(''); setNewDesc(''); setNewRank('E'); setNewXP(50); setNewCat('Development'); setIsProgress(false);
    setEditingQuest(null);
    setAddMode(false); Keyboard.dismiss();
  };

  const openAddModal = () => {
    setEditingQuest(null);
    setNewTitle(''); setNewDesc(''); setNewRank('E'); setNewXP(50); setNewCat('Development'); setIsProgress(false);
    setAddMode(true);
    setShowFilter(false);
  };

  const openEditModal = (q: Quest) => {
    setEditingQuest(q);
    setNewTitle(q.title);
    setNewDesc(q.description);
    setNewCat(q.category);
    setNewRank(q.rank);
    setNewXP(q.xp);
    setIsProgress(q.isProgressBased ?? false);
    setAddMode(true);
    setShowFilter(false);
  };

  const pending    = quests.filter(q => !q.completed && (!q.isProgressBased || !q.progress));
  const inProgress = quests.filter(q => !q.completed && q.isProgressBased && q.progress && q.progress > 0);
  const completed  = quests.filter(q => q.completed);

  const totalXP   = completed.reduce((s, q) => s + q.xp, 0);
  const doneCount = completed.length;

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: C.void }]}>

      {/* ── Header ── */}
      <View style={[styles.header, { borderBottomColor: C.border }]}>
        <View style={styles.headerTop}>
          <View>
            <Text style={[styles.title, { color: C.text }]}>Quests</Text>
            <Text style={[styles.subtitle, { color: C.textMut }]}>
              {doneCount} done · +{totalXP} XP earned today
            </Text>
          </View>

          <View style={styles.headerActions}>
            {/* Filter toggle */}
            <Pressable
              style={[
                styles.iconBtn,
                { backgroundColor: showFilter ? C.blueDim : C.surface, borderColor: showFilter ? C.blue : C.border },
              ]}
              onPress={() => { setShowFilter(v => !v); setDeletingId(null); }}
            >
              <SlidersHorizontal size={16} color={showFilter ? C.blue : C.textMut} strokeWidth={2} />
            </Pressable>

            {/* Add toggle — rotates to X when open */}
            <Pressable
              style={[
                styles.iconBtn,
                { backgroundColor: addMode ? C.blueDim : C.surface, borderColor: addMode ? C.blue : C.border },
              ]}
              onPress={() => {
                if (addMode) { 
                  setAddMode(false); 
                  setEditingQuest(null);
                  Keyboard.dismiss(); 
                } else { 
                  openAddModal(); 
                }
              }}
            >
              {addMode
                ? <X size={16} color={C.blue} strokeWidth={2.5} />
                : <Plus size={16} color={C.textMut} strokeWidth={2} />
              }
            </Pressable>
          </View>
        </View>

        {/* Filter picker */}
        {showFilter && (
          <Animated.View entering={FadeIn.duration(180)}>
            <FilterPicker 
              filter={filter} onFilterChange={f => { setFilter(f); setShowFilter(false); }}
            />
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
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                <Text style={[styles.panelLabel, { color: C.textMut }]}>Category</Text>
                <Pressable onPress={() => { setManageCatMode(!manageCatMode); setAddCatMode(false); }}>
                  <Text style={{ fontFamily: F.medium, fontSize: 12, color: C.blue }}>{manageCatMode ? 'Done' : 'Manage'}</Text>
                </Pressable>
              </View>

              {manageCatMode ? (
                <View style={{ gap: 8 }}>
                  {store.categories.map(cat => (
                    <View key={cat} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <TextInput 
                        style={[styles.modalInput, { flex: 1, height: 36, backgroundColor: C.void, borderColor: C.borderFocus, color: C.text }]} 
                        defaultValue={cat}
                        onEndEditing={(e) => {
                          const t = e.nativeEvent.text.trim();
                          if (t && t !== cat) store.editCategory(cat, t);
                        }}
                      />
                      <Pressable 
                        onPress={() => store.deleteCategory(cat)}
                        style={{ width: 36, height: 36, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FEE2E2', borderRadius: 10 }}
                      >
                        <Trash2 size={16} color="#EF4444" />
                      </Pressable>
                    </View>
                  ))}
                  {addCatMode ? (
                    <TextInput 
                      style={[styles.modalInput, { height: 36, backgroundColor: C.void, borderColor: C.borderFocus, color: C.text }]} 
                      placeholder="New category name..."
                      placeholderTextColor={C.textMut}
                      autoFocus
                      onEndEditing={(e) => {
                        const t = e.nativeEvent.text.trim();
                        if (t) store.addCategory(t);
                        setAddCatMode(false);
                      }}
                    />
                  ) : (
                    <Pressable 
                      onPress={() => setAddCatMode(true)}
                      style={{ paddingVertical: 10, alignItems: 'center', backgroundColor: C.surface2, borderRadius: 10, borderWidth: 1, borderColor: C.border, borderStyle: 'dashed' }}
                    >
                      <Plus size={16} color={C.textMut} />
                    </Pressable>
                  )}
                </View>
              ) : (
                <View style={styles.modalPickerRow}>
                  {CATEGORIES.map(cat => {
                    const active = newCat === cat;
                    return (
                      <Pressable key={cat} onPress={() => setNewCat(cat)}
                        style={[styles.modalCatBtn, { borderColor: active ? C.blue : C.border, backgroundColor: active ? C.blueDim : C.void }]}>
                        <Text style={[styles.modalCatText, { color: active ? C.blue : C.textMut }]}>{cat}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              )}

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

              {/* Progress Toggle */}
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 4 }}>
                <Text style={[styles.panelLabel, { color: C.textMut }]}>Track Percentage (%)</Text>
                <Pressable
                  onPress={() => setIsProgress(!isProgress)}
                  style={{
                    width: 44, height: 24, borderRadius: 12,
                    backgroundColor: isProgress ? C.blue : C.surface2,
                    padding: 2,
                    justifyContent: 'center',
                  }}
                >
                  <Animated.View
                    style={{
                      width: 20, height: 20, borderRadius: 10,
                      backgroundColor: '#fff',
                      transform: [{ translateX: isProgress ? 20 : 0 }],
                    }}
                  />
                </Pressable>
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
                  onPress={submitQuest}
                  disabled={!newTitle.trim()}
                >
                  <Text style={[styles.panelSubmitText, { color: newTitle.trim() ? '#fff' : C.textMut }]}>
                    {editingQuest ? 'Save Changes' : 'Add Quest'}
                  </Text>
                </Pressable>
              </View>
            </ScrollView>
          </Animated.View>
        )}
      </View>

      {/* Active tags indicator */}
      <View style={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 6, flexDirection: 'row', gap: 8 }}>
        {filter !== 'all' && (
          <Pressable
            style={[styles.sortTag, { alignSelf: 'flex-start', backgroundColor: C.blueDim, borderColor: C.blueBorder }]}
            onPress={() => setFilter('all')}
          >
            <Text style={[styles.sortTagText, { color: C.blue, textTransform: 'capitalize' }]}>
              {filter.replace('_', ' ')}
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
        {pending.length === 0 && inProgress.length === 0 && completed.length === 0 ? (
          <Animated.View entering={FadeIn} style={styles.emptyState}>
            <Text style={[styles.emptyIcon, { color: C.blue }]}>✦</Text>
            <Text style={[styles.emptyTitle, { color: C.text }]}>All clear.</Text>
          </Animated.View>
        ) : (
          <>
            {/* Pending */}
            {(filter === 'all' || filter === 'pending') && pending.length > 0 && (
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
                      key={q.id} quest={q} onToggle={toggle} onUncheck={store.uncheckQuest} index={i}
                      onEdit={openEditModal}
                      onDelete={store.deleteQuest}
                      onAddProgress={(id, amt) => {
                        const result = store.addQuestProgress(id, amt);
                        if (result?.leveledUp) { setLvlUpNum(result.newLevel); setShowLvlUp(true); }
                      }}
                      isDeleting={deletingId === q.id}
                      onLongPress={(id) => setDeletingId(prev => prev === id ? null : id)}
                    />
                  ))}
                </View>
              </View>
            )}

            {/* In Progress */}
            {(filter === 'all' || filter === 'in_progress') && inProgress.length > 0 && (
              <View style={styles.group}>
                <View style={[styles.groupHeader, { borderBottomColor: C.border }]}>
                  <Text style={[styles.groupLabel, { color: C.textMut }]}>
                    In Progress
                  </Text>
                  <View style={[styles.groupBadge, { backgroundColor: C.surface2 }]}>
                    <Text style={[styles.groupBadgeText, { color: C.textMut }]}>
                      {inProgress.length}
                    </Text>
                  </View>
                </View>
                <View style={[styles.groupList, { borderTopColor: C.border }]}>
                  {inProgress.map((q, i) => (
                    <QuestRow
                      key={q.id} quest={q} onToggle={toggle} onUncheck={store.uncheckQuest} index={i}
                      onEdit={openEditModal}
                      onDelete={store.deleteQuest}
                      onAddProgress={(id, amt) => {
                        const result = store.addQuestProgress(id, amt);
                        if (result?.leveledUp) { setLvlUpNum(result.newLevel); setShowLvlUp(true); }
                      }}
                      isDeleting={deletingId === q.id}
                      onLongPress={(id) => setDeletingId(prev => prev === id ? null : id)}
                    />
                  ))}
                </View>
              </View>
            )}

            {/* Completed */}
            {(filter === 'all' || filter === 'completed') && completed.length > 0 && (
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
                      key={q.id} quest={q} onToggle={toggle} onUncheck={store.uncheckQuest} index={i}
                      onEdit={openEditModal}
                      onDelete={store.deleteQuest}
                      onAddProgress={() => {}}
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
