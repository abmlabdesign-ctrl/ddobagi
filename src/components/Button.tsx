import { Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { colors, radius } from '@/theme/tokens';
import { fontFamily, type } from '@/theme/typography';

type Variant = 'primary' | 'secondary' | 'dark' | 'text';

type Props = {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  disabled?: boolean;
  /** Renders an icon to the left of the label (social sign-in). */
  icon?: React.ReactNode;
  style?: ViewStyle;
};

/** Height 56, radius 18, label 16/600. The text variant is 48 high. */
export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
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
        pressed && !disabled ? pressedStyles[variant] : null,
        disabled ? styles.disabled : null,
        style,
      ]}
    >
      <View style={styles.content}>
        {icon}
        <Text style={[styles.label, labelStyles[variant]]}>{label}</Text>
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
    paddingHorizontal: 20,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    ...type.title,
    fontFamily: fontFamily.sans,
  },
  disabled: {
    opacity: 0.4,
  },
});

const variantStyles: Record<Variant, ViewStyle> = {
  primary: { backgroundColor: colors.primary },
  secondary: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dark: { backgroundColor: colors.ink },
  text: { height: 48, backgroundColor: 'transparent' },
};

const pressedStyles: Record<Variant, ViewStyle> = {
  primary: { backgroundColor: colors.primaryPressed },
  secondary: { backgroundColor: colors.fill },
  dark: { backgroundColor: '#11161D' },
  text: { opacity: 0.6 },
};

const labelStyles = {
  primary: { color: colors.surface },
  secondary: { color: colors.inkAlt },
  dark: { color: colors.surface },
  text: { color: colors.textSecondary, fontSize: 15, fontWeight: '500' as const },
};
