import Svg, { Circle } from 'react-native-svg';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/theme/tokens';
import { numeral } from '@/theme/typography';

type Props = {
  /** 0–100. */
  percent: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  /** Arc colour; the report ring uses the info blue from the comp. */
  color?: string;
  trackColor?: string;
  /** Rendered instead of the percentage — the report shows `82` + `pts`. */
  center?: React.ReactNode;
};

/** Replaces the static percentage-circle.svg so the arc follows real progress. */
export function ProgressRing({
  percent,
  size = 64,
  strokeWidth = 5,
  label,
  color = colors.primary,
  trackColor = '#99A4B5',
  center,
}: Props) {
  const clamped = Math.max(0, Math.min(100, percent));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor}
          strokeOpacity={0.6}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${(circumference * clamped) / 100} ${circumference}`}
          fill="none"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={[StyleSheet.absoluteFill, styles.center]} pointerEvents="none">
        {center ?? <Text style={styles.label}>{label ?? `${Math.round(clamped)}%`}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: numeral(15, 20, '700', colors.ink),
});
