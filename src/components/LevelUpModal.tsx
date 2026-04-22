import React, { useEffect } from 'react';
import { View, Text, Modal, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle,
  withTiming, withDelay, Easing,
} from 'react-native-reanimated';
import { useTheme } from '../theme/ThemeContext';
import { F } from '../theme/fonts';

interface LevelUpModalProps {
  visible: boolean;
  newLevel: number;
  statGains?: { label: string; value: string }[];
  onDismiss: () => void;
}

export function LevelUpModal({ visible, newLevel, statGains = [], onDismiss }: LevelUpModalProps) {
  const { colors: C, isDark } = useTheme();
  const containerScale   = useSharedValue(0);
  const containerOpacity = useSharedValue(0);
  const textScale        = useSharedValue(0.5);
  const levelOpacity     = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      containerOpacity.value = withTiming(1, { duration: 220, easing: Easing.out(Easing.cubic) });
      containerScale.value   = withTiming(1, { duration: 280, easing: Easing.out(Easing.cubic) });
      textScale.value        = withDelay(160, withTiming(1, { duration: 240, easing: Easing.out(Easing.cubic) }));
      levelOpacity.value     = withDelay(300, withTiming(1, { duration: 280, easing: Easing.out(Easing.cubic) }));
    } else {
      containerScale.value   = withTiming(0.96, { duration: 160, easing: Easing.in(Easing.cubic) });
      containerOpacity.value = withTiming(0,    { duration: 160, easing: Easing.in(Easing.cubic) });
      textScale.value   = 0.5;
      levelOpacity.value = 0;
    }
  }, [visible]);

  const backdropStyle = useAnimatedStyle(() => ({ opacity: containerOpacity.value }));
  const cardStyle     = useAnimatedStyle(() => ({ transform: [{ scale: containerScale.value }] }));
  const textStyle     = useAnimatedStyle(() => ({ transform: [{ scale: textScale.value }] }));
  const levelStyle    = useAnimatedStyle(() => ({
    opacity: levelOpacity.value,
    transform: [{ translateY: (1 - levelOpacity.value) * 16 }],
  }));

  return (
    <Modal transparent visible={visible} animationType="none" statusBarTranslucent>
      <Animated.View style={[
        styles.backdrop,
        { backgroundColor: isDark ? 'rgba(0,0,0,0.72)' : 'rgba(0,0,0,0.30)' },
        backdropStyle,
      ]}>
        <Animated.View style={[
          styles.card,
          { backgroundColor: C.surface, borderColor: C.border },
          cardStyle,
        ]}>
          <View style={[styles.accentLine, { backgroundColor: C.blue }]} />
          <View style={[styles.glowOrb, { backgroundColor: C.blueGlow }]} />

          <Animated.View style={[styles.headerWrap, textStyle]}>
            <Text style={[styles.eyebrow, { color: C.textMut }]}>SYSTEM UPDATE</Text>
            <Text style={[styles.levelUpText, { color: C.blue }]}>Level Up</Text>
            <Text style={[styles.subtitle, { color: C.textSub }]}>Outstanding progress. New thresholds unlocked.</Text>
          </Animated.View>

          <Animated.View style={[styles.levelBadgeWrap, levelStyle]}>
            <View style={[styles.levelBadge, { backgroundColor: C.surface2, borderColor: C.border }]}>
              <Text style={[styles.levelLabel, { color: C.textMut }]}>CURRENT LEVEL</Text>
              <Text style={[styles.levelNumber, { color: C.text }]}>{newLevel}</Text>
            </View>
          </Animated.View>

          {statGains.length > 0 && (
            <Animated.View style={[styles.statsContainer, levelStyle]}>
              {statGains.map((stat, i) => (
                <View key={i} style={[styles.statRow, { backgroundColor: C.surface2, borderColor: C.border }]}>
                  <Text style={[styles.statLabel, { color: C.textSub }]}>{stat.label}</Text>
                  <Text style={[styles.statValue, { color: C.blue }]}>{stat.value}</Text>
                </View>
              ))}
            </Animated.View>
          )}

          <Animated.View style={[styles.btnWrap, levelStyle]}>
            <Pressable
              style={({ pressed }) => [
                styles.dismissBtn,
                { backgroundColor: C.blue, opacity: pressed ? 0.92 : 1 },
              ]}
              onPress={onDismiss}
            >
              <Text style={styles.dismissText}>Continue</Text>
            </Pressable>
          </Animated.View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: '82%',
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 22,
    alignItems: 'center',
    gap: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 16,
  },
  accentLine: {
    position: 'absolute',
    top: 0, left: 32, right: 32,
    height: 3,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
  },
  glowOrb: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    top: -110,
    right: -75,
  },
  headerWrap: { alignItems: 'center', gap: 6, marginTop: 8 },
  eyebrow: { fontFamily: F.mono, fontSize: 9, letterSpacing: 3 },
  levelUpText: { fontFamily: F.bold, fontSize: 34, letterSpacing: -1 },
  subtitle: { fontFamily: F.regular, fontSize: 12, textAlign: 'center', lineHeight: 18, maxWidth: 240 },
  levelBadgeWrap: { width: '100%', alignItems: 'center' },
  levelBadge: {
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 14,
    minWidth: 160,
    paddingHorizontal: 22,
    paddingVertical: 14,
  },
  levelLabel: { fontFamily: F.mono, fontSize: 9, letterSpacing: 2 },
  levelNumber: { fontFamily: F.bold, fontSize: 58, lineHeight: 64, letterSpacing: -2.2 },
  statsContainer: { width: '100%', gap: 8, marginTop: 2 },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
  },
  statLabel: { fontFamily: F.medium, fontSize: 13 },
  statValue: { fontFamily: F.semiBold, fontSize: 13 },
  btnWrap: { width: '100%' },
  dismissBtn: {
    paddingVertical: 13, borderRadius: 10, alignItems: 'center',
  },
  dismissText: { fontFamily: F.semiBold, color: '#fff', fontSize: 14, letterSpacing: 0.2 },
});
