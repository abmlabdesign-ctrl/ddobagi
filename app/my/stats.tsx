import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/Card';
import { Segmented } from '@/components/Controls';
import { NavBar } from '@/components/NavBar';
import { Screen } from '@/components/Screen';
import { Section } from '@/components/Section';
import { SkillBarCompact } from '@/components/SkillBar';
import { stats } from '@/data/profile';
import { skillLabels } from '@/data/skills';
import type { StatsPeriod } from '@/data/types';
import { colors, spacing } from '@/theme/tokens';
import { fontFamily, type } from '@/theme/typography';

const periods = ['Weekly', 'Monthly'] as const;

/** MY-2 / MY-2b Stats */
export default function Stats() {
  const [period, setPeriod] = useState<(typeof periods)[number]>('Weekly');
  const data = stats[period.toLowerCase() as StatsPeriod];

  return (
    <View style={styles.root}>
      <NavBar title="Stats" />

      <Screen scroll background="surface-alt" contentStyle={styles.content}>
        <Segmented options={periods} value={period} onChange={setPeriod} />

        <Card style={styles.overall}>
          <Text style={type.body}>{data.heading}</Text>
          <View style={styles.scoreRow}>
            <Text style={styles.score}>{data.score}</Text>
            <Delta value={data.delta} />
          </View>
          <Text style={type.caption}>{data.rangeLabel}</Text>
          <View style={styles.insights}>
            {data.insights.map((insight) => (
              <Text key={insight} style={type.secondary}>
                {insight}
              </Text>
            ))}
          </View>
        </Card>

        <Section title="6-skill scores" caption={data.rangeLabel}>
          <Card style={styles.skills}>
            {data.skills.map((entry) => (
              <SkillBarCompact key={entry.skill} skill={entry.skill} score={entry.score} />
            ))}
          </Card>
        </Section>

        <View style={styles.pair}>
          <Card style={styles.pairCard}>
            <Text style={styles.pairLabel}>Biggest gain</Text>
            <View style={styles.scoreRow}>
              <Text style={type.listTitle}>{skillLabels[data.biggestGain.skill]}</Text>
              <Delta value={data.biggestGain.delta} />
            </View>
            <Text style={type.secondary}>{data.biggestGain.note}</Text>
          </Card>

          <Card style={styles.pairCard}>
            <Text style={[styles.pairLabel, styles.pairLabelNext]}>Practice this next</Text>
            <View style={styles.scoreRow}>
              <Text style={type.listTitle}>{skillLabels[data.practiceNext.skill]}</Text>
              <Text style={type.caption}>
                {data.practiceNext.score} · {data.practiceNext.delta >= 0 ? '↑' : '↓'}
                {Math.abs(data.practiceNext.delta)}
              </Text>
            </View>
            <Text style={type.secondary}>{data.practiceNext.note}</Text>
          </Card>
        </View>
      </Screen>
    </View>
  );
}

function Delta({ value }: { value: number }) {
  const up = value >= 0;
  return (
    <Text style={[styles.delta, up ? styles.deltaUp : styles.deltaDown]}>
      {up ? '↑' : '↓'}
      {Math.abs(value)}
    </Text>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surfaceAlt,
  },
  content: {
    gap: spacing.xl,
    paddingTop: spacing.sm,
    paddingBottom: spacing.huge,
  },
  overall: {
    gap: spacing.sm,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.sm,
  },
  score: {
    ...type.timer,
  },
  delta: {
    fontFamily: fontFamily.numeric,
    fontSize: 14,
    fontWeight: '700',
  },
  deltaUp: { color: colors.success },
  deltaDown: { color: colors.primary },
  insights: {
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  skills: {
    gap: spacing.sm,
  },
  pair: {
    gap: spacing.md,
  },
  pairCard: {
    gap: spacing.sm,
  },
  pairLabel: {
    ...type.badge,
    color: colors.success,
  },
  pairLabelNext: {
    color: colors.primary,
  },
});
