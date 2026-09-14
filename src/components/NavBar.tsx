import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ChevronLeftIcon } from '@/icons';
import { colors, layout, spacing } from '@/theme/tokens';
import { type } from '@/theme/typography';

type Props = {
  title?: string;
  /** Right-hand action text, e.g. `Finish` or `Edit`. */
  action?: string;
  onAction?: () => void;
  /** Hide the back chevron on roots. */
  showBack?: boolean;
  onBack?: () => void;
  /** Replaces the centre title, e.g. the `2 / 4` turn counter. */
  center?: React.ReactNode;
};

/** 56px bar: back chevron · centred title · action text. */
export function NavBar({ title, action, onAction, showBack = true, onBack, center }: Props) {
  const goBack = onBack ?? (() => (router.canGoBack() ? router.back() : router.replace('/')));

  return (
    <View style={styles.bar}>
      <View style={styles.side}>
        {showBack ? (
          <Pressable
            onPress={goBack}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            style={styles.backTarget}
          >
            <ChevronLeftIcon size={24} />
          </Pressable>
        ) : null}
      </View>

      <View style={styles.center}>
        {center ?? (
          <Text style={type.title} numberOfLines={1}>
            {title}
          </Text>
        )}
      </View>

      <View style={[styles.side, styles.sideRight]}>
        {action ? (
          <Pressable onPress={onAction} hitSlop={12} accessibilityRole="button">
            <Text style={type.action}>{action}</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    height: layout.navBarHeight,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.gutter,
    backgroundColor: colors.surface,
  },
  side: {
    minWidth: 44,
    justifyContent: 'center',
  },
  sideRight: {
    alignItems: 'flex-end',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backTarget: {
    width: 44,
    height: 44,
    marginLeft: -10,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
});
