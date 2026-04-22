/**
 * StatGrid — Themed 2×2 attribute quadrant.
 */
import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle,
  withDelay, withTiming, Easing,
} from 'react-native-reanimated';
import { useTheme } from '../theme/ThemeContext';
import { F } from '../theme/fonts';

const STATS_BASE = [
  { key: 'INT', label: 'INT', value: 14, max: 25, sub: 'Development'  },
  { key: 'PER', label: 'PER', value: 12, max: 25, sub: 'Market Sense' },
  { key: 'STR', label: 'STR', value: 10, max: 25, sub: 'Consistency'  },
  { key: 'VIT', label: 'VIT', value: 8,  max: 25, sub: 'Health'       },
];

function StatTile({ statKey, label, value, max, sub, color, delay, isRight }:
  { statKey: string; label: string; value: number; max: number; sub: string;
    color: string; delay: number; isRight?: boolean }) {
  const { colors: C } = useTheme();
  const barW = useSharedValue(0);
  const pct  = (value / max) * 100;

  useEffect(() => {
    barW.value = withDelay(delay, withTiming(pct, { duration: 900, easing: Easing.out(Easing.cubic) }));
  }, []);

  const barStyle = useAnimatedStyle(() => ({ width: `${barW.value}%` }));

  return (
    <View style={[styles.tile, { borderRightColor: C.border }, isRight && styles.tileRight]}>
      <View style={[styles.statIcon, { backgroundColor: color + '16' }]}>
        <View style={[styles.statDot, { backgroundColor: color }]} />
      </View>
      <View style={styles.tileTop}>
        <Text style={[styles.tileKey, { color }]}>{label}</Text>
        <Text style={[styles.tileValue, { color: C.text }]}>{value}</Text>
        <Text style={[styles.tileMax, { color: C.textMut }]}>/{max}</Text>
      </View>
      <Text style={[styles.tileSub, { color: C.textMut }]}>{sub}</Text>
      <View style={[styles.microTrack, { backgroundColor: C.surface2 }]}>
        <Animated.View style={[styles.microFill, { backgroundColor: color }, barStyle]} />
      </View>
    </View>
  );
}

export function StatGrid() {
  const { colors: C } = useTheme();

  const statColors = [C.statInt, C.statPer, C.statStr, C.statVit];

  return (
    <View style={[styles.wrapper, { backgroundColor: C.surface, borderColor: C.border }]}>
      <View style={styles.row}>
        <StatTile {...STATS_BASE[0]} color={statColors[0]} delay={0}   />
        <StatTile {...STATS_BASE[1]} color={statColors[1]} delay={80}  isRight />
      </View>
      <View style={[styles.hDivider, { backgroundColor: C.border }]} />
      <View style={styles.row}>
        <StatTile {...STATS_BASE[2]} color={statColors[2]} delay={160} />
        <StatTile {...STATS_BASE[3]} color={statColors[3]} delay={240} isRight />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  row: { flexDirection: 'row' },
  tile: {
    flex: 1,
    paddingHorizontal: 18,
    paddingVertical: 16,
    gap: 4,
    borderRightWidth: 1,
  },
  tileRight: { borderRightWidth: 0 },
  statIcon: {
    width: 28, height: 28, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center', marginBottom: 6,
  },
  statDot: { width: 8, height: 8, borderRadius: 4 },
  tileTop: { flexDirection: 'row', alignItems: 'baseline', gap: 3 },
  tileKey: { fontFamily: F.monoBold, fontSize: 9, letterSpacing: 1.5 },
  tileValue: { fontFamily: F.bold, fontSize: 26, letterSpacing: -1, lineHeight: 30 },
  tileMax: { fontFamily: F.regular, fontSize: 11, marginBottom: 1 },
  tileSub: { fontFamily: F.regular, fontSize: 11 },
  microTrack: { height: 3, borderRadius: 2, marginTop: 8, overflow: 'hidden' },
  microFill: { height: '100%', borderRadius: 2 },
  hDivider: { height: 1 },
});
