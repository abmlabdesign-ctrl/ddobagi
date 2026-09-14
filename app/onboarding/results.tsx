import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { ScaleCaption, SkillBar } from '@/components/SkillBar';
import { NavBar } from '@/components/NavBar';
import { Screen } from '@/components/Screen';
import { Section } from '@/components/Section';
import { levelCheckSkills, levelCheckSummary } from '@/data/skills';
import { useApp } from '@/store/AppStore';
import { colors, spacing } from '@/theme/tokens';
import { type } from '@/theme/typography';

/** ON-4 Your results → HM-1 */
export default function Results() {
  const { completeOnboarding } = useApp();

  const start = () => {
    completeOnboarding();
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.root}>
      <NavBar title="Your results" showBack={false} />

      <Screen scroll background="surface-alt" contentStyle={styles.content}>
        <Section title="Summary">
          <Card style={styles.summary}>
            {levelCheckSummary.map((line) => (
              <Text key={line} style={type.body}>
                {line}
              </Text>
            ))}
          </Card>
        </Section>

        <Section title="Your skills" caption="0–100">
          <Card style={styles.skills}>
            {levelCheckSkills.map((entry) => (
              <SkillBar
                key={entry.skill}
                skill={entry.skill}
                score={entry.score}
                band={entry.band}
              />
            ))}
          </Card>
        </Section>
      </Screen>

      <View style={styles.footer}>
        <Button label="Start practicing" onPress={start} />
      </View>
    </View>
  );
}

/** Re-exported so the caption stays in one place if the scale changes. */
export { ScaleCaption };

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surfaceAlt,
  },
  content: {
    gap: spacing.xxl,
    paddingTop: spacing.sm,
    paddingBottom: spacing.huge,
  },
  summary: {
    gap: spacing.xs,
  },
  skills: {
    gap: spacing.xl,
  },
  footer: {
    paddingHorizontal: spacing.gutter,
    paddingBottom: spacing.xxl,
    paddingTop: spacing.md,
    backgroundColor: colors.surfaceAlt,
  },
});
