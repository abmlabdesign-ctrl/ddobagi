import { Pressable, StyleSheet, Text, View, type TextStyle, type ViewStyle } from 'react-native';

import { colors, radius, shadows } from '@/theme/tokens';
import { type } from '@/theme/typography';

/**
 * `primary` — filled orange, `glow` adds the RP-4 Save halo.
 * `elevated` — white with the card shadow (RP-4 Try again).
 * `tonal` — `#F2F3F5` fill (ON-4 Home).
 * `dark`  — ink fill (ON-1 Apple).
 * `text` — 48px text-only row (ON-1 email).
 * No variant carries a border: none of the comps draw one.
 */
type Variant = 'primary' | 'elevated' | 'tonal' | 'dark' | 'text';

type Props = {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  disabled?: boolean;
  /** The comps use 56 everywhere except ON-4's primary, which is 52. */
  height?: number;
  glow?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  height,
  glow = false,
  icon,
  style,
}: Props) {
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.base,
        variantStyles[variant],
        height ? { height } : null,
        glow ? shadows.primaryGlow : null,
        pressed && !disabled ? pressedStyles[variant] : null,
        disabled ? styles.disabled : null,
        style,
      ]}
    >
      <View style={styles.content}>
        {icon}
        <Text style={labelStyles[variant]}>{label}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 56,
    borderRadius: radius.button,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  disabled: {
    opacity: 0.4,
  },
});

const variantStyles: Record<Variant, ViewStyle> = {
  primary: { backgroundColor: colors.primary },
  elevated: { backgroundColor: colors.surface, ...shadows.card },
  tonal: { backgroundColor: colors.fill },
  dark: { backgroundColor: colors.ink },
  text: { height: 48, backgroundColor: 'transparent' },
};

const pressedStyles: Record<Variant, ViewStyle> = {
  primary: { backgroundColor: colors.primaryPressed },
  elevated: { backgroundColor: colors.fill },
  tonal: { backgroundColor: colors.fillAlt },
  dark: { backgroundColor: '#11161D' },
  text: { opacity: 0.6 },
};

const labelStyles: Record<Variant, TextStyle> = {
  primary: type.cta,
  elevated: type.title,
  tonal: type.title,
  dark: { ...type.title, color: colors.surface },
  text: { ...type.row, color: colors.textSecondary },
};
