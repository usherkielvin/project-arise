/**
 * StatGrid — 2×2 quadrant with slight surface background per tile.
 */
import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { C } from '../theme/colors';
import { F } from '../theme/fonts';

interface StatItem {
  key: string;
  label: string;
  value: number;
  max: number;
  color: string;
  sub: string;
}

const STATS: StatItem[] = [
  { key: 'INT', label: 'INT', value: 14, max: 25, color: C.statInt, sub: 'Development'  },
  { key: 'PER', label: 'PER', value: 12, max: 25, color: C.statPer, sub: 'Market Sense' },
  { key: 'STR', label: 'STR', value: 10, max: 25, color: C.statStr, sub: 'Consistency'  },
  { key: 'VIT', label: 'VIT', value: 8,  max: 25, color: C.statVit, sub: 'Health'        },
];

function StatTile({ stat, delay }: { stat: StatItem; delay: number }) {
  const barW = useSharedValue(0);
  const pct = (stat.value / stat.max) * 100;

  useEffect(() => {
    barW.value = withDelay(
      delay,
      withTiming(pct, { duration: 900, easing: Easing.out(Easing.cubic) })
    );
  }, []);

  const barStyle = useAnimatedStyle(() => ({ width: `${barW.value}%` }));

  return (
    <View style={styles.tile}>
      <View style={styles.tileTop}>
        <Text style={[styles.tileKey, { color: stat.color }]}>{stat.label}</Text>
        <Text style={styles.tileValue}>{stat.value}</Text>
        <Text style={styles.tileMax}>/{stat.max}</Text>
      </View>
      <Text style={styles.tileSub}>{stat.sub.toUpperCase()}</Text>
      <View style={styles.microTrack}>
        <Animated.View
          style={[styles.microFill, { backgroundColor: stat.color }, barStyle, {
            shadowColor: stat.color,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.7,
            shadowRadius: 3,
          }]}
        />
      </View>
    </View>
  );
}

export function StatGrid() {
  return (
    <View style={styles.wrapper}>
      <View style={styles.row}>
        <StatTile stat={STATS[0]} delay={0} />
        <View style={styles.vDivider} />
        <StatTile stat={STATS[1]} delay={80} />
      </View>
      <View style={styles.hDivider} />
      <View style={styles.row}>
        <StatTile stat={STATS[2]} delay={160} />
        <View style={styles.vDivider} />
        <StatTile stat={STATS[3]} delay={240} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 16,
    borderRadius: 16,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
  },
  tile: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 18,
    gap: 5,
  },
  tileTop: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  tileKey: {
    fontFamily: F.monoBold,
    fontSize: 9,
    letterSpacing: 2,
  },
  tileValue: {
    fontFamily: F.monoBold,
    fontSize: 30,
    color: C.text,
    letterSpacing: -1,
    lineHeight: 34,
  },
  tileMax: {
    fontFamily: F.mono,
    fontSize: 11,
    color: C.textMut,
    marginBottom: 2,
  },
  tileSub: {
    fontFamily: F.mono,
    fontSize: 8,
    color: C.textMut,
    letterSpacing: 2,
  },
  microTrack: {
    height: 2,
    backgroundColor: C.surface2,
    borderRadius: 1,
    marginTop: 6,
    overflow: 'hidden',
  },
  microFill: {
    height: '100%',
    borderRadius: 1,
  },
  hDivider: {
    height: 1,
    backgroundColor: C.border,
  },
  vDivider: {
    width: 1,
    backgroundColor: C.border,
  },
});
