import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Defs, G, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

import { InProgressBadge } from './Badge';
import { PlayIcon } from '@/icons';
import type { Situation } from '@/data/types';
import { colors, radius, shadows } from '@/theme/tokens';
import { numeral, text } from '@/theme/typography';

/** Streak pill + notification bell that sit above the greeting on HM-1. */
export function HomeStatusRow({ streakDays }: { streakDays: number }) {
  return (
    <View style={styles.statusRow}>
      <View style={styles.streak}>
        <FlameIcon />
        <Text style={styles.streakLabel}>{streakDays}</Text>
      </View>
      <Pressable
        hitSlop={10}
        accessibilityRole="button"
        accessibilityLabel="Notifications"
        style={styles.bell}
      >
        <BellIcon />
      </Pressable>
    </View>
  );
}

function FlameIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 16 16">
      <Path
        d="M8.4 1.2c.3 2 1.6 2.9 2.6 4 1 1.1 1.6 2.3 1.6 3.9A4.6 4.6 0 0 1 8 13.9a4.6 4.6 0 0 1-4.6-4.8c0-1.5.7-2.6 1.5-3.4.2.7.7 1.2 1.3 1.3.3-2.1 1.3-3.6 2.2-5.8z"
        fill={colors.primary}
      />
    </Svg>
  );
}

/**
 * The comp's bell: a filled 20×17 body at (2,1) and a separate 5.5×3 clapper
 * at (9.27,20), both in a 24×24 box — no stroke, and the clapper sits clear of
 * the body rather than touching it.
 */
function BellIcon() {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24">
      <G transform="translate(2 1)">
        <Path d="M 15 7 C 15 5.674 14.473 4.403 13.535 3.465 C 12.597 2.527 11.326 2 10 2 C 8.674 2 7.403 2.527 6.465 3.465 C 5.527 4.403 5 5.674 5 7 C 5 10.647 4.217 13.065 3.378 14.604 C 3.302 14.743 3.224 14.875 3.147 15 L 16.853 15 C 16.776 14.875 16.698 14.743 16.622 14.604 C 15.783 13.065 15 10.647 15 7 Z M 17 7 C 17 10.353 17.717 12.435 18.378 13.646 C 18.71 14.255 19.032 14.654 19.257 14.891 C 19.369 15.009 19.459 15.087 19.512 15.132 C 19.538 15.154 19.556 15.168 19.563 15.174 C 19.562 15.173 19.561 15.172 19.56 15.171 L 19.556 15.169 C 19.922 15.414 20.085 15.869 19.957 16.29 C 19.829 16.712 19.441 17 19 17 L 1 17 C 0.559 17 0.171 16.712 0.043 16.29 C -0.085 15.869 0.078 15.414 0.444 15.169 L 0.44 15.171 C 0.439 15.172 0.438 15.173 0.437 15.174 C 0.444 15.168 0.462 15.154 0.488 15.132 C 0.542 15.087 0.631 15.009 0.743 14.891 C 0.968 14.654 1.29 14.255 1.622 13.646 C 2.283 12.435 3 10.353 3 7 C 3 5.143 3.737 3.363 5.05 2.05 C 6.363 0.737 8.143 0 10 0 C 11.857 0 13.637 0.737 14.95 2.05 C 16.263 3.363 17 5.143 17 7 Z" fill={colors.ink} fillRule="evenodd" />
      </G>
      <G transform="translate(9.27 20)">
        <Path d="M 3.595 0.498 C 3.872 0.021 4.485 -0.142 4.962 0.135 C 5.44 0.412 5.603 1.025 5.326 1.502 C 5.062 1.957 4.683 2.334 4.228 2.596 C 3.773 2.858 3.256 2.996 2.731 2.996 C 2.205 2.996 1.688 2.858 1.233 2.596 C 0.778 2.334 0.399 1.957 0.135 1.502 C -0.142 1.025 0.021 0.412 0.498 0.135 C 0.976 -0.142 1.588 0.021 1.866 0.498 C 1.953 0.65 2.079 0.776 2.231 0.864 C 2.383 0.951 2.556 0.996 2.731 0.996 C 2.906 0.996 3.078 0.951 3.23 0.864 C 3.382 0.776 3.507 0.65 3.595 0.498 Z" fill={colors.ink} fillRule="evenodd" />
      </G>
    </Svg>
  );
}

