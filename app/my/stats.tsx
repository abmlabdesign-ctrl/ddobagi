import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';
import Svg, { Circle, Line, Polyline, Text as SvgText } from 'react-native-svg';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Segmented } from '@/components/Controls';
import { NavBar } from '@/components/NavBar';
import { Screen, ScreenShell } from '@/components/Screen';
import { SkillBarCompact } from '@/components/SkillBar';
import { missions } from '@/data/missions';
import { stats } from '@/data/profile';
import { skillLabels } from '@/data/skills';
import type { SkillId, StatsPeriod } from '@/data/types';
import { StepChevronIcon } from '@/icons';
import { colors, radius, spacing } from '@/theme/tokens';
import { fontFamily, numeral, text, type } from '@/theme/typography';

const periods = ['Weekly', 'Monthly'] as const;

/**
 * MY-2 / MY-2b Stats.
 *
 * Reads top to bottom as a story rather than a scoreboard: where you are now,
 * how you got here, where each axis stands, what improved, what to do next.
 * Only one change number survives — the biggest gain — because a screen full of
 * ↑/↓ makes the reader do the comparing the chart is there to do for them.
 */
export default function Stats() {
  const [period, setPeriod] = useState<(typeof periods)[number]>('Weekly');
  // How far back the 6-skill card is looking; 0 is the period the header shows.
  const [back, setBack] = useState(0);
  const data = stats[period.toLowerCase() as StatsPeriod];

  const index = Math.min(Math.max(data.trend.length - 1 - back, 0), data.trend.length - 1);
  const viewing = data.trend[index];
  const atLatest = index === data.trend.length - 1;

  const practiceMission = missions.find((mission) => mission.kind === data.practiceNext.skill);

  return (
    <ScreenShell bottomEdge="content">
      <NavBar title="Stats" />

      <Screen scroll background="surface-alt" contentStyle={styles.content}>
        <Segmented
          options={periods}
          value={period}
          onChange={(next) => {
            setPeriod(next);
            setBack(0);
          }}
        />

        {/* The comp puts the score outside any card, with the range on the right. */}
        <View style={styles.scoreRow}>
          <View style={styles.scoreText}>
            <Text style={styles.scoreLabel}>{data.heading}</Text>
            <Text style={type.timer}>{data.score}</Text>
          </View>
          <Text style={styles.rangeLabel}>{data.rangeLabel}</Text>
        </View>

        <Card
          radiusToken="group"
          elevation="card"
          paddingHorizontal={20}
          paddingVertical={16}
          style={styles.block}
        >
          <View style={styles.blockHead}>
            <Text style={type.label}>Overall progress</Text>
            <Text style={styles.blockMeta}>{data.trendLabel}</Text>
          </View>
          <TrendChart points={data.trend} />
        </Card>

        <Card
          radiusToken="group"
          elevation="card"
          paddingHorizontal={20}
          paddingVertical={16}
          style={styles.block}
        >
          <View style={styles.blockHead}>
            <Text style={type.label}>6-skill scores</Text>
            {/* `gap:8` between two 24px round hit boxes and a 12/600 label. */}
            <View style={styles.stepper}>
              <Pressable
                onPress={() => setBack((value) => Math.min(value + 1, data.trend.length - 1))}
                disabled={index === 0}
                accessibilityRole="button"
                accessibilityState={{ disabled: index === 0 }}
                accessibilityLabel={`Previous ${period === 'Weekly' ? 'week' : 'month'}`}
                style={styles.stepperArrow}
              >
                <StepChevronIcon
                  back
                  color={index === 0 ? colors.textTertiary : colors.inkAlt}
                />
              </Pressable>
              <Text style={styles.stepperLabel}>{viewing.rangeLabel}</Text>
              <Pressable
                onPress={() => setBack((value) => Math.max(value - 1, 0))}
                disabled={atLatest}
                accessibilityRole="button"
                accessibilityState={{ disabled: atLatest }}
                accessibilityLabel={`Next ${period === 'Weekly' ? 'week' : 'month'}`}
                style={styles.stepperArrow}
              >
                <StepChevronIcon color={atLatest ? colors.textTertiary : colors.inkAlt} />
              </Pressable>
            </View>
          </View>
          <View style={styles.skillsList}>
            {viewing.skills.map((entry) => (
              <SkillBarCompact
                key={entry.skill}
                skill={entry.skill}
                score={entry.score}
                // The gain is a fact about the period the header shows, so the
                // orange row only means something while that period is up.
                highlight={atLatest && entry.skill === data.biggestGain.skill}
              />
            ))}
          </View>
        </Card>

        <Card radiusToken="group" elevation="card" padding={20} style={styles.insight}>
          <Text style={[styles.tag, styles.tagGain]}>Biggest gain</Text>
          <View style={styles.insightRow}>
            <Text style={type.cardTitle}>{skillLabels[data.biggestGain.skill]}</Text>
            <Text style={styles.gainDelta}>↑{data.biggestGain.delta}</Text>
          </View>
          <Text style={styles.insightNote}>{data.biggestGain.note}</Text>
        </Card>

        <Card radiusToken="group" elevation="card" padding={20} style={styles.insight}>
          <Text style={[styles.tag, styles.tagNext]}>Practice this next</Text>
          <Text style={type.cardTitle}>{skillLabels[data.practiceNext.skill]}</Text>
          <Text style={styles.insightNote}>{data.practiceNext.note}</Text>
          {practiceMission ? (
            <Button
              label={`Practice ${labelFor(data.practiceNext.skill)}`}
              height={48}
              style={styles.practiceCta}
              onPress={() => router.push(`/review/mission?missionId=${practiceMission.id}`)}
            />
          ) : null}
        </Card>
      </Screen>
    </ScreenShell>
  );
}

