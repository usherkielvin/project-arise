import React, { useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import { useTheme } from '../../src/theme/ThemeContext';
import { F } from '../../src/theme/fonts';
import { useSystemStore } from '../../src/store/useSystemStore';

export default function VaultScreen() {
  const { colors: C } = useTheme();
  const tradeLogs = useSystemStore((s) => s.tradeLogs);

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

  const currentMonthLogs = useMemo(() => {
    return tradeLogs.filter(log => {
      const d = new Date(log.timestamp);
      return d.getFullYear() === currentDate.getFullYear() && d.getMonth() === currentDate.getMonth();
    });
  }, [tradeLogs, currentDate]);

  const monthStats = useMemo(() => {
    let pnl = 0;
    let wins = 0;
    let losses = 0;
    const daysMap: Record<string, number> = {};

    currentMonthLogs.forEach(log => {
      pnl += log.pips;
      if (log.pips > 0) wins++;
      else losses++;
      
      const dateStr = log.timestamp.split('T')[0];
      if (!daysMap[dateStr]) daysMap[dateStr] = 0;
      daysMap[dateStr] += log.pips;
    });

    const totalTrades = wins + losses;
    const winRate = totalTrades > 0 ? Math.round((wins / totalTrades) * 100) : 0;
    const tradingDays = Object.keys(daysMap).length;
    
    let bestDayPips = -Infinity;
    let bestDay = '—';
    if (tradingDays > 0) {
      Object.entries(daysMap).forEach(([date, pips]) => {
        if (pips > bestDayPips) {
          bestDayPips = pips;
        }
      });
      if (bestDayPips !== -Infinity) {
        bestDay = bestDayPips > 0 ? `+$${bestDayPips}` : `-$${Math.abs(bestDayPips)}`;
      }
    }

    return { pnl, winRate, bestDay, totalTrades, tradingDays };
  }, [currentMonthLogs]);

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
  const monthlyGoal = 500;
  const progressPercent = Math.min(100, Math.max(0, (monthStats.pnl / monthlyGoal) * 100));

  const today = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: C.surface }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: C.text }]}>Vault</Text>
          <Text style={[styles.sub, { color: C.textMut }]}>Monthly calendar and trading performance.</Text>
        </View>

        <View style={styles.calendarHeaderRow}>
          <Pressable onPress={() => setCurrentDate(new Date(currentYear, currentMonth - 1, 1))} style={styles.navBtn}>
            <Text style={{color: C.text, fontFamily: F.bold, fontSize: 18}}>{'<'}</Text>
          </Pressable>
          <Text style={[styles.cardTitle, { color: C.text }]}>{monthName}</Text>
          <Pressable onPress={() => setCurrentDate(new Date(currentYear, currentMonth + 1, 1))} style={styles.navBtn}>
            <Text style={{color: C.text, fontFamily: F.bold, fontSize: 18}}>{'>'}</Text>
          </Pressable>
        </View>

        <View style={styles.goalContainer}>
          <Text style={[styles.goalTitle, { color: C.text }]}>◎ Monthly goal</Text>
          <View style={[styles.progressBarBg, { backgroundColor: C.surface2 }]}>
             <View style={[styles.progressBarFill, { backgroundColor: C.success, width: `${progressPercent}%` }]} />
          </View>
          <View style={styles.goalLabels}>
             <Text style={[styles.goalCurrent, { color: C.success }]}>{monthStats.pnl > 0 ? '+' : monthStats.pnl < 0 ? '-' : ''}${Math.abs(monthStats.pnl)}</Text>
             <Text style={[styles.goalTarget, { color: C.textMut }]}>of ${monthlyGoal}</Text>
          </View>
        </View>
        
        <View style={styles.calendarGrid}>
          {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((day, i) => (
            <Text key={`h-${i}`} style={[styles.calDayHeader, { color: C.textMut }]}>{day}</Text>
          ))}
          {calendarDays.map((item, i) => {
            if (!item) return <View key={`e-${i}`} style={styles.calCell} />;
            const dayStats = logsByDate[item.dateStr];
            const isToday = currentYear === today.getFullYear() && currentMonth === today.getMonth() && item.day === today.getDate();
            
            return (
              <View key={`d-${i}`} style={[styles.calCell, isToday && { borderColor: C.borderMid, borderWidth: 1 }]}>
                <Text style={[styles.calDayText, { color: isToday ? C.text : C.textSub }]}>{item.day}</Text>
                {dayStats ? (
                  <Text style={[styles.dollarText, { color: dayStats.pips >= 0 ? C.success : C.penalty }]}>
                    {dayStats.pips > 0 ? '+' : dayStats.pips < 0 ? '-' : ''}${Math.abs(dayStats.pips)}
                  </Text>
                ) : (
                  <View style={styles.emptyDollarSpacer} />
                )}
              </View>
            );
          })}
        </View>

        <View style={styles.monthSection}>
          <Text style={[styles.sectionTitle, { color: C.textMut }]}>YOUR MONTH</Text>
          <View style={styles.monthStatsGrid}>
            <View style={[styles.statBox, { backgroundColor: C.void }]}>
              <Text style={[styles.statBoxValue, { color: monthStats.pnl >= 0 ? C.success : C.penalty }]}>
                {monthStats.pnl > 0 ? '+' : monthStats.pnl < 0 ? '-' : ''}${Math.abs(monthStats.pnl)}
              </Text>
              <Text style={[styles.statBoxLabel, { color: C.textMut }]}>P&L</Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: C.void }]}>
              <Text style={[styles.statBoxValue, { color: C.text }]}>{monthStats.winRate}%</Text>
              <Text style={[styles.statBoxLabel, { color: C.textMut }]}>Win rate</Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: C.void }]}>
              <Text style={[styles.statBoxValue, { color: C.text }]}>{monthStats.bestDay}</Text>
              <Text style={[styles.statBoxLabel, { color: C.textMut }]}>Best day</Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: C.void }]}>
              <Text style={[styles.statBoxValue, { color: C.text }]}>{monthStats.totalTrades}</Text>
              <Text style={[styles.statBoxLabel, { color: C.textMut }]}>Trades</Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: C.void }]}>
              <Text style={[styles.statBoxValue, { color: C.text }]}>{monthStats.tradingDays}</Text>
              <Text style={[styles.statBoxLabel, { color: C.textMut }]}>Trading days</Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: C.void }]}>
              <Text style={[styles.statBoxValue, { color: C.text }]}>{monthStats.totalTrades}</Text>
              <Text style={[styles.statBoxLabel, { color: C.textMut }]}>Journaled</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 8, gap: 4 },
  title: { fontFamily: F.bold, fontSize: 34, letterSpacing: -1 },
  sub: { fontFamily: F.regular, fontSize: 13 },
  
  calendarHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: 20, marginBottom: 20 },
  cardTitle: { fontFamily: F.semiBold, fontSize: 16 },
  navBtn: { paddingHorizontal: 12, paddingVertical: 4 },

  goalContainer: { marginHorizontal: 20, marginBottom: 24 },
  goalTitle: { fontFamily: F.medium, fontSize: 14, marginBottom: 12 },
  progressBarBg: { height: 6, borderRadius: 3, width: '100%', overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 3 },
  goalLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  goalCurrent: { fontFamily: F.bold, fontSize: 14 },
  goalTarget: { fontFamily: F.regular, fontSize: 12 },

  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: 16, marginBottom: 32 },
  calDayHeader: { width: '14.28%', textAlign: 'center', fontFamily: F.semiBold, fontSize: 11, marginBottom: 16 },
  calCell: { width: '14.28%', aspectRatio: 0.85, justifyContent: 'center', alignItems: 'center', borderRadius: 8 },
  calDayText: { fontFamily: F.medium, fontSize: 15 },
  dollarText: { fontFamily: F.bold, fontSize: 10, marginTop: 4 },
  emptyDollarSpacer: { height: 14, marginTop: 4 },

  monthSection: { marginHorizontal: 20 },
  sectionTitle: { fontFamily: F.semiBold, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 },
  monthStatsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statBox: { width: '31%', aspectRatio: 1.4, borderRadius: 12, padding: 12, justifyContent: 'center', alignItems: 'center' },
  statBoxValue: { fontFamily: F.bold, fontSize: 18, marginBottom: 4 },
  statBoxLabel: { fontFamily: F.medium, fontSize: 11 },
});
