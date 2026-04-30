/**
 * Settings screen — Arise System
 * Accessible from the Profile (stats) tab via the gear icon.
 */
import React, { useState } from 'react';
import {
  View, Text, ScrollView, Pressable, StyleSheet,
  Switch, Alert, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ArrowLeft, Sun, Moon, Smartphone, Bell, BellOff,
  Trash2, RotateCcw, Info, ChevronRight, Shield,
  Database, Palette, Zap, AlertTriangle, X,
} from 'lucide-react-native';
import { useTheme, ThemeMode } from '../../src/theme/ThemeContext';
import { useSystemStore } from '../../src/store/useSystemStore';
import { F } from '../../src/theme/fonts';
import { protocolAccent } from '../../src/theme/colors';

// ─── Section Header ───────────────────────────────────────────────────────────
function SectionHeader({ label, icon: Icon }: { label: string; icon: React.ComponentType<any> }) {
  const { colors: C } = useTheme();
  return (
    <View style={styles.sectionHeader}>
      <View style={[styles.sectionIconWrap, { backgroundColor: C.surface2, borderColor: C.border }]}>
        <Icon size={13} color={C.textMut} strokeWidth={2} />
      </View>
      <Text style={[styles.sectionLabel, { color: C.textMut }]}>{label.toUpperCase()}</Text>
    </View>
  );
}

// ─── Row variants ─────────────────────────────────────────────────────────────
function SettingRow({
  label, sub, onPress, destructive = false, chevron = true,
}: {
  label: string; sub?: string; onPress?: () => void; destructive?: boolean; chevron?: boolean;
}) {
  const { colors: C } = useTheme();
  const labelColor = destructive ? C.penalty : C.text;

  return (
    <Pressable
      style={({ pressed }) => [styles.row, { backgroundColor: pressed ? C.surface2 : 'transparent' }]}
      onPress={onPress}
    >
      <View style={{ flex: 1 }}>
        <Text style={[styles.rowLabel, { color: labelColor }]}>{label}</Text>
        {sub ? <Text style={[styles.rowSub, { color: C.textMut }]}>{sub}</Text> : null}
      </View>
      {chevron && <ChevronRight size={16} color={C.textMut} strokeWidth={1.8} />}
    </Pressable>
  );
}

function SettingToggleRow({
  label, sub, value, onValueChange,
}: {
  label: string; sub?: string; value: boolean; onValueChange: (v: boolean) => void;
}) {
  const { colors: C, isDark } = useTheme();
  return (
    <View style={[styles.row, { backgroundColor: 'transparent' }]}>
      <View style={{ flex: 1 }}>
        <Text style={[styles.rowLabel, { color: C.text }]}>{label}</Text>
        {sub ? <Text style={[styles.rowSub, { color: C.textMut }]}>{sub}</Text> : null}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: C.surface3, true: C.blue }}
        thumbColor={isDark ? '#ECEDF5' : '#FFFFFF'}
      />
    </View>
  );
}

