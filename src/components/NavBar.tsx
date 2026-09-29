import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BackChevronIcon } from '@/icons';
import { colors, layout } from '@/theme/tokens';
import { type } from '@/theme/typography';

type Props = {
  title?: string;
  /** Right-hand action text, e.g. `Finish`. */
  action?: string;
  onAction?: () => void;
  showBack?: boolean;
  onBack?: () => void;
  /** Swaps the back chevron for a close glyph (mission runner). */
  closeIcon?: boolean;
  /** Replaces the centre title. */
  center?: React.ReactNode;
};

/**
 * 52px bar. Screens with a back control gutter at 20 and use a 40×40 hit box;
 * the right spacer keeps the title optically centred.
 */
export function NavBar({
  title,
  action,
  onAction,
  showBack = true,
  onBack,
  closeIcon = false,
  center,
}: Props) {
  const goBack = onBack ?? (() => (router.canGoBack() ? router.back() : router.replace('/')));

  return (
    <View style={styles.bar}>
      <View style={styles.side}>
        {showBack ? (
          <Pressable
            onPress={goBack}
            accessibilityRole="button"
            accessibilityLabel={closeIcon ? 'Close' : 'Go back'}
            style={styles.button}
          >
            <BackChevronIcon close={closeIcon} />
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
            <Text style={styles.action}>{action}</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

/** Root tabs use a left-aligned 24/34/700 title in the same 52px bar. */
export function ScreenTitleBar({
  title,
  right,
}: {
  title: string;
  right?: React.ReactNode;
}) {
  return (
    <View style={styles.titleBar}>
      <Text style={type.screenTitle} numberOfLines={1}>
        {title}
      </Text>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    height: layout.navBarHeight,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: layout.navBarPaddingWithBack,
  },
  titleBar: {
    height: layout.navBarHeight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: layout.navBarPaddingTitleOnly,
  },
  side: {
    width: 40,
    justifyContent: 'center',
  },
  sideRight: {
    alignItems: 'flex-end',
  },
  button: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  action: {
    ...type.label,
    color: colors.primary,
    textAlign: 'right',
  },
});
