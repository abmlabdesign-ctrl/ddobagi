import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { ListChevronIcon, SearchIcon, SelectChevronIcon } from '@/icons';
import { colors, radius, selectedOutline, shadows } from '@/theme/tokens';
import { numeral, text, type } from '@/theme/typography';

/** RP-1 search: h48, r16, white with the card shadow — not a sunken grey field. */
export function SearchField({
  value,
  onChangeText,
  placeholder = 'Search situations',
}: {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <View style={styles.search}>
      <SearchIcon size={18} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textTertiary}
        style={styles.searchInput}
        returnKeyType="search"
        accessibilityLabel={placeholder}
      />
    </View>
  );
}

/** ON-2 / MY-1b select. The label sits at section-header weight in the comps. */
export function SelectRow({
  label,
  value,
  onPress,
}: {
  label?: string;
  value: string;
  onPress?: () => void;
}) {
  return (
    <View style={styles.selectGroup}>
      {label ? <Text style={type.section}>{label}</Text> : null}
      <Pressable onPress={onPress} accessibilityRole="button" style={styles.select}>
        <Text style={styles.selectValue}>{value}</Text>
        <SelectChevronIcon />
      </Pressable>
    </View>
  );
}

/**
 * ON-2 single-select row. Selected state is the 1.5px ring only — the comps
 * declare no fill, and no border on the unselected state either.
 */
export function OptionRow({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      style={[styles.option, selected ? selectedOutline : styles.optionIdle]}
    >
      <Text style={selected ? styles.optionLabelSelected : styles.optionLabel}>{label}</Text>
    </Pressable>
  );
}

/** Row inside a grouped card (My Page, Settings). */
export function MenuRow({
  label,
  value,
  onPress,
  height = 54,
}: {
  label: string;
  value?: string;
  onPress?: () => void;
  height?: number;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={[styles.menuRow, { height }]}
    >
      <Text style={type.row}>{label}</Text>
      <View style={styles.menuRight}>
        {value ? <Text style={styles.menuValue}>{value}</Text> : null}
        <ListChevronIcon />
      </View>
    </Pressable>
  );
}

/**
 * MY-2 period switch. The comps invert the usual treatment: a white shell with
 * an ink-filled active pill.
 */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <View style={styles.segmented}>
      {options.map((option) => {
        const active = option === value;
        return (
          <Pressable
            key={option}
            onPress={() => onChange(option)}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            style={[styles.segment, active ? styles.segmentActive : null]}
          >
            <Text style={active ? styles.segmentLabelActive : styles.segmentLabel}>
              {option}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function Toggle({
  value,
  onChange,
  label,
}: {
  value: boolean;
  onChange: (value: boolean) => void;
  label: string;
}) {
  return (
    <Pressable
      onPress={() => onChange(!value)}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      accessibilityLabel={label}
      style={[styles.toggle, value ? styles.toggleOn : styles.toggleOff]}
    >
      <View style={[styles.knob, value ? styles.knobOn : styles.knobOff]} />
    </Pressable>
  );
}

/** MY-3 AI speech speed. Tapping the track steps through the given stops. */
export function SliderRow({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
}) {
  const index = Math.max(0, options.indexOf(value));
  const percent = options.length > 1 ? (index / (options.length - 1)) * 100 : 0;

  return (
    <Pressable
      onPress={() => onChange(options[(index + 1) % options.length])}
      accessibilityRole="adjustable"
      accessibilityLabel={label}
      accessibilityValue={{ text: value }}
      style={styles.sliderRow}
    >
      <View style={styles.sliderHeader}>
        <Text style={type.row}>{label}</Text>
        <Text style={styles.sliderValue}>{value}</Text>
      </View>
      <View style={styles.sliderTrack}>
        <View style={[styles.sliderFill, { width: `${percent}%` }]} />
        <View style={[styles.sliderKnob, { left: `${percent}%` }]} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  search: {
    height: 48,
    borderRadius: radius.card,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 10,
    ...shadows.card,
  },
  searchInput: {
    flex: 1,
    ...text(15, 20, '400', colors.ink),
    padding: 0,
  },
  selectGroup: {
    gap: 12,
  },
  select: {
    height: 48,
    borderRadius: radius.input,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
  },
  selectValue: text(15, 22, '600', colors.inkAlt),
  option: {
    height: 56,
    borderRadius: radius.card,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  optionIdle: {
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  optionLabel: text(15, 22, '500', colors.inkAlt),
  optionLabelSelected: text(15, 22, '600', colors.primary),
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  menuValue: text(14, 20, '500', colors.textSecondary),
  segmented: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    padding: 4,
    gap: 6,
    ...shadows.soft,
  },
  segment: {
    flex: 1,
    height: 36,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentActive: {
    backgroundColor: colors.ink,
  },
  segmentLabel: text(14, 20, '600', colors.inkAlt),
  segmentLabelActive: text(14, 20, '600', colors.surface),
  toggle: {
    width: 48,
    height: 28,
    borderRadius: radius.pill,
    paddingHorizontal: 3,
    justifyContent: 'center',
  },
  toggleOn: { backgroundColor: colors.primary },
  toggleOff: { backgroundColor: colors.border },
  knob: {
    width: 22,
    height: 22,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
  },
  knobOn: { alignSelf: 'flex-end' },
  knobOff: { alignSelf: 'flex-start' },
  sliderRow: {
    paddingVertical: 14,
    gap: 10,
  },
  sliderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sliderValue: numeral(14, 20, '600', colors.primary),
  sliderTrack: {
    height: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.track,
  },
  sliderFill: {
    height: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },
  sliderKnob: {
    position: 'absolute',
    top: -6,
    marginLeft: -9,
    width: 18,
    height: 18,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    shadowColor: '#324458',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
});
