import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../src/theme/ThemeContext';
import { F } from '../../src/theme/fonts';
import { protocolAccent } from '../../src/theme/colors';
import { useSystemStore, xpForLevel } from '../../src/store/useSystemStore';

export default function PulseScreen() {
  const { colors: C, isDark } = useTheme();
  const accent = protocolAccent('FINANCE', isDark, C.blue);
  const store = useSystemStore();

  const curLevelXP = xpForLevel(store.level);
  const nextLevelXP = xpForLevel(store.level + 1);
  const levelProgress = Math.min(((store.totalXP - curLevelXP) / (nextLevelXP - curLevelXP)) * 100, 100);
  const perGrowth = Math.floor((store.statPoints.PER ?? 0) / 50);

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: C.surface }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: C.text }]}>Pulse</Text>
          <Text style={[styles.sub, { color: C.textMut }]}>XAUUSD readiness and perception growth.</Text>
        </View>

        <View style={[styles.card, { backgroundColor: C.void, borderColor: C.border }]}>
          <Text style={[styles.cardLabel, { color: C.textMut }]}>Perception Growth</Text>
          <Text style={[styles.cardValue, { color: C.text }]}>{store.statPoints.PER} PER</Text>
          <Text style={[styles.cardSub, { color: C.textMut }]}>Ranked bonus: +{perGrowth}</Text>
          <View style={[styles.progressBg, { backgroundColor: C.surface2 }]}>
            <View style={[styles.progressFill, { width: `${levelProgress}%`, backgroundColor: accent }]} />
          </View>
        </View>

        <View style={styles.grid}>
          <View style={[styles.metric, { backgroundColor: C.void, borderColor: C.border }]}>
            <Text style={[styles.metricLabel, { color: C.textMut }]}>Bias</Text>
            <Text style={[styles.metricValue, { color: C.text }]}>Neutral</Text>
          </View>
          <View style={[styles.metric, { backgroundColor: C.void, borderColor: C.border }]}>
            <Text style={[styles.metricLabel, { color: C.textMut }]}>Volatility</Text>
            <Text style={[styles.metricValue, { color: C.text }]}>Moderate</Text>
          </View>
        </View>

        <View style={[styles.noteCard, { backgroundColor: C.void, borderColor: C.border }]}>
          <Text style={[styles.noteTitle, { color: C.text }]}>Session Protocol</Text>
          <Text style={[styles.noteText, { color: C.textMut }]}>
            Check News tab before entering. Log every setup in Terminal to convert execution quality into PER XP and Gold.
          </Text>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: 24, paddingTop: 24, gap: 4 },
  title: { fontFamily: F.bold, fontSize: 34, letterSpacing: -1 },
  sub: { fontFamily: F.regular, fontSize: 13 },
  card: { marginHorizontal: 20, marginTop: 22, borderRadius: 14, borderWidth: 1, padding: 16, gap: 6 },
  cardLabel: { fontFamily: F.mono, fontSize: 9, letterSpacing: 1.4, textTransform: 'uppercase' },
  cardValue: { fontFamily: F.bold, fontSize: 28, letterSpacing: -0.8 },
  cardSub: { fontFamily: F.regular, fontSize: 12 },
  progressBg: { height: 4, borderRadius: 2, marginTop: 6, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 2 },
  grid: { flexDirection: 'row', gap: 10, marginHorizontal: 20, marginTop: 12 },
  metric: { flex: 1, borderWidth: 1, borderRadius: 12, padding: 14, gap: 4 },
  metricLabel: { fontFamily: F.mono, fontSize: 9, letterSpacing: 1.2, textTransform: 'uppercase' },
  metricValue: { fontFamily: F.semiBold, fontSize: 16 },
  noteCard: { marginHorizontal: 20, marginTop: 12, borderRadius: 12, borderWidth: 1, padding: 14, gap: 6 },
  noteTitle: { fontFamily: F.semiBold, fontSize: 14 },
  noteText: { fontFamily: F.regular, fontSize: 13, lineHeight: 18 },
});
