import { Children } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';

import { spacing } from '@/theme/tokens';

type Props = {
  children: React.ReactNode;
  columns?: number;
  gap?: number;
  /** Total horizontal padding already applied by the parent. */
  outerPadding?: number;
};

/**
 * Two-up card grid. RN has no `grid-template-columns`, so the item width is
 * measured from the viewport: 390 − 24×2 − 12 gap → 2 × 165.
 */
export function CardGrid({
  children,
  columns = 2,
  gap = spacing.md,
  outerPadding = spacing.gutter * 2,
}: Props) {
  const { width } = useWindowDimensions();
  const itemWidth = (width - outerPadding - gap * (columns - 1)) / columns;

  return (
    <View style={[styles.grid, { gap }]}>
      {Children.map(children, (child, index) => (
        <View key={index} style={{ width: itemWidth }}>
          {child}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});