/** HM-1 resume card — a glow card, not a plain one. */
export function ResumeCard({
  situation,
  onPress,
}: {
  situation: Situation;
  onPress: () => void;
}) {
  const progress = situation.progress;
  if (!progress) return null;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Resume ${situation.title}`}
      style={styles.resume}
    >
      <View style={styles.resumeMain}>
        <View style={styles.resumeHeader}>
          <InProgressBadge />
          <Text style={styles.resumeTitle} numberOfLines={1}>
            {situation.title}
          </Text>
        </View>
        <View style={styles.resumeTrack}>
          <View style={[styles.resumeFill, { width: `${progress.percent}%` }]} />
        </View>
      </View>

      <View style={styles.resumeSide}>
        <Text style={styles.resumeCount}>
          {progress.completed}/{progress.total}
        </Text>
        <View style={styles.resumePlay}>
          <PlayIcon size={8} />
        </View>
      </View>
    </Pressable>
  );
}

/** The layered card graphic in the Mistake log tile. */
export function MistakeLogArt() {
  return (
    <View style={styles.art} pointerEvents="none">
      <View style={styles.artBack} />
      <View style={styles.artFront}>
        <Svg width={22} height={28} viewBox="0 0 22 28">
          <Path d="M4 6h14M4 12h14M4 18h9" stroke={colors.surface} strokeWidth={2} strokeLinecap="round" />
        </Svg>
      </View>
    </View>
  );
}

/** `radial-gradient(… at 17.27% 100%, #FF6A3D, #FFD1C3)` behind the tile. */
export function MistakeLogBackground() {
  return (
    <Svg style={StyleSheet.absoluteFill} width="100%" height="100%">
      <Defs>
        <LinearGradient id="mistake" x1="0.17" y1="1" x2="0.95" y2="0.05">
          <Stop offset="0" stopColor={colors.primary} />
          <Stop offset="1" stopColor={colors.primary200} />
        </LinearGradient>
      </Defs>
      <Rect x="0" y="0" width="100%" height="100%" fill="url(#mistake)" />
    </Svg>
  );
}

const styles = StyleSheet.create({
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 24,
  },
  streak: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
  },
  streakLabel: text(12, 16, '600', colors.ink),
  bell: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resume: {
    borderRadius: radius.button,
    backgroundColor: 'rgba(255,255,255,0.43)',
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 16,
    padding: 16,
    ...shadows.micGlow,
  },
  resumeMain: {
    flex: 1,
    gap: 12,
  },
  resumeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  resumeTitle: {
    ...text(15, 26, '600', colors.ink),
    letterSpacing: -0.3,
    flexShrink: 1,
  },
  resumeTrack: {
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(153,164,181,0.5)',
    overflow: 'hidden',
  },
  resumeFill: {
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },
  resumeSide: {
    alignItems: 'center',
    justifyContent: 'space-between',
    alignSelf: 'stretch',
    gap: 8,
  },
  resumeCount: numeral(11, 16, '400', colors.ink),
  resumePlay: {
    width: 24,
    height: 24,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  art: {
    position: 'absolute',
    top: 10,
    right: 9,
    width: 66,
    height: 66,
  },
  artBack: {
    position: 'absolute',
    left: 19,
    top: 5,
    width: 36,
    height: 46,
    borderRadius: 6,
    backgroundColor: 'rgba(255,106,61,0.7)',
  },
  artFront: {
    position: 'absolute',
    left: 10,
    top: 13,
    width: 36,
    height: 46,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
