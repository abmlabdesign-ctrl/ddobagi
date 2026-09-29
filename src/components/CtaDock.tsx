import { StyleSheet, View, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, shadows, spacing } from '@/theme/tokens';

type Props = {
  children: React.ReactNode;
  /** The comps use 16 on onboarding/mission docks and 12 on RP-2 / RP-4. */
  paddingTop?: number;
  row?: boolean;
  gap?: number;
  style?: ViewStyle;
};

/**
 * The fixed bottom action area. In the comps it is a white block with a
 * `0 -4px 12px #21212114` top shadow sitting above the home indicator, so the
 * scrolling content passes under a visible edge.
 */
export function CtaDock({ children, paddingTop = 16, row = false, gap = 8, style }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.dock,
        {
          paddingTop,
          paddingBottom: 8 + insets.bottom,
          flexDirection: row ? 'row' : 'column',
          gap,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  dock: {
    paddingHorizontal: spacing.gutter,
    backgroundColor: colors.surface,
    ...shadows.dock,
  },
});
