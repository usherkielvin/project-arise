import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { F } from '../theme/fonts';

const { width, height } = Dimensions.get('window');

const SLIDES = [
  {
    id: 0,
    tag: '// SYSTEM BOOT',
    title: 'Welcome to\nARISE.',
    sub: 'A sovereign productivity system built for those who refuse to be ordinary.',
    cta: 'Initialize',
  },
  {
    id: 1,
    tag: '// PROTOCOL SELECT',
    title: 'Two Systems.\nOne Mission.',
    sub: 'MONARCH tracks your habits, quests & growth.\nSOVEREIGN powers your trading terminal.',
    cta: 'Understood',
  },
  {
    id: 2,
    tag: '// IDENTITY CHECK',
    title: 'Are You Ready\nTo Be A Player?',
    sub: 'Weak resolve will be penalized. Every day counts. Every habit matters. The system is watching.',
    cta: 'I Am Ready — Enter',
  },
];

interface Props {
  onComplete: () => void;
}

export default function OnboardingScreen({ onComplete }: Props) {
  const [slide, setSlide] = useState(0);

  // Animations
  const bgOpacity  = useRef(new Animated.Value(0)).current;
  const glowAnim   = useRef(new Animated.Value(0)).current;
  const tagOpacity = useRef(new Animated.Value(0)).current;
  const tagY       = useRef(new Animated.Value(-8)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleY     = useRef(new Animated.Value(24)).current;
  const subOpacity = useRef(new Animated.Value(0)).current;
  const btnOpacity = useRef(new Animated.Value(0)).current;
  const btnScale   = useRef(new Animated.Value(0.92)).current;
  const scanLine   = useRef(new Animated.Value(0)).current;

  // Pulse glow loop
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 2200, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
        Animated.timing(glowAnim, { toValue: 0, duration: 2200, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
      ])
    ).start();
    // Scan line
    Animated.loop(
      Animated.timing(scanLine, { toValue: 1, duration: 3000, useNativeDriver: true, easing: Easing.linear })
    ).start();
  }, []);

  // Entrance animation per slide
  const animateIn = () => {
    tagOpacity.setValue(0); tagY.setValue(-8);
    titleOpacity.setValue(0); titleY.setValue(24);
    subOpacity.setValue(0);
    btnOpacity.setValue(0); btnScale.setValue(0.92);

    Animated.sequence([
      Animated.timing(bgOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.parallel([
        Animated.timing(tagOpacity, { toValue: 1, duration: 350, useNativeDriver: true }),
        Animated.timing(tagY,       { toValue: 0, duration: 350, useNativeDriver: true }),
      ]),
      Animated.delay(80),
      Animated.parallel([
        Animated.timing(titleOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(titleY,       { toValue: 0, duration: 500, useNativeDriver: true, easing: Easing.out(Easing.exp) }),
      ]),
      Animated.delay(80),
      Animated.timing(subOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.delay(100),
      Animated.parallel([
        Animated.timing(btnOpacity, { toValue: 1, duration: 350, useNativeDriver: true }),
        Animated.timing(btnScale,   { toValue: 1, duration: 350, useNativeDriver: true, easing: Easing.out(Easing.back(1.4)) }),
      ]),
    ]).start();
  };

  useEffect(() => { animateIn(); }, [slide]);

  const handleNext = () => {
    if (slide < SLIDES.length - 1) {
      // Fade out then next slide
      Animated.parallel([
        Animated.timing(bgOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.timing(titleOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(subOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(btnOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start(() => setSlide(s => s + 1));
    } else {
      onComplete();
    }
  };

  const current = SLIDES[slide];
  const glowOpacity = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.4, 0.85] });
  const scanY = scanLine.interpolate({ inputRange: [0, 1], outputRange: [-height * 0.1, height * 1.1] });

  return (
    <View style={styles.root}>
      {/* Deep background */}
      <View style={styles.bg} />

      {/* Grid overlay */}
      <View style={styles.grid} pointerEvents="none">
        {Array.from({ length: 12 }).map((_, i) => (
          <View key={i} style={[styles.gridLine, { top: `${(i / 12) * 100}%` }]} />
        ))}
        {Array.from({ length: 8 }).map((_, i) => (
          <View key={i} style={[styles.gridCol, { left: `${(i / 8) * 100}%` }]} />
        ))}
      </View>

      {/* Scan line */}
      <Animated.View
        pointerEvents="none"
        style={[styles.scanLine, { transform: [{ translateY: scanY }] }]}
      />

      {/* Glow orb */}
      <Animated.View
        pointerEvents="none"
        style={[styles.glowOrb, { opacity: glowOpacity }]}
      />

      {/* Corner brackets */}
      <View style={[styles.corner, styles.cornerTL]} pointerEvents="none" />
      <View style={[styles.corner, styles.cornerTR]} pointerEvents="none" />
      <View style={[styles.corner, styles.cornerBL]} pointerEvents="none" />
      <View style={[styles.corner, styles.cornerBR]} pointerEvents="none" />

      {/* Content */}
      <Animated.View style={[styles.content, { opacity: bgOpacity }]}>
        {/* Step dots */}
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View key={i} style={[styles.dot, i === slide && styles.dotActive]} />
          ))}
        </View>

        {/* Tag */}
        <Animated.Text style={[styles.tag, { opacity: tagOpacity, transform: [{ translateY: tagY }] }]}>
          {current.tag}
        </Animated.Text>

        {/* Title */}
        <Animated.Text style={[styles.title, { opacity: titleOpacity, transform: [{ translateY: titleY }] }]}>
          {current.title}
        </Animated.Text>

        {/* Sub */}
        <Animated.Text style={[styles.sub, { opacity: subOpacity }]}>
          {current.sub}
        </Animated.Text>

        {/* Divider */}
        <View style={styles.divider} />

        {/* CTA Button */}
        <Animated.View style={{ opacity: btnOpacity, transform: [{ scale: btnScale }], width: '100%' }}>
          <Pressable
            style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]}
            onPress={handleNext}
          >
            <Text style={styles.btnText}>{current.cta}</Text>
            <Text style={styles.btnArrow}>›</Text>
          </Pressable>
        </Animated.View>

        {/* Skip (only on non-last slides) */}
        {slide < SLIDES.length - 1 && (
          <Pressable onPress={onComplete} style={styles.skipBtn}>
            <Text style={styles.skipText}>Skip</Text>
          </Pressable>
        )}
      </Animated.View>
    </View>
  );
}

