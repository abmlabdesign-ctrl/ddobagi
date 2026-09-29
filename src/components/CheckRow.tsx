import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CheckIcon } from '@/icons';
import { colors, radius } from '@/theme/tokens';
import { text, type } from '@/theme/typography';

/**
 * A checkbox row (ON-1b consents, Delete account). The box follows the ON-2
 * selection language: a primary fill when checked, the `#D1D5D9` outline at
 * rest. `onView` adds the trailing `View` link to the full document.
 */
export function CheckRow({
  label,
  checked,
  onToggle,
  tag,
  onView,
  strong = false,
}: {
  label: string;
  checked: boolean;
  onToggle: () => void;
  /** `Required` / `Optional`, printed before the label. */
  tag?: string;
  onView?: () => void;
  /** The `Agree to all` row reads at title weight. */
  strong?: boolean;
}) {
  return (
    <View style={styles.row}>
      <Pressable
        onPress={onToggle}
        accessibilityRole="checkbox"
        accessibilityState={{ checked }}
        accessibilityLabel={tag ? `${tag}: ${label}` : label}
        hitSlop={6}
        style={styles.hit}
      >
        <View style={[styles.box, checked ? styles.boxOn : styles.boxOff]}>
          {checked ? <CheckIcon size={16} weight={2.4} color={colors.surface} /> : null}
        </View>
        <Text style={[strong ? type.title : type.row, styles.label]}>
          {tag ? <Text style={styles.tag}>{tag} </Text> : null}
          {label}
        </Text>
      </Pressable>
      {onView ? (
        <Pressable onPress={onView} hitSlop={10} accessibilityRole="link">
          <Text style={styles.view}>View</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  hit: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  box: {
    width: 22,
    height: 22,
    borderRadius: radius.chipBadge,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxOn: {
    backgroundColor: colors.primary,
  },
  boxOff: {
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  label: {
    flex: 1,
  },
  tag: text(15, 24, '600', colors.primary),
  view: text(13, 19, '500', colors.textSecondary),
});
