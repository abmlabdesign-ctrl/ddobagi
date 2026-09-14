import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { NavBar } from '@/components/NavBar';
import { Screen } from '@/components/Screen';
import { Section } from '@/components/Section';
import { SkillBar } from '@/components/SkillBar';
import { reports } from '@/data/conversations';
import { situationById } from '@/data/situations';
import { useApp } from '@/store/AppStore';
import { colors, radius, spacing } from '@/theme/tokens';
import { fontFamily, type } from '@/theme/typography';

/** RP-4 Report — goals, score, 6-skill breakdown and sentence fixes. */
export default function ReportScreen() {
  const { situationId } = useLocalSearchParams<{ situationId: string }>();
  const { savePhrase } = useApp();

  const report = reports[situationId] ?? Object.values(reports)[0];
  const situation = situationById[report.situationId];

  const save = () => {
    report.fixes.forEach((fix, index) => {
      savePhrase({
        id: `${report.situationId}-fix-${index}`,
        situationId: report.situationId,
        korean: fix.suggested.korean.replace(/"/g, ''),
        english: fix.suggested.english.replace(/[“”]/g, ''),
      });
    });
    router.replace('/(tabs)/roleplay');
  };

  return (
    <View style={styles.root}>
      <NavBar title="Report" onBack={() => router.replace('/(tabs)/roleplay')} />

      <Screen scroll background="surface-alt" contentStyle={styles.content}>
        <View style={styles.headline}>
          <Text style={type.caption}>{situation?.title}</Text>
          <Text style={type.display}>
            You hit all {report.goalsMet} goal{report.goalsMet === 1 ? '' : 's'}.
          </Text>
          <View style={styles.scoreRow}>
            <Text style={styles.score}>{report.score}</Text>
            <Text style={styles.scoreUnit}>pts</Text>
          </View>
          <Text style={type.secondary}>
            That&apos;s {report.scoreDelta} points more than last time.
          </Text>
        </View>

        <Section title="6-skill breakdown" caption="0–100">
          <Card style={styles.skills}>
            {report.skills.map((entry) => (
              <SkillBar
                key={entry.skill}
                skill={entry.skill}
                score={entry.score}
                band={entry.band}
              />
            ))}
          </Card>
        </Section>

        <Section title="Sentence fix">
          {report.fixes.map((fix) => (
            <Card key={fix.said.korean} style={styles.fix}>
              <View style={styles.fixBlock}>
                <Text style={styles.fixLabel}>What you said</Text>
                <Text style={[styles.fixKorean, styles.fixKoreanWrong]}>{fix.said.korean}</Text>
                <Text style={type.caption}>{fix.said.english}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.fixBlock}>
                <Text style={[styles.fixLabel, styles.fixLabelGood]}>Suggested</Text>
                <Text style={styles.fixKorean}>{fix.suggested.korean}</Text>
                <Text style={type.caption}>{fix.suggested.english}</Text>
              </View>
            </Card>
          ))}
        </Section>
      </Screen>

      <View style={styles.footer}>
        <Button
          label="Try again"
          variant="secondary"
          style={styles.footerButton}
          onPress={() => router.replace(`/roleplay/session?situationId=${report.situationId}`)}
        />
        <Button label="Save" style={styles.footerButton} onPress={save} />
      </View>
    </View>
  );
}

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
  headline: {
    gap: spacing.sm,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.xs,
  },
  score: {
    ...type.timer,
    fontSize: 56,
    lineHeight: 64,
    color: colors.primary,
  },
  scoreUnit: {
    fontFamily: fontFamily.numeric,
    fontSize: 18,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  skills: {
    gap: spacing.xl,
  },
  fix: {
    gap: spacing.md,
  },
  fixBlock: {
    gap: spacing.xs,
  },
  fixLabel: {
    ...type.badge,
    color: colors.primary,
  },
  fixLabelGood: {
    color: colors.success,
  },
  fixKorean: {
    ...type.body,
    fontWeight: '600',
    fontSize: 17,
    lineHeight: 26,
  },
  fixKoreanWrong: {
    textDecorationLine: 'line-through',
    textDecorationColor: colors.primary,
    color: colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.fill,
    borderRadius: radius.pill,
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.gutter,
    paddingBottom: spacing.xxl,
    paddingTop: spacing.md,
    backgroundColor: colors.surfaceAlt,
  },
  footerButton: {
    flex: 1,
  },
});
