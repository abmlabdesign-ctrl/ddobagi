import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, radius, spacing } from '@/theme/tokens';
import { text, type } from '@/theme/typography';

/**
 * Bottom-sheet single select for the `>` rows (Native language, Weekly goal). Same sheet as the RP-1 category filter, so the pickers look
 * like one family. Picking closes it; `note` explains a short list.
 */
export function PickerSheet<T extends string | number>({
  visible,
  title,
  options,
  selected,
  onSelect,
  onClose,
  format = String,
  note,
}: {
  visible: boolean;
  title: string;
  options: readonly T[];
  selected: T;
  onSelect: (value: T) => void;
  onClose: () => void;
  format?: (value: T) => string;
  note?: string;
}) {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Close" />
      <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.xl }]}>
        <View style={styles.handle} />
        <Text style={styles.title}>{title}</Text>
        {note ? <Text style={styles.note}>{note}</Text> : null}
        <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
          {options.map((value) => {
            const active = value === selected;
            return (
              <Pressable
                key={String(value)}
                onPress={() => {
                  onSelect(value);
                  onClose();
                }}
                accessibilityRole="radio"
                accessibilityState={{ selected: active }}
                style={styles.row}
              >
                <Text style={active ? styles.rowActive : styles.rowLabel}>{format(value)}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
    </Modal>
  );
}

/**
 * A read-only sheet for rows that explain rather than change something
 * (Account, Help center). Tap outside or `OK` to close.
 */
export function NoticeSheet({
  visible,
  title,
  lines,
  onClose,
}: {
  visible: boolean;
  title: string;
  lines: string[];
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Close" />
      <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.xl }]}>
        <View style={styles.handle} />
        <Text style={styles.title}>{title}</Text>
        <View style={styles.lines}>
          {lines.map((line) => (
            <Text key={line} style={type.body}>
              {line}
            </Text>
          ))}
        </View>
        <Pressable onPress={onClose} accessibilityRole="button" style={styles.row}>
          <Text style={[styles.rowActive, styles.center]}>OK</Text>
        </Pressable>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(25,31,40,0.35)',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.md,
    maxHeight: '72%',
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.border,
    marginBottom: spacing.md,
  },
  title: {
    ...type.title,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  note: {
    ...type.caption,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  body: {
    paddingBottom: spacing.md,
  },
  row: {
    height: 52,
    justifyContent: 'center',
  },
  rowLabel: text(16, 22, '500', colors.inkAlt),
  rowActive: text(16, 22, '600', colors.primary),
  lines: {
    gap: 10,
    paddingVertical: spacing.sm,
  },
  center: {
    textAlign: 'center',
  },
});
