import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { QuickTalkArt } from '@/components/art/QuickTalkArt';
import { SavedExpressionArt } from '@/components/art/SavedExpressionArt';
import { CardGrid } from '@/components/CardGrid';
import { HomeStatusRow, MistakeLogArt, MistakeLogBackground, ResumeCard } from '@/components/HomeParts';
import { ProgressRing } from '@/components/ProgressRing';
import { Screen } from '@/components/Screen';
import { Section } from '@/components/Section';
import { SituationCard } from '@/components/SituationCard';
import { situations } from '@/data/situations';
import { CheckCircleIcon } from '@/icons';
import { useApp } from '@/store/AppStore';
import { colors, radius, shadows, spacing } from '@/theme/tokens';
import { text, type } from '@/theme/typography';

/** HM-1 Home — the re-entry hub. */
export default function Home() {
  const { profile } = useApp();
  const goal = profile.weeklyGoal;
  const percent = Math.round((goal.completed / goal.total) * 100);
  const featured = situations.filter((situation) => situation.featured).slice(0, 4);
  const inProgress = situations.find((situation) => situation.progress);

  return (
    <Screen scroll background="surface-alt" contentStyle={styles.content}>
      <HomeStatusRow streakDays={profile.streakDays} />

      <Text style={styles.greeting}>
        Hi there,{'\n'}
        {profile.nickname}!
      </Text>

      <LinearGradient
        colors={['#FFFFFF', 'rgba(255,255,255,0.2)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0.35 }}
        style={styles.goalCard}
      >
        <View style={styles.goalText}>
          <View style={styles.goalLabel}>
            <CheckCircleIcon size={24} color={colors.primary} />
            <Text style={styles.goalLabelText}>This week&apos;s goal</Text>
          </View>
          <Text style={type.section}>{goal.label}</Text>
        </View>
        <ProgressRing percent={percent} size={64} />
      </LinearGradient>

      <View style={styles.quickGrid}>
        <Pressable
          onPress={() => router.push('/(tabs)/roleplay')}
          accessibilityRole="button"
          style={styles.quickTall}
        >
          <LinearGradient
            colors={['#D8E7FF', '#FFF0EC']}
            locations={[0.236, 0.946]}
            start={{ x: 0, y: 1 }}
            end={{ x: 1, y: 0 }}
            style={styles.quickFill}
          >
            <View style={styles.quickArtTop}>
              <QuickTalkArt width={140} height={89} />
            </View>
            <View style={styles.quickTallText}>
              <Text style={styles.quickTitleLarge}>Start{'\n'}speaking</Text>
              <Text style={styles.quickCaption}>We&apos;ll pick a topic for you</Text>
            </View>
          </LinearGradient>
        </Pressable>

        <View style={styles.quickColumn}>
          <Pressable
            onPress={() => router.push('/(tabs)/review?tab=scrapbook')}
            accessibilityRole="button"
            style={[styles.quickSmall, styles.quickSmallLight]}
          >
            <View style={styles.quickSmallArt}>
              <SavedExpressionArt width={52} height={52} />
            </View>
            <Text style={type.section}>Saved phrases</Text>
          </Pressable>

          <Pressable
            onPress={() => router.push('/(tabs)/review?tab=mistakes')}
            accessibilityRole="button"
            style={styles.quickSmall}
          >
            <MistakeLogBackground />
            <MistakeLogArt />
            <Text style={[type.section, styles.quickTitleOnPrimary]}>Mistake log</Text>
          </Pressable>
        </View>
      </View>

      <Section
        title="Browse situations"
        action="See all"
        onAction={() => router.push('/(tabs)/roleplay')}
      >
        <CardGrid>
          {featured.map((situation) => (
            <SituationCard
              key={situation.id}
              situation={situation}
              durationPrefix="About "
              onPress={() => router.push(`/roleplay/${situation.id}`)}
            />
          ))}
        </CardGrid>
      </Section>

      {inProgress ? (
        <ResumeCard
          situation={inProgress}
          onPress={() => router.push(`/roleplay/${inProgress.id}`)}
        />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    // The comp spaces every home block 32 apart, measured off its absolute tops.
    gap: spacing.xxxl,
    paddingTop: 20,
    paddingBottom: spacing.huge,
  },
  greeting: type.display,
  goalCard: {
    minHeight: 96,
    borderRadius: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 16,
    paddingHorizontal: 20,
    ...shadows.card,
  },
  goalText: {
    flex: 1,
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  goalLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  goalLabelText: text(16, 22, '500', colors.inkAlt),
  quickGrid: {
    flexDirection: 'row',
    gap: spacing.md,
    height: 252,
  },
  quickTall: {
    flex: 1,
    borderRadius: radius.panel,
    overflow: 'hidden',
  },
  quickFill: {
    flex: 1,
    padding: 16,
    justifyContent: 'flex-end',
  },
  quickArtTop: {
    position: 'absolute',
    top: 16,
    left: 25,
  },
  quickTallText: {
    gap: spacing.xs,
  },
  quickTitleLarge: type.korean,
  quickCaption: text(12, 16, '400', colors.inkAlt),
  quickColumn: {
    flex: 1,
    gap: spacing.md,
  },
  quickSmall: {
    flex: 1,
    borderRadius: radius.panel,
    overflow: 'hidden',
    padding: 16,
    justifyContent: 'flex-end',
  },
  quickSmallLight: {
    backgroundColor: colors.surface,
  },
  quickSmallArt: {
    position: 'absolute',
    top: 11,
    right: 19,
  },
  quickTitleOnPrimary: {
    color: colors.surface,
  },
});
