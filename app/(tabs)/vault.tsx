import React, { useMemo } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../src/theme/ThemeContext';
import { F } from '../../src/theme/fonts';
import { protocolAccent } from '../../src/theme/colors';
import { useSystemStore } from '../../src/store/useSystemStore';

export default function VaultScreen() {
  const { colors: C, isDark } = useTheme();
  const accent = protocolAccent('FINANCE', isDark, C.blue);
  const tradeLogs = useSystemStore((s) => s.tradeLogs);
  const financeGold = useSystemStore((s) => s.financeGold);
  const preparedNewsEvents = useSystemStore((s) => s.preparedNewsEvents);

  const stats = useMemo(() => {
    const wins = tradeLogs.filter((t) => t.pips > 0).length;
    const losses = tradeLogs.filter((t) => t.pips <= 0).length;
    const totalPips = tradeLogs.reduce((sum, t) => sum + t.pips, 0);
    return { wins, losses, totalPips };
  }, [tradeLogs]);

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: C.surface }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.eyebrow, { color: C.textMut }]}>Financial Milestones</Text>
          <Text style={[styles.title, { color: C.text }]}>Vault</Text>
        </View>

        <View style={styles.grid}>
          <View style={[styles.metric, { backgroundColor: C.void, borderColor: C.border }]}>
            <Text style={[styles.metricLabel, { color: C.textMut }]}>Gold</Text>
            <Text style={[styles.metricVal, { color: C.text }]}>{financeGold}</Text>
          </View>
          <View style={[styles.metric, { backgroundColor: C.void, borderColor: C.border }]}>
            <Text style={[styles.metricLabel, { color: C.textMut }]}>Prepared</Text>
            <Text style={[styles.metricVal, { color: C.text }]}>{preparedNewsEvents.filter((e) => e.prepared).length}</Text>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: C.void, borderColor: C.border }]}>
          <Text style={[styles.cardTitle, { color: C.text }]}>Trade History</Text>
          <View style={styles.row}>
            <Text style={[styles.rowLabel, { color: C.textMut }]}>Wins</Text>
            <Text style={[styles.rowVal, { color: accent }]}>{stats.wins}</Text>
          </View>
          <View style={styles.row}>
            <Text style={[styles.rowLabel, { color: C.textMut }]}>Losses</Text>
            <Text style={[styles.rowVal, { color: C.penalty }]}>{stats.losses}</Text>
          </View>
          <View style={styles.row}>
            <Text style={[styles.rowLabel, { color: C.textMut }]}>Net Pips</Text>
            <Text style={[styles.rowVal, { color: C.text }]}>{stats.totalPips}</Text>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: C.void, borderColor: C.border }]}>
          <Text style={[styles.cardTitle, { color: C.text }]}>Latest Milestone</Text>
          <Text style={[styles.milestoneText, { color: C.textMut }]}>
            {tradeLogs.length > 0
              ? `Most recent trade: ${tradeLogs[0].instrument} (${tradeLogs[0].pips} pips).`
              : 'Log your first trade in Terminal to unlock milestones.'}
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
  eyebrow: { fontFamily: F.mono, fontSize: 10, letterSpacing: 2, textTransform: 'uppercase' },
  title: { fontFamily: F.bold, fontSize: 34, letterSpacing: -1 },
  grid: { flexDirection: 'row', gap: 10, marginHorizontal: 20, marginTop: 18 },
  metric: { flex: 1, borderWidth: 1, borderRadius: 12, padding: 14, gap: 3 },
  metricLabel: { fontFamily: F.mono, fontSize: 9, letterSpacing: 1.2, textTransform: 'uppercase' },
  metricVal: { fontFamily: F.bold, fontSize: 24, letterSpacing: -0.6 },
  card: { marginHorizontal: 20, marginTop: 10, borderRadius: 12, borderWidth: 1, padding: 14, gap: 8 },
  cardTitle: { fontFamily: F.semiBold, fontSize: 14 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowLabel: { fontFamily: F.regular, fontSize: 13 },
  rowVal: { fontFamily: F.semiBold, fontSize: 14 },
  milestoneText: { fontFamily: F.regular, fontSize: 13, lineHeight: 18 },
});
