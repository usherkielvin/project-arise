import React, { useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useTheme } from '../../src/theme/ThemeContext';
import { F } from '../../src/theme/fonts';
import { protocolAccent } from '../../src/theme/colors';
import { useSystemStore } from '../../src/store/useSystemStore';

export default function TerminalScreen() {
  const { colors: C, isDark } = useTheme();
  const accent = protocolAccent('FINANCE', isDark, C.blue);
  const addTradeLog = useSystemStore((s) => s.addTradeLog);
  const tradeLogs = useSystemStore((s) => s.tradeLogs);
  const financeGold = useSystemStore((s) => s.financeGold);

  const [instrument, setInstrument] = useState('XAUUSD');
  const [entry, setEntry] = useState('');
  const [exit, setExit] = useState('');
  const [notes, setNotes] = useState('');

  const parsedEntry = Number(entry);
  const parsedExit = Number(exit);
  const canSubmit = Number.isFinite(parsedEntry) && Number.isFinite(parsedExit) && instrument.trim().length > 0;
  const previewPips = canSubmit ? Math.round((parsedExit - parsedEntry) * 100) : 0;

  const totalPips = useMemo(() => tradeLogs.reduce((sum, t) => sum + t.pips, 0), [tradeLogs]);

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: C.surface }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.eyebrow, { color: C.textMut }]}>Trade Journal</Text>
          <Text style={[styles.title, { color: C.text }]}>Terminal</Text>
        </View>

        <View style={[styles.formCard, { backgroundColor: C.void, borderColor: C.border }]}>
          <Text style={[styles.sectionLabel, { color: C.text }]}>New Entry</Text>
          <TextInput value={instrument} onChangeText={setInstrument} style={[styles.input, { borderColor: C.border, color: C.text }]} placeholder="Instrument" placeholderTextColor={C.textMut} />
          <View style={styles.row}>
            <TextInput value={entry} onChangeText={setEntry} keyboardType="decimal-pad" style={[styles.input, styles.half, { borderColor: C.border, color: C.text }]} placeholder="Entry" placeholderTextColor={C.textMut} />
            <TextInput value={exit} onChangeText={setExit} keyboardType="decimal-pad" style={[styles.input, styles.half, { borderColor: C.border, color: C.text }]} placeholder="Exit" placeholderTextColor={C.textMut} />
          </View>
          <TextInput value={notes} onChangeText={setNotes} multiline style={[styles.input, styles.notes, { borderColor: C.border, color: C.text }]} placeholder="Setup notes" placeholderTextColor={C.textMut} />
          <Text style={[styles.preview, { color: previewPips >= 0 ? accent : C.penalty }]}>Preview: {previewPips} pips</Text>
          <Pressable
            disabled={!canSubmit}
            style={[styles.submitBtn, { backgroundColor: canSubmit ? accent : C.surface2 }]}
            onPress={() => {
              if (!canSubmit) return;
              addTradeLog({
                instrument: instrument.trim(),
                entryPrice: parsedEntry,
                exitPrice: parsedExit,
                notes: notes.trim(),
              });
              setEntry('');
              setExit('');
              setNotes('');
            }}
          >
            <Text style={[styles.submitText, { color: C.void }]}>Log Trade</Text>
          </Pressable>
        </View>

        <View style={styles.metricsRow}>
          <View style={[styles.metricCard, { backgroundColor: C.void, borderColor: C.border }]}>
            <Text style={[styles.metricLabel, { color: C.textMut }]}>Gold</Text>
            <Text style={[styles.metricVal, { color: C.text }]}>{financeGold}</Text>
          </View>
          <View style={[styles.metricCard, { backgroundColor: C.void, borderColor: C.border }]}>
            <Text style={[styles.metricLabel, { color: C.textMut }]}>Total Pips</Text>
            <Text style={[styles.metricVal, { color: C.text }]}>{totalPips}</Text>
          </View>
        </View>

        <View style={[styles.logCard, { backgroundColor: C.void, borderColor: C.border }]}>
          <Text style={[styles.sectionLabel, { color: C.text }]}>Recent Logs</Text>
          {tradeLogs.length === 0 ? (
            <Text style={[styles.empty, { color: C.textMut }]}>No trades logged yet.</Text>
          ) : (
            tradeLogs.slice(0, 8).map((log) => (
              <View key={log.id} style={[styles.logRow, { borderTopColor: C.border }]}>
                <Text style={[styles.logMain, { color: C.text }]}>{log.instrument} · {log.pips} pips</Text>
                <Text style={[styles.logSub, { color: C.textMut }]}>{log.entryPrice} → {log.exitPrice}</Text>
              </View>
            ))
          )}
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
  formCard: { marginHorizontal: 20, marginTop: 18, borderRadius: 14, borderWidth: 1, padding: 14, gap: 8 },
  sectionLabel: { fontFamily: F.semiBold, fontSize: 14 },
  row: { flexDirection: 'row', gap: 8 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontFamily: F.regular, fontSize: 13 },
  half: { flex: 1 },
  notes: { minHeight: 74, textAlignVertical: 'top' },
  preview: { fontFamily: F.medium, fontSize: 12, marginTop: 2 },
  submitBtn: { borderRadius: 10, paddingVertical: 11, alignItems: 'center', marginTop: 2 },
  submitText: { fontFamily: F.semiBold, fontSize: 13 },
  metricsRow: { flexDirection: 'row', gap: 10, marginHorizontal: 20, marginTop: 10 },
  metricCard: { flex: 1, borderWidth: 1, borderRadius: 12, padding: 12, gap: 2 },
  metricLabel: { fontFamily: F.mono, fontSize: 9, letterSpacing: 1.2, textTransform: 'uppercase' },
  metricVal: { fontFamily: F.bold, fontSize: 20, letterSpacing: -0.4 },
  logCard: { marginHorizontal: 20, marginTop: 10, borderWidth: 1, borderRadius: 12, padding: 12, gap: 2 },
  empty: { fontFamily: F.regular, fontSize: 13, marginTop: 6 },
  logRow: { borderTopWidth: 1, paddingTop: 10, marginTop: 8 },
  logMain: { fontFamily: F.medium, fontSize: 13 },
  logSub: { fontFamily: F.regular, fontSize: 12, marginTop: 2 },
});
