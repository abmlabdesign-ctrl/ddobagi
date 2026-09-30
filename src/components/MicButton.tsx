import { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { MicIcon } from '@/icons';
import { colors, radius, shadows } from '@/theme/tokens';

type Props = {
  active?: boolean;
  onPress?: () => void;
  size?: number;
  /**
   * Opt-in: draw off and on as two different buttons (white + mic icon at
   * rest, orange + stop square while recording) instead of relying on the
   * glow alone. Off by default so the other screens keep the comp's button.
   */
  distinctStates?: boolean;
};

/** 88px circle, primary fill, `0 0 32px rgba(255,106,61,0.5)` glow pulsing at 1.6s. */
export function MicButton({ active = false, onPress, size = 88, distinctStates = false }: Props) {
  const pulse = useSharedValue(0);

  useEffect(() => {
    if (active) {
      pulse.value = withRepeat(
        withTiming(1, { duration: 1600, easing: Easing.inOut(Easing.ease) }),
        -1,
        true,
      );
    } else {
      cancelAnimation(pulse);
      pulse.value = withTiming(0, { duration: 200 });
    }
    return () => cancelAnimation(pulse);
  }, [active, pulse]);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: 0.1 + pulse.value * 0.18,
    transform: [{ scale: 1.06 + pulse.value * 0.26 }],
  }));

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <Animated.View
        style={[
          styles.glow,
          { width: size, height: size, borderRadius: size / 2 },
          glowStyle,
        ]}
        pointerEvents="none"
      />
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={active ? 'Stop recording' : 'Start recording'}
        accessibilityState={{ selected: active }}
        style={({ pressed }) => [
          styles.button,
          { width: size, height: size, borderRadius: size / 2 },
          distinctStates && !active ? styles.idle : null,
          pressed ? (distinctStates && !active ? styles.idlePressed : styles.pressed) : null,
        ]}
      >
        {distinctStates && active ? (
          <View
            style={[
              styles.stop,
              { width: size * 0.28, height: size * 0.28, borderRadius: size * 0.06 },
            ]}
          />
        ) : (
          <MicIcon
            size={size * 0.36}
            color={distinctStates && !active ? colors.primary : colors.surface}
          />
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    backgroundColor: colors.primary,
  },
  button: {
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.micGlow,
  },
  pressed: {
    backgroundColor: colors.primaryPressed,
  },
  /** Off: a quiet white button with an orange ring — nothing is listening. */
  idle: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.primary200,
    ...shadows.card,
  },
  idlePressed: {
    backgroundColor: colors.primary100,
  },
  stop: {
    backgroundColor: colors.surface,
  },
});

export const micRadius = radius.pill;
