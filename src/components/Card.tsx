import { StyleSheet, View, type ViewProps, type ViewStyle } from 'react-native';

import { colors, radius, shadows } from '@/theme/tokens';

type Props = ViewProps & {
  /** `card` is the default 0 0 20px shadow; `flat` drops it for nested cards. */
  elevation?: 'card' | 'flat';
  padding?: number;
  style?: ViewStyle | ViewStyle[];
};

export function Card({ elevation = 'card', padding = 20, style, children, ...rest }: Props) {
  return (
    <View
      style={[
        styles.card,
        elevation === 'card' ? shadows.card : null,
        { padding },
        style as ViewStyle,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}

/** `surface-alt` panel used inside cards (report fixes, mission explanations). */
export function SubCard({ padding = 16, style, children, ...rest }: Props) {
  return (
    <View style={[styles.subCard, { padding }, style as ViewStyle]} {...rest}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
  },
  subCard: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.input,
  },
});
