/**
 * QuestCard — Clean quest row with subtle surface background.
 */
import React, { useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle,
  withTiming, withSpring, withSequence,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { C, RANK_COLOR } from '../theme/colors';
import { F } from '../theme/fonts';

type QuestRank = 'E' | 'D' | 'C' | 'B' | 'A' | 'S';

interface QuestProps {
  title: string;
  description?: string;
  category: string;
  xp: number;
  stat?: string;
  rank?: QuestRank;
  isCompleted: boolean;
  onPress: () => void;
}

export function QuestCard({ title, description, category, xp, stat = 'INT', rank = 'E', isCompleted, onPress }: QuestProps) {
  const rankColor = RANK_COLOR[rank] ?? C.rankE;
  const leftBarW = useSharedValue(0);
  const rowOpacity = useSharedValue(1);
  const rowScale = useSharedValue(1);

  useEffect(() => {
    if (isCompleted) {
      leftBarW.value = withTiming(3, { duration: 350 });
      rowOpacity.value = withTiming(0.48, { duration: 400 });
    }
  }, [isCompleted]);

  const handlePress = () => {
    if (isCompleted) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    rowScale.value = withSequence(
      withSpring(0.985, { damping: 14 }),
      withSpring(1.0,   { damping: 16 })
    );
    onPress();
  };

  const rowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: rowScale.value }],
    opacity: rowOpacity.value,
  }));

  const barStyle = useAnimatedStyle(() => ({
    width: leftBarW.value,
  }));

  return (
    <Pressable onPress={handlePress} style={styles.pressable}>
      <Animated.View style={[styles.row, rowStyle]}>
        {/* Left accent bar */}
        <Animated.View style={[styles.leftBar, barStyle, { backgroundColor: C.blue }]} />

        {/* Content */}
        <View style={styles.content}>
          {/* Top meta */}
          <View style={styles.metaRow}>
            <View style={[styles.rankDot, { backgroundColor: rankColor }]} />
            <Text style={[styles.rankLabel, { color: rankColor }]}>{rank}</Text>
            <Text style={styles.metaSep}>·</Text>
            <Text style={styles.category}>{category.toUpperCase()}</Text>
            <View style={{ flex: 1 }} />
            <View style={[styles.statChip, isCompleted && styles.statChipDone]}>
              <Text style={[styles.statText, isCompleted && { color: C.blue }]}>{stat}</Text>
            </View>
          </View>

          {/* Title */}
          <Text style={[styles.title, isCompleted && styles.titleDone]} numberOfLines={2}>
            {title}
          </Text>

          {/* Description */}
          {description && !isCompleted && (
            <Text style={styles.desc} numberOfLines={1}>{description}</Text>
          )}

          {/* Bottom */}
          <View style={styles.bottomRow}>
            <Text style={styles.xp}>+{xp} XP</Text>
            {isCompleted && (
              <Text style={styles.lockedIn}>⟳  LOCKED IN</Text>
            )}
          </View>
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    borderRadius: 12,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    overflow: 'hidden',
  },
  leftBar: {
    width: 0,
    backgroundColor: C.blue,
  },
  content: {
    flex: 1,
    padding: 14,
    gap: 7,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rankDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  rankLabel: {
    fontFamily: F.monoBold,
    fontSize: 9,
    letterSpacing: 1,
  },
  metaSep: {
    color: C.textFnt,
    fontSize: 10,
  },
  category: {
    fontFamily: F.mono,
    fontSize: 9,
    color: C.textMut,
    letterSpacing: 1.5,
  },
  statChip: {
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 4,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  statChipDone: {
    borderColor: C.blueBorder,
    backgroundColor: C.blueDim,
  },
  statText: {
    fontFamily: F.mono,
    fontSize: 8,
    color: C.textMut,
    letterSpacing: 1,
  },
  title: {
    fontFamily: F.semiBold,
    fontSize: 15,
    color: C.text,
    lineHeight: 21,
    letterSpacing: -0.2,
  },
  titleDone: {
    color: C.textMut,
  },
  desc: {
    fontFamily: F.regular,
    fontSize: 12,
    color: C.textMut,
    lineHeight: 17,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  xp: {
    fontFamily: F.monoBold,
    fontSize: 11,
    color: C.gold,
    letterSpacing: 1,
  },
  lockedIn: {
    fontFamily: F.mono,
    fontSize: 9,
    color: C.blue,
    letterSpacing: 1.5,
  },
});
