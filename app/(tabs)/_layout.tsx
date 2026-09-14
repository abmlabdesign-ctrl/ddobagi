import { Tabs } from 'expo-router';
import { Platform } from 'react-native';

import { HomeIcon, ProfileIcon, ReviewIcon, RoleplayIcon } from '@/icons';
import { colors, layout, shadows } from '@/theme/tokens';
import { fontFamily } from '@/theme/typography';

/** 4 roots · icons 24 · labels 12/500 · active primary, inactive `#B0B8C1`. */
export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarLabelStyle: {
          fontFamily: fontFamily.sans,
          fontSize: 12,
          lineHeight: 16,
          fontWeight: '500',
        },
        tabBarStyle: {
          height: layout.tabBarHeight + (Platform.OS === 'ios' ? 28 : 12),
          paddingTop: 6,
          backgroundColor: colors.surface,
          borderTopWidth: 0,
          ...shadows.bottomNav,
        },
        sceneStyle: { backgroundColor: colors.surfaceAlt },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <HomeIcon size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="roleplay"
        options={{
          title: 'Roleplay',
          tabBarIcon: ({ color }) => <RoleplayIcon size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="review"
        options={{
          title: 'Review',
          tabBarIcon: ({ color }) => <ReviewIcon size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="my"
        options={{
          title: 'My Page',
          tabBarIcon: ({ color }) => <ProfileIcon size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
