import { Tabs } from 'expo-router';
import { LayoutDashboard, User, BookOpen, Flame, FileText } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '../../src/theme/ThemeContext';
import { F } from '../../src/theme/fonts';

export default function TabLayout() {
  const { colors: C, isDark } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: C.blue,
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
          title: 'Today',
          tabBarIcon: ({ color }) => <LayoutDashboard color={color} size={20} strokeWidth={1.8} />,
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
        name="quests"
        options={{
          title: 'Quests',
          tabBarIcon: ({ color }) => <BookOpen color={color} size={20} strokeWidth={1.8} />,
        }}
      />
      <Tabs.Screen
        name="journal"
        options={{
          title: 'Journal',
          tabBarIcon: ({ color }) => <FileText color={color} size={20} strokeWidth={1.8} />,
        }}
      />
      <Tabs.Screen
        name="habits"
        options={{
          title: 'Habits',
          tabBarIcon: ({ color }) => <Flame color={color} size={20} strokeWidth={1.8} />,
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
