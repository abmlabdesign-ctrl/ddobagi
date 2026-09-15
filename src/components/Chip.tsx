import { Pressable, StyleSheet, Text, View, type TextStyle, type ViewStyle } from 'react-native';

import { DropdownChevronIcon } from '@/icons';
import { colors, radius, selectedOutline } from '@/theme/tokens';
import { type } from '@/theme/typography';

/**
 * Three chip roles from the comps:
 * `choice` — ON-2 answers. No fill at all; state is colour + weight only.
 * `filter` — RP-1. White fill, selected adds the tint plus a 1.5px ring and a
 *   dropdown chevron.
 * `tab`    — RV-1. Active is an ink fill with white text.
 */
type Variant = 'choice' | 'filter' | 'tab';

type Props = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  variant?: Variant;
  /** Filter chips that open a sheet show the chevron. */
  dropdown?: boolean;
};

export function Chip({
  label,
  selected = false,
  onPress,
  variant = 'choice',
  dropdown = false,
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      hitSlop={{ top: 4, bottom: 4 }}
      style={({ pressed }) => [
        styles.chip,
        dropdown ? styles.chipDropdown : null,
        containerStyles[variant](selected),
        pressed ? styles.pressed : null,
      ]}
    >
      <Text style={labelStyles[variant](selected)}>{label}</Text>
      {dropdown ? (
        <View style={styles.chevron}>
          <DropdownChevronIcon color={selected ? colors.primary : colors.inkAlt} />
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    height: 36,
    borderRadius: radius.pill,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipDropdown: {
    paddingRight: 12,
    gap: 6,
  },
  chevron: {
    justifyContent: 'center',
  },
  pressed: { opacity: 0.7 },
});

const containerStyles: Record<Variant, (selected: boolean) => ViewStyle> = {
  choice: () => ({}),
  filter: (selected) =>
    selected
      ? { backgroundColor: colors.primary100, ...selectedOutline }
      : { backgroundColor: colors.surface },
  tab: (selected) =>
    selected
      ? { backgroundColor: colors.ink }
      : { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.fill },
};

const labelStyles: Record<Variant, (selected: boolean) => TextStyle> = {
  choice: (selected) =>
    selected ? { ...type.label, color: colors.primary } : type.chip,
  filter: (selected) =>
    selected ? { ...type.label, color: colors.primary } : type.chip,
  tab: (selected) =>
    selected
      ? { ...type.descriptionMedium, color: colors.surface }
      : { ...type.descriptionMedium, color: colors.inkAlt },
};
