import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { Card } from '@/components/Card';
import { Segmented } from '@/components/Controls';
import { NavBar } from '@/components/NavBar';
import { Screen, ScreenShell } from '@/components/Screen';
import { SkillBarCompact } from '@/components/SkillBar';
import { stats } from '@/data/profile';
import { skillLabels } from '@/data/skills';
import type { StatsPeriod } from '@/data/types';
import { ListChevronIcon } from '@/icons';
import { colors, radius, shadows, spacing } from '@/theme/tokens';
import { numeral, text, type } from '@/theme/typography';

const periods = ['Weekly', 'Monthly'] as const;

/** MY-2 / MY-2b Stats */
export default function Stats() {
  const [period, setPeriod] = useState<(typeof periods)[number]>('Weekly');
  const data = stats[period.toLowerCase() as StatsPeriod];

  return (
    <ScreenShell>
      <NavBar title="Stats" />

      <Screen scroll background="surface-alt" contentStyle={styles.content}>
        <Segmented options={periods} value={period} onChange={setPeriod} />

        {/* The comp puts the score outside any card, with the range on the right. */}
        <View style={styles.scoreRow}>
          <View style={styles.scoreText}>
            <Text style={styles.scoreLabel}>{data.heading}</Text>
            <View style={styles.scoreValue}>
              <Text style={type.timer}>{data.score}</Text>
              <Delta value={data.delta} />
            </View>
          </View>
          <Text style={styles.rangeLabel}>{data.rangeLabel}</Text>
        </View>

        <InsightCard headline={data.insights[0]} detail={data.insights[1]} />

        <Card
          radiusToken="group"
          elevation="card"
          paddingHorizontal={20}
          paddingVertical={12}
          style={styles.skillsCard}
        >
          <View style={styles.skillsHeader}>
            <Text style={type.label}>6-skill scores</Text>
            <View style={styles.periodStepper}>
              <ListChevronIcon color={colors.inkAlt} />
              <Text style={styles.periodLabel}>{data.rangeLabel}</Text>
            </View>
          </View>
          <View style={styles.skillsList}>
            {data.skills.map((entry) => (
              <SkillBarCompact key={entry.skill} skill={entry.skill} score={entry.score} />
            ))}
          </View>
        </Card>

        <View style={styles.pair}>
          <Card radiusToken="group" elevation="card" padding={20} style={styles.pairCard}>
            <Text style={styles.pairLabel}>Biggest gain</Text>
            <View style={styles.pairRow}>
              <Text style={type.cardTitle}>{skillLabels[data.biggestGain.skill]}</Text>
              <Delta value={data.biggestGain.delta} />
            </View>
            <Text style={type.description}>{data.biggestGain.note}</Text>
          </Card>

          <Card radiusToken="group" elevation="card" padding={20} style={styles.pairCard}>
            <Text style={[styles.pairLabel, styles.pairLabelNext]}>Practice this next</Text>
            <View style={styles.pairRow}>
              <Text style={type.cardTitle}>{skillLabels[data.practiceNext.skill]}</Text>
              <Text style={type.caption}>
                {data.practiceNext.score} · {data.practiceNext.delta >= 0 ? '↑' : '↓'}
                {Math.abs(data.practiceNext.delta)}
              </Text>
            </View>
            <Text style={type.description}>{data.practiceNext.note}</Text>
          </Card>
        </View>
      </Screen>
    </ScreenShell>
  );
}

/** Gradient card with a primary hairline — the comp's headline insight. */
function InsightCard({ headline, detail }: { headline: string; detail: string }) {
  return (
    <View style={styles.insight}>
      <View style={styles.insightText}>
        <Text style={styles.insightHeadline}>{headline}</Text>
        <Text style={styles.insightDetail}>{detail}</Text>
      </View>
      <Svg width={76} height={76} viewBox="0 0 76 76">
        <Circle cx={38} cy={38} r={32} stroke={colors.primary200} strokeWidth={8} fill="none" />
        <Circle
          cx={38}
          cy={38}
          r={32}
          stroke={colors.primary}
          strokeWidth={8}
          strokeLinecap="round"
          strokeDasharray={`${2 * Math.PI * 32 * 0.72} ${2 * Math.PI * 32}`}
          transform="rotate(-90 38 38)"
          fill="none"
        />
      </Svg>
    </View>
  );
}

function Delta({ value }: { value: number }) {
  const up = value >= 0;
  return (
    <Text style={styles.delta}>
      {up ? '↑' : '↓'}
      {Math.abs(value)}
    </Text>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 10,
    paddingTop: 12,
    paddingBottom: spacing.huge,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  scoreText: {
    gap: 2,
  },
  scoreLabel: text(13, 19, '500', colors.textSecondary),
  scoreValue: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  rangeLabel: text(12, 16, '500', colors.textSecondary),
  delta: numeral(16, 22, '700', colors.primary),
  insight: {
    borderRadius: radius.group,
    backgroundColor: colors.primary100,
    borderWidth: 1,
    borderColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    ...shadows.insight,
  },
  insightText: {
    flex: 1,
    gap: 6,
  },
  insightHeadline: text(18, 27, '700', colors.inkAlt),
  insightDetail: text(13, 19, '400', '#3C424C'),
  skillsCard: {
    gap: 12,
  },
  skillsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  periodStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  periodLabel: text(12, 16, '600', colors.inkAlt),
  skillsList: {
    gap: 8,
  },
  pair: {
    gap: 10,
  },
  pairCard: {
    gap: 6,
  },
  pairRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  pairLabel: text(12, 16, '600', colors.success),
  pairLabelNext: {
    color: colors.primary,
  },
});
