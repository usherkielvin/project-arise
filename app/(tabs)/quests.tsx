/**
 * Quests Screen — The full Daily Quest Journal with category filter.
 */
import React, { useState } from 'react';
import { ScrollView, View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { QuestCard } from '../../src/components/QuestCard';
import { C } from '../../src/theme/colors';
import { F } from '../../src/theme/fonts';

type QuestRank = 'E' | 'D' | 'C' | 'B' | 'A' | 'S';

const CATEGORIES = ['ALL', 'TRADING', 'DEVELOPMENT', 'NU MOA', 'HEALTH'];

const MOCK = [
  { id: 1, title: 'Market Analysis: XAUUSD',         description: 'Study 1H + 4H chart for trend direction and S/R levels.',       category: 'TRADING',     stat: 'PER', xp: 50,  rank: 'D' as QuestRank, completed: false },
  { id: 2, title: 'Trend Reversal: XAUUSD Review',   description: 'Identify reversal signals and document your trading thesis.',    category: 'TRADING',     stat: 'PER', xp: 75,  rank: 'C' as QuestRank, completed: false },
  { id: 3, title: 'Code Protocol: Ashcol Portal',    description: 'Implement JWT refresh tokens and role-based route guards.',      category: 'DEVELOPMENT', stat: 'INT', xp: 100, rank: 'C' as QuestRank, completed: false },
  { id: 4, title: 'Commit Protocol: GitHub Push',    description: 'Commit progress to any active project with a meaningful note.',  category: 'DEVELOPMENT', stat: 'INT', xp: 30,  rank: 'E' as QuestRank, completed: false },
  { id: 5, title: 'Scholarly Raid: NU MOA Module',   description: 'Complete the Web Systems & Technologies online assessment.',     category: 'NU MOA',      stat: 'INT', xp: 75,  rank: 'D' as QuestRank, completed: true  },
  { id: 6, title: 'Knowledge Archive: MWA Notes',    description: 'Consolidate lecture notes and highlight key concepts.',          category: 'NU MOA',      stat: 'INT', xp: 40,  rank: 'E' as QuestRank, completed: false },
  { id: 7, title: 'Physical Protocol: 3km Run',      description: 'Complete a 3km outdoor run before 9AM.',                        category: 'HEALTH',      stat: 'STR', xp: 60,  rank: 'D' as QuestRank, completed: false },
];

export default function QuestsScreen() {
  const [quests, setQuests] = useState(MOCK);
  const [filter, setFilter] = useState('ALL');

  const toggle = (id: number) =>
    setQuests(prev => prev.map(q => q.id === id && !q.completed ? { ...q, completed: true } : q));

  const list = filter === 'ALL' ? quests : quests.filter(q => q.category === filter);
  const earned = quests.filter(q => q.completed).reduce((s, q) => s + q.xp, 0);
  const done = quests.filter(q => q.completed).length;

  return (
    <SafeAreaView style={styles.root}>

      {/* ── Header ── */}
      <View style={styles.header}>
        <Text style={styles.eyebrow}>SYSTEM LOG</Text>
        <View style={styles.titleRow}>
          <Text style={styles.title}>Quest Journal</Text>
          {/* Stats pill */}
          <View style={styles.pill}>
            <Text style={styles.pillVal}>{done}/{quests.length}</Text>
            <Text style={styles.pillSub}>DONE</Text>
          </View>
        </View>

        {/* XP earned row */}
        <View style={styles.earnedRow}>
          <Text style={styles.earnedLabel}>Total earned today</Text>
          <Text style={styles.earnedVal}>+{earned} XP</Text>
        </View>
      </View>

      {/* ── Hairline ── */}
      <View style={styles.hairline} />

      {/* ── Category Filter ── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterBar}
      >
        {CATEGORIES.map(cat => {
          const active = cat === filter;
          return (
            <Pressable
              key={cat}
              onPress={() => setFilter(cat)}
              style={[styles.filterChip, active && styles.filterChipActive]}
            >
              <Text style={[styles.filterText, active && styles.filterTextActive]}>
                {cat}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* ── Hairline ── */}
      <View style={styles.hairline} />

      {/* ── Quest rows ── */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
        {list.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>[ NO QUESTS FOUND ]</Text>
          </View>
        ) : (
          list.map(q => (
            <QuestCard
              key={q.id}
              title={q.title}
              description={q.description}
              category={q.category}
              stat={q.stat}
              xp={q.xp}
              rank={q.rank}
              isCompleted={q.completed}
              onPress={() => toggle(q.id)}
            />
          ))
        )}
        <View style={styles.listFooter}>
          <Text style={styles.listFooterText}>END OF LOG · {quests.length} QUESTS TOTAL</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.void },

  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
    gap: 10,
  },
  eyebrow: {
    fontFamily: F.mono,
    fontSize: 9,
    color: C.blue,
    letterSpacing: 4,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontFamily: F.bold,
    fontSize: 28,
    color: C.text,
    letterSpacing: -0.5,
  },
  pill: {
    borderWidth: 0.5,
    borderColor: C.blueBorder,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: 'center',
    backgroundColor: C.blueDim,
  },
  pillVal: {
    fontFamily: F.monoBold,
    fontSize: 16,
    color: C.blue,
  },
  pillSub: {
    fontFamily: F.mono,
    fontSize: 7,
    color: C.textMut,
    letterSpacing: 2,
  },
  earnedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  earnedLabel: {
    fontFamily: F.regular,
    fontSize: 12,
    color: C.textMut,
  },
  earnedVal: {
    fontFamily: F.monoBold,
    fontSize: 12,
    color: C.gold,
    letterSpacing: 1,
  },
  hairline: {
    height: 0.5,
    backgroundColor: C.border,
  },

  filterBar: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    gap: 8,
    flexDirection: 'row',
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: C.border,
  },
  filterChipActive: {
    borderColor: C.blue,
    backgroundColor: C.blueDim,
  },
  filterText: {
    fontFamily: F.mono,
    fontSize: 9,
    color: C.textMut,
    letterSpacing: 2,
  },
  filterTextActive: {
    color: C.blue,
  },

  list: {
    paddingBottom: 110,
  },
  empty: {
    paddingTop: 60,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: F.mono,
    fontSize: 10,
    color: C.textMut,
    letterSpacing: 3,
  },
  listFooter: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    alignItems: 'center',
  },
  listFooterText: {
    fontFamily: F.mono,
    fontSize: 8,
    color: C.textFnt,
    letterSpacing: 3,
  },
});
