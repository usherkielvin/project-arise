import { Tabs } from 'expo-router';
import { BlurView } from 'expo-blur';
import { LayoutDashboard, BookOpen, Grid2X2 } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';
import { C } from '../../src/theme/colors';
import { F } from '../../src/theme/fonts';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: C.blue,
        tabBarInactiveTintColor: 'rgba(238,240,255,0.22)',
        tabBarStyle: {
          position: 'absolute',
          borderTopWidth: 0,
          backgroundColor: 'transparent',
          elevation: 0,
          height: 60,
        },
        tabBarBackground: () => (
          <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFill}>
            {/* Top hairline */}
            <View style={styles.topLine} />
          </BlurView>
        ),
        tabBarLabelStyle: {
          fontFamily: F.mono,
          fontSize: 8,
          letterSpacing: 1.5,
          textTransform: 'uppercase',
          marginBottom: 4,
        },
        tabBarIconStyle: {
          marginTop: 6,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Status',
          tabBarIcon: ({ color }) => <LayoutDashboard color={color} size={20} strokeWidth={1.5} />,
        }}
      />
      <Tabs.Screen
        name="quests"
        options={{
          title: 'Quests',
          tabBarIcon: ({ color }) => <BookOpen color={color} size={20} strokeWidth={1.5} />,
        }}
      />
      <Tabs.Screen
        name="inventory"
        options={{
          title: 'Archive',
          tabBarIcon: ({ color }) => <Grid2X2 color={color} size={20} strokeWidth={1.5} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  topLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 0.5,
    backgroundColor: 'rgba(124,131,253,0.18)',
  },
});
