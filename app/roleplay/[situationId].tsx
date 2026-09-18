import { router, useLocalSearchParams } from 'expo-router';
import { Image, StyleSheet, Text, View } from 'react-native';

import { DifficultyBadge, MetaChip } from '@/components/Badge';
import { Button } from '@/components/Button';
import { CtaDock } from '@/components/CtaDock';
import { NavBar } from '@/components/NavBar';
import { Screen, ScreenShell } from '@/components/Screen';
import { FieldLabel } from '@/components/Section';
import { categoryById } from '@/data/categories';
import { reports } from '@/data/conversations';
import { situationById } from '@/data/situations';
import { colors, radius, spacing } from '@/theme/tokens';
import { numeral, text, type } from '@/theme/typography';

/**
 * RP-2 Scenario detail. The comp has no hero image and no cards — sections are
 * separated by whitespace with a primary label above each.
 */
export default function ScenarioDetail() {
  const { situationId } = useLocalSearchParams<{ situationId: string }>();
  const situation = situationById[situationId];

  if (!situation) {
    return (
      <ScreenShell background="surface">
        <NavBar title="Scenario detail" />
        <Screen>
          <Text style={type.secondary}>That situation isn&apos;t in the catalog.</Text>
        </Screen>
      </ScreenShell>
    );
  }

  const category = categoryById[situation.categoryId];
  const breadcrumb = situation.place ? `${category.name} · ${situation.place}` : category.name;
  // A report exists only once the learner has finished the situation, so it is
  // what tells this screen whether there is a history to show.
  const lastReport = reports[situation.id];

  return (
    <ScreenShell background="surface">
      <NavBar title="Scenario detail" />

      <Screen scroll contentStyle={styles.content}>
        <View style={styles.headline}>
          <View style={styles.metaRow}>
            <DifficultyBadge difficulty={situation.difficulty} />
            <MetaChip label={`Est. ${situation.minutes} min`} />
            <MetaChip label={breadcrumb} />
          </View>
          <Text style={type.screenTitle}>{situation.title}</Text>
        </View>

        <View style={styles.rule} />

        <View style={styles.sections}>
          <View style={styles.section}>
            <FieldLabel label="The situation" />
            <Text style={type.bodyLead}>{situation.detail.situation}</Text>
          </View>

          <View style={styles.section}>
            <FieldLabel label="AI plays" />
            <View style={styles.role}>
              <Image
                source={category.illustration}
                style={styles.roleAvatar}
                resizeMode="cover"
                accessibilityIgnoresInvertColors
              />
              <View style={styles.roleText}>
                <Text style={type.title}>{situation.detail.aiRole}</Text>
                <Text style={type.description}>{situation.detail.aiRoleDescription}</Text>
              </View>
            </View>
          </View>

          <View style={[styles.section, styles.goalsSection]}>
            <FieldLabel label="Your goals" />
            {situation.detail.goals.map((goal, index) => (
              <View key={goal} style={styles.goalRow}>
                <View style={styles.goalNumber}>
                  <Text style={styles.goalNumberLabel}>{index + 1}</Text>
                </View>
                <Text style={[type.body, styles.goalLabel]}>{goal}</Text>
              </View>
            ))}
          </View>

          {lastReport ? (
            <View style={[styles.section, styles.lastSection]}>
              <FieldLabel label="Last time" />
              <View style={styles.lastRow}>
                <Text style={styles.lastScore}>{lastReport.score}</Text>
                <Text style={styles.lastUnit}>pts</Text>
                <Text style={styles.lastDate}>Finished {lastReport.completedOn}</Text>
              </View>
              <Button
                label="View transcript"
                variant="elevated"
                height={48}
                onPress={() => router.push(`/review/script/${situation.id}`)}
              />
            </View>
          ) : null}
        </View>
      </Screen>

      <CtaDock paddingTop={12}>
        <Button
          label="Start conversation"
          onPress={() => router.push(`/roleplay/session?situationId=${situation.id}`)}
        />
      </CtaDock>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 16,
    paddingTop: 8,
    paddingBottom: spacing.huge,
  },
  headline: {
    gap: 12,
    paddingTop: 16,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
  },
  rule: {
    height: 2,
    backgroundColor: colors.fill,
  },
  sections: {
    gap: 16,
  },
  section: {
    paddingVertical: 16,
    gap: 8,
  },
  goalsSection: {
    gap: 12,
  },
  role: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  roleAvatar: {
    width: 48,
    height: 48,
    borderRadius: radius.input,
    backgroundColor: colors.fill,
  },
  roleText: {
    flex: 1,
    gap: 2,
  },
  goalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  goalNumber: {
    width: 22,
    height: 22,
    borderRadius: radius.pill,
    backgroundColor: colors.primary100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalNumberLabel: numeral(11, 16, '600', colors.primary),
  goalLabel: {
    flex: 1,
  },
  lastSection: {
    gap: 12,
  },
  lastRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  lastScore: numeral(22, 30, '700', colors.info),
  lastUnit: text(12, 16, '600', colors.textSecondary),
  lastDate: {
    ...type.description,
    marginLeft: 8,
  },
});
