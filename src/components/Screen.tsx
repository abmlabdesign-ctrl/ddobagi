import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, spacing } from '@/theme/tokens';

/**
 * Who owns the bottom edge of the screen, and therefore the home-indicator
 * inset. Exactly one element per screen should claim it.
 *  `dock`    — a CtaDock sits below the body and already pads for the indicator.
 *  `tabs`    — the tab bar does, via its own inset.
 *  `content` — nothing else does, so the scrolling body pads for it itself.
 */
type BottomEdge = 'dock' | 'tabs' | 'content';

type ShellProps = {
  children: ReactNode;
  background?: 'surface' | 'surface-alt';
  bottomEdge?: BottomEdge;
  style?: ViewStyle;
};

/**
 * The page frame: fixed header, scrolling body, fixed dock.
 *
 * The comps draw a 44px status bar and a 34px home indicator inside the 390×844
 * frame, so the real content box is 766px tall. On device those two bands are
 * the safe-area insets — the shell reserves the top one here, and `bottomEdge`
 * says which element reserves the bottom one.
 */
export function ScreenShell({
  children,
  background = 'surface-alt',
  bottomEdge = 'dock',
  style,
}: ShellProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.root,
        {
          backgroundColor: background === 'surface' ? colors.surface : colors.surfaceAlt,
          paddingTop: insets.top,
          paddingBottom: bottomEdge === 'content' ? insets.bottom : 0,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

type Props = {
  children: ReactNode;
  gutter?: boolean;
  scroll?: boolean;
  /** Extra room under the last item, on top of the comp's own bottom padding. */
  bottomInset?: number;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  background?: 'surface' | 'surface-alt';
};

/**
 * The scrolling body of a screen. Headers, filter rows and CTA docks sit
 * outside it — the comps keep those fixed and scroll only the middle block.
 * It never adds a safe-area inset of its own; the shell owns that.
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
  const padding = {
    paddingHorizontal: gutter ? spacing.gutter : 0,
    paddingBottom: bottomInset,
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
