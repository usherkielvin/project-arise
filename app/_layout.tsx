import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useRef } from 'react';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import '../global.css';

import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';

import {
  JetBrainsMono_400Regular,
  JetBrainsMono_700Bold,
} from '@expo-google-fonts/jetbrains-mono';

import { ThemeProvider, useTheme } from '../src/theme/ThemeContext';
import { useSystemStore } from '../src/store/useSystemStore';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { F } from '../src/theme/fonts';
import { ShieldAlert } from 'lucide-react-native';

void SplashScreen.preventAutoHideAsync().catch(() => {
  // During fast refresh/reload, splash may already be managed.
});

export const unstable_settings = { anchor: '(tabs)' };

function AppShell() {
  const { isDark } = useTheme();
  const { checkMidnightReset, penaltyMode, clearPenalty } = useSystemStore();

  useEffect(() => {
    checkMidnightReset();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Penalty Mode Overlay */}
      {penaltyMode && (
        <View style={StyleSheet.absoluteFill}>
          <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]} pointerEvents="none" />
          <View style={styles.penaltyOverlay}>
            <View style={styles.penaltyCard}>
              <ShieldAlert size={48} color="#EF4444" strokeWidth={1.5} />
              <Text style={styles.penaltyTitle}>System Alert</Text>
              <Text style={styles.penaltyText}>
                You failed to complete all protocols yesterday. The system has initiated Penalty Mode.
              </Text>
              <View style={styles.recoveryBox}>
                <Text style={styles.recoveryLabel}>Recovery Task</Text>
                <Text style={styles.recoveryTask}>Complete 100 Push-ups, 100 Sit-ups, 100 Squats, and a 10km Run.</Text>
              </View>
              <Pressable style={styles.penaltyBtn} onPress={clearPenalty}>
                <Text style={styles.penaltyBtnText}>Acknowledge & Clear</Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

export default function RootLayout() {
  const didHideSplashRef = useRef(false);
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    JetBrainsMono_400Regular,
    JetBrainsMono_700Bold,
  });

  useEffect(() => {
    if ((fontsLoaded || fontError) && !didHideSplashRef.current) {
      didHideSplashRef.current = true;
      void SplashScreen.hideAsync().catch(() => {
        // Ignore race conditions when native splash is already hidden.
      });
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppShell />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  penaltyOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  penaltyCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    gap: 16,
    width: '100%',
    shadowColor: '#EF4444',
    shadowOpacity: 0.3,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
  },
  penaltyTitle: {
    fontFamily: F.bold,
    fontSize: 24,
    color: '#EF4444',
    letterSpacing: -0.5,
  },
  penaltyText: {
    fontFamily: F.regular,
    fontSize: 14,
    color: '#374151',
    textAlign: 'center',
    lineHeight: 20,
  },
  recoveryBox: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    gap: 4,
  },
  recoveryLabel: {
    fontFamily: F.monoBold,
    fontSize: 10,
    color: '#EF4444',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  recoveryTask: {
    fontFamily: F.medium,
    fontSize: 14,
    color: '#7F1D1D',
    lineHeight: 20,
  },
  penaltyBtn: {
    backgroundColor: '#EF4444',
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  penaltyBtnText: {
    fontFamily: F.semiBold,
    fontSize: 14,
    color: '#fff',
  },
});
