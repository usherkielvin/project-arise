/**
 * StatusHeader — Themed status panel (light + dark).
 */
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, Easing,
} from 'react-native-reanimated';
import { useTheme } from '../theme/ThemeContext';
import { F } from '../theme/fonts';

const RANK_COLORS_LIGHT: Record<string, string> = {
  E:'#94A3B8', D:'#10B981', C:'#0891B2', B:'#4F46E5', A:'#7C3AED', S:'#D97706',
};
const RANK_COLORS_DARK: Record<string, string> = {
  E:'#64748B', D:'#34D399', C:'#22D3EE', B:'#818CF8', A:'#A78BFA', S:'#FBBF24',
};

function rankFromLevel(lvl: number) {
  if (lvl >= 101) return { rank: 'S', title: 'Shadow Monarch' };
  if (lvl >= 71)  return { rank: 'A', title: 'A-Rank Specialist' };
  if (lvl >= 46)  return { rank: 'B', title: 'B-Rank Developer' };
  if (lvl >= 26)  return { rank: 'C', title: 'C-Rank Apprentice' };
  if (lvl >= 11)  return { rank: 'D', title: 'D-Rank Hunter' };
  return           { rank: 'E', title: 'E-Rank Hunter' };
}

interface StatusHeaderProps {
  level: number;
  expProgress: number;
  totalXP: number;
  nextLevelXP: number;
}

export function StatusHeader({ level, expProgress, totalXP, nextLevelXP }: StatusHeaderProps) {
  const { colors: C, isDark } = useTheme();
  const { rank, title } = rankFromLevel(level);
  const barWidth = useSharedValue(0);

  useEffect(() => {
    barWidth.value = withTiming(expProgress, {
      duration: 1100,
      easing: Easing.out(Easing.cubic),
    });
  }, [expProgress]);

  const barStyle = useAnimatedStyle(() => ({ width: `${barWidth.value}%` }));
  const rankColor = (isDark ? RANK_COLORS_DARK : RANK_COLORS_LIGHT)[rank] ?? C.rankE;

  return (
    <View style={[styles.container, { backgroundColor: C.void, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 }]}>
      <View style={[styles.card, { backgroundColor: C.surface, borderColor: C.border }]}>

        <View style={styles.statusRow}>
          <View style={[styles.activeDot, { backgroundColor: C.success }]} />
          <Text style={[styles.statusText, { color: C.textMut }]}>Active · Today</Text>
          <View style={{ flex: 1 }} />
          <View style={[styles.rankBadge, { borderColor: rankColor + '40', backgroundColor: rankColor + '12' }]}>
            <Text style={[styles.rankBadgeText, { color: rankColor }]}>{rank}-Rank</Text>
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: C.border }]} />

        <View style={styles.heroRow}>
          <View style={[styles.avatarWrap, { backgroundColor: C.blueDim, borderColor: C.blueBorder }]}>
            <Text style={[styles.avatarText, { color: C.blue }]}>U</Text>
          </View>
          <View style={styles.nameCol}>
            <Text style={[styles.hunterName, { color: C.text }]}>Usher</Text>
            <Text style={[styles.hunterTitle, { color: C.textMut }]}>{title}</Text>
          </View>
          <View style={styles.levelCol}>
            <Text style={[styles.levelLabel, { color: C.textMut }]}>LVL</Text>
            <Text style={[styles.levelNum, { color: C.blue }]}>{String(level).padStart(2, '0')}</Text>
          </View>
        </View>

        <View style={styles.xpSection}>
          <View style={styles.xpHeader}>
            <Text style={[styles.xpLabel, { color: C.textMut }]}>EXP</Text>
            <Text style={[styles.xpValue, { color: C.textMut }]}>{totalXP} / {nextLevelXP}</Text>
            <View style={{ flex: 1 }} />
            <Text style={[styles.xpPct, { color: C.blue }]}>{Math.round(expProgress)}%</Text>
          </View>
          <View style={[styles.xpBar, { backgroundColor: C.surface2 }]}>
            <Animated.View style={[styles.xpBarFill, { backgroundColor: C.blue }, barStyle]} />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  activeDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontFamily: F.medium, fontSize: 11, letterSpacing: 0.2 },
  rankBadge: { borderWidth: 1, borderRadius: 5, paddingHorizontal: 9, paddingVertical: 3 },
  rankBadgeText: { fontFamily: F.monoBold, fontSize: 9, letterSpacing: 1.5 },
  divider: { height: 1 },
  heroRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatarWrap: {
    width: 48, height: 48, borderRadius: 12,
    borderWidth: 1, alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontFamily: F.bold, fontSize: 20 },
  nameCol: { flex: 1, gap: 2 },
  hunterName: { fontFamily: F.bold, fontSize: 20, letterSpacing: -0.3 },
  hunterTitle: { fontFamily: F.regular, fontSize: 11, letterSpacing: 0.2 },
  levelCol: { alignItems: 'flex-end' },
  levelLabel: { fontFamily: F.mono, fontSize: 8, letterSpacing: 2 },
  levelNum: { fontFamily: F.monoBold, fontSize: 38, lineHeight: 42, letterSpacing: -2 },
  xpSection: { gap: 7 },
  xpHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  xpLabel: { fontFamily: F.monoBold, fontSize: 9, letterSpacing: 2 },
  xpValue: { fontFamily: F.mono, fontSize: 9, letterSpacing: 0.5 },
  xpPct: { fontFamily: F.semiBold, fontSize: 11 },
  xpBar: { height: 5, borderRadius: 3, overflow: 'hidden' },
  xpBarFill: { height: '100%', borderRadius: 3 },
});
