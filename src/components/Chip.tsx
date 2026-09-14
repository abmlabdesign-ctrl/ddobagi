import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, radius } from '@/theme/tokens';
import { fontFamily } from '@/theme/typography';

type Props = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
};

/**
 * Height 36, radius 999, padding 0 14, 14/500.
 * The 8px vertical margin gives the 44px touch target.
 */
export function Chip({ label, selected = false, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      hitSlop={{ top: 4, bottom: 4 }}
      style={({ pressed }) => [
        styles.chip,
        selected ? styles.selected : styles.unselected,
        pressed ? styles.pressed : null,
      ]}
    >
      <Text style={[styles.label, selected ? styles.labelSelected : styles.labelUnselected]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    height: 36,
    borderRadius: radius.pill,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unselected: { backgroundColor: colors.fill },
  selected: { backgroundColor: colors.primary100 },
  pressed: { opacity: 0.7 },
  label: {
    fontFamily: fontFamily.sans,
    fontSize: 14,
    lineHeight: 22,
  },
  labelUnselected: { color: colors.inkAlt, fontWeight: '500' },
  labelSelected: { color: colors.primary, fontWeight: '600' },
});
