import { router, useLocalSearchParams } from 'expo-router';
import { Image, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { DifficultyBadge } from '@/components/Badge';
import { NavBar } from '@/components/NavBar';
import { Screen } from '@/components/Screen';
import { categoryById } from '@/data/categories';
import { situationById } from '@/data/situations';
import { colors, radius, spacing } from '@/theme/tokens';
import { fontFamily, type } from '@/theme/typography';

/** RP-2 Scenario detail — the briefing before the conversation starts. */
export default function ScenarioDetail() {
  const { situationId } = useLocalSearchParams<{ situationId: string }>();
  const situation = situationById[situationId];

  if (!situation) {
    return (
      <View style={styles.root}>
        <NavBar title="Scenario detail" />
        <Screen>
          <Text style={type.secondary}>That situation isn&apos;t in the catalog.</Text>
        </Screen>
      </View>
    );
  }

  const category = categoryById[situation.categoryId];
  const breadcrumb = situation.place
    ? `${category.name} · ${situation.place}`
    : category.name;

  return (
    <View style={styles.root}>
      <NavBar title="Scenario detail" />

      <Screen scroll contentStyle={styles.content}>
        <View style={styles.hero}>
          <Image
            source={category.illustration}
            style={styles.illustration}
            resizeMode="contain"
            accessibilityIgnoresInvertColors
          />
          <View style={styles.heroMeta}>
            <DifficultyBadge difficulty={situation.difficulty} />
            <Text style={styles.estimate}>Est. {situation.minutes} min</Text>
          </View>
          <Text style={type.caption}>{breadcrumb}</Text>
          <Text style={type.display}>{situation.title}</Text>
        </View>

        <View style={styles.block}>
          <Text style={type.section}>The situation</Text>
          <Card>
            <Text style={type.bodyRegular}>{situation.detail.situation}</Text>
          </Card>
        </View>

        <View style={styles.block}>
          <Text style={type.section}>AI plays</Text>
          <Card style={styles.aiCard}>
            <Image
              source={category.illustration}
              style={styles.aiAvatar}
              resizeMode="cover"
              accessibilityIgnoresInvertColors
            />
            <View style={styles.aiText}>
              <Text style={type.title}>{situation.detail.aiRole}</Text>
              <Text style={type.description}>{situation.detail.aiRoleDescription}</Text>
            </View>
          </Card>
        </View>

        <View style={styles.block}>
          <Text style={type.section}>Your goals</Text>
          <Card style={styles.goals}>
            {situation.detail.goals.map((goal, index) => (
              <View key={goal} style={styles.goalRow}>
                <View style={styles.goalNumber}>
                  <Text style={styles.goalNumberLabel}>{index + 1}</Text>
                </View>
                <Text style={[type.body, styles.goalLabel]}>{goal}</Text>
              </View>
            ))}
          </Card>
        </View>
      </Screen>

      <View style={styles.footer}>
        <Button
          label="Start conversation"
          onPress={() => router.push(`/roleplay/session?situationId=${situation.id}`)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  content: {
    gap: spacing.xxl,
    paddingBottom: spacing.huge,
  },
  hero: {
    gap: spacing.sm,
  },
  illustration: {
    width: '100%',
    height: 180,
    marginBottom: spacing.sm,
  },
  heroMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  estimate: {
    fontFamily: fontFamily.numeric,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  block: {
    gap: spacing.md,
  },
  aiCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  aiAvatar: {
    width: 48,
    height: 48,
    borderRadius: radius.pill,
    backgroundColor: colors.fill,
  },
  aiText: {
    flex: 1,
    gap: 2,
  },
  goals: {
    gap: spacing.lg,
  },
  goalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  goalNumber: {
    width: 24,
    height: 24,
    borderRadius: radius.pill,
    backgroundColor: colors.primary100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalNumberLabel: {
    fontFamily: fontFamily.numeric,
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  goalLabel: {
    flex: 1,
  },
  footer: {
    paddingHorizontal: spacing.gutter,
    paddingBottom: spacing.xxl,
    paddingTop: spacing.md,
    backgroundColor: colors.surface,
  },
});
