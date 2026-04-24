import React, { useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
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

  const logsByDate = useMemo(() => {
    const map: Record<string, { wins: number; losses: number; pips: number }> = {};
    tradeLogs.forEach(log => {
      const d = log.timestamp.split('T')[0];
      if (!map[d]) map[d] = { wins: 0, losses: 0, pips: 0 };
      if (log.pips > 0) map[d].wins++;
      else map[d].losses++;
      map[d].pips += log.pips;
    });
    return map;
  }, [tradeLogs]);

  const [currentDate, setCurrentDate] = useState(new Date());

  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days: ({ day: number; dateStr: string } | null)[] = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(year, month, i);
      const dateStr = [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join('-');
      days.push({ day: i, dateStr });
    }
    return days;
  }, [currentDate]);

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

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

        <View style={[styles.card, { backgroundColor: C.void, borderColor: C.border }]}>
          <View style={styles.calendarHeaderRow}>
            <Text style={[styles.cardTitle, { color: C.text }]}>{monthName}</Text>
            <View style={{flexDirection: 'row', gap: 16}}>
              <Pressable onPress={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}>
                <Text style={{color: C.textMut, fontFamily: F.bold, fontSize: 16}}>{'<'}</Text>
              </Pressable>
              <Pressable onPress={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}>
                <Text style={{color: C.textMut, fontFamily: F.bold, fontSize: 16}}>{'>'}</Text>
              </Pressable>
            </View>
          </View>
          
          <View style={styles.calendarGrid}>
            {['S','M','T','W','T','F','S'].map((day, i) => (
              <Text key={`h-${i}`} style={[styles.calDayHeader, { color: C.textMut }]}>{day}</Text>
            ))}
            {calendarDays.map((item, i) => {
              if (!item) return <View key={`e-${i}`} style={styles.calCell} />;
              const dayStats = logsByDate[item.dateStr];
              
              // We'll use a very light overlay of success/penalty if there is data
              let bgColor = 'transparent';
              if (dayStats) {
                bgColor = dayStats.pips >= 0 ? C.success + '22' : C.penalty + '22';
              }

              return (
                <View key={`d-${i}`} style={[styles.calCell, { backgroundColor: bgColor }]}>
                  <Text style={[styles.calDayText, { color: C.text }]}>{item.day}</Text>
                  {dayStats && (
                    <View style={[styles.dot, { backgroundColor: dayStats.pips >= 0 ? C.success : C.penalty }]} />
                  )}
                </View>
              );
            })}
          </View>
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
  calendarHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 4 },
  calDayHeader: { width: '14.28%', textAlign: 'center', fontFamily: F.semiBold, fontSize: 12, marginBottom: 8 },
  calCell: { width: '14.28%', aspectRatio: 1, justifyContent: 'center', alignItems: 'center', borderRadius: 8, marginBottom: 2 },
  calDayText: { fontFamily: F.medium, fontSize: 13 },
  dot: { width: 4, height: 4, borderRadius: 2, marginTop: 2, position: 'absolute', bottom: 4 },
});
