import { StyleSheet, Text, View, type ViewStyle } from 'react-native';

import type { Difficulty } from '@/data/types';
import { colors, radius } from '@/theme/tokens';
import { text, type } from '@/theme/typography';

type Props = {
  label: string;
  color: string;
  background: string;
  style?: ViewStyle;
};

/** r8 · padding 4/8 · 12/16/600 — the difficulty badge on situation cards. */
export function Badge({ label, color, background, style }: Props) {
  return (
    <View style={[styles.badge, { backgroundColor: background }, style]}>
      <Text style={[type.badge, { color }]}>{label}</Text>
    </View>
  );
}

const difficultyColors: Record<Difficulty, { text: string; background: string }> = {
  Easy: { text: colors.success, background: colors.successBg },
  Medium: { text: colors.info, background: colors.infoBg },
  Hard: { text: colors.primary, background: colors.primary100 },
};

export function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  const tone = difficultyColors[difficulty];
  return <Badge label={difficulty} color={tone.text} background={tone.background} />;
}

/** RP-2 meta chip — r8, `#F2F3F5`, padding 3/8, 12/16/500. */
export function MetaChip({ label }: { label: string }) {
  return (
    <View style={styles.metaChip}>
      <Text style={styles.metaChipLabel}>{label}</Text>
    </View>
  );
}

/** Compact count badge — r8, tinted, padding 3/8, 11/16/600. */
export function CountBadge({
  label,
  color = colors.primary,
  background = colors.primary100,
}: {
  label: string;
  color?: string;
  background?: string;
}) {
  return (
    <View style={[styles.countBadge, { backgroundColor: background }]}>
      <Text style={[type.badgeSmall, { color }]}>{label}</Text>
    </View>
  );
}

/** `In progress` — r60 pill, 10/16/600, used on the home resume card. */
export function InProgressBadge() {
  return (
    <View style={styles.progressBadge}>
      <Text style={[type.micro, styles.progressBadgeLabel]}>In progress</Text>
    </View>
  );
}

/** White pill used as a heading label on ON-4 and RP-4. */
export function PillLabel({ label }: { label: string }) {
  return (
    <View style={styles.pill}>
      <Text style={styles.pillLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: radius.badge,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  metaChip: {
    borderRadius: radius.badge,
    backgroundColor: colors.fill,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  metaChipLabel: text(12, 16, '500', colors.ink),
  countBadge: {
    borderRadius: radius.badge,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  progressBadge: {
    borderRadius: 60,
    backgroundColor: colors.primary100,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  progressBadgeLabel: {
    color: colors.primary,
  },
  pill: {
    height: 24,
    paddingHorizontal: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  pillLabel: text(12, 16, '600', colors.primary),
});
