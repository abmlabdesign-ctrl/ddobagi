import { Pressable, StyleSheet, Text, View, type TextStyle, type ViewStyle } from 'react-native';

import { DropdownChevronIcon } from '@/icons';
import { colors, radius, selectedOutline } from '@/theme/tokens';
import { text, type } from '@/theme/typography';

/**
 * Three chip roles from the comps:
 * `choice` — ON-2 answers. Always outlined; selecting recolours the line and
 *   the label without changing the fill (the comp tints it, the design call
 *   for ON-2 is ring-only).
 * `filter` — RP-1. White fill, selected adds the tint plus a 1.5px ring and a
 *   dropdown chevron.
 * `tab`    — RV-1. Active is an ink fill with white text.
 * `option` — MY-1b interests. 34px tall, tinted with a ring when selected.
 */
type Variant = 'choice' | 'filter' | 'tab' | 'option';

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
        variant === 'option' ? styles.chipOption : null,
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
  chipOption: {
    height: 34,
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
  choice: (selected) => ({
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: selected ? colors.primary : colors.border,
  }),
  filter: (selected) =>
    selected
      ? { backgroundColor: colors.primary100, ...selectedOutline }
      : { backgroundColor: colors.surface },
  tab: (selected) =>
    selected
      ? { backgroundColor: colors.ink }
      : { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.fill },
  option: (selected) =>
    selected
      ? { backgroundColor: colors.primary100, ...selectedOutline }
      : { backgroundColor: colors.surfaceAlt },
};

const labelStyles: Record<Variant, (selected: boolean) => TextStyle> = {
  // One step under the rest of the chip family — ON-2 reads lighter in the comp.
  choice: (selected) =>
    selected ? text(14, 22, '500', colors.primary) : text(14, 22, '400', colors.inkAlt),
  filter: (selected) =>
    selected ? { ...type.label, color: colors.primary } : type.chip,
  tab: (selected) =>
    selected
      ? { ...type.descriptionMedium, color: colors.surface }
      : { ...type.descriptionMedium, color: colors.inkAlt },
  option: (selected) =>
    selected
      ? { ...text(13, 19, '600', colors.primary) }
      : { ...text(13, 19, '500', colors.textSecondary) },
};
