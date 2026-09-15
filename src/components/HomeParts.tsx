import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

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

function BellIcon() {
  return (
    <Svg width={20} height={17} viewBox="0 0 20 20">
      <Path
        d="M10 2.2a5.4 5.4 0 0 1 5.4 5.4v3.1l1.2 2.2a.8.8 0 0 1-.7 1.2H4.1a.8.8 0 0 1-.7-1.2l1.2-2.2V7.6A5.4 5.4 0 0 1 10 2.2zM8.1 15.8h3.8a1.9 1.9 0 0 1-3.8 0z"
        fill={colors.ink}
      />
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