const INDIGO = '#6366F1';
const VIOLET = '#8B5CF6';

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#030712',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#030712',
  },
  grid: {
    ...StyleSheet.absoluteFillObject,
  },
  gridLine: {
    position: 'absolute',
    left: 0, right: 0,
    height: 1,
    backgroundColor: 'rgba(99,102,241,0.06)',
  },
  gridCol: {
    position: 'absolute',
    top: 0, bottom: 0,
    width: 1,
    backgroundColor: 'rgba(99,102,241,0.06)',
  },
  scanLine: {
    position: 'absolute',
    left: 0, right: 0,
    height: 2,
    backgroundColor: 'rgba(99,102,241,0.18)',
  },
  glowOrb: {
    position: 'absolute',
    width: width * 1.2,
    height: width * 1.2,
    borderRadius: width * 0.6,
    backgroundColor: 'transparent',
    top: -width * 0.3,
    alignSelf: 'center',
    shadowColor: INDIGO,
    shadowOpacity: 1,
    shadowRadius: 160,
    shadowOffset: { width: 0, height: 0 },
    // Android glow via background
    elevation: 0,
  },

  // Corner brackets
  corner: {
    position: 'absolute',
    width: 24, height: 24,
    borderColor: INDIGO,
    opacity: 0.5,
  },
  cornerTL: { top: 32, left: 24, borderTopWidth: 2, borderLeftWidth: 2 },
  cornerTR: { top: 32, right: 24, borderTopWidth: 2, borderRightWidth: 2 },
  cornerBL: { bottom: 40, left: 24, borderBottomWidth: 2, borderLeftWidth: 2 },
  cornerBR: { bottom: 40, right: 24, borderBottomWidth: 2, borderRightWidth: 2 },

  content: {
    paddingHorizontal: 32,
    width: '100%',
    alignItems: 'flex-start',
  },
  dots: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 32,
  },
  dot: {
    width: 6, height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(99,102,241,0.3)',
  },
  dotActive: {
    width: 24,
    backgroundColor: INDIGO,
  },
  tag: {
    fontFamily: F.mono,
    fontSize: 11,
    color: INDIGO,
    letterSpacing: 2,
    marginBottom: 16,
    textTransform: 'uppercase',
  },
  title: {
    fontFamily: F.bold,
    fontSize: 42,
    color: '#F9FAFB',
    lineHeight: 50,
    letterSpacing: -1.5,
    marginBottom: 20,
  },
  sub: {
    fontFamily: F.regular,
    fontSize: 15,
    color: '#9CA3AF',
    lineHeight: 24,
    marginBottom: 40,
  },
  divider: {
    width: 48,
    height: 2,
    backgroundColor: INDIGO,
    marginBottom: 40,
    borderRadius: 1,
  },
  btn: {
    backgroundColor: INDIGO,
    borderRadius: 14,
    paddingVertical: 18,
    paddingHorizontal: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: VIOLET,
    shadowOpacity: 0.5,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  btnPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.97 }],
  },
  btnText: {
    fontFamily: F.semiBold,
    fontSize: 16,
    color: '#fff',
    letterSpacing: 0.3,
  },
  btnArrow: {
    fontFamily: F.bold,
    fontSize: 22,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 22,
  },
  skipBtn: {
    alignSelf: 'center',
    marginTop: 24,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  skipText: {
    fontFamily: F.regular,
    fontSize: 13,
    color: '#4B5563',
    letterSpacing: 0.5,
  },
});
