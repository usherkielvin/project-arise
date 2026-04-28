import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../src/theme/ThemeContext';
import { F } from '../../src/theme/fonts';
import { useSystemStore } from '../../src/store/useSystemStore';
import { Plus, X } from 'lucide-react-native';
import Animated, { SlideInRight, SlideOutRight } from 'react-native-reanimated';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getLocalDateString } from '../../src/utils/date';

function formatLongDate(dateStr: string) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'short'
    });
}

export default function JournalScreen() {
  const { colors: C } = useTheme();
  const store = useSystemStore();
  const router = useRouter();
  const params = useLocalSearchParams<{ openDate?: string; aiPrompt?: string }>();
  const [editingDate, setEditingDate] = useState<string | null>(null);

  const sortedJournals = [...store.journals].sort((a, b) => b.date.localeCompare(a.date));

  const openToday = () => {
    const today = getLocalDateString(new Date());
    setEditingDate(today);
  };

  useEffect(() => {
    if (typeof params.openDate === 'string' && params.openDate.trim().length > 0) {
      setEditingDate(params.openDate);
    }
  }, [params.openDate]);

  useEffect(() => {
    if (typeof params.aiPrompt === 'string' && params.aiPrompt.trim().length > 0) {
      setEditingDate(getLocalDateString(new Date()));
      router.setParams({ aiPrompt: undefined });
    }
  }, [params.aiPrompt, router]);

  if (editingDate) {
    return (
      <LogEntryView 
        dateStr={editingDate} 
        onClose={() => {
          setEditingDate(null);
          if (typeof params.openDate === 'string') {
            router.setParams({ openDate: undefined });
          }
        }} 
      />
    );
  }

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: C.void }]}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.listTitle, { color: C.text }]}>Journal</Text>
          <Text style={[styles.subtitle, { color: C.textMut }]}>Daily logs and reflections.</Text>
        </View>
        <Pressable onPress={openToday} style={styles.addBtn}>
          <Plus size={24} color={C.text} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.listContent}>
        {sortedJournals.length === 0 ? (
            <View style={styles.emptyState}>
                <Text style={[styles.emptyText, { color: C.textMut }]}>No logs recorded yet.</Text>
            </View>
        ) : (
            sortedJournals.map((entry) => {
                const hasContent = entry.content && entry.content.trim().length > 0;
                return (
                  <Pressable 
                      key={entry.date} 
                      onPress={() => setEditingDate(entry.date)}
                      style={({ pressed }) => [
                          styles.entryCard,
                          { 
                            backgroundColor: C.surface, 
                            borderColor: C.border,
                            opacity: pressed ? 0.7 : 1,
                            transform: [{ scale: pressed ? 0.98 : 1 }]
                          }
                      ]}
                  >
                      <View style={styles.entryInfo}>
                          <Text style={[styles.entryDate, { color: C.text }]}>{formatLongDate(entry.date)}</Text>
                          <Text style={[styles.entrySnippet, { color: hasContent ? C.textSub : C.textMut }]} numberOfLines={2}>
                              {hasContent ? entry.content.trim() : "No content recorded."}
                          </Text>
                      </View>
                  </Pressable>
                );
            })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function LogEntryView({ dateStr, onClose }: { dateStr: string, onClose: () => void }) {
    const { colors: C } = useTheme();
    const store = useSystemStore();
    const existingEntry = store.journals.find(j => j.date === dateStr)?.content || '';
    const [text, setText] = useState(existingEntry);
    const textRef = useRef(existingEntry);
    const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleTextChange = (val: string) => {
        setText(val);
        textRef.current = val;
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = setTimeout(() => {
          store.saveJournal(dateStr, val);
          saveTimeoutRef.current = null;
        }, 300);
    };

    useEffect(() => {
      return () => {
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        const finalVal = textRef.current;
        // Defer save to next tick to prevent React unmount loop crash
        setTimeout(() => {
          useSystemStore.getState().saveJournal(dateStr, finalVal);
        }, 0);
      };
    }, [dateStr]);

    return (
        <Animated.View 
            entering={SlideInRight.duration(250)} 
            exiting={SlideOutRight.duration(200)}
            style={[StyleSheet.absoluteFill, { backgroundColor: C.void, zIndex: 100 }]}
        >
            <SafeAreaView style={{ flex: 1 }}>
                <View style={styles.editorHeader}>
                    <Text style={[styles.editorDate, { color: C.text }]}>Journal</Text>
                    <Pressable onPress={() => { 
                      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
                      useSystemStore.getState().saveJournal(dateStr, textRef.current);
                      onClose(); 
                    }} style={styles.closeBtn}>
                        <X size={28} color={C.text} />
                    </Pressable>
                </View>

                <KeyboardAvoidingView 
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={{ flex: 1 }}
                >
                    <TextInput
                        style={[styles.editorInput, { color: C.text }]}
                        placeholder="How did you feel today? What were your thoughts? What did you achieve?"
                        placeholderTextColor={C.textMut}
                        multiline
                        scrollEnabled
                        autoFocus
                        value={text}
                        onChangeText={handleTextChange}
                        textAlignVertical="top"
                    />
                </KeyboardAvoidingView>
            </SafeAreaView>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 20,
  },
  listTitle: {
    fontFamily: F.bold,
    fontSize: 28,
  },
  subtitle: {
    fontFamily: F.regular,
    fontSize: 13,
    marginTop: 2,
  },
  addBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 120,
    gap: 12,
  },
  entryCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  entryInfo: {
    flex: 1,
  },
  entryDate: {
    fontFamily: F.bold,
    fontSize: 15,
    letterSpacing: -0.2,
    marginBottom: 6,
  },
  entrySnippet: {
    fontFamily: F.regular,
    fontSize: 14,
    lineHeight: 22,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    fontFamily: F.regular,
    fontSize: 16,
  },

  // Editor
  editorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
  },
  editorDate: {
    fontFamily: F.bold,
    fontSize: 24,
  },
  closeBtn: {
    padding: 4,
  },
  editorInput: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    fontFamily: F.regular,
    fontSize: 16,
    lineHeight: 24,
  },
});
