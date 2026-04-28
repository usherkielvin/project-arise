/**
 * Stats screen. Full dark mode support + theme toggle.
 */
import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, Pressable, StyleSheet, Image, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue, useAnimatedStyle,
  withDelay, withTiming, Easing,
} from 'react-native-reanimated';
import { useTheme, ThemeMode } from '../../src/theme/ThemeContext';
import { ProtocolMode, useSystemStore } from '../../src/store/useSystemStore';
import { F } from '../../src/theme/fonts';
import { Sun, Moon, Smartphone, Activity, TrendingUp, Swords, Flame, Skull, Crown, Ghost, Zap, Image as ImageIcon, X } from 'lucide-react-native';
import { protocolAccent } from '../../src/theme/colors';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { getLevelProgress } from '../../src/utils/progression';
import { getRankScale, rankFromLevel } from '../../src/features/stats/rank';

// ─── Stat base config (labels, sub, colorKey) ──────────────────────────────
const STAT_CONFIG = [
  { key: 'INT', fullName: 'Intelligence', sub: 'Logic, Coding & Skill Synthesis', colorKey: 'statInt' as const },
  { key: 'PER', fullName: 'Perception',   sub: 'Market Intuition & Pattern Recognition', colorKey: 'statPer' as const },
  { key: 'STR', fullName: 'Strength',     sub: 'Physical Discipline & Habit Output', colorKey: 'statStr' as const },
  { key: 'VIT', fullName: 'Vitality',     sub: 'Energy Core & Recovery Efficiency', colorKey: 'statVit' as const },
];

// Base values before earned XP
const STAT_BASE = { INT: 14, PER: 12, STR: 10, VIT: 8 };

const RANK_COLORS_LIGHT: Record<string, string> = {
  E:'#94A3B8', D:'#10B981', C:'#0891B2', B:'#4F46E5', A:'#7C3AED', S:'#D97706',
};
const RANK_COLORS_DARK: Record<string, string> = {
  E:'#64748B', D:'#34D399', C:'#22D3EE', B:'#818CF8', A:'#A78BFA', S:'#FBBF24',
};

function StatTile({ stat, delay, isRight }: {
  stat: { key: string; fullName: string; sub: string; colorKey: 'statInt'|'statPer'|'statStr'|'statVit'; value: number; max: number; };
  delay: number; isRight?: boolean;
}) {
  const { colors: C } = useTheme();
  const color = C[stat.colorKey];
  const barW  = useSharedValue(0);

  useEffect(() => {
    barW.value = withDelay(delay, withTiming(Math.min((stat.value / stat.max) * 100, 100), {
      duration: 900, easing: Easing.out(Easing.cubic),
    }));
  }, [stat.value, stat.max]);

  const barStyle = useAnimatedStyle(() => ({ width: `${barW.value}%` }));

  return (
    <View style={[styles.tile, { borderRightColor: C.border }, isRight && styles.tileRight]}>
      <Text style={[styles.tileKey, { color }]}>{stat.key}</Text>
      <View style={styles.tileValueRow}>
        <Text style={[styles.tileNum, { color: C.text }]}>{stat.value}</Text>
        <Text style={[styles.tileMax, { color: C.textMut }]}>/{stat.max}</Text>
      </View>
      <Text style={[styles.tileFullName, { color: C.text }]}>{stat.fullName}</Text>
      <Text style={[styles.tileSub, { color: C.textMut }]}>{stat.sub}</Text>
      <View style={[styles.microTrack, { backgroundColor: C.surface2 }]}>
        <Animated.View style={[styles.microFill, { backgroundColor: color }, barStyle]} />
      </View>
    </View>
  );
}

