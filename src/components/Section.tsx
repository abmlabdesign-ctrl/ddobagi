import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ChevronRightIcon } from '@/icons';
import { colors } from '@/theme/tokens';
import { type } from '@/theme/typography';

type Props = {
  title: string;
  /** Right-hand link, e.g. `See all`. */
  action?: string;
  onAction?: () => void;
  caption?: string;
  children?: React.ReactNode;
};

export function Section({ title, action, onAction, caption, children }: Props) {
  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={[type.section, styles.title]}>{title}</Text>
        {action ? (
          <Pressable onPress={onAction} hitSlop={8} accessibilityRole="button" style={styles.link}>
            <Text style={type.caption}>{action}</Text>
            <ChevronRightIcon size={12} />
          </Pressable>
        ) : caption ? (
          <Text style={type.caption}>{caption}</Text>
        ) : null}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    color: colors.inkAlt,
  },
  link: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
});
