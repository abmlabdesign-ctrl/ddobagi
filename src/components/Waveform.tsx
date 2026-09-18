import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { colors, radius } from '@/theme/tokens';

/** Bar heights and tints are taken one for one from the ON-3 comp. */
const BARS: { height: number; color: string }[] = [
  { height: 10, color: colors.primary200 },
  { height: 22, color: colors.primary300 },
  { height: 34, color: colors.primary },
  { height: 16, color: colors.primary300 },
  { height: 28, color: colors.primary },
  { height: 12, color: colors.primary200 },
  { height: 24, color: colors.primary300 },
  { height: 36, color: colors.primary },
  { height: 18, color: colors.primary300 },
  { height: 9, color: colors.primary200 },
];

/** Ten 4px bars above the mic. At rest they hold the comp's exact heights. */
export function Waveform({ active = false }: { active?: boolean }) {
  return (
    <View style={styles.row}>
      {BARS.map((bar, index) => (
        <Bar key={index} height={bar.height} color={bar.color} index={index} active={active} />
      ))}
    </View>
  );
}

function Bar({
  height,
  color,
  index,
  active,
}: {
  height: number;
  color: string;
  index: number;
  active: boolean;
}) {
  const scale = useSharedValue(1);

  useEffect(() => {
    if (active) {
      scale.value = withDelay(
        index * 70,
        withRepeat(
          withTiming(height > 24 ? 0.55 : 1.8, {
            duration: 620,
            easing: Easing.inOut(Easing.ease),
          }),
          -1,
          true,
        ),
      );
    } else {
      cancelAnimation(scale);
      scale.value = withTiming(1, { duration: 180 });
    }
    return () => cancelAnimation(scale);
  }, [active, height, index, scale]);

  const style = useAnimatedStyle(() => ({ transform: [{ scaleY: scale.value }] }));

  return <Animated.View style={[styles.bar, { height, backgroundColor: color }, style]} />;
}

const styles = StyleSheet.create({
  row: {
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  bar: {
    width: 4,
    borderRadius: radius.pill,
  },
});
