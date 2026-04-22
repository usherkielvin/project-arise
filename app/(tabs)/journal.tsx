import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../src/theme/ThemeContext';
import { F } from '../../src/theme/fonts';
import { useSystemStore, JournalEntry } from '../../src/store/useSystemStore';
import { Plus, X, ChevronDown, ChevronRight } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeOut, SlideInRight, SlideOutRight } from 'react-native-reanimated';

function getLocalDateString(d: Date) {
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split('T')[0];
}

function formatDisplayDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  });
}

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
  const [editingDate, setEditingDate] = useState<string | null>(null);

  const sortedJournals = [...store.journals].sort((a, b) => b.date.localeCompare(a.date));

  const openToday = () => {
    const today = getLocalDateString(new Date());
    setEditingDate(today);
  };

  if (editingDate) {
    return (
      <LogEntryView 
        dateStr={editingDate} 
        onClose={() => setEditingDate(null)} 
      />
    );
  }

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: C.void }]}>
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
            <Text style={[styles.listTitle, { color: C.text }]}>Journal</Text>
            <ChevronDown size={20} color={C.text} style={{ marginLeft: 4, marginTop: 4 }} />
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
            sortedJournals.map((entry) => (
                <Pressable 
                    key={entry.date} 
                    onPress={() => setEditingDate(entry.date)}
                    style={({ pressed }) => [
                        styles.entryRow,
                        { borderBottomColor: C.border, opacity: pressed ? 0.7 : 1 }
                    ]}
                >
                    <View style={styles.entryInfo}>
                        <Text style={[styles.entryDate, { color: C.text }]}>{formatLongDate(entry.date)}</Text>
                        <Text style={[styles.entrySnippet, { color: C.textMut }]} numberOfLines={1}>
                            {entry.content || "No content recorded."}
                        </Text>
                    </View>
                    <ChevronRight size={18} color={C.textMut} />
                </Pressable>
            ))
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

    const handleTextChange = (val: string) => {
        setText(val);
        store.saveJournal(dateStr, val);
    };

    return (
        <Animated.View 
            entering={SlideInRight.duration(250)} 
            exiting={SlideOutRight.duration(200)}
            style={[StyleSheet.absoluteFill, { backgroundColor: C.void, zIndex: 100 }]}
        >
            <SafeAreaView style={{ flex: 1 }}>
                <View style={styles.editorHeader}>
                    <Text style={[styles.editorDate, { color: C.text }]}>{formatDisplayDate(dateStr)}</Text>
                    <Pressable onPress={onClose} style={styles.closeBtn}>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listTitle: {
    fontFamily: F.bold,
    fontSize: 28,
  },
  addBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingHorizontal: 20,
  },
  entryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    borderBottomWidth: 0.5,
  },
  entryInfo: {
    flex: 1,
  },
  entryDate: {
    fontFamily: F.semiBold,
    fontSize: 16,
    marginBottom: 4,
  },
  entrySnippet: {
    fontFamily: F.regular,
    fontSize: 14,
    opacity: 0.8,
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