// ─── Theme Picker ─────────────────────────────────────────────────────────────
function ThemePicker() {
  const { colors: C, mode, setMode } = useTheme();

  const options: { key: ThemeMode; label: string; Icon: React.ComponentType<any> }[] = [
    { key: 'light', label: 'Light', Icon: Sun },
    { key: 'auto',  label: 'Auto',  Icon: Smartphone },
    { key: 'dark',  label: 'Dark',  Icon: Moon },
  ];

  return (
    <View style={[styles.themePicker, { backgroundColor: C.surface2, borderColor: C.border }]}>
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
            <Icon size={14} color={active ? C.blue : C.textMut} strokeWidth={active ? 2.2 : 1.8} />
            <Text style={[styles.themeOptionText, { color: active ? C.blue : C.textMut },
              active && styles.themeOptionTextActive]}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// ─── Danger Zone Modal ────────────────────────────────────────────────────────
function DangerModal({
  visible, onClose, onConfirm, title, body, confirmLabel,
}: {
  visible: boolean; onClose: () => void; onConfirm: () => void;
  title: string; body: string; confirmLabel: string;
}) {
  const { colors: C } = useTheme();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.6)' }]}>
        <View style={[styles.dangerModal, { backgroundColor: C.surface, borderColor: C.border }]}>
          <View style={[styles.dangerIconWrap, { backgroundColor: 'rgba(239,68,68,0.12)' }]}>
            <AlertTriangle size={26} color="#EF4444" strokeWidth={2} />
          </View>
          <Text style={[styles.dangerTitle, { color: C.text }]}>{title}</Text>
          <Text style={[styles.dangerBody, { color: C.textSub }]}>{body}</Text>
          <View style={styles.dangerActions}>
            <Pressable
              style={[styles.dangerBtn, styles.dangerBtnCancel, { backgroundColor: C.surface2, borderColor: C.border }]}
              onPress={onClose}
            >
              <Text style={[styles.dangerBtnText, { color: C.text }]}>Cancel</Text>
            </Pressable>
            <Pressable
              style={[styles.dangerBtn, styles.dangerBtnConfirm, { backgroundColor: '#EF4444' }]}
              onPress={onConfirm}
            >
              <Text style={[styles.dangerBtnText, { color: '#fff' }]}>{confirmLabel}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ─── About Modal ──────────────────────────────────────────────────────────────
function AboutModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { colors: C, isDark } = useTheme();
  const activeProtocol = useSystemStore((s) => s.activeProtocol);
  const accent = protocolAccent(activeProtocol, isDark, C.blue);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
        <View style={[styles.aboutModal, { backgroundColor: C.surface, borderColor: C.border }]}>
          <View style={styles.aboutHeader}>
            <View style={[styles.aboutIconWrap, { backgroundColor: accent + '16', borderColor: accent + '40' }]}>
              <Zap size={22} color={accent} strokeWidth={2} />
            </View>
            <Pressable onPress={onClose} style={{ padding: 4 }}>
              <X size={20} color={C.textMut} />
            </Pressable>
          </View>

          <Text style={[styles.aboutAppName, { color: C.text }]}>Project Arise</Text>
          <Text style={[styles.aboutVersion, { color: C.textMut }]}>Version 1.0.0 · Alpha</Text>

          <View style={[styles.aboutDivider, { backgroundColor: C.border }]} />

          {[
            { label: 'Built with', value: 'Expo + React Native' },
            { label: 'State',      value: 'Zustand + AsyncStorage' },
            { label: 'Protocol',   value: activeProtocol === 'MONARCH' ? 'Monarch OS' : 'Sovereign OS' },
            { label: 'Author',     value: 'Usher Kielvin' },
          ].map(({ label, value }) => (
            <View key={label} style={styles.aboutRow}>
              <Text style={[styles.aboutRowLabel, { color: C.textMut }]}>{label}</Text>
              <Text style={[styles.aboutRowValue, { color: C.text }]}>{value}</Text>
            </View>
          ))}

          <Pressable
            style={[styles.aboutCloseBtn, { backgroundColor: C.surface2, borderColor: C.border }]}
            onPress={onClose}
          >
            <Text style={[styles.aboutCloseBtnText, { color: C.text }]}>Close</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function SettingsScreen() {
  const { colors: C, isDark } = useTheme();
  const router = useRouter();
  const store = useSystemStore();

  const activeProtocol = store.activeProtocol;
  const accent = protocolAccent(activeProtocol, isDark, C.blue);

  // Local toggle states (UI-only, not persisted yet — extend store if you need persistence)
  const [questNotifs,  setQuestNotifs]  = useState(true);
  const [habitNotifs,  setHabitNotifs]  = useState(true);
  const [penaltyAlert, setPenaltyAlert] = useState(true);

  // Modals
  const [resetQuestsModal,  setResetQuestsModal]  = useState(false);
  const [resetHabitsModal,  setResetHabitsModal]  = useState(false);
  const [clearLogsModal,    setClearLogsModal]    = useState(false);
  const [nukeDataModal,     setNukeDataModal]     = useState(false);
  const [aboutModal,        setAboutModal]        = useState(false);

  const handleResetQuests = () => {
    store.quests.forEach((q) => store.deleteQuest(q.id));
    setResetQuestsModal(false);
  };

  const handleResetHabits = () => {
    store.habits.forEach((h) => store.deleteHabit(h.id));
    setResetHabitsModal(false);
  };

  const handleClearTradeLogs = () => {
    store.tradeLogs.forEach((t) => store.deleteTradeLog(t.id));
    setClearLogsModal(false);
  };

  const handleNukeData = () => {
    store.quests.forEach((q) => store.deleteQuest(q.id));
    store.habits.forEach((h) => store.deleteHabit(h.id));
    store.tradeLogs.forEach((t) => store.deleteTradeLog(t.id));
    store.clearPenalty();
    setNukeDataModal(false);
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: C.void }]}>

      {/* ── Header ── */}
      <View style={[styles.header, { borderBottomColor: C.border }]}>
        <Pressable
          onPress={() => router.back()}
          style={[styles.backBtn, { backgroundColor: C.surface, borderColor: C.border }]}
        >
          <ArrowLeft size={18} color={C.text} strokeWidth={2} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: C.text }]}>Settings</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* ── Appearance ── */}
        <SectionHeader label="Appearance" icon={Palette} />
        <View style={[styles.card, { backgroundColor: C.surface, borderColor: C.border }]}>
          <View style={styles.themeRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.rowLabel, { color: C.text }]}>Color Theme</Text>
              <Text style={[styles.rowSub, { color: C.textMut }]}>Auto follows your device setting</Text>
            </View>
          </View>
          <ThemePicker />
        </View>

        {/* ── Notifications ── */}
        <SectionHeader label="Notifications" icon={Bell} />
        <View style={[styles.card, { backgroundColor: C.surface, borderColor: C.border }]}>
          <SettingToggleRow
            label="Quest Reminders"
            sub="Get reminded about active quests"
            value={questNotifs}
            onValueChange={setQuestNotifs}
          />
          <View style={[styles.rowDivider, { backgroundColor: C.border }]} />
          <SettingToggleRow
            label="Habit Alerts"
            sub="Daily nudge to check in habits"
            value={habitNotifs}
            onValueChange={setHabitNotifs}
          />
          <View style={[styles.rowDivider, { backgroundColor: C.border }]} />
          <SettingToggleRow
            label="Penalty Warnings"
            sub="Alert when penalty mode triggers"
            value={penaltyAlert}
            onValueChange={setPenaltyAlert}
          />
        </View>

        {/* ── Data Management ── */}
        <SectionHeader label="Data" icon={Database} />
        <View style={[styles.card, { backgroundColor: C.surface, borderColor: C.border }]}>
          <SettingRow
            label="Reset Quests"
            sub={`${store.quests.length} quest${store.quests.length !== 1 ? 's' : ''} stored`}
            onPress={() => setResetQuestsModal(true)}
            destructive
          />
          <View style={[styles.rowDivider, { backgroundColor: C.border }]} />
          <SettingRow
            label="Reset Habits"
            sub={`${store.habits.length} habit${store.habits.length !== 1 ? 's' : ''} stored`}
            onPress={() => setResetHabitsModal(true)}
            destructive
          />
          <View style={[styles.rowDivider, { backgroundColor: C.border }]} />
          <SettingRow
            label="Clear Trade Logs"
            sub={`${store.tradeLogs.length} log${store.tradeLogs.length !== 1 ? 's' : ''} stored`}
            onPress={() => setClearLogsModal(true)}
            destructive
          />
        </View>

        {/* ── Danger Zone ── */}
        <SectionHeader label="Danger Zone" icon={Shield} />
        <View style={[styles.card, styles.dangerCard, { backgroundColor: C.surface, borderColor: '#EF444440' }]}>
          <View style={[styles.dangerBanner, { backgroundColor: 'rgba(239,68,68,0.07)' }]}>
            <AlertTriangle size={14} color="#EF4444" strokeWidth={2} />
            <Text style={styles.dangerBannerText}>These actions are irreversible.</Text>
          </View>
          <SettingRow
            label="Wipe All Data"
            sub="Deletes all quests, habits & trade logs"
            onPress={() => setNukeDataModal(true)}
            destructive
          />
        </View>

        {/* ── System ── */}
        <SectionHeader label="System" icon={Info} />
        <View style={[styles.card, { backgroundColor: C.surface, borderColor: C.border }]}>
          <SettingRow
            label="Active Protocol"
            sub={activeProtocol === 'MONARCH' ? 'Monarch OS — Habit & Quest Tracker' : 'Sovereign OS — Traders Terminal'}
            chevron={false}
          />
          <View style={[styles.rowDivider, { backgroundColor: C.border }]} />
          <SettingRow
            label="About Arise"
            sub="Version, build info & credits"
            onPress={() => setAboutModal(true)}
          />
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ── Modals ── */}
      <DangerModal
        visible={resetQuestsModal}
        onClose={() => setResetQuestsModal(false)}
        onConfirm={handleResetQuests}
        title="Reset All Quests?"
        body="This will permanently delete all your active and completed quests. XP earned will remain."
        confirmLabel="Delete Quests"
      />
      <DangerModal
        visible={resetHabitsModal}
        onClose={() => setResetHabitsModal(false)}
        onConfirm={handleResetHabits}
        title="Reset All Habits?"
        body="This will permanently delete all your habits and their streak history. XP earned will remain."
        confirmLabel="Delete Habits"
      />
      <DangerModal
        visible={clearLogsModal}
        onClose={() => setClearLogsModal(false)}
        onConfirm={handleClearTradeLogs}
        title="Clear Trade Logs?"
        body="All trade log entries will be permanently removed. This cannot be undone."
        confirmLabel="Clear Logs"
      />
      <DangerModal
        visible={nukeDataModal}
        onClose={() => setNukeDataModal(false)}
        onConfirm={handleNukeData}
        title="Wipe All Data?"
        body="This will permanently delete ALL quests, habits, and trade logs. Your level and XP will remain, but all activity records will be gone forever."
        confirmLabel="Wipe Everything"
      />
      <AboutModal visible={aboutModal} onClose={() => setAboutModal(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: {
    fontFamily: F.semiBold,
    fontSize: 17,
    letterSpacing: -0.3,
  },
  backBtn: {
    width: 38, height: 38,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Scroll
  scroll: { paddingTop: 12, paddingHorizontal: 16 },

  // Section header
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 20,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  sectionIconWrap: {
    width: 22, height: 22,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionLabel: {
    fontFamily: F.monoBold,
    fontSize: 9,
    letterSpacing: 2,
  },

  // Card
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  dangerCard: {
    borderWidth: 1,
  },
  dangerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  dangerBannerText: {
    fontFamily: F.medium,
    fontSize: 12,
    color: '#EF4444',
  },

  // Row
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
    minHeight: 54,
  },
  rowLabel: {
    fontFamily: F.medium,
    fontSize: 15,
    letterSpacing: -0.1,
  },
  rowSub: {
    fontFamily: F.regular,
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
  rowDivider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 16,
  },

  // Theme row
  themeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
  },
  themePicker: {
    flexDirection: 'row',
    borderRadius: 10,
    borderWidth: 1,
    padding: 3,
    gap: 2,
    marginHorizontal: 16,
    marginBottom: 14,
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

  // Danger modal
  modalOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  dangerModal: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    gap: 12,
  },
  dangerIconWrap: {
    width: 52, height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  dangerTitle: {
    fontFamily: F.bold,
    fontSize: 18,
    letterSpacing: -0.4,
    textAlign: 'center',
  },
  dangerBody: {
    fontFamily: F.regular,
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
  },
  dangerActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
    width: '100%',
  },
  dangerBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  dangerBtnCancel: {},
  dangerBtnConfirm: { borderColor: 'transparent' },
  dangerBtnText: {
    fontFamily: F.semiBold,
    fontSize: 14,
  },

  // About modal
  aboutModal: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    gap: 8,
  },
  aboutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  aboutIconWrap: {
    width: 46, height: 46,
    borderRadius: 13,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aboutAppName: {
    fontFamily: F.bold,
    fontSize: 22,
    letterSpacing: -0.6,
  },
  aboutVersion: {
    fontFamily: F.mono,
    fontSize: 11,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  aboutDivider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 8,
  },
  aboutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  aboutRowLabel: {
    fontFamily: F.regular,
    fontSize: 13,
  },
  aboutRowValue: {
    fontFamily: F.medium,
    fontSize: 13,
  },
  aboutCloseBtn: {
    marginTop: 12,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  aboutCloseBtnText: {
    fontFamily: F.semiBold,
    fontSize: 14,
  },
});
