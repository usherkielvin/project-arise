import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../src/theme/ThemeContext';
import { F } from '../../src/theme/fonts';
import { protocolAccent } from '../../src/theme/colors';
import { useSystemStore } from '../../src/store/useSystemStore';

const EVENTS = [
  { id: 'nfp', title: 'NFP Release', date: 'Fri 20:30' },
  { id: 'cpi', title: 'US CPI', date: 'Tue 20:30' },
  { id: 'retail', title: 'Retail Sales', date: 'Thu 20:30' },
  { id: 'fomc', title: 'FOMC Statement', date: 'Wed 02:00' },
];

export default function NewsScreen() {
  const { colors: C, isDark } = useTheme();
  const accent = protocolAccent('FINANCE', isDark, C.blue);
  const preparedNewsEvents = useSystemStore((s) => s.preparedNewsEvents);
  const togglePreparedNewsEvent = useSystemStore((s) => s.togglePreparedNewsEvent);

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: C.surface }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.eyebrow, { color: C.textMut }]}>Economic Calendar</Text>
          <Text style={[styles.title, { color: C.text }]}>News</Text>
          <Text style={[styles.sub, { color: C.textMut }]}>Mark prepared events to gain +50 PER XP.</Text>
        </View>

        <View style={[styles.card, { backgroundColor: C.void, borderColor: C.border }]}>
          {EVENTS.map((event, i) => {
            const prepared = preparedNewsEvents.find((e) => e.id === event.id)?.prepared ?? false;
            return (
              <View key={event.id} style={[styles.row, i > 0 && { borderTopWidth: 1, borderTopColor: C.border }]}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.rowTitle, { color: C.text }]}>{event.title}</Text>
                  <Text style={[styles.rowSub, { color: C.textMut }]}>{event.date}</Text>
                </View>
                <Pressable
                  style={[styles.btn, { backgroundColor: prepared ? C.surface2 : accent }]}
                  onPress={() => togglePreparedNewsEvent({ id: event.id, title: event.title, date: event.date })}
                >
                  <Text style={[styles.btnText, { color: prepared ? C.textMut : C.void }]}>
                    {prepared ? 'Prepared' : 'Mark Prepared'}
                  </Text>
                </Pressable>
              </View>
            );
          })}
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
  sub: { fontFamily: F.regular, fontSize: 13 },
  card: { marginHorizontal: 20, marginTop: 18, borderRadius: 14, borderWidth: 1, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 12 },
  rowTitle: { fontFamily: F.medium, fontSize: 14 },
  rowSub: { fontFamily: F.regular, fontSize: 12, marginTop: 2 },
  btn: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8 },
  btnText: { fontFamily: F.semiBold, fontSize: 11 },
});
