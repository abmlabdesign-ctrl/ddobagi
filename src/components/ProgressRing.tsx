import Svg, { Circle } from 'react-native-svg';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/theme/tokens';
import { fontFamily } from '@/theme/typography';

type Props = {
  /** 0–100. */
  percent: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
};

/** Replaces the static percentage-circle.svg so the arc follows real progress. */
export function ProgressRing({ percent, size = 64, strokeWidth = 5, label }: Props) {
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
          stroke="#99A4B5"
          strokeOpacity={0.6}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.primary}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${(circumference * clamped) / 100} ${circumference}`}
          fill="none"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={[StyleSheet.absoluteFill, styles.center]} pointerEvents="none">
        <Text style={styles.label}>{label ?? `${Math.round(clamped)}%`}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: fontFamily.numeric,
    fontSize: 15,
    fontWeight: '700',
    color: colors.ink,
  },
});
