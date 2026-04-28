import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../src/theme/ThemeContext';
import { F } from '../../src/theme/fonts';
import { protocolAccent } from '../../src/theme/colors';
import { useSystemStore } from '../../src/store/useSystemStore';
import { getLevelProgress } from '../../src/utils/progression';
import { ScreenHeader } from '../../src/components/ui/ScreenHeader';
import { SectionCard } from '../../src/components/ui/SectionCard';
import { MetricTile } from '../../src/components/ui/MetricTile';

export default function PulseScreen() {
  const { colors: C, isDark } = useTheme();
  const accent = protocolAccent('FINANCE', isDark, C.blue);
  const store = useSystemStore();

  const { progressPercent } = getLevelProgress(store.totalXP, store.level);
  const perGrowth = Math.floor((store.statPoints.PER ?? 0) / 50);

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: C.surface }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <ScreenHeader
          title="Pulse"
          subtitle="XAUUSD readiness and perception growth."
          titleColor={C.text}
          subtitleColor={C.textMut}
        />

        <SectionCard backgroundColor={C.void} borderColor={C.border} style={styles.card}>
          <Text style={[styles.cardLabel, { color: C.textMut }]}>Perception Growth</Text>
          <Text style={[styles.cardValue, { color: C.text }]}>{store.statPoints.PER} PER</Text>
          <Text style={[styles.cardSub, { color: C.textMut }]}>Ranked bonus: +{perGrowth}</Text>
          <View style={[styles.progressBg, { backgroundColor: C.surface2 }]}>
            <View style={[styles.progressFill, { width: `${progressPercent}%`, backgroundColor: accent }]} />
          </View>
        </SectionCard>

        <View style={styles.grid}>
          <MetricTile
            label="Bias"
            value="Neutral"
            labelColor={C.textMut}
            valueColor={C.text}
            backgroundColor={C.void}
            borderColor={C.border}
          />
          <MetricTile
            label="Volatility"
            value="Moderate"
            labelColor={C.textMut}
            valueColor={C.text}
            backgroundColor={C.void}
            borderColor={C.border}
          />
        </View>

        <SectionCard backgroundColor={C.void} borderColor={C.border}>
          <Text style={[styles.noteTitle, { color: C.text }]}>Session Protocol</Text>
          <Text style={[styles.noteText, { color: C.textMut }]}>
            Check News tab before entering. Log every setup in Terminal to convert execution quality into PER XP and Gold.
          </Text>
        </SectionCard>

        <View style={{ height: 120 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  card: { marginTop: 22, borderRadius: 14, padding: 16, gap: 6 },
  cardLabel: { fontFamily: F.mono, fontSize: 9, letterSpacing: 1.4, textTransform: 'uppercase' },
  cardValue: { fontFamily: F.bold, fontSize: 28, letterSpacing: -0.8 },
  cardSub: { fontFamily: F.regular, fontSize: 12 },
  progressBg: { height: 4, borderRadius: 2, marginTop: 6, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 2 },
  grid: { flexDirection: 'row', gap: 10, marginHorizontal: 20, marginTop: 12 },
  noteTitle: { fontFamily: F.semiBold, fontSize: 14 },
  noteText: { fontFamily: F.regular, fontSize: 13, lineHeight: 18 },
});
