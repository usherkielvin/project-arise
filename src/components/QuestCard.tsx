/**
 * QuestCard — Themed quest/todo row (used in Home screen).
 */
import React, { useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle,
  withTiming, withSequence, Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../theme/ThemeContext';
import { F } from '../theme/fonts';
import { Check } from 'lucide-react-native';

type QuestRank = 'E' | 'D' | 'C' | 'B' | 'A' | 'S';

const RANK_COLORS_LIGHT: Record<QuestRank, string> = {
  E:'#94A3B8', D:'#10B981', C:'#0891B2', B:'#4F46E5', A:'#7C3AED', S:'#D97706',
};
const RANK_COLORS_DARK: Record<QuestRank, string> = {
  E:'#64748B', D:'#34D399', C:'#22D3EE', B:'#818CF8', A:'#A78BFA', S:'#FBBF24',
};

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

export function QuestCard({
  title, description, category, xp,
  stat = 'INT', rank = 'E', isCompleted, onPress,
}: QuestProps) {
  const { colors: C, isDark } = useTheme();
  const rankColor = (isDark ? RANK_COLORS_DARK : RANK_COLORS_LIGHT)[rank];

  const rowOpacity  = useSharedValue(1);
  const rowScale    = useSharedValue(1);
  const checkScale  = useSharedValue(0);

  useEffect(() => {
    if (isCompleted) {
      rowOpacity.value  = withTiming(0.45, { duration: 300, easing: Easing.out(Easing.cubic) });
      checkScale.value  = withTiming(1,    { duration: 200, easing: Easing.out(Easing.cubic) });
    }
  }, [isCompleted]);

  const handlePress = () => {
    if (isCompleted) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    rowScale.value = withSequence(
      withTiming(0.97, { duration: 70, easing: Easing.out(Easing.cubic) }),
      withTiming(1.0,  { duration: 120, easing: Easing.out(Easing.cubic) })
    );
    onPress();
  };

  const rowAnim   = useAnimatedStyle(() => ({ transform: [{ scale: rowScale.value }], opacity: rowOpacity.value }));
  const checkAnim = useAnimatedStyle(() => ({ transform: [{ scale: checkScale.value }] }));

  return (
    <Pressable onPress={handlePress} style={styles.pressable}>
      <Animated.View style={[
        styles.row,
        { backgroundColor: C.surface, borderBottomColor: C.border },
        rowAnim,
      ]}>
        {/* Checkbox */}
        <View style={[
          styles.checkbox,
          { borderColor: isCompleted ? C.blue : C.borderMid },
          isCompleted && { backgroundColor: C.blue },
        ]}>
          <Animated.View style={checkAnim}>
            <Check size={11} color="#fff" strokeWidth={3} />
          </Animated.View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text
            style={[
              styles.title,
              { color: C.text },
              isCompleted && { color: C.textMut, textDecorationLine: 'line-through' },
            ]}
            numberOfLines={2}
          >
            {title}
          </Text>

          {description && !isCompleted && (
            <Text style={[styles.desc, { color: C.textMut }]} numberOfLines={1}>
              {description}
            </Text>
          )}

          <View style={styles.metaRow}>
            <View style={[
              styles.categoryPill,
              { backgroundColor: rankColor + '14', borderColor: rankColor + '30' },
            ]}>
              <View style={[styles.rankDot, { backgroundColor: rankColor }]} />
              <Text style={[styles.categoryText, { color: rankColor }]}>
                {rank} · {category.toUpperCase()}
              </Text>
            </View>
            <View style={{ flex: 1 }} />
            <Text style={[styles.xpBadge, { color: isCompleted ? C.textMut : C.blue }]}>
              +{xp} XP
            </Text>
          </View>
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {},
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    gap: 13,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
    flexShrink: 0,
  },
  content: {
    flex: 1,
    gap: 5,
  },
  title: {
    fontFamily: F.medium,
    fontSize: 15,
    lineHeight: 22,
    letterSpacing: -0.1,
  },
  desc: {
    fontFamily: F.regular,
    fontSize: 12,
    lineHeight: 17,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
  },
  rankDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  categoryText: {
    fontFamily: F.mono,
    fontSize: 9,
    letterSpacing: 0.5,
  },
  xpBadge: {
    fontFamily: F.semiBold,
    fontSize: 11,
  },
});
