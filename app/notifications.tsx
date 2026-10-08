import { router, type Href } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card, RowDivider } from '@/components/Card';
import { NavBar } from '@/components/NavBar';
import { Screen, ScreenShell } from '@/components/Screen';
import { notices } from '@/data/support';
import { ListChevronIcon } from '@/icons';
import { useApp } from '@/store/AppStore';
import { colors, radius, spacing } from '@/theme/tokens';
import { type } from '@/theme/typography';

type Item = { id: string; title: string; caption: string; href: Href; tone: 'primary' | 'info' };

/**
 * HM-1 bell → Notifications. There's no push server, so the inbox is built
 * from what the app already knows: an unkept streak, open mistakes, the week's
 * goal and the newest notice. Each row goes where the learner can act on it.
 */
export default function Notifications() {
  const { profile, mistakes, practice } = useApp();
  // Same count as the Mistake log headline: open and not yet Done.
  const open = mistakes.filter((mistake) => !mistake.fixed && !mistake.done).length;
  const goal = profile.weeklyGoal;

  const items: Item[] = [];
  // A live streak gets kept; with none yet, the nudge is just to practise today.
  if (!practice.practicedToday) {
    items.push({
      id: 'streak',
      title:
        practice.streakDays > 0
          ? `Keep your ${practice.streakDays}-day streak going`
          : 'Practice today to start a streak',
      caption: 'One roleplay or mission today counts.',
      href: '/(tabs)/roleplay',
      tone: 'primary',
    });
  }
  if (open > 0) {
    items.push({
      id: 'mistakes',
      title: `${open} mistake${open === 1 ? '' : 's'} to review`,
      caption: 'Say the fix to mark it fixed.',
      href: '/(tabs)/review?tab=mistakes',
      tone: 'primary',
    });
  }
  if (practice.weekCompleted < goal.total) {
    const left = goal.total - practice.weekCompleted;
    items.push({
      id: 'goal',
      title: `${left} lesson${left === 1 ? '' : 's'} left this week`,
      caption: `${practice.weekCompleted} / ${goal.total} done`,
      href: '/(tabs)/review',
      tone: 'info',
    });
  }
  if (notices[0]) {
    items.push({
      id: notices[0].id,
      title: notices[0].title,
      caption: `Notice · ${notices[0].date}`,
      href: '/my/notices',
      tone: 'info',
    });
  }

  return (
    <ScreenShell bottomEdge="content">
      <NavBar
        title="Notifications"
        action="Settings"
        onAction={() => router.push('/my/settings')}
      />

      <Screen scroll background="surface-alt" contentStyle={styles.content}>
        {items.length === 0 ? (
          <Text style={type.secondary}>You&apos;re all caught up.</Text>
        ) : (
          <Card radiusToken="group" elevation="card" paddingHorizontal={20} paddingVertical={4}>
            {items.map((item, index) => (
              <View key={item.id}>
                {index > 0 ? <RowDivider /> : null}
                <Pressable
                  onPress={() => router.push(item.href)}
                  accessibilityRole="button"
                  style={styles.row}
                >
                  <View style={[styles.dot, item.tone === 'info' ? styles.dotInfo : null]} />
                  <View style={styles.rowText}>
                    <Text style={type.listTitle}>{item.title}</Text>
                    <Text style={type.caption}>{item.caption}</Text>
                  </View>
                  <ListChevronIcon />
                </Pressable>
              </View>
            ))}
          </Card>
        )}
      </Screen>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: 8,
    paddingBottom: spacing.huge,
  },
  row: {
    minHeight: 68,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },
  dotInfo: {
    backgroundColor: colors.info,
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
});
