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
  const updateTradeLog = useSystemStore((s) => s.updateTradeLog);
  const deleteTradeLog = useSystemStore((s) => s.deleteTradeLog);
  const tradeLogs = useSystemStore((s) => s.tradeLogs);
  const financeGold = useSystemStore((s) => s.financeGold);

  const [editingId, setEditingId] = useState<number | null>(null);

  const [instrument, setInstrument] = useState('XAUUSD');
  const [direction, setDirection] = useState<'LONG' | 'SHORT'>('LONG');
  const [setup, setSetup] = useState('');
  const [entry, setEntry] = useState('');
  const [exit, setExit] = useState('');
  const [notes, setNotes] = useState('');

  const parsedEntry = Number(entry);
  const parsedExit = Number(exit);
  const canSubmit = Number.isFinite(parsedEntry) && Number.isFinite(parsedExit) && instrument.trim().length > 0;
  
  const previewPips = canSubmit 
    ? direction === 'LONG' 
      ? Math.round((parsedExit - parsedEntry) * 100)
      : Math.round((parsedEntry - parsedExit) * 100)
    : 0;

  const totalPips = useMemo(() => tradeLogs.reduce((sum, t) => sum + t.pips, 0), [tradeLogs]);

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: C.surface }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.eyebrow, { color: C.textMut }]}>Trade Journal</Text>
          <Text style={[styles.title, { color: C.text }]}>Terminal</Text>
        </View>

        <View style={[styles.formCard, { backgroundColor: C.void, borderColor: C.border }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={[styles.sectionLabel, { color: C.text }]}>{editingId ? 'Edit Entry' : 'New Entry'}</Text>
            {editingId && (
              <Pressable onPress={() => {
                setEditingId(null);
                setInstrument('XAUUSD');
                setDirection('LONG');
                setSetup('');
                setEntry('');
                setExit('');
                setNotes('');
              }}>
                <Text style={{ color: C.textMut, fontFamily: F.medium, fontSize: 12 }}>Cancel</Text>
              </Pressable>
            )}
          </View>
          <TextInput value={instrument} onChangeText={setInstrument} style={[styles.input, { borderColor: C.border, color: C.text }]} placeholder="Instrument" placeholderTextColor={C.textMut} />
          <View style={styles.directionRow}>
            <Pressable 
              style={[styles.directionBtn, direction === 'LONG' ? { backgroundColor: C.success, borderColor: C.success } : { borderColor: C.border }]}
              onPress={() => setDirection('LONG')}
            >
              <Text style={[styles.directionText, direction === 'LONG' ? { color: C.void } : { color: C.textMut }]}>LONG</Text>
            </Pressable>
            <Pressable 
              style={[styles.directionBtn, direction === 'SHORT' ? { backgroundColor: C.penalty, borderColor: C.penalty } : { borderColor: C.border }]}
              onPress={() => setDirection('SHORT')}
            >
              <Text style={[styles.directionText, direction === 'SHORT' ? { color: C.void } : { color: C.textMut }]}>SHORT</Text>
            </Pressable>
          </View>
          <TextInput value={setup} onChangeText={setSetup} style={[styles.input, { borderColor: C.border, color: C.text }]} placeholder="Setup / Confluence (e.g. FVG, OB)" placeholderTextColor={C.textMut} />
          <View style={styles.row}>
            <TextInput value={entry} onChangeText={setEntry} keyboardType="decimal-pad" style={[styles.input, styles.half, { borderColor: C.border, color: C.text }]} placeholder="Entry" placeholderTextColor={C.textMut} />
            <TextInput value={exit} onChangeText={setExit} keyboardType="decimal-pad" style={[styles.input, styles.half, { borderColor: C.border, color: C.text }]} placeholder="Exit" placeholderTextColor={C.textMut} />
          </View>
          <TextInput value={notes} onChangeText={setNotes} multiline style={[styles.input, styles.notes, { borderColor: C.border, color: C.text }]} placeholder="Trade notes" placeholderTextColor={C.textMut} />
          <Text style={[styles.preview, { color: previewPips >= 0 ? accent : C.penalty }]}>Preview: {previewPips} pips</Text>
          <Pressable
            disabled={!canSubmit}
            style={[styles.submitBtn, { backgroundColor: canSubmit ? accent : C.surface2 }]}
            onPress={() => {
              if (!canSubmit) return;
              const payload = {
                instrument: instrument.trim(),
                direction,
                setup: setup.trim(),
                entryPrice: parsedEntry,
                exitPrice: parsedExit,
                notes: notes.trim(),
              };
              if (editingId) {
                updateTradeLog(editingId, payload);
                setEditingId(null);
              } else {
                addTradeLog(payload);
              }
              setEntry('');
              setExit('');
              setNotes('');
              setSetup('');
              setDirection('LONG');
              setInstrument('XAUUSD');
            }}
          >
            <Text style={[styles.submitText, { color: C.void }]}>{editingId ? 'Save Changes' : 'Log Trade'}</Text>
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
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={[styles.logMain, { color: C.text }]}>{log.instrument} · <Text style={{ color: log.direction === 'SHORT' ? C.penalty : C.success }}>{log.direction || 'LONG'}</Text></Text>
                  <Text style={[styles.logMain, { color: log.pips >= 0 ? accent : C.penalty }]}>{log.pips > 0 ? '+' : ''}{log.pips} pips</Text>
                </View>
                <Text style={[styles.logSub, { color: C.textMut }]}>{log.entryPrice} → {log.exitPrice} {log.setup ? `· ${log.setup}` : ''}</Text>
                <View style={styles.actionRow}>
                  <Pressable onPress={() => {
                    setEditingId(log.id);
                    setInstrument(log.instrument);
                    setDirection(log.direction || 'LONG');
                    setSetup(log.setup || '');
                    setEntry(String(log.entryPrice));
                    setExit(String(log.exitPrice));
                    setNotes(log.notes);
                  }}>
                    <Text style={{ color: C.blue, fontFamily: F.medium, fontSize: 12 }}>Edit</Text>
                  </Pressable>
                  <Pressable onPress={() => {
                    deleteTradeLog(log.id);
                    if (editingId === log.id) {
                      setEditingId(null);
                      setEntry(''); setExit(''); setNotes(''); setSetup(''); setDirection('LONG'); setInstrument('XAUUSD');
                    }
                  }}>
                    <Text style={{ color: C.penalty, fontFamily: F.medium, fontSize: 12 }}>Delete</Text>
                  </Pressable>
                </View>
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
  directionRow: { flexDirection: 'row', gap: 8 },
  directionBtn: { flex: 1, borderWidth: 1, borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  directionText: { fontFamily: F.semiBold, fontSize: 13 },
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
  actionRow: { flexDirection: 'row', gap: 12, marginTop: 6 },
});
