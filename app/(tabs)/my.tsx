import { router } from 'expo-router';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { Card, RowDivider } from '@/components/Card';
import { MenuRow } from '@/components/Controls';
import { ScreenTitleBar } from '@/components/NavBar';
import { Screen, ScreenShell } from '@/components/Screen';
import { avatars } from '@/data/profile';
import { useApp } from '@/store/AppStore';
import { colors, radius, spacing } from '@/theme/tokens';
import { numeral, text, type } from '@/theme/typography';

const MENU = [
  { label: 'Stats', href: '/my/stats' },
  { label: 'Scrapbook', href: '/(tabs)/review?tab=scrapbook' },
  { label: 'Settings', href: '/my/settings' },
] as const;

/** MY-1 My Page */
export default function MyPage() {
  const { profile } = useApp();
  const avatar = avatars.find((entry) => entry.id === profile.avatarId) ?? avatars[0];
  const goal = profile.weeklyGoal;
  const percent = Math.round((goal.completed / goal.total) * 100);

  return (
    <ScreenShell bottomEdge="tabs">
      <ScreenTitleBar title="My Page" />

      <Screen scroll background="surface-alt" contentStyle={styles.content}>
        {/* The comp leaves the profile row uncarded. */}
        <View style={styles.profile}>
          <View style={styles.avatarFrame}>
            <Image
              source={avatar.source}
              style={styles.avatar}
              resizeMode="cover"
              accessibilityIgnoresInvertColors
            />
          </View>
          <View style={styles.profileText}>
            <Text style={styles.nickname}>{profile.nickname}</Text>
            <Text style={styles.profileMeta}>
              {profile.purposes[0] ?? 'School life'} · {profile.koreanLevel} ·{' '}
              {profile.streakDays}-day streak
            </Text>
          </View>
          <Pressable
            onPress={() => router.push('/my/edit')}
            accessibilityRole="button"
            style={styles.editPill}
          >
            <Text style={styles.editLabel}>Edit</Text>
          </Pressable>
        </View>

        <View style={styles.statsRow}>
          <Stat label="Situations done" value={`${profile.situationsDone}`} />
          <Stat label="Total practice" value={profile.totalPractice} />
        </View>

        <Card
          radiusToken="group"
          elevation="card"
          paddingHorizontal={20}
          paddingVertical={18}
          style={styles.goalCard}
        >
          <View style={styles.goalHeader}>
            <Text style={type.listTitle}>Weekly goal</Text>
            <Pressable onPress={() => router.push('/my/edit')} accessibilityRole="button">
              <Text style={styles.goalEdit}>Edit</Text>
            </Pressable>
          </View>
          <View style={styles.goalBody}>
            <View style={styles.goalRow}>
              <Text style={styles.goalLabel}>{goal.total} lessons this week</Text>
              <Text style={styles.goalCount}>
                {goal.completed} / {goal.total}
              </Text>
            </View>
            <View style={styles.goalTrack}>
              <View style={[styles.goalFill, { width: `${percent}%` }]} />
            </View>
          </View>
        </Card>

        <Card radiusToken="group" elevation="card" paddingHorizontal={20} paddingVertical={6}>
          {MENU.map((entry, index) => (
            <View key={entry.label}>
              {index > 0 ? <RowDivider /> : null}
              <MenuRow label={entry.label} onPress={() => router.push(entry.href)} />
            </View>
          ))}
        </Card>
      </Screen>
    </ScreenShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card
      radiusToken="panel"
      elevation="card"
      paddingHorizontal={16}
      paddingVertical={14}
      style={styles.stat}
    >
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 10,
    paddingTop: 8,
    paddingBottom: spacing.huge,
  },
  profile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 20,
  },
  avatarFrame: {
    width: 64,
    height: 64,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.7)',
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  profileText: {
    flex: 1,
    gap: 4,
  },
  nickname: text(20, 28, '700', colors.inkAlt),
  profileMeta: text(13, 19, '400', colors.inkAlt),
  editPill: {
    height: 30,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    justifyContent: 'center',
  },
  editLabel: text(13, 19, '600', colors.surface),
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  stat: {
    flex: 1,
    gap: 4,
  },
  statLabel: text(12, 16, '500', colors.textSecondary),
  statValue: numeral(22, 28, '700', colors.inkAlt),
  goalCard: {
    gap: 12,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  goalEdit: text(12, 16, '500', colors.primary),
  goalBody: {
    gap: 6,
  },
  goalRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  goalLabel: text(14, 20, '500', colors.inkAlt),
  goalCount: numeral(13, 18, '600', colors.primary),
  goalTrack: {
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.track,
    overflow: 'hidden',
  },
  goalFill: {
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },
});
