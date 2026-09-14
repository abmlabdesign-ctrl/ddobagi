import { StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { bandColors } from '@/data/skills';
import type { Difficulty, SkillBand } from '@/data/types';
import { colors, radius } from '@/theme/tokens';
import { fontFamily } from '@/theme/typography';

type Props = {
  label: string;
  color: string;
  background: string;
  /** 10/16/600 instead of 12/16/600 — used for `In progress` on cards. */
  micro?: boolean;
  style?: ViewStyle;
};

export function Badge({ label, color, background, micro = false, style }: Props) {
  return (
    <View style={[styles.badge, { backgroundColor: background }, style]}>
      <Text style={[styles.label, micro ? styles.micro : null, { color }]}>{label}</Text>
    </View>
  );
}

/** Easy → success, Medium → info, Hard → primary. */
const difficultyColors: Record<Difficulty, { text: string; background: string }> = {
  Easy: { text: colors.success, background: colors.successBg },
  Medium: { text: colors.info, background: colors.infoBg },
  Hard: { text: colors.primary, background: colors.primary100 },
};

export function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  const tone = difficultyColors[difficulty];
  return <Badge label={difficulty} color={tone.text} background={tone.background} />;
}

export function SkillBandBadge({ band, label }: { band: SkillBand; label: string }) {
  const tone = bandColors[band];
  return <Badge label={label} color={tone.text} background={tone.background} />;
}

export function InProgressBadge() {
  return (
    <Badge label="In progress" color={colors.primary} background={colors.primary100} micro />
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: radius.badge,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  label: {
    fontFamily: fontFamily.sans,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
  },
  micro: {
    fontSize: 10,
  },
});