/** `Practice particles`, not `Practice Particles` — the button is a sentence. */
const labelFor = (skill: SkillId) => skillLabels[skill].toLowerCase();

/**
 * Room for the y labels on the left, and on the right for the end dot's ring
 * plus half of the last tick label — otherwise `Aug 4` runs off the card.
 */
const PAD_LEFT = 28;
const PAD_RIGHT = 24;
const PLOT_TOP = 12;
const PLOT_HEIGHT = 92;
const LABEL_ROW = 20;

/**
 * One series, so no legend — the card title names it. A 2px line with a single
 * end dot, two hairline rules carrying the range, and a tick per period: the
 * shape does the comparing, so no point carries a number of its own.
 */
function TrendChart({ points }: { points: { label: string; score: number }[] }) {
  const [width, setWidth] = useState(0);
  const onLayout = (event: LayoutChangeEvent) => setWidth(event.nativeEvent.layout.width);

  const scores = points.map((point) => point.score);
  // Snapped to tens so the two rules read as round numbers rather than data.
  const low = Math.floor(Math.min(...scores) / 10) * 10;
  const high = Math.ceil(Math.max(...scores) / 10) * 10;
  const span = Math.max(1, high - low);

  const height = PLOT_TOP + PLOT_HEIGHT + LABEL_ROW;
  const innerWidth = Math.max(0, width - PAD_LEFT - PAD_RIGHT);
  const step = points.length > 1 ? innerWidth / (points.length - 1) : 0;
  const x = (index: number) => PAD_LEFT + step * index;
  const y = (score: number) => PLOT_TOP + PLOT_HEIGHT * (1 - (score - low) / span);

  const last = points.length - 1;

  return (
    <View onLayout={onLayout} style={{ height }}>
      {width > 0 ? (
        <Svg width={width} height={height}>
          {[high, low].map((value) => (
            <Line
              key={value}
              x1={PAD_LEFT}
              x2={width - PAD_RIGHT}
              y1={y(value)}
              y2={y(value)}
              stroke={colors.divider}
              strokeWidth={1}
            />
          ))}
          {[high, low].map((value) => (
            <SvgText
              key={`label-${value}`}
              x={PAD_LEFT - 8}
              y={y(value) + 4}
              textAnchor="end"
              fontFamily={fontFamily.numericMedium}
              fontSize={11}
              fill={colors.textTertiary}
            >
              {value}
            </SvgText>
          ))}

          <Polyline
            points={points.map((point, index) => `${x(index)},${y(point.score)}`).join(' ')}
            fill="none"
            stroke={colors.primary}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* The surface ring keeps the end dot legible where it sits on the line. */}
          <Circle cx={x(last)} cy={y(points[last].score)} r={6} fill={colors.surface} />
          <Circle cx={x(last)} cy={y(points[last].score)} r={4} fill={colors.primary} />

          {points.map((point, index) => (
            <SvgText
              key={point.label}
              x={x(index)}
              y={PLOT_TOP + PLOT_HEIGHT + 15}
              textAnchor="middle"
              fontFamily={index === last ? fontFamily.sansSemiBold : fontFamily.sans}
              fontSize={11}
              fill={index === last ? colors.inkAlt : colors.textTertiary}
            >
              {point.label}
            </SvgText>
          ))}
        </Svg>
      ) : null}
    </View>
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
    paddingBottom: 2,
  },
  scoreText: {
    gap: 2,
  },
  scoreLabel: text(13, 19, '500', colors.textSecondary),
  rangeLabel: text(12, 16, '500', colors.textSecondary),
  block: {
    gap: 12,
  },
  blockHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  blockMeta: text(12, 16, '600', colors.textSecondary),
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepperArrow: {
    width: 24,
    height: 24,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperLabel: text(12, 16, '600', colors.inkAlt),
  skillsList: {
    gap: 8,
  },
  insight: {
    gap: 6,
    alignItems: 'flex-start',
  },
  /** The comp's pill: 22 high, 10 side padding, 11/600. */
  tag: {
    height: 22,
    lineHeight: 22,
    paddingHorizontal: 10,
    borderRadius: radius.pill,
    overflow: 'hidden',
    fontFamily: fontFamily.sansSemiBold,
    fontSize: 11,
  },
  tagGain: {
    backgroundColor: colors.primary100,
    color: colors.primary,
  },
  tagNext: {
    backgroundColor: colors.surfaceAlt,
    color: colors.textSecondary,
  },
  insightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  gainDelta: numeral(15, 22, '700', colors.primary),
  insightNote: text(13, 20, '400', colors.textBody),
  practiceCta: {
    alignSelf: 'stretch',
    marginTop: 6,
  },
});
