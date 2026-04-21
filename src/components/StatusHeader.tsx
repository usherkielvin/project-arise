/**
 * StatusHeader — Modern Slate-Dark Status Panel
 */
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { C, RANK_COLOR } from '../theme/colors';
import { F } from '../theme/fonts';

interface StatusHeaderProps {
  level: number;
  expProgress: number;
  totalXP: number;
  nextLevelXP: number;
}

function rankFromLevel(lvl: number) {
  if (lvl >= 101) return { rank: 'S', title: 'Shadow Monarch' };
  if (lvl >= 71)  return { rank: 'A', title: 'A-Rank Specialist' };
  if (lvl >= 46)  return { rank: 'B', title: 'B-Rank Developer' };
  if (lvl >= 26)  return { rank: 'C', title: 'C-Rank Apprentice' };
  if (lvl >= 11)  return { rank: 'D', title: 'D-Rank Hunter' };
  return           { rank: 'E', title: 'E-Rank Hunter' };
}

export function StatusHeader({ level, expProgress, totalXP, nextLevelXP }: StatusHeaderProps) {
  const { rank, title } = rankFromLevel(level);
  const barWidth = useSharedValue(0);
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
    barWidth.value = withTiming(expProgress, {
      duration: 1100,
      easing: Easing.out(Easing.cubic),
    });
  }, [expProgress]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${barWidth.value}%`,
  }));

  const rankColor = RANK_COLOR[rank] ?? C.rankE;

  return (
    <View style={styles.container}>

      {/* ── Top XP line ── */}
      <View style={styles.xpTrack}>
        <Animated.View style={[styles.xpFill, barStyle]} />
      </View>

      {/* ── Hero card ── */}
      <View style={styles.card}>

        {/* Status row */}
        <View style={styles.statusRow}>
          <View style={styles.activeDot} />
          <Text style={styles.statusText}>SYSTEM STATUS: ACTIVE</Text>
          <View style={{ flex: 1 }} />
          <View style={[styles.rankBadge, { borderColor: rankColor + '55' , backgroundColor: rankColor + '18' }]}>
            <Text style={[styles.rankBadgeText, { color: rankColor }]}>{rank}-RANK</Text>
          </View>
        </View>

        {/* Hero row */}
        <View style={styles.heroRow}>
          <View style={styles.avatarWrap}>
            <Text style={styles.avatarText}>U</Text>
          </View>

          <View style={styles.nameCol}>
            <Text style={styles.hunterName}>Usher</Text>
            <Text style={styles.hunterTitle}>{title}</Text>
          </View>

          <View style={styles.levelCol}>
            <Text style={styles.levelLabel}>LVL.</Text>
            <Text style={styles.levelNum}>{String(level).padStart(2, '0')}</Text>
          </View>
        </View>

        {/* XP row */}
        <View style={styles.xpSection}>
          <View style={styles.xpHeader}>
            <Text style={styles.xpLabel}>EXP</Text>
            <Text style={styles.xpValue}>{totalXP} / {nextLevelXP}</Text>
            <View style={{ flex:1 }} />
            <Text style={styles.xpPct}>{Math.round(expProgress)}%</Text>
          </View>
          <View style={styles.xpBar}>
            <Animated.View style={[styles.xpBarFill, barStyle]} />
          </View>
        </View>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: C.void,
  },
  xpTrack: {
    height: 2,
    backgroundColor: C.surface2,
  },
  xpFill: {
    height: '100%',
    backgroundColor: C.cyan,
    shadowColor: C.cyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 6,
  },
  card: {
    margin: 16,
    marginTop: 14,
    borderRadius: 16,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    padding: 18,
    gap: 16,
  },

  // Status row
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: C.cyan,
    shadowColor: C.cyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 5,
  },
  statusText: {
    fontFamily: F.mono,
    fontSize: 9,
    color: C.textMut,
    letterSpacing: 2,
  },
  rankBadge: {
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  rankBadgeText: {
    fontFamily: F.monoBold,
    fontSize: 9,
    letterSpacing: 1.5,
  },

  // Hero row
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatarWrap: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: C.blueDim,
    borderWidth: 1,
    borderColor: C.blueBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: F.monoBold,
    fontSize: 24,
    color: C.blue,
  },
  nameCol: {
    flex: 1,
    gap: 3,
  },
  hunterName: {
    fontFamily: F.bold,
    fontSize: 22,
    color: C.text,
    letterSpacing: -0.3,
  },
  hunterTitle: {
    fontFamily: F.mono,
    fontSize: 10,
    color: C.textMut,
    letterSpacing: 1.5,
  },
  levelCol: {
    alignItems: 'flex-end',
  },
  levelLabel: {
    fontFamily: F.mono,
    fontSize: 9,
    color: C.textMut,
    letterSpacing: 2,
  },
  levelNum: {
    fontFamily: F.monoBold,
    fontSize: 44,
    color: C.blue,
    lineHeight: 48,
    letterSpacing: -2,
    textShadowColor: C.blue,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },

  // XP section
  xpSection: {
    gap: 8,
  },
  xpHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  xpLabel: {
    fontFamily: F.monoBold,
    fontSize: 9,
    color: C.cyan,
    letterSpacing: 2,
  },
  xpValue: {
    fontFamily: F.mono,
    fontSize: 9,
    color: C.textMut,
    letterSpacing: 1,
  },
  xpPct: {
    fontFamily: F.monoBold,
    fontSize: 10,
    color: C.cyan,
    letterSpacing: 1,
  },
  xpBar: {
    height: 4,
    backgroundColor: C.surface2,
    borderRadius: 2,
    overflow: 'hidden',
  },
  xpBarFill: {
    height: '100%',
    backgroundColor: C.cyan,
    borderRadius: 2,
    shadowColor: C.cyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
  },
});
