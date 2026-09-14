import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';

import { SkillBandBadge } from './Badge';
import { bandLabels, skillLabels } from '@/data/skills';
import type { SkillBand, SkillId } from '@/data/types';
import { colors, radius } from '@/theme/tokens';
import { fontFamily, type } from '@/theme/typography';

type Props = {
  skill: SkillId;
  score: number;
  band: SkillBand;
};

/** Label 15/500 · score · band badge · 8px track. Scores run 0–100. */
export function SkillBar({ skill, score, band }: Props) {
  const fill = colors[band === 'needs-work' ? 'primary' : band === 'medium' ? 'info' : 'success'];

  return (
    <View style={styles.row}>
      <View style={styles.header}>
        <Text style={type.body}>{skillLabels[skill]}</Text>
        <View style={styles.right}>
          <Text style={styles.score}>{score}</Text>
          <SkillBandBadge band={band} label={bandLabels[band]} />
        </View>
      </View>
      <View style={styles.track}>
        <View
          style={[
            styles.fill,
            { width: `${Math.max(0, Math.min(100, score))}%`, backgroundColor: fill },
          ]}
        />
      </View>
    </View>
  );
}

/** `0–100` caption that sits beside a breakdown heading. */
export function ScaleCaption() {
  return <Text style={type.caption}>0–100</Text>;
}

/**
 * MY-2 variant: label · 10px track with the blue gradient fill · score.
 * The stats screens show trends, not bands, so there's no badge here.
 */
export function SkillBarCompact({ skill, score }: { skill: SkillId; score: number }) {
  return (
    <View style={styles.compactRow}>
      <Text style={styles.compactLabel} numberOfLines={1}>
        {skillLabels[skill]}
      </Text>
      <View style={styles.compactTrack}>
        <LinearGradient
          colors={[colors.bubbleUser, colors.bubbleUserStrong]}
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 0 }}
          style={[styles.compactFill, { width: `${Math.max(0, Math.min(100, score))}%` }]}
        />
      </View>
      <Text style={styles.compactScore}>{score}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  score: {
    fontFamily: fontFamily.numeric,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '600',
    color: colors.ink,
  },
  track: {
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.fill,
    overflow: 'hidden',
  },
  fill: {
    height: 8,
    borderRadius: radius.pill,
  },
  compactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  compactLabel: {
    width: 86,
    fontFamily: fontFamily.sans,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  compactTrack: {
    flex: 1,
    height: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.fillAlt,
    overflow: 'hidden',
  },
  compactFill: {
    height: 10,
    borderRadius: radius.pill,
  },
  compactScore: {
    width: 24,
    textAlign: 'right',
    fontFamily: fontFamily.numeric,
    fontSize: 13,
    fontWeight: '700',
    color: colors.inkAlt,
  },
});
