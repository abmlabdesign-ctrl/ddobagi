import { Tabs } from 'expo-router';
import { StyleSheet, Text, type ColorValue } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HomeTabIcon, ProfileTabIcon, ReviewTabIcon, RoleplayTabIcon } from '@/icons';
import { colors } from '@/theme/tokens';
import { fontFamily } from '@/theme/typography';

type TabIcon = (props: { color: ColorValue }) => React.ReactElement;

const TABS: { name: string; title: string; Icon: TabIcon }[] = [
  { name: 'index', title: 'Home', Icon: HomeTabIcon },
  { name: 'roleplay', title: 'Roleplay', Icon: RoleplayTabIcon },
  { name: 'review', title: 'Review', Icon: ReviewTabIcon },
  { name: 'my', title: 'My Page', Icon: ProfileTabIcon },
];

/**
 * The comps draw the bar as `padding:12px 16px 8px` with an 8px gap between a
 * filled 24px glyph and an Inter label — no shadow, and the active label steps
 * up to 700 rather than only changing colour.
 */
export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarIconStyle: { height: 24 },
        tabBarItemStyle: { paddingVertical: 0 },
        tabBarStyle: {
          height: 64 + insets.bottom,
          paddingTop: 12,
          paddingBottom: 8 + insets.bottom,
          paddingHorizontal: 16,
          backgroundColor: colors.surface,
          borderTopWidth: 0,
          elevation: 0,
        },
        sceneStyle: { backgroundColor: colors.surfaceAlt },
      }}
    >
      {TABS.map(({ name, title, Icon }) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{
            title,
            // The comp greys the glyph one step lighter than its label —
            // #B0B8C1 against #95989C — so the icon takes its own colour.
            tabBarIcon: ({ focused }) => (
              <Icon color={focused ? colors.primary : colors.textTertiary} />
            ),
            tabBarLabel: ({ focused, color }) => (
              <Text style={[styles.label, focused ? styles.labelActive : null, { color }]}>
                {title}
              </Text>
            ),
          }}
        />
      ))}
    </Tabs>
  );
}

const styles = StyleSheet.create({
  label: {
    fontFamily: fontFamily.numericMedium,
    fontSize: 12,
    lineHeight: 12,
    marginTop: 8,
  },
  labelActive: {
    fontFamily: fontFamily.numericBold,
  },
});
