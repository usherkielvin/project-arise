/**
 * Home / Status Hub — The precision daily dashboard.
 */
import React, { useState } from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusHeader } from '../../src/components/StatusHeader';
import { StatGrid } from '../../src/components/StatGrid';
import { QuestCard } from '../../src/components/QuestCard';
import { LevelUpModal } from '../../src/components/LevelUpModal';
import { C } from '../../src/theme/colors';
import { F } from '../../src/theme/fonts';

const xpForLevel = (lvl: number) => Math.floor(100 * Math.pow(lvl, 1.5));

const INITIAL_QUESTS = [
  { id: 1, title: 'Market Analysis: XAUUSD', description: 'Study 1H + 4H chart for trend direction and S/R zones.', category: 'Trading', stat: 'PER', xp: 50,  rank: 'D' as const, completed: false },
  { id: 2, title: 'Code Protocol: Ashcol Portal', description: 'Implement JWT refresh and role-based route guards.', category: 'Development', stat: 'INT', xp: 100, rank: 'C' as const, completed: false },
  { id: 3, title: 'Scholarly Raid: NU MOA Module', description: 'Complete the Web Systems & Technologies online quiz.', category: 'NU MOA', stat: 'INT', xp: 75,  rank: 'D' as const, completed: true },
];

function SectionLabel({ label, right }: { label: string; right?: string }) {
  return (
    <View style={styles.sectionRow}>
      <Text style={styles.sectionLabel}>{label}</Text>
      {right && <Text style={styles.sectionRight}>{right}</Text>}
    </View>
  );
}

export default function HomeScreen() {
  const [quests, setQuests] = useState(INITIAL_QUESTS);
  const [totalXP, setTotalXP]   = useState(75);
  const [level, setLevel]       = useState(1);
  const [showLvlUp, setShowLvlUp] = useState(false);
  const [newLevel, setNewLevel] = useState(1);

  const nextXP = xpForLevel(level + 1);
  const curXP  = xpForLevel(level);
  const progress = Math.min(((totalXP - curXP) / (nextXP - curXP)) * 100, 100);

  const toggleQuest = (id: number) => {
    const q = quests.find(q => q.id === id);
    if (!q || q.completed) return;
    setQuests(prev => prev.map(q => q.id === id ? { ...q, completed: true } : q));
    const gained = totalXP + q.xp;
    setTotalXP(gained);
    let nlvl = level;
    while (xpForLevel(nlvl + 1) <= gained) nlvl++;
    if (nlvl > level) { setLevel(nlvl); setNewLevel(nlvl); setShowLvlUp(true); }
  };

  const completedCount = quests.filter(q => q.completed).length;
  const todayXP = quests.filter(q => q.completed).reduce((s, q) => s + q.xp, 0);

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Status Window ── */}
        <StatusHeader
          level={level}
          expProgress={progress}
          totalXP={totalXP}
          nextLevelXP={nextXP}
        />

        {/* ── Attributes Quadrant ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderPad}>
            <SectionLabel label="ATTRIBUTES" right={`${todayXP} XP TODAY`} />
          </View>
          <StatGrid />
        </View>

        {/* ── Daily Quest Log ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderPad}>
            <SectionLabel
              label="DAILY QUEST LOG"
              right={`${completedCount} / ${quests.length} CLEARED`}
            />
          </View>

          {/* Quest rows — no padding, flush to edges */}
          {quests.map(q => (
            <QuestCard
              key={q.id}
              title={q.title}
              description={q.description}
              category={q.category}
              stat={q.stat}
              xp={q.xp}
              rank={q.rank}
              isCompleted={q.completed}
              onPress={() => toggleQuest(q.id)}
            />
          ))}
        </View>

        {/* ── Footer ── */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>ARISE: DAILY SYSTEM · INITIALIZED</Text>
        </View>
      </ScrollView>

      <LevelUpModal
        visible={showLvlUp}
        newLevel={newLevel}
        statGains={[
          { label: 'INT', value: '+2' },
          { label: 'PER', value: '+1' },
          { label: 'Next Threshold', value: `${xpForLevel(newLevel + 1)} XP` },
        ]}
        onDismiss={() => setShowLvlUp(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.void,
  },
  scroll: {
    paddingTop: 0,
    paddingBottom: 110,
  },
  section: {
    marginTop: 12,
  },
  sectionHeaderPad: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionLabel: {
    fontFamily: F.mono,
    fontSize: 9,
    color: C.textMut,
    letterSpacing: 3,
  },
  sectionRight: {
    fontFamily: F.mono,
    fontSize: 9,
    color: C.blue,
    letterSpacing: 2,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 8,
    alignItems: 'center',
  },
  footerText: {
    fontFamily: F.mono,
    fontSize: 8,
    color: C.textFnt,
    letterSpacing: 3,
  },
});
