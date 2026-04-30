import { Tabs, useRouter } from 'expo-router';
import { LayoutDashboard, User, BookOpen, Flame, FileText, Notebook, Sparkles, ScrollText, Scroll, ChartCandlestick, History, SlidersHorizontal, ArrowUp, Plus, X } from 'lucide-react-native';
import { KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { BlurView } from 'expo-blur';
import React, { useMemo, useState } from 'react';
import { useTheme } from '../../src/theme/ThemeContext';
import { F } from '../../src/theme/fonts';
import { useSystemStore } from '../../src/store/useSystemStore';
import { protocolAccent } from '../../src/theme/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getLocalDateString } from '../../src/utils/date';
import { resolveAiTargetTab } from '../../src/utils/aiRouting';

export default function TabLayout() {
  const { colors: C, isDark } = useTheme();
  const activeProtocol = useSystemStore((s) => s.activeProtocol);
  const activeTint = protocolAccent(activeProtocol, isDark, C.blue);
  const [aiMenuOpen, setAiMenuOpen] = useState(false);
  const [aiComposerOpen, setAiComposerOpen] = useState(false);
  const [aiText, setAiText] = useState('');
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const bottomOffset = 94;
  const isMonarch = activeProtocol === 'MONARCH';
  const isFinance = activeProtocol === 'FINANCE';

  const quickActions = useMemo(() => {
    const actions: { key: string; label: string; icon: React.ComponentType<any>; onPress: () => void }[] = [];
    if (isMonarch) {
      actions.push(
        {
          key: 'quest',
          label: 'New Quest',
          icon: Scroll,
          onPress: () => router.push({ pathname: '/(tabs)/quests', params: { aiCreate: '1' } }),
        },
        {
          key: 'habit',
          label: 'New Habit',
          icon: Flame,
          onPress: () => router.push({ pathname: '/(tabs)/habits', params: { aiCreate: '1' } }),
        },
        {
          key: 'journal',
          label: 'New Journal Log',
          icon: ScrollText,
          onPress: () => {
            const openDate = getLocalDateString(new Date());
            router.push({ pathname: '/(tabs)/journal', params: { openDate } });
          },
        },
      );
    }

    if (isFinance) {
      actions.push({
        key: 'trade',
        label: 'New Trade Log',
        icon: ChartCandlestick,
        onPress: () => router.push({ pathname: '/(tabs)/terminal', params: { aiCreate: '1' } }),
      });
    }

    return actions;
  }, [isMonarch, isFinance, router]);

  const handleAiSubmit = () => {
    const text = aiText.trim();
    if (!text) return;
    router.push({ pathname: resolveAiTargetTab(text), params: { aiPrompt: text } });

    setAiText('');
    setAiComposerOpen(false);
    setAiMenuOpen(false);
  };

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: activeTint,
          tabBarInactiveTintColor: C.textMut,
          tabBarStyle: {
            position: 'absolute',
            borderTopWidth: 0,
            backgroundColor: 'transparent',
            elevation: 0,
            height: 84,
            paddingBottom: 26,
          },
          tabBarBackground: () => (
            <BlurView
              intensity={80}
              tint={isDark ? 'dark' : 'light'}
              style={StyleSheet.absoluteFill}
            >
              <View style={[styles.topHairline, { backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)' }]} />
            </BlurView>
          ),
          tabBarLabelStyle: {
            fontFamily: F.medium,
            fontSize: 10,
            letterSpacing: 0.2,
            marginBottom: 2,
          },
          tabBarIconStyle: {
            marginTop: 8,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            href: activeProtocol === 'MONARCH' ? undefined : null,
            title: 'Home',
            tabBarIcon: ({ color }) => <LayoutDashboard color={color} size={20} strokeWidth={1.8} />,
          }}
        />
        <Tabs.Screen
          name="quests"
          options={{
            href: activeProtocol === 'MONARCH' ? undefined : null,
            title: 'Quests',
            tabBarIcon: ({ color }) => <BookOpen color={color} size={20} strokeWidth={1.8} />,
          }}
        />
        <Tabs.Screen
          name="habits"
          options={{
            href: activeProtocol === 'MONARCH' ? undefined : null,
            title: 'Habits',
            tabBarIcon: ({ color }) => <Flame color={color} size={20} strokeWidth={1.8} />,
          }}
        />
        <Tabs.Screen
          name="journal"
          options={{
            href: activeProtocol === 'MONARCH' ? undefined : null,
            title: 'Journal',
            tabBarIcon: ({ color }) => <Notebook color={color} size={20} strokeWidth={1.8} />,
          }}
        />
        <Tabs.Screen
          name="pulse"
          options={{
            href: activeProtocol === 'FINANCE' ? undefined : null,
            title: 'Pulse',
            tabBarIcon: ({ color }) => <LayoutDashboard color={color} size={20} strokeWidth={1.8} />,
          }}
        />
        <Tabs.Screen
          name="terminal"
          options={{
            href: activeProtocol === 'FINANCE' ? undefined : null,
            title: 'Terminal',
            tabBarIcon: ({ color }) => <Notebook color={color} size={20} strokeWidth={1.8} />,
          }}
        />
        <Tabs.Screen
          name="news"
          options={{
            href: activeProtocol === 'FINANCE' ? undefined : null,
            title: 'News',
            tabBarIcon: ({ color }) => <BookOpen color={color} size={20} strokeWidth={1.8} />,
          }}
        />
        <Tabs.Screen
          name="vault"
          options={{
            href: activeProtocol === 'FINANCE' ? undefined : null,
            title: 'Vault',
            tabBarIcon: ({ color }) => <FileText color={color} size={20} strokeWidth={1.8} />,
          }}
        />
        <Tabs.Screen
          name="stats"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color }) => <User color={color} size={20} strokeWidth={1.8} />,
          }}
        />
        <Tabs.Screen
          name="inventory"
          options={{ href: null }}
        />
        <Tabs.Screen
          name="settings"
          options={{ href: null }}
        />
      </Tabs>

      {quickActions.length > 0 && (
        <>
          <Modal visible={aiComposerOpen} transparent animationType="fade" onRequestClose={() => setAiComposerOpen(false)}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.fullscreenWrap}>
              <View style={[styles.fullscreenSurface, { backgroundColor: C.void }]}>
                <View style={[styles.aiTopRow, { paddingTop: Math.max(insets.top + 6, 18) }]}>
                  <Pressable style={[styles.topIconBtn, { borderColor: C.border, backgroundColor: C.surface }]} onPress={() => setAiMenuOpen((v) => !v)}>
                    <History size={16} color={C.textMut} />
                  </Pressable>
                  <View style={styles.aiIdentity}>
                    <View style={[styles.aiBadgeCircle, { backgroundColor: C.surface }]}>
                      <Sparkles size={20} color={C.text} />
                    </View>
                    <View style={[styles.aiBadgeLabel, { borderColor: C.border, backgroundColor: C.surface }]}>
                      <Text style={[styles.aiBadgeLabelText, { color: C.text }]}>Arise AI</Text>
                    </View>
                  </View>
                  <Pressable style={[styles.topIconBtn, { borderColor: C.border, backgroundColor: C.surface }]} onPress={() => setAiComposerOpen(false)}>
                    <X size={16} color={C.textMut} />
                  </Pressable>
                </View>

                <View style={[styles.composerWrap, { paddingBottom: Math.max(insets.bottom + 10, 14) }]}>
                  <View style={[styles.composerShell, { backgroundColor: C.surface, borderColor: C.border }]}>
                    <TextInput
                      value={aiText}
                      onChangeText={setAiText}
                      placeholder="Ask, search, or make anything..."
                      placeholderTextColor={C.textSub}
                      style={[styles.composerInput, { color: C.text }]}
                      autoFocus
                      multiline
                    />
                    <View style={styles.composerActions}>
                      <View style={styles.composerLeft}>
                        <Pressable style={styles.smallIconBtn}>
                          <Plus size={18} color={C.textMut} />
                        </Pressable>
                        <Pressable style={styles.smallIconBtn}>
                          <SlidersHorizontal size={18} color={C.textMut} />
                        </Pressable>
                      </View>
                      <Pressable
                        style={[styles.sendBtn, { backgroundColor: aiText.trim() ? C.text : C.surface2 }]}
                        onPress={handleAiSubmit}
                        disabled={!aiText.trim()}
                      >
                        <ArrowUp size={14} color={aiText.trim() ? C.void : C.textMut} />
                      </Pressable>
                    </View>
                  </View>
                </View>
              </View>
            </KeyboardAvoidingView>
          </Modal>

          {aiMenuOpen && (
            <View style={[styles.aiMenu, { bottom: bottomOffset + 68, backgroundColor: C.surface, borderColor: C.border }]}>
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Pressable
                    key={action.key}
                    style={[styles.aiAction, { borderBottomColor: C.border }]}
                    onPress={() => {
                      setAiMenuOpen(false);
                      action.onPress();
                    }}
                  >
                    <Icon size={14} color={C.textMut} strokeWidth={2.1} />
                    <Text style={[styles.aiActionText, { color: C.text }]}>{action.label}</Text>
                  </Pressable>
                );
              })}
            </View>
          )}

          <Pressable
            onPress={() => {
              setAiMenuOpen(false);
              setAiComposerOpen(true);
            }}
            onLongPress={() => setAiMenuOpen((v) => !v)}
            style={[
              styles.aiFab,
              { bottom: bottomOffset, backgroundColor: C.blue, borderColor: C.blueBorder },
            ]}
          >
            <Sparkles size={22} color="#fff" strokeWidth={2.2} />
          </Pressable>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  topHairline: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 0.5,
  },
  aiFab: {
    position: 'absolute',
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.22,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 7,
  },
  aiMenu: {
    position: 'absolute',
    right: 16,
    minWidth: 190,
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  aiAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  aiActionText: {
    fontFamily: F.medium,
    fontSize: 13,
  },
  fullscreenWrap: {
    flex: 1,
  },
  fullscreenSurface: {
    flex: 1,
  },
  aiTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
  },
  topIconBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiIdentity: {
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  aiBadgeCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiBadgeLabel: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  aiBadgeLabelText: {
    fontFamily: F.medium,
    fontSize: 13,
  },
  composerWrap: {
    marginTop: 'auto',
    paddingHorizontal: 12,
  },
  composerShell: {
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 8,
    gap: 8,
  },
  composerInput: {
    minHeight: 32,
    maxHeight: 120,
    fontFamily: F.regular,
    fontSize: 16,
    lineHeight: 22,
    textAlignVertical: 'top',
  },
  composerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  composerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  smallIconBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
