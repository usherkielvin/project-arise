import { Tabs } from 'expo-router';
import { LayoutDashboard, User, BookOpen, Flame, FileText, Notebook } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '../../src/theme/ThemeContext';
import { F } from '../../src/theme/fonts';
import { useSystemStore } from '../../src/store/useSystemStore';
import { protocolAccent } from '../../src/theme/colors';

export default function TabLayout() {
  const { colors: C, isDark } = useTheme();
  const activeProtocol = useSystemStore((s) => s.activeProtocol);
  const activeTint = protocolAccent(activeProtocol, isDark, C.blue);

  return (
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
    </Tabs>
  );
}

const styles = StyleSheet.create({
  topHairline: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 0.5,
  },
});
