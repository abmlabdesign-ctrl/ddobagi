import { StyleSheet, View } from 'react-native';

import { colors, radius } from '@/theme/tokens';

/** RV-2 progress: one 6px segment per question, filled as the run advances. */
export function StepProgress({ total, completed }: { total: number; completed: number }) {
  return (
    <View
      style={styles.row}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: total, now: completed }}
    >
      {Array.from({ length: total }).map((_, index) => (
        <View
          key={index}
          style={[styles.segment, index < completed ? styles.filled : styles.empty]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 5,
  },
  segment: {
    flex: 1,
    height: 6,
    borderRadius: radius.pill,
  },
  filled: { backgroundColor: colors.primary },
  empty: { backgroundColor: colors.track },
});
