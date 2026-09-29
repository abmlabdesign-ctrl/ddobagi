import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ListChevronIcon } from '@/icons';
import { colors } from '@/theme/tokens';
import { text, type } from '@/theme/typography';

type Props = {
  title: string;
  /** Right-hand link, e.g. `See all`. */
  action?: string;
  onAction?: () => void;
  caption?: string;
  gap?: number;
  children?: React.ReactNode;
};

/** 18/26/600 header with an optional right-hand link or caption. */
export function Section({ title, action, onAction, caption, gap = 12, children }: Props) {
  return (
    <View style={{ gap }}>
      <View style={styles.header}>
        <Text style={type.section}>{title}</Text>
        {action ? (
          <Pressable onPress={onAction} hitSlop={8} accessibilityRole="button" style={styles.link}>
            <Text style={styles.linkLabel}>{action}</Text>
            <ListChevronIcon color={colors.inkAlt} />
          </Pressable>
        ) : caption ? (
          <Text style={type.caption}>{caption}</Text>
        ) : null}
      </View>
      {children}
    </View>
  );
}

/** RP-2 section label — 14/600 in primary, with no card around the body. */
export function FieldLabel({ label }: { label: string }) {
  return <Text style={styles.fieldLabel}>{label}</Text>;
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  link: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  linkLabel: text(12, 16, '400', colors.inkAlt),
  fieldLabel: text(14, 20, '600', colors.primary),
});
