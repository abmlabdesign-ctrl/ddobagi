import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';

import { bandColors, bandLabels, skillLabels } from '@/data/skills';
import type { SkillBand, SkillId } from '@/data/types';
import { colors, radius } from '@/theme/tokens';
import { numeral, text, type } from '@/theme/typography';

type Props = {
  skill: SkillId;
  score: number;
  band: SkillBand;
};

/**
 * ON-4 / RP-4 breakdown row. The fill is the same orange gradient for every
 * skill — the band only changes the label on the right, and `needs-work` is a
 * bare text label rather than a badge.
 */
export function SkillBar({ skill, score, band }: Props) {
  const clamped = Math.max(0, Math.min(100, score));

  return (
    <View style={styles.row}>
      <View style={styles.header}>
        <View style={styles.labelGroup}>
          <Text style={type.bodyRegular}>{skillLabels[skill]}</Text>
          <Text style={styles.score}>{score}</Text>
        </View>
        <BandLabel band={band} />
      </View>

      <View style={styles.track}>
        <LinearGradient
          colors={[colors.primary300, colors.primary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.fill, { width: `${clamped}%` }]}
        />
      </View>
    </View>
  );
}

function BandLabel({ band }: { band: SkillBand }) {
  if (band === 'needs-work') {
    return <Text style={styles.needsWork}>{bandLabels[band]}</Text>;
  }
  const tone = bandColors[band];
  return (
    <View style={[styles.badge, { backgroundColor: tone.background }]}>
      <Text style={[styles.badgeLabel, { color: tone.text }]}>{bandLabels[band]}</Text>
    </View>
  );
}

/** MY-2 variant: label · 10px track · score, with no band. */
export function SkillBarCompact({
  skill,
  score,
  highlight = false,
}: {
  skill: SkillId;
  score: number;
  /** MY-2 paints one row orange — the axis the screen wants read first. */
  highlight?: boolean;
}) {
  return (
    <View style={styles.compactRow}>
      <Text
        style={[styles.compactLabel, highlight ? styles.compactLabelOn : null]}
        numberOfLines={1}
      >
        {skillLabels[skill]}
      </Text>
      <View style={styles.compactTrack}>
        <LinearGradient
          colors={
            highlight
              ? [colors.primary, colors.primary200]
              : [colors.bubbleUser, colors.bubbleUserStrong]
          }
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 0 }}
          style={[styles.compactFill, { width: `${Math.max(0, Math.min(100, score))}%` }]}
        />
      </View>
      <Text style={[styles.compactScore, highlight ? styles.compactScoreOn : null]}>{score}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: 6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  labelGroup: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  score: text(16, 22, '500', colors.inkAlt),
  badge: {
    borderRadius: radius.chipBadge,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeLabel: text(12, 16, '400'),
  needsWork: text(13, 19, '600', colors.primary),
  track: {
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.track,
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
    ...text(12, 16, '500', colors.textSecondary),
    width: 86,
  },
  compactLabelOn: text(12, 16, '600', colors.primary),
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
    ...numeral(13, 18, '700', colors.inkAlt),
    width: 24,
    textAlign: 'right',
  },
  compactScoreOn: {
    color: colors.primary,
  },
});
