import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { DifficultyBadge } from './Badge';
import type { Situation } from '@/data/types';
import { colors, radius } from '@/theme/tokens';
import { numeral, text, type } from '@/theme/typography';

type Props = {
  situation: Situation;
  onPress?: () => void;
  /** `About 8 min` on the home rail, `8 min` in browse. */
  durationPrefix?: string;
  /** RP-1 shows a progress bar at the card's foot; the home rail does not. */
  showProgress?: boolean;
};

/**
 * 164×160, radius 24, white on `surface-alt`. The comps give this card no
 * shadow and no status badge — progress is a bar, and only on RP-1.
 */
export function SituationCard({
  situation,
  onPress,
  durationPrefix = '',
  showProgress = false,
}: Props) {
  const progress = showProgress ? situation.progress : undefined;

  const duration = (
    <View style={styles.meta}>
      <View style={styles.clock}>
        <ClockIcon />
      </View>
      <Text style={styles.metaLabel}>
        {durationPrefix}
        {situation.minutes} min
      </Text>
    </View>
  );

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${situation.title}, ${situation.difficulty}, ${situation.minutes} minutes`}
      style={({ pressed }) => [styles.card, pressed ? styles.pressed : null]}
    >
      <View style={styles.top}>
        <DifficultyBadge difficulty={situation.difficulty} />
        <Text style={styles.title} numberOfLines={2}>
          {situation.title}
        </Text>
        {/* The card is a space-between column, so whatever comes last is pinned
            to its foot. With a progress bar the duration rides with the title;
            without one the duration takes the foot itself — both comps agree. */}
        {progress ? duration : null}
      </View>

      {progress ? (
        <View style={styles.progressRow}>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${progress.percent}%` }]} />
          </View>
          <Text style={styles.percent}>{progress.percent}%</Text>
        </View>
      ) : (
        duration
      )}
    </Pressable>
  );
}

function ClockIcon() {
  return (
    <Svg width={12} height={12} viewBox="0 0 12 12">
      <Circle cx={6} cy={6} r={5} stroke={colors.textTertiary} strokeWidth={1} fill="none" />
      <Path
        d="M6 3.2V6l2 1.2"
        stroke={colors.textTertiary}
        strokeWidth={1}
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    // The comps fix the card at 160 so the two columns stay level.
    height: 160,
    borderRadius: 24,
    backgroundColor: colors.surface,
    paddingVertical: 16,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  pressed: {
    backgroundColor: colors.fill,
  },
  top: {
    gap: 8,
    alignItems: 'flex-start',
  },
  title: {
    ...type.section,
    alignSelf: 'stretch',
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  /** The comp centres the 12px clock inside a 16px box before the 2px gap. */
  clock: {
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaLabel: numeral(12, 12, '400', colors.textSecondary),
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  track: {
    flex: 1,
    height: 7,
    borderRadius: radius.pill,
    backgroundColor: colors.track,
    overflow: 'hidden',
  },
  fill: {
    height: 7,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },
  percent: text(12, 16, '500', colors.primary),
});
