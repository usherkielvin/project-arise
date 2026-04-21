/**
 * Inventory — 4×4 grid of Milestone Collectibles.
 * Empty squares until a milestone is earned. Long-press for item details.
 */
import React, { useState } from 'react';
import {
  View, Text, ScrollView,
  Pressable, StyleSheet, Dimensions, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { C, Rarity, RARITY_COLOR } from '../../src/theme/colors';
import { F } from '../../src/theme/fonts';

const W = Dimensions.get('window').width;
const COLS = 4;
const CELL = (W - 48) / COLS; // 24px side padding × 2

interface ArtifactItem {
  id: number;
  icon: string;
  name: string;
  type: string;
  rarity: Rarity;
  effect: string;
  earned: boolean;
}

const ARTIFACTS: ArtifactItem[] = [
  { id: 1,  icon: '⌨️', name: "Architect's Keyboard",   type: 'Weapon',     rarity: 'Legendary', effect: '+20 INT · Activates 25-min Pomodoro', earned: true  },
  { id: 2,  icon: '👁️', name: "Trader's Eye",            type: 'Amulet',     rarity: 'Rare',      effect: '+5 PER · 30-min analysis boost',      earned: true  },
  { id: 3,  icon: '🎓', name: 'Scholar ID: NU MOA',      type: 'Artifact',   rarity: 'Epic',      effect: '×1.5 EXP during school hours',         earned: true  },
  { id: 4,  icon: '☕', name: 'Mana Elixir',             type: 'Consumable', rarity: 'Common',    effect: '+10 Focus for 2 hours',                earned: true  },
  { id: 5,  icon: '🔑', name: 'Vercel Deploy Key',       type: 'Material',   rarity: 'Common',    effect: 'Crafting material ×1',                 earned: false },
  { id: 6,  icon: '📱', name: 'Mobile Build Badge',      type: 'Artifact',   rarity: 'Rare',      effect: '+8 INT after first EAS build',         earned: false },
  { id: 7,  icon: '⚡', name: 'Sprint Protocol',         type: 'Consumable', rarity: 'Common',    effect: 'STR +5 for 1 day',                     earned: false },
  { id: 8,  icon: '🏆', name: 'Semester Raid Clear',     type: 'Trophy',     rarity: 'Epic',      effect: 'Title: "MWA Specialist" unlocked',     earned: false },
];

// Pad to fill the 4×4 grid (16 slots total)
const TOTAL_SLOTS = 16;
const GRID_ITEMS = [
  ...ARTIFACTS,
  ...Array.from({ length: TOTAL_SLOTS - ARTIFACTS.length }, (_, i) => null as null),
];

export default function InventoryScreen() {
  const [selected, setSelected] = useState<ArtifactItem | null>(null);
  const earnedCount = ARTIFACTS.filter(a => a.earned).length;

  return (
    <SafeAreaView style={styles.root}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <Text style={styles.eyebrow}>HUNTER'S CACHE</Text>
        <View style={styles.titleRow}>
          <Text style={styles.title}>Artifacts</Text>
          <View style={styles.goldPill}>
            <Text style={styles.goldIcon}>✦</Text>
            <Text style={styles.goldVal}>340</Text>
            <Text style={styles.goldSub}> GOLD</Text>
          </View>
        </View>
        <Text style={styles.subtitle}>{earnedCount} of {TOTAL_SLOTS} slots unlocked</Text>
      </View>

      <View style={styles.hairline} />

      {/* ── Grid ── */}
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.grid}>
          {GRID_ITEMS.map((item, idx) => {
            if (!item) {
              return (
                <View key={`empty-${idx}`} style={styles.cell}>
                  <View style={styles.emptySlot}>
                    <Text style={styles.emptyDot}>·</Text>
                  </View>
                </View>
              );
            }
            const rarityColor = RARITY_COLOR[item.rarity];
            return (
              <Pressable
                key={item.id}
                style={styles.cell}
                onLongPress={() => setSelected(item)}
                delayLongPress={300}
              >
                <View style={[
                  styles.filledSlot,
                  { borderColor: item.earned ? `${rarityColor}40` : C.border },
                  !item.earned && styles.slotLocked,
                ]}>
                  {item.earned ? (
                    <>
                      {/* Rarity dot */}
                      <View style={[styles.rarityDot, { backgroundColor: rarityColor }]} />
                      <Text style={styles.itemIcon}>{item.icon}</Text>
                    </>
                  ) : (
                    <Text style={styles.lockedIcon}>?</Text>
                  )}
                </View>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.hint}>
          <Text style={styles.hintText}>HOLD AN ITEM TO INSPECT · EARN BY COMPLETING MILESTONES</Text>
        </View>
      </ScrollView>

      {/* ── Item Detail Modal ── */}
      <Modal
        transparent
        visible={!!selected}
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setSelected(null)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setSelected(null)}>
          <View style={styles.modalCard}>
            {selected && (() => {
              const rc = RARITY_COLOR[selected.rarity];
              return (
                <>
                  {/* Rarity strip */}
                  <View style={[styles.modalStrip, { backgroundColor: rc }]} />

                  <View style={styles.modalBody}>
                    <Text style={styles.modalIcon}>{selected.icon}</Text>
                    <View style={styles.modalInfo}>
                      <Text style={[styles.modalRarity, { color: rc }]}>
                        {selected.rarity.toUpperCase()} · {selected.type.toUpperCase()}
                      </Text>
                      <Text style={styles.modalName}>{selected.name}</Text>
                    </View>
                  </View>

                  <View style={styles.modalDivider} />

                  <Text style={styles.modalEffect}>{selected.effect}</Text>

                  <Pressable onPress={() => setSelected(null)} style={styles.modalClose}>
                    <Text style={styles.modalCloseText}>CLOSE</Text>
                  </Pressable>
                </>
              );
            })()}
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.void },

  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
    gap: 8,
  },
  eyebrow: {
    fontFamily: F.mono,
    fontSize: 9,
    color: C.blue,
    letterSpacing: 4,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontFamily: F.bold,
    fontSize: 28,
    color: C.text,
    letterSpacing: -0.5,
  },
  goldPill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: 'rgba(245,158,11,0.4)',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: 'rgba(245,158,11,0.06)',
  },
  goldIcon: { color: C.gold, fontSize: 12 },
  goldVal:  { fontFamily: F.monoBold, fontSize: 16, color: C.gold, marginLeft: 4 },
  goldSub:  { fontFamily: F.mono, fontSize: 9, color: 'rgba(245,158,11,0.5)', letterSpacing: 1 },

  subtitle: {
    fontFamily: F.regular,
    fontSize: 12,
    color: C.textMut,
  },

  hairline: { height: 0.5, backgroundColor: C.border },

  scroll: { paddingBottom: 110 },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 24,
    paddingTop: 24,
    gap: 0,
  },

  cell: {
    width: CELL,
    height: CELL,
    padding: 4,
  },

  emptySlot: {
    flex: 1,
    borderWidth: 0.5,
    borderColor: C.border,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyDot: {
    color: C.textFnt,
    fontSize: 20,
  },

  filledSlot: {
    flex: 1,
    borderWidth: 0.5,
    borderRadius: 4,
    backgroundColor: C.surface,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  slotLocked: {
    opacity: 0.3,
  },
  rarityDot: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  itemIcon: {
    fontSize: 26,
  },
  lockedIcon: {
    fontFamily: F.monoBold,
    fontSize: 16,
    color: C.textMut,
  },

  hint: {
    paddingHorizontal: 24,
    paddingTop: 20,
    alignItems: 'center',
  },
  hintText: {
    fontFamily: F.mono,
    fontSize: 7,
    color: C.textFnt,
    letterSpacing: 2,
    textAlign: 'center',
    lineHeight: 14,
  },

  // -- Modal --
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: C.surface,
    borderTopWidth: 0.5,
    borderTopColor: C.border,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: 'hidden',
  },
  modalStrip: {
    height: 2,
  },
  modalBody: {
    flexDirection: 'row',
    gap: 16,
    padding: 24,
    alignItems: 'center',
  },
  modalIcon: {
    fontSize: 44,
  },
  modalInfo: { flex: 1, gap: 4 },
  modalRarity: {
    fontFamily: F.mono,
    fontSize: 9,
    letterSpacing: 2,
  },
  modalName: {
    fontFamily: F.bold,
    fontSize: 20,
    color: C.text,
    letterSpacing: -0.3,
  },
  modalDivider: {
    height: 0.5,
    backgroundColor: C.border,
    marginHorizontal: 24,
  },
  modalEffect: {
    fontFamily: F.mono,
    fontSize: 11,
    color: C.textSub,
    letterSpacing: 1,
    padding: 24,
    lineHeight: 18,
  },
  modalClose: {
    marginHorizontal: 24,
    marginBottom: 32,
    paddingVertical: 13,
    borderWidth: 0.5,
    borderColor: C.border,
    borderRadius: 6,
    alignItems: 'center',
  },
  modalCloseText: {
    fontFamily: F.mono,
    fontSize: 10,
    color: C.textMut,
    letterSpacing: 3,
  },
});
