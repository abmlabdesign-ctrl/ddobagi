import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, spacing } from '@/theme/tokens';

type Props = {
  children: ReactNode;
  /** Adds the 24px side gutter. Turn off for edge-to-edge lists. */
  gutter?: boolean;
  scroll?: boolean;
  /** Extra bottom room for a fixed CTA or the tab bar. */
  bottomInset?: number;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  /** Most screens sit on `surface-alt`; ON-1~3, RP-2 and RV-2f are white. */
  background?: 'surface' | 'surface-alt';
};

export function Screen({
  children,
  gutter = true,
  scroll = false,
  bottomInset = 0,
  style,
  contentStyle,
  background = 'surface',
}: Props) {
  const insets = useSafeAreaInsets();
  const padding = {
    paddingHorizontal: gutter ? spacing.gutter : 0,
    paddingBottom: bottomInset + insets.bottom,
  };
  const surface = {
    backgroundColor: background === 'surface' ? colors.surface : colors.surfaceAlt,
  };

  if (scroll) {
    return (
      <ScrollView
        style={[styles.root, surface, style]}
        contentContainerStyle={[padding, contentStyle]}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    );
  }

  return <View style={[styles.root, surface, padding, style, contentStyle]}>{children}</View>;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surface,
  },
});