// ─── Theme Mode Toggle ────────────────────────────────────────────────────────
function ThemeToggle() {
  const { colors: C, mode, setMode } = useTheme();

  const options: { key: ThemeMode; label: string; Icon: any }[] = [
    { key: 'light', label: 'Light', Icon: Sun },
    { key: 'auto',  label: 'Auto',  Icon: Smartphone },
    { key: 'dark',  label: 'Dark',  Icon: Moon },
  ];

  return (
    <View style={[styles.themeToggle, { backgroundColor: C.surface2, borderColor: C.border }]}>
      {options.map(({ key, label, Icon }) => {
        const active = mode === key;
        return (
          <Pressable
            key={key}
            style={[
              styles.themeOption,
              active && [styles.themeOptionActive, { backgroundColor: C.surface, borderColor: C.border }],
            ]}
            onPress={() => setMode(key)}
          >
            <Icon
              size={14}
              color={active ? C.blue : C.textMut}
              strokeWidth={active ? 2 : 1.8}
            />
            <Text style={[
              styles.themeOptionText,
              { color: active ? C.blue : C.textMut },
              active && styles.themeOptionTextActive,
            ]}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}



// ─── Rank Bar ─────────────────────────────────────────────────────────────────
function RankBar({ currentRank }: { currentRank: string }) {
  const { colors: C, isDark } = useTheme();
  const RANKS = getRankScale();
  const idx = RANKS.indexOf(currentRank);
  const rankColors = isDark ? RANK_COLORS_DARK : RANK_COLORS_LIGHT;

  return (
    <View style={styles.rankBarWrap}>
      {RANKS.map((r, i) => {
        const isCurrent = i === idx;
        const isPast    = i < idx;
        const dotColor  = (isPast || isCurrent) ? rankColors[r] : C.surface3;
        return (
          <React.Fragment key={r}>
            <View style={styles.rankNode}>
              <View style={[
                styles.rankDot,
                { backgroundColor: dotColor },
                isCurrent && { transform: [{ scale: 1.45 }] },
              ]}>
                {isCurrent && <View style={styles.rankDotInner} />}
              </View>
              <Text style={[
                styles.rankLabel,
                { color: (isPast || isCurrent) ? rankColors[r] : C.textFnt },
              ]}>
                {r}
              </Text>
            </View>
            {i < RANKS.length - 1 && (
              <View style={[
                styles.rankLine,
                { backgroundColor: isPast ? C.blue : C.surface2 },
              ]} />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────

const PREFILL_ICONS = [
  { id: 'Swords', Icon: Swords },
  { id: 'Flame', Icon: Flame },
  { id: 'Skull', Icon: Skull },
  { id: 'Crown', Icon: Crown },
  { id: 'Ghost', Icon: Ghost },
  { id: 'Zap', Icon: Zap },
];

export default function StatsScreen() {
  const { colors: C, isDark } = useTheme();
  const store = useSystemStore();
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [targetProtocol, setTargetProtocol] = useState<ProtocolMode | null>(null);
  const syncOpacity = useSharedValue(0);
  const syncScale = useSharedValue(1.1);
  const syncTextY = useSharedValue(10);
  
  const activeProtocol = store.activeProtocol;
  const router = useRouter();

  const triggerSync = (next: ProtocolMode) => {
    if (next === activeProtocol || isSyncing) return;
    setTargetProtocol(next);
  };

  useEffect(() => {
    if (!targetProtocol) return;

    setIsSyncing(true);
    syncOpacity.value = withTiming(1, { duration: 250 });
    syncScale.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) });
    syncTextY.value = withTiming(0, { duration: 300 });

    // Halfway through the animation, actually switch the protocol and navigate
    const switchTimer = setTimeout(() => {
      store.setActiveProtocol(targetProtocol);
      if (targetProtocol === 'FINANCE') {
        router.replace('/(tabs)/pulse');
      } else {
        router.replace('/(tabs)');
      }
      
      // Start fading out
      setTimeout(() => {
        syncOpacity.value = withTiming(0, { duration: 400 });
        setTimeout(() => {
          setIsSyncing(false);
          setTargetProtocol(null);
        }, 450);
      }, 500); // Hold for 500ms
    }, 400); // 400ms to fade in fully

    return () => clearTimeout(switchTimer);
  }, [targetProtocol]);

  const syncOverlayStyle = useAnimatedStyle(() => ({
    opacity: syncOpacity.value,
    transform: [{ scale: syncScale.value }]
  }));

  const syncTextStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: syncTextY.value }]
  }));

  const rankColors = isDark ? RANK_COLORS_DARK : RANK_COLORS_LIGHT;

  const { rank: currentRank, title } = rankFromLevel(store.level);
  const { rank: nextRank } = rankFromLevel(store.level + 1);
  const rankColor = rankColors[currentRank] || rankColors['E'];
  const nextColor = rankColors[nextRank]    || rankColors['D'];

  // Derive live stat values from XP earned in each category
  const sp = store.statPoints;
  const STATS_DATA = STAT_CONFIG.map((cfg) => {
    const base = STAT_BASE[cfg.key as keyof typeof STAT_BASE];
    const bonus = Math.floor((sp[cfg.key as keyof typeof sp] ?? 0) / 50);
    const value = base + bonus;
    const max   = base + 10;   // cap grows with base
    return { ...cfg, value, max };
  });

  const totalStat   = STATS_DATA.reduce((s, st) => s + st.value, 0);
  const maxStat     = STATS_DATA.reduce((s, st) => s + st.max, 0);
  const { nextLevelXP, progressPercent, xpToNext } = getLevelProgress(store.totalXP, store.level);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      store.setProfileImage(result.assets[0].uri);
      setShowAvatarPicker(false);
    }
  };

  let AvatarContent = <Text style={[styles.avatarText, { color: C.blue }]}>U</Text>;
  if (store.profileImage) {
    if (store.profileImage.startsWith('icon-')) {
      const iconName = store.profileImage.split('icon-')[1];
      const FoundIcon = PREFILL_ICONS.find(i => i.id === iconName)?.Icon;
      if (FoundIcon) {
        AvatarContent = <FoundIcon size={26} color={C.blue} strokeWidth={2.5} />;
      }
    } else {
      AvatarContent = <Image source={{ uri: store.profileImage }} style={{ width: '100%', height: '100%', borderRadius: 12 }} />;
    }
  }

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: C.surface }]}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: C.text }]}>Profile</Text>
        </View>

        {/* Name card */}
        <View style={[styles.nameCard, { backgroundColor: C.void, borderColor: C.border }]}>
          <Pressable onPress={() => setShowAvatarPicker(true)} style={[styles.avatarWrap, { backgroundColor: C.blueDim, borderColor: C.blueBorder }]}>
            {AvatarContent}
          </Pressable>
          <View style={styles.nameInfo}>
            <Text style={[styles.hunterName, { color: C.text }]}>Usher</Text>
            <Text style={[styles.hunterTitle, { color: C.textMut }]}>{title}</Text>
            <View style={[styles.rankBadge, { borderColor: rankColor + '40', backgroundColor: rankColor + '12' }]}>
              <Text style={[styles.rankBadgeText, { color: rankColor }]}>{currentRank}-Rank</Text>
            </View>
          </View>
          <View style={styles.lvlBubble}>
            <Text style={[styles.lvlLabel, { color: C.textMut }]}>LVL</Text>
            <Text style={[styles.lvlNum, { color: C.blue }]}>{String(store.level).padStart(2, '0')}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={[styles.protocolCard, { backgroundColor: C.void, borderColor: C.border }]}>
            <View style={styles.protocolHeaderRow}>
              <Text style={[styles.protocolLabel, { color: C.text }]}>Protocol Selection</Text>
              <Text style={[styles.protocolSub, { color: C.textMut }]}>System State</Text>
            </View>
            
            <View style={styles.protocolCardsRow}>
              {[
                { key: 'MONARCH' as ProtocolMode, label: 'Monarch Mode', desc: 'Habit & Quest Tracker', icon: Swords },
                { key: 'FINANCE' as ProtocolMode, label: 'Sovereign Mode', desc: 'Traders Terminal', icon: TrendingUp },
              ].map(({ key, label, desc, icon: Icon }) => {
                const active = activeProtocol === key;
                const color = key === 'FINANCE' ? protocolAccent('FINANCE', isDark, C.blue) : C.blue;
                
                return (
                  <Pressable
                    key={key}
                    style={[
                      styles.protocolOptionCard,
                      { 
                        backgroundColor: active ? color + '12' : C.surface2, 
                        borderColor: active ? color : C.border 
                      }
                    ]}
                    onPress={() => triggerSync(key)}
                  >
                    <View style={[styles.protocolIconWrap, { backgroundColor: active ? color + '20' : C.surface, borderColor: active ? color + '40' : C.border }]}>
                      <Icon size={18} color={active ? color : C.textMut} strokeWidth={active ? 2.5 : 2} />
                    </View>
                    <Text style={[styles.protocolOptionCardLabel, { color: active ? color : C.text }]}>{label}</Text>
                    <Text style={[styles.protocolOptionCardDesc, { color: C.textMut }]}>{desc}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>

        {/* 2×2 Stat grid */}
        <View style={[styles.statGrid, { backgroundColor: C.void, borderColor: C.border }]}>
          <View style={styles.statRow}>
            <StatTile stat={STATS_DATA[0]} delay={0}   />
            <StatTile stat={STATS_DATA[1]} delay={80}  isRight />
          </View>
          <View style={[styles.statRowDivider, { backgroundColor: C.border }]} />
          <View style={styles.statRow}>
            <StatTile stat={STATS_DATA[2]} delay={160} />
            <StatTile stat={STATS_DATA[3]} delay={240} isRight />
          </View>
        </View>

        {/* Total power */}
        <View style={styles.section}>
          <View style={[styles.powerCard, { backgroundColor: C.void, borderColor: C.border }]}>
            <Text style={[styles.powerLabel, { color: C.textMut }]}>Total XP Progress</Text>
            <Text style={[styles.powerNum, { color: C.text }]}>
              {store.totalXP}<Text style={[styles.powerMax, { color: C.textMut }]}>/{nextLevelXP}</Text>
            </Text>
            <View style={[styles.powerBar, { backgroundColor: C.surface2 }]}>
              <View style={[styles.powerBarFill, { width: `${progressPercent}%`, backgroundColor: C.blue }]} />
            </View>
          </View>
        </View>

        {/* Rank progression */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: C.text }]}>Rank Progression</Text>
          <View style={[styles.rankCard, { backgroundColor: C.void, borderColor: C.border }]}>
            <RankBar currentRank={currentRank} />
            <View style={styles.nextRankRow}>
              <Text style={[styles.nextRankText, { color: C.text }]}>
                Next rank:{' '}
                <Text style={{ color: nextColor, fontFamily: F.semiBold }}>{nextRank}-Rank</Text>
              </Text>
              <Text style={[styles.nextRankSub, { color: C.textMut }]}>
                Gain {xpToNext} more XP to advance
              </Text>
            </View>
          </View>
        </View>

        {/* Title card */}
        <View style={styles.section}>
          <View style={[styles.titleCard, { backgroundColor: C.void, borderColor: C.border }]}>
            <Text style={[styles.titleCardEyebrow, { color: C.textMut }]}>Current Title</Text>
            <Text style={[styles.titleCardTitle, { color: C.text }]}>{title}</Text>
            <Text style={[styles.titleCardSub, { color: C.textMut }]}>
              A {currentRank}-Rank hunter who has awakened to the System. Currently optimizing neural pathways and physical output at Level {store.level}.
            </Text>
          </View>
        </View>

        {/* Categories / Traits */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: C.text }]}>Hunter Expertise</Text>
          <View style={{ gap: 10 }}>
            {[
              { label: 'Technical Proficiency', stat: 'INT', icon: Zap, color: C.statInt },
              { label: 'Market Instincts', stat: 'PER', icon: TrendingUp, color: C.statPer },
              { label: 'Physical Discipline', stat: 'STR', icon: Swords, color: C.statStr },
              { label: 'System Resilience', stat: 'VIT', icon: Activity, color: C.statVit },
            ].map((trait, i) => (
              <View key={i} style={[styles.traitCard, { backgroundColor: C.void, borderColor: C.border }]}>
                <View style={[styles.traitIcon, { backgroundColor: trait.color + '14', borderColor: trait.color + '40' }]}>
                  <trait.icon size={16} color={trait.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.traitLabel, { color: C.text }]}>{trait.label}</Text>
                  <Text style={[styles.traitSub, { color: C.textMut }]}>Synchronized with {trait.stat} Stat</Text>
                </View>
                <View style={styles.traitValueWrap}>
                  <Text style={[styles.traitValue, { color: trait.color }]}>
                    {STATS_DATA.find(s => s.key === trait.stat)?.value ?? 0}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* ── Appearance settings ── */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: C.text }]}>Appearance</Text>
          <View style={[styles.appearanceCard, { backgroundColor: C.void, borderColor: C.border }]}>
            <View style={styles.appearanceRow}>
              <View>
                <Text style={[styles.appearanceLabel, { color: C.text }]}>Theme</Text>
                <Text style={[styles.appearanceSub, { color: C.textMut }]}>Auto follows system setting</Text>
              </View>
            </View>
            <ThemeToggle />
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Avatar Picker Modal */}
      <Modal visible={showAvatarPicker} transparent animationType="fade">
        <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.6)' }]}>
          <View style={[styles.modalContent, { backgroundColor: C.void, borderColor: C.border }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: C.text }]}>Customize Profile</Text>
              <Pressable onPress={() => setShowAvatarPicker(false)} style={{ padding: 4 }}>
                <X size={20} color={C.textMut} />
              </Pressable>
            </View>
            <View style={{ gap: 20 }}>
              <View>
                <Text style={[styles.modalSectionLabel, { color: C.textMut }]}>System Prefills</Text>
                <View style={styles.iconGrid}>
                  {PREFILL_ICONS.map(({ id, Icon }) => (
                    <Pressable
                      key={id}
                      style={[styles.iconBtn, { backgroundColor: C.surface2, borderColor: store.profileImage === `icon-${id}` ? C.blue : C.border }]}
                      onPress={() => {
                        store.setProfileImage(`icon-${id}`);
                        setShowAvatarPicker(false);
                      }}
                    >
                      <Icon size={28} color={C.blue} strokeWidth={2} />
                    </Pressable>
                  ))}
                </View>
              </View>

              <View>
                <Text style={[styles.modalSectionLabel, { color: C.textMut }]}>Custom Image</Text>
                <Pressable
                  style={[styles.uploadBtn, { backgroundColor: C.surface2, borderColor: C.border }]}
                  onPress={pickImage}
                >
                  <ImageIcon size={20} color={C.text} />
                  <Text style={[styles.uploadBtnText, { color: C.text }]}>Import Photo</Text>
                </Pressable>
              </View>

              {store.profileImage !== null && (
                <Pressable
                  style={{ padding: 12, alignItems: 'center' }}
                  onPress={() => {
                    store.setProfileImage(null);
                    setShowAvatarPicker(false);
                  }}
                >
                  <Text style={{ color: '#EF4444', fontFamily: F.medium, fontSize: 13 }}>Reset to Default</Text>
                </Pressable>
              )}
            </View>
          </View>
        </View>
      </Modal>

      {/* Full Screen Protocol Sync Overlay */}
      <Modal transparent visible={isSyncing} animationType="none" statusBarTranslucent>
        <Animated.View 
          style={[
            styles.fullSyncOverlay, 
            { 
              backgroundColor: (targetProtocol || activeProtocol) === 'FINANCE' 
                ? (isDark ? '#0A0A0A' : '#F0FDF4') // Ultra light green for FINANCE light
                : C.void 
            },
            syncOverlayStyle
          ]}
        >
          <View style={styles.syncContent}>
            <Animated.View style={[
              styles.syncIconWrap, 
              { borderColor: (targetProtocol || activeProtocol) === 'FINANCE' ? (isDark ? '#34D399' : '#10B981') : C.blue }, 
              syncTextStyle
            ]}>
              { (targetProtocol || activeProtocol) === 'FINANCE' ? (
                <TrendingUp size={32} color={isDark ? '#34D399' : '#10B981'} />
              ) : (
                <Swords size={32} color={C.blue} />
              )}
            </Animated.View>
            <Animated.Text style={[
              styles.syncTitle, 
              { color: (targetProtocol || activeProtocol) === 'FINANCE' ? (isDark ? '#fff' : '#111827') : C.text }, 
              syncTextStyle
            ]}>
              {(targetProtocol || activeProtocol) === 'FINANCE' ? 'SOVEREIGN_PROTOCOL' : 'MONARCH_PROTOCOL'}
            </Animated.Text>
            <Animated.Text style={[
              styles.syncSub, 
              { color: (targetProtocol || activeProtocol) === 'FINANCE' ? (isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)') : C.textMut }, 
              syncTextStyle
            ]}>
              OVERRIDING SYSTEM PERMISSIONS...
            </Animated.Text>
            <View style={[
              styles.syncBarBase, 
              { backgroundColor: (targetProtocol || activeProtocol) === 'FINANCE' ? (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(16,185,129,0.1)') : C.border }
            ]}>
              <Animated.View style={[
                styles.syncBarFill, 
                { backgroundColor: (targetProtocol || activeProtocol) === 'FINANCE' ? (isDark ? '#34D399' : '#10B981') : C.blue }
              ]} />
            </View>
          </View>
        </Animated.View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 4, gap: 4 },
  title: { fontFamily: F.bold, fontSize: 36, letterSpacing: -1.2, marginTop: 4 },

  // Name card
  nameCard: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: 20, marginTop: 20,
    borderRadius: 16, borderWidth: 1, padding: 16, gap: 14,
  },
  avatarWrap: {
    width: 50, height: 50, borderRadius: 13, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontFamily: F.bold, fontSize: 20 },
  nameInfo: { flex: 1, gap: 5 },
  hunterName: { fontFamily: F.bold, fontSize: 18, letterSpacing: -0.3 },
  hunterTitle: { fontFamily: F.regular, fontSize: 12, fontStyle: 'italic' },
  rankBadge: { alignSelf: 'flex-start', borderWidth: 1, borderRadius: 5, paddingHorizontal: 8, paddingVertical: 2, marginTop: 2 },
  rankBadgeText: { fontFamily: F.monoBold, fontSize: 9, letterSpacing: 1 },
  lvlBubble: { alignItems: 'center' },
  lvlLabel: { fontFamily: F.mono, fontSize: 8, letterSpacing: 2 },
  lvlNum: { fontFamily: F.bold, fontSize: 32, letterSpacing: -2, lineHeight: 36 },

  // Stat grid
  statGrid: { marginHorizontal: 20, marginTop: 16, borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
  statRow: { flexDirection: 'row' },
  statRowDivider: { height: 1 },
  tile: { flex: 1, padding: 18, gap: 4, borderRightWidth: 1 },
  tileRight: { borderRightWidth: 0 },
  tileKey: { fontFamily: F.monoBold, fontSize: 10, letterSpacing: 2 },
  tileValueRow: { flexDirection: 'row', alignItems: 'baseline', gap: 2, marginTop: 2 },
  tileNum: { fontFamily: F.bold, fontSize: 30, letterSpacing: -1, lineHeight: 34 },
  tileMax: { fontFamily: F.regular, fontSize: 12, marginBottom: 2 },
  tileFullName: { fontFamily: F.medium, fontSize: 12, marginTop: 4 },
  tileSub: { fontFamily: F.regular, fontSize: 11, lineHeight: 15 },
  microTrack: { height: 3, borderRadius: 2, marginTop: 10, overflow: 'hidden' },
  microFill: { height: '100%', borderRadius: 2 },

  // Common section
  section: { paddingHorizontal: 20, marginTop: 16 },
  sectionLabel: { fontFamily: F.semiBold, fontSize: 13, marginBottom: 10 },

  // Power card
  powerCard: { borderRadius: 14, borderWidth: 1, padding: 16, gap: 8 },
  powerLabel: { fontFamily: F.mono, fontSize: 9, letterSpacing: 2, textTransform: 'uppercase' },
  powerNum: { fontFamily: F.bold, fontSize: 28, letterSpacing: -1 },
  powerMax: { fontFamily: F.regular, fontSize: 14 },
  powerBar: { height: 4, borderRadius: 2, overflow: 'hidden' },
  powerBarFill: { height: '100%', borderRadius: 2 },

  // Rank card
  rankCard: { borderRadius: 14, borderWidth: 1, padding: 20, gap: 16 },
  rankBarWrap: { flexDirection: 'row', alignItems: 'center' },
  rankNode: { alignItems: 'center', gap: 6 },
  rankDot: { width: 12, height: 12, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  rankDotInner: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#fff' },
  rankLabel: { fontFamily: F.monoBold, fontSize: 9, letterSpacing: 1 },
  rankLine: { flex: 1, height: 1.5, marginBottom: 15, marginHorizontal: 2 },
  nextRankRow: { gap: 4 },
  nextRankText: { fontFamily: F.medium, fontSize: 13 },
  nextRankSub: { fontFamily: F.regular, fontSize: 12 },

  // Title card
  titleCard: { borderRadius: 14, borderWidth: 1, padding: 20, gap: 8 },
  titleCardEyebrow: { fontFamily: F.mono, fontSize: 9, letterSpacing: 3, textTransform: 'uppercase' },
  titleCardTitle: { fontFamily: F.bold, fontSize: 20, letterSpacing: -0.5, fontStyle: 'italic' },
  titleCardSub: { fontFamily: F.regular, fontSize: 13, lineHeight: 20 },

  // Appearance
  appearanceCard: { borderRadius: 14, borderWidth: 1, padding: 16, gap: 14 },
  appearanceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  appearanceLabel: { fontFamily: F.medium, fontSize: 14 },
  appearanceSub: { fontFamily: F.regular, fontSize: 12, marginTop: 2 },
  themeToggle: {
    flexDirection: 'row',
    borderRadius: 10,
    borderWidth: 1,
    padding: 3,
    gap: 2,
  },
  themeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  themeOptionActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  themeOptionText: { fontFamily: F.medium, fontSize: 12 },
  themeOptionTextActive: { fontFamily: F.semiBold },
  traitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  traitIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  traitLabel: {
    fontFamily: F.semiBold,
    fontSize: 13,
  },
  traitSub: {
    fontFamily: F.regular,
    fontSize: 10,
    marginTop: 1,
  },
  traitValueWrap: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  traitValue: {
    fontFamily: F.bold,
    fontSize: 16,
  },
  protocolCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    gap: 14,
    overflow: 'hidden',
  },
  protocolHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  protocolLabel: { fontFamily: F.semiBold, fontSize: 15 },
  protocolSub: { fontFamily: F.mono, fontSize: 9, letterSpacing: 1.4, textTransform: 'uppercase' },
  protocolCardsRow: { flexDirection: 'row', gap: 12 },
  protocolOptionCard: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    alignItems: 'flex-start',
  },
  protocolIconWrap: {
    width: 36, height: 36,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 10,
  },
  protocolOptionCardLabel: { fontFamily: F.semiBold, fontSize: 13, marginBottom: 4 },
  protocolOptionCardDesc: { fontFamily: F.regular, fontSize: 11, lineHeight: 15 },
  protocolSyncFlash: { ...StyleSheet.absoluteFillObject, opacity: 0 },

  // Modal
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { width: '100%', maxWidth: 360, borderRadius: 20, borderWidth: 1, padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontFamily: F.bold, fontSize: 18 },
  modalSectionLabel: { fontFamily: F.semiBold, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 },
  iconGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  iconBtn: { width: 60, height: 60, borderRadius: 12, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  uploadBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 12, borderWidth: 1, gap: 8 },
  uploadBtnText: { fontFamily: F.medium, fontSize: 14 },
  fullSyncOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  syncContent: {
    alignItems: 'center',
    gap: 12,
  },
  syncIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  syncTitle: {
    fontFamily: F.monoBold,
    fontSize: 18,
    letterSpacing: 4,
  },
  syncSub: {
    fontFamily: F.mono,
    fontSize: 10,
    letterSpacing: 1,
  },
  syncBarBase: {
    width: 200,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginTop: 20,
    borderRadius: 1,
    overflow: 'hidden',
  },
  syncBarFill: {
    height: '100%',
    width: '100%',
  },
});
