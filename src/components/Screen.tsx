import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, spacing } from '@/theme/tokens';

type Props = {
  children: ReactNode;
  gutter?: boolean;
  scroll?: boolean;
  bottomInset?: number;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  background?: 'surface' | 'surface-alt';
};

/**
 * The scrolling body of a screen. Headers, filter rows and CTA docks sit
 * outside it — the comps keep those fixed and scroll only the middle block.
 */
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

/**
 * Screen shell for a fixed header + scrolling body + fixed dock. Keeps the
 * background on the outer view so the dock and header sit on the same ground.
 */
export function ScreenShell({
  children,
  background = 'surface-alt',
  style,
}: {
  children: ReactNode;
  background?: 'surface' | 'surface-alt';
  style?: ViewStyle;
}) {
  return (
    <View
      style={[
        styles.root,
        { backgroundColor: background === 'surface' ? colors.surface : colors.surfaceAlt },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surface,
  },
});
