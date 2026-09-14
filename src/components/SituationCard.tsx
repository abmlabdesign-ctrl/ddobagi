import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { DifficultyBadge, InProgressBadge } from './Badge';
import type { Situation } from '@/data/types';
import { colors, shadows } from '@/theme/tokens';
import { fontFamily, type } from '@/theme/typography';

type Props = {
  situation: Situation;
  onPress?: () => void;
  /** `About 8 min` on the home rail, `8 min` in browse. */
  durationPrefix?: string;
};

/** 164 × 160, radius 24, white on `surface-alt`. Two per row with a 12px gap. */
export function SituationCard({ situation, onPress, durationPrefix = '' }: Props) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${situation.title}, ${situation.difficulty}, ${situation.minutes} minutes`}
      style={({ pressed }) => [styles.card, pressed ? styles.pressed : null]}
    >
      <View style={styles.top}>
        <View style={styles.badgeRow}>
          <DifficultyBadge difficulty={situation.difficulty} />
          {situation.progress ? <InProgressBadge /> : null}
        </View>
        <Text style={styles.title} numberOfLines={2}>
          {situation.title}
        </Text>
      </View>

      <View style={styles.metaRow}>
        <View style={styles.meta}>
          <ClockIcon />
          <Text style={styles.metaLabel}>
            {durationPrefix}
            {situation.minutes} min
          </Text>
        </View>
        {situation.progress ? (
          <Text style={styles.progress}>{situation.progress.percent}%</Text>
        ) : null}
      </View>
    </Pressable>
  );
}

function ClockIcon() {
  return (
    <Svg width={12} height={12} viewBox="0 0 12 12">
      <Circle cx={6} cy={6} r={5} stroke={colors.textSecondary} strokeWidth={1.2} fill="none" />
      <Path
        d="M6 3.2V6l2 1.2"
        stroke={colors.textSecondary}
        strokeWidth={1.2}
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    minHeight: 160,
    borderRadius: 24,
    backgroundColor: colors.surface,
    paddingVertical: 16,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    ...shadows.card,
  },
  pressed: {
    backgroundColor: colors.fill,
  },
  top: {
    gap: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    ...type.section,
    color: colors.inkAlt,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaLabel: {
    fontFamily: fontFamily.numeric,
    fontSize: 12,
    fontWeight: '400',
    color: colors.textSecondary,
  },
  progress: {
    fontFamily: fontFamily.numeric,
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
});
