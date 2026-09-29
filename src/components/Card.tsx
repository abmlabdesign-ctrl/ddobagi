import { StyleSheet, View, type ViewProps, type ViewStyle } from 'react-native';

import { colors, radius, shadows } from '@/theme/tokens';

type Props = ViewProps & {
  /**
   * The comps split cards in two: list/tile cards carry
   * `0 0 20px rgba(50,68,88,0.08)`, while the big content cards declare
   * `0 0 0 0` — no shadow. Flat is therefore the default.
   */
  elevation?: 'flat' | 'card';
  /** 16 prompt · 20 panel · 24 grouped. */
  radiusToken?: keyof typeof radius;
  padding?: number;
  paddingHorizontal?: number;
  paddingVertical?: number;
  style?: ViewStyle | ViewStyle[];
};

export function Card({
  elevation = 'flat',
  radiusToken = 'panel',
  padding,
  paddingHorizontal,
  paddingVertical,
  style,
  children,
  ...rest
}: Props) {
  return (
    <View
      style={[
        styles.card,
        { borderRadius: radius[radiusToken] },
        elevation === 'card' ? shadows.card : null,
        padding !== undefined ? { padding } : null,
        paddingHorizontal !== undefined ? { paddingHorizontal } : null,
        paddingVertical !== undefined ? { paddingVertical } : null,
        style as ViewStyle,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}

/** `surface-alt` panel used inside cards. */
export function SubCard({ padding = 16, style, children, ...rest }: Props) {
  return (
    <View style={[styles.subCard, { padding }, style as ViewStyle]} {...rest}>
      {children}
    </View>
  );
}

/** 1px `#F0F2F7` rule between rows of a grouped card. */
export function RowDivider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
  },
  subCard: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.input,
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
  },
});
