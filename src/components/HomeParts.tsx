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

/**
 * The comp's streak flame: a 10.7×13.3 primary body at (2.67,1.33) with a
 * #FFC800 core at (6,8), the pair mirrored horizontally inside a 16×16 box
 * (`transform: matrix(-1,0,0,1,0,0)`). The yellow is illustration-only, so it
 * lives here rather than in the token table.
 */
function FlameIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 16 16">
      <G transform="translate(16 0) scale(-1 1)">
        <G transform="translate(2.667 1.333)">
          <Path d="M 1.484 4.882 L 1.482 4.883 L 1.48 4.885 L 1.473 4.891 C 1.443 4.913 1.414 4.936 1.386 4.96 C 1.314 5.022 1.245 5.087 1.178 5.154 C 1.013 5.323 0.801 5.573 0.602 5.909 C 0.201 6.585 -0.135 7.594 0.054 8.943 C 0.241 10.274 0.818 11.387 1.794 12.163 C 2.767 12.936 4.085 13.333 5.678 13.333 C 7.321 13.333 8.633 12.737 9.501 11.713 C 10.361 10.699 10.745 9.316 10.653 7.804 C 10.565 6.353 9.75 5.253 9.029 4.281 L 8.823 4.003 C 8.037 2.928 7.417 1.938 7.568 0.553 C 7.576 0.483 7.568 0.412 7.546 0.346 C 7.523 0.279 7.487 0.218 7.438 0.166 C 7.39 0.113 7.331 0.072 7.265 0.043 C 7.198 0.015 7.127 0 7.055 0 C 6.792 0 6.49 0.079 6.2 0.197 C 5.863 0.337 5.546 0.516 5.255 0.731 C 4.618 1.196 3.981 1.897 3.642 2.835 C 3.303 3.769 3.476 4.66 3.723 5.309 C 3.886 5.735 3.71 6.155 3.443 6.278 C 3.33 6.33 3.2 6.337 3.081 6.299 C 2.962 6.26 2.863 6.179 2.805 6.071 L 2.25 5.051 C 2.216 4.987 2.167 4.931 2.108 4.887 C 2.049 4.843 1.98 4.811 1.907 4.796 C 1.835 4.78 1.759 4.779 1.686 4.794 C 1.613 4.809 1.544 4.839 1.484 4.883 Z" fill={colors.primary} fillRule="evenodd" />
        </G>
        <G transform="translate(6 8)">
          <Path d="M 2.333 0 C 2.333 0 4.667 1.29 4.667 3.093 C 4.667 4.33 3.622 5.333 2.333 5.333 C 1.045 5.333 0 4.33 0 3.093 C 0 1.29 2.333 0 2.333 0 Z" fill="#FFC800" fillRule="evenodd" />
        </G>
      </G>
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
    // The comp declares rgba(255,255,255,0.43), which it composites over the
    // #F7F8FD page ground. The card is sticky now and floats over the situation
    // grid, so it carries that composite as an opaque fill — same colour where
    // the comp shows it, and the list no longer reads through it.
    backgroundColor: '#FAFBFE',
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
