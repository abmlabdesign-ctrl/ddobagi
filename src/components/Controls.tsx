import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { ChevronDownIcon, ChevronRightIcon, SearchIcon } from '@/icons';
import { colors, hairline, radius, selectedOutline } from '@/theme/tokens';
import { fontFamily, type } from '@/theme/typography';

/** Height 48, radius 14, `#F2F3F5` — RP-1 search. */
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
      <SearchIcon size={20} />
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

/** Height 48, radius 12 — `App language`, `Native language`. */
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
      {label ? <Text style={type.caption}>{label}</Text> : null}
      <Pressable onPress={onPress} accessibilityRole="button" style={styles.select}>
        <Text style={styles.selectValue}>{value}</Text>
        <ChevronDownIcon size={18} />
      </Pressable>
    </View>
  );
}

/** Height 56, radius 16 — single-select list (ON-2). */
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
      style={[styles.option, selected ? styles.optionSelected : styles.optionIdle]}
    >
      <Text style={[type.body, selected ? styles.optionLabelSelected : null]}>{label}</Text>
    </Pressable>
  );
}

/** Menu row with a chevron — My Page. */
export function MenuRow({
  label,
  value,
  onPress,
  last = false,
}: {
  label: string;
  value?: string;
  onPress?: () => void;
  last?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={[styles.menuRow, last ? null : styles.menuDivider]}
    >
      <Text style={type.body}>{label}</Text>
      <View style={styles.menuRight}>
        {value ? <Text style={type.secondary}>{value}</Text> : null}
        <ChevronRightIcon size={18} />
      </View>
    </Pressable>
  );
}

/** Weekly | Monthly, Beginner | Intermediate | Advanced. */
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
            <Text style={[styles.segmentLabel, active ? styles.segmentLabelActive : null]}>
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

const styles = StyleSheet.create({
  search: {
    height: 48,
    borderRadius: radius.search,
    backgroundColor: colors.fill,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontFamily: fontFamily.sans,
    fontSize: 15,
    lineHeight: 20,
    color: colors.ink,
    padding: 0,
  },
  selectGroup: {
    gap: 8,
  },
  select: {
    height: 48,
    borderRadius: radius.input,
    backgroundColor: colors.surface,
    ...hairline,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  selectValue: {
    ...type.body,
    fontWeight: '600',
  },
  option: {
    height: 56,
    borderRadius: radius.card,
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  optionIdle: {
    backgroundColor: colors.surface,
    ...hairline,
  },
  optionSelected: {
    backgroundColor: colors.primary100,
    ...selectedOutline,
  },
  optionLabelSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  menuRow: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  menuDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.fill,
  },
  menuRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  segmented: {
    flexDirection: 'row',
    backgroundColor: colors.fill,
    borderRadius: radius.pill,
    padding: 4,
    gap: 4,
  },
  segment: {
    flex: 1,
    height: 36,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentActive: {
    backgroundColor: colors.surface,
  },
  segmentLabel: {
    fontFamily: fontFamily.sans,
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  segmentLabelActive: {
    color: colors.ink,
    fontWeight: '600',
  },
  toggle: {
    width: 52,
    height: 32,
    borderRadius: radius.pill,
    padding: 3,
    justifyContent: 'center',
  },
  toggleOn: { backgroundColor: colors.primary },
  toggleOff: { backgroundColor: colors.border },
  knob: {
    width: 26,
    height: 26,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
  },
  knobOn: { alignSelf: 'flex-end' },
  knobOff: { alignSelf: 'flex-start' },
});
