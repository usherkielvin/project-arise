import React, { useEffect } from 'react';
import { View, Text, Modal, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { C } from '../theme/colors';
import { F } from '../theme/fonts';

interface LevelUpModalProps {
  visible: boolean;
  newLevel: number;
  statGains?: { label: string; value: string }[];
  onDismiss: () => void;
}

// Individual ring that expands and fades
function PulseRing({ delay }: { delay: number }) {
  const scale = useSharedValue(0.3);
  const opacity = useSharedValue(0.8);

  useEffect(() => {
    scale.value = withDelay(delay, withTiming(2.5, { duration: 1400, easing: Easing.out(Easing.exp) }));
    opacity.value = withDelay(delay, withTiming(0, { duration: 1400 }));
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[styles.ring, style]}
      pointerEvents="none"
    />
  );
}

export function LevelUpModal({ visible, newLevel, statGains = [], onDismiss }: LevelUpModalProps) {
  const containerScale = useSharedValue(0);
  const containerOpacity = useSharedValue(0);
  const textScale = useSharedValue(0.5);
  const levelOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      // Backdrop
      containerOpacity.value = withTiming(1, { duration: 300 });
      // Card entrance
      containerScale.value = withSpring(1, { damping: 12, stiffness: 120 });
      // "LEVEL UP" text punch-in
      textScale.value = withDelay(200, withSequence(
        withSpring(1.15, { damping: 8 }),
        withSpring(1.0, { damping: 14 })
      ));
      // Level number fade in
      levelOpacity.value = withDelay(400, withTiming(1, { duration: 500 }));
    } else {
      containerScale.value = withTiming(0.9, { duration: 200 });
      containerOpacity.value = withTiming(0, { duration: 200 });
      textScale.value = 0.5;
      levelOpacity.value = 0;
    }
  }, [visible]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
  }));

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: containerScale.value }],
  }));

  const textStyle = useAnimatedStyle(() => ({
    transform: [{ scale: textScale.value }],
  }));

  const levelStyle = useAnimatedStyle(() => ({
    opacity: levelOpacity.value,
    transform: [{ translateY: (1 - levelOpacity.value) * 20 }],
  }));

  return (
    <Modal transparent visible={visible} animationType="none" statusBarTranslucent>
      <Animated.View style={[styles.backdrop, backdropStyle]}>
        {/* Pulse rings behind card */}
        {visible && (
          <View style={styles.ringsContainer} pointerEvents="none">
            <PulseRing delay={0} />
            <PulseRing delay={300} />
            <PulseRing delay={600} />
          </View>
        )}

        {/* Main card */}
        <Animated.View style={[styles.card, cardStyle]}>
          {/* Glow line top */}
          <View style={styles.glowLine} />

          {/* LEVEL UP Header */}
          <Animated.View style={textStyle}>
            <Text style={styles.systemLabel}>— SYSTEM NOTIFICATION —</Text>
            <Text style={styles.levelUpText}>LEVEL UP</Text>
          </Animated.View>

          {/* New Level */}
          <Animated.View style={[styles.levelBadge, levelStyle]}>
            <Text style={styles.levelLabel}>CURRENT LEVEL</Text>
            <Text style={styles.levelNumber}>{newLevel}</Text>
          </Animated.View>

          {/* Stat gains */}
          {statGains.length > 0 && (
            <Animated.View style={[styles.statsContainer, levelStyle]}>
              {statGains.map((stat, i) => (
                <View key={i} style={styles.statRow}>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                  <Text style={styles.statValue}>{stat.value}</Text>
                </View>
              ))}
            </Animated.View>
          )}

          {/* Dismiss button */}
          <Animated.View style={levelStyle}>
            <Pressable style={styles.dismissBtn} onPress={onDismiss}>
              <Text style={styles.dismissText}>ACKNOWLEDGE</Text>
            </Pressable>
          </Animated.View>

          {/* Glow line bottom */}
          <View style={styles.glowLine} />
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(7, 9, 28, 0.94)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringsContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 1.5,
    borderColor: C.blue,
  },
  card: {
    width: '84%',
    backgroundColor: C.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.blueBorder,
    padding: 28,
    alignItems: 'center',
    gap: 20,
    shadowColor: C.blue,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 28,
    elevation: 20,
  },
  glowLine: {
    width: '100%',
    height: 0.5,
    backgroundColor: C.blueBorder,
  },
  systemLabel: {
    color: C.textMut,
    fontFamily: F.mono,
    fontSize: 9,
    letterSpacing: 3,
    textAlign: 'center',
    marginBottom: 6,
  },
  levelUpText: {
    color: C.blue,
    fontFamily: F.monoBold,
    fontSize: 40,
    letterSpacing: 8,
    textAlign: 'center',
    textShadowColor: C.blue,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 18,
  },
  levelBadge: {
    alignItems: 'center',
  },
  levelLabel: {
    fontFamily: F.mono,
    color: C.textMut,
    fontSize: 9,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  levelNumber: {
    fontFamily: F.monoBold,
    color: C.text,
    fontSize: 72,
    lineHeight: 80,
    letterSpacing: -2,
  },
  statsContainer: {
    width: '100%',
    gap: 8,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: C.blueDim,
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: C.blueBorder,
  },
  statLabel: {
    fontFamily: F.medium,
    color: C.textSub,
    fontSize: 12,
  },
  statValue: {
    fontFamily: F.monoBold,
    color: C.blue,
    fontSize: 12,
    letterSpacing: 1,
  },
  dismissBtn: {
    paddingHorizontal: 40,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: C.blueBorder,
    backgroundColor: C.blueDim,
  },
  dismissText: {
    fontFamily: F.mono,
    color: C.blue,
    fontSize: 11,
    letterSpacing: 3,
  },
});
