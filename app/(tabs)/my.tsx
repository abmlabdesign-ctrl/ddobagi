import { router } from 'expo-router';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/Card';
import { MenuRow } from '@/components/Controls';
import { Screen } from '@/components/Screen';
import { avatars } from '@/data/profile';
import { useApp } from '@/store/AppStore';
import { colors, radius, spacing } from '@/theme/tokens';
import { fontFamily, type } from '@/theme/typography';

/** MY-1 My Page */
export default function MyPage() {
  const { profile } = useApp();
  const avatar = avatars.find((entry) => entry.id === profile.avatarId) ?? avatars[0];
  const goal = profile.weeklyGoal;

  return (
    <Screen scroll background="surface-alt" contentStyle={styles.content}>
      <Text style={styles.title}>My Page</Text>

      <Card style={styles.profileCard}>
        <Image
          source={avatar.source}
          style={styles.avatar}
          resizeMode="cover"
          accessibilityIgnoresInvertColors
        />
        <View style={styles.profileText}>
          <Text style={type.listTitle}>{profile.nickname}</Text>
          <Text style={type.description}>
            {profile.purposes[0] ?? 'School life'} · {profile.koreanLevel} ·{' '}
            {profile.streakDays}-day streak
          </Text>
        </View>
        <Pressable
          onPress={() => router.push('/my/edit')}
          hitSlop={10}
          accessibilityRole="button"
        >
          <Text style={type.action}>Edit</Text>
        </Pressable>
      </Card>

      <View style={styles.statsRow}>
        <Stat label="Situations done" value={`${profile.situationsDone}`} />
        <Stat label="Total practice" value={profile.totalPractice} />
        <Stat label="Weekly goal" value={`${goal.completed} / ${goal.total}`} />
      </View>

      <Card style={styles.goalCard}>
        <Text style={type.body}>{goal.label}</Text>
        <Text style={styles.goalCount}>
          {goal.completed} / {goal.total}
        </Text>
      </Card>

      <Card style={styles.menu} padding={16}>
        <MenuRow label="Stats" onPress={() => router.push('/my/stats')} />
        <MenuRow label="Scrapbook" onPress={() => router.push('/(tabs)/review?tab=scrapbook')} />
        <MenuRow label="Settings" onPress={() => router.push('/my/settings')} last />
      </Card>
    </Screen>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={type.caption}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.lg,
    paddingTop: spacing.huge,
    paddingBottom: spacing.huge,
  },
  title: {
    ...type.display,
    color: colors.inkAlt,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: radius.pill,
    backgroundColor: colors.fill,
  },
  profileText: {
    flex: 1,
    gap: 2,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  stat: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    padding: 16,
    gap: spacing.xs,
  },
  statValue: {
    fontFamily: fontFamily.numeric,
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '700',
    color: colors.ink,
  },
  goalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  goalCount: {
    fontFamily: fontFamily.numeric,
    fontSize: 15,
    fontWeight: '600',
    color: colors.primary,
  },
  menu: {
    gap: 0,
  },
});
