import type { ColorValue } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { colors } from '@/theme/tokens';

export type IconProps = {
  size?: number;
  color?: ColorValue;
  /** Stroke width in the 24×24 viewbox. The design system uses 1.8. */
  weight?: number;
};

const base = ({ size = 24, color = colors.ink, weight = 1.8 }: IconProps) => ({
  size,
  color,
  weight,
});

const strokeProps = (color: ColorValue, weight: number) =>
  ({
    stroke: color,
    strokeWidth: weight,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    fill: 'none',
  }) as const;

function Icon({ size, children }: { size: number; children: React.ReactNode }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {children}
    </Svg>
  );
}

export function HomeIcon(props: IconProps) {
  const { size, color, weight } = base(props);
  return (
    <Icon size={size}>
      <Path d="M3.5 10.2 12 3.4l8.5 6.8V19a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 19z" {...strokeProps(color, weight)} />
      <Path d="M9.6 20.5v-5.4a1 1 0 0 1 1-1h2.8a1 1 0 0 1 1 1v5.4" {...strokeProps(color, weight)} />
    </Icon>
  );
}

export function RoleplayIcon(props: IconProps) {
  const { size, color, weight } = base(props);
  return (
    <Icon size={size}>
      <Path
        d="M20.5 12.4c0 3.9-3.8 7-8.5 7-.9 0-1.8-.1-2.6-.3l-4.4 1.6 1.3-3.6c-1.4-1.2-2.3-2.9-2.3-4.7 0-3.9 3.8-7 8.5-7s8 3.1 8 7z"
        {...strokeProps(color, weight)}
      />
      <Path d="M9 11.6h6" {...strokeProps(color, weight)} />
      <Path d="M9 14.4h3.6" {...strokeProps(color, weight)} />
    </Icon>
  );
}

export function ReviewIcon(props: IconProps) {
  const { size, color, weight } = base(props);
  return (
    <Icon size={size}>
      <Path d="M20.2 12a8.2 8.2 0 1 1-2.5-5.9" {...strokeProps(color, weight)} />
      <Path d="M20.4 3.6v4.1h-4.1" {...strokeProps(color, weight)} />
      <Path d="M9.4 12.2l1.9 1.9 3.5-4" {...strokeProps(color, weight)} />
    </Icon>
  );
}

export function ProfileIcon(props: IconProps) {
  const { size, color, weight } = base(props);
  return (
    <Icon size={size}>
      <Circle cx={12} cy={8.4} r={3.6} {...strokeProps(color, weight)} />
      <Path d="M4.6 20.4c0-3.6 3.3-5.8 7.4-5.8s7.4 2.2 7.4 5.8" {...strokeProps(color, weight)} />
    </Icon>
  );
}

export function ChevronLeftIcon(props: IconProps) {
  const { size, color, weight } = base({ color: colors.textSecondary, ...props });
  return (
    <Icon size={size}>
      <Path d="M15 5 8 12l7 7" {...strokeProps(color, weight)} />
    </Icon>
  );
}

export function ChevronRightIcon(props: IconProps) {
  const { size, color, weight } = base({ color: colors.textTertiary, ...props });
  return (
    <Icon size={size}>
      <Path d="M9 5l7 7-7 7" {...strokeProps(color, weight)} />
    </Icon>
  );
}

export function ChevronDownIcon(props: IconProps) {
  const { size, color, weight } = base({ color: colors.textTertiary, ...props });
  return (
    <Icon size={size}>
      <Path d="M5.5 9l6.5 6.5L18.5 9" {...strokeProps(color, weight)} />
    </Icon>
  );
}

export function SearchIcon(props: IconProps) {
  const { size, color, weight } = base({ color: colors.textTertiary, ...props });
  return (
    <Icon size={size}>
      <Circle cx={11} cy={11} r={6.6} {...strokeProps(color, weight)} />
      <Path d="M16 16l4 4" {...strokeProps(color, weight)} />
    </Icon>
  );
}

export function SpeakerIcon(props: IconProps) {
  const { size, color, weight } = base({ color: colors.primary, ...props });
  return (
    <Icon size={size}>
      <Path d="M5 9.4h2.8L12 5.6v12.8L7.8 14.6H5a1 1 0 0 1-1-1v-3.2a1 1 0 0 1 1-1z" {...strokeProps(color, weight)} />
      <Path d="M15.4 9.2a4 4 0 0 1 0 5.6" {...strokeProps(color, weight)} />
      <Path d="M18 6.8a7.4 7.4 0 0 1 0 10.4" {...strokeProps(color, weight)} />
    </Icon>
  );
}

export function MicIcon(props: IconProps) {
  const { size, color, weight } = base({ color: colors.surface, ...props });
  return (
    <Icon size={size}>
      <Rect x={9} y={2.8} width={6} height={11} rx={3} {...strokeProps(color, weight)} />
      <Path d="M5.4 11.4a6.6 6.6 0 0 0 13.2 0" {...strokeProps(color, weight)} />
      <Path d="M12 18v3.2" {...strokeProps(color, weight)} />
    </Icon>
  );
}

export function ScriptIcon(props: IconProps) {
  const { size, color, weight } = base({ color: colors.ink, ...props });
  return (
    <Icon size={size}>
      <Rect x={4} y={3.4} width={16} height={17.2} rx={3} {...strokeProps(color, weight)} />
      <Path d="M8 8.6h8" {...strokeProps(color, weight)} />
      <Path d="M8 12h8" {...strokeProps(color, weight)} />
      <Path d="M8 15.4h4.6" {...strokeProps(color, weight)} />
    </Icon>
  );
}

export function HintIcon(props: IconProps) {
  const { size, color, weight } = base({ color: colors.ink, ...props });
  return (
    <Icon size={size}>
      <Path d="M9.2 17.6a5.8 5.8 0 1 1 5.6 0v1.2a1.4 1.4 0 0 1-1.4 1.4h-2.8a1.4 1.4 0 0 1-1.4-1.4z" {...strokeProps(color, weight)} />
      <Path d="M9.6 17.6h4.8" {...strokeProps(color, weight)} />
    </Icon>
  );
}

export function CheckIcon(props: IconProps) {
  const { size, color, weight } = base({ color: colors.success, ...props });
  return (
    <Icon size={size}>
      <Path d="M5 12.6l4.6 4.4L19 7" {...strokeProps(color, weight)} />
    </Icon>
  );
}

export function CheckCircleIcon(props: IconProps) {
  const { size, color, weight } = base({ color: colors.success, ...props });
  return (
    <Icon size={size}>
      <Circle cx={12} cy={12} r={8.6} {...strokeProps(color, weight)} />
      <Path d="M8.2 12.2l2.6 2.6 5-5.4" {...strokeProps(color, weight)} />
    </Icon>
  );
}

export function AlertIcon(props: IconProps) {
  const { size, color, weight } = base({ color: colors.primary, ...props });
  return (
    <Icon size={size}>
      <Circle cx={12} cy={12} r={8.6} {...strokeProps(color, weight)} />
      <Path d="M12 7.8v5" {...strokeProps(color, weight)} />
      <Path d="M12 16.1v.1" {...strokeProps(color, weight)} />
    </Icon>
  );
}

export function BookmarkIcon(props: IconProps) {
  const { size, color, weight } = base({ color: colors.primary, ...props });
  return (
    <Icon size={size}>
      <Path d="M6.4 4.8A1.8 1.8 0 0 1 8.2 3h7.6a1.8 1.8 0 0 1 1.8 1.8v16l-5.6-3.8-5.6 3.8z" {...strokeProps(color, weight)} />
    </Icon>
  );
}

export function ReplayIcon(props: IconProps) {
  const { size, color, weight } = base({ color: colors.primary, ...props });
  return (
    <Icon size={size}>
      <Path d="M20.2 12a8.2 8.2 0 1 1-2.5-5.9" {...strokeProps(color, weight)} />
      <Path d="M20.4 3.6v4.1h-4.1" {...strokeProps(color, weight)} />
    </Icon>
  );
}

export function CloseIcon(props: IconProps) {
  const { size, color, weight } = base({ color: colors.ink, ...props });
  return (
    <Icon size={size}>
      <Path d="M6 6l12 12M18 6L6 18" {...strokeProps(color, weight)} />
    </Icon>
  );
}

export function ArrowUpIcon(props: IconProps) {
  const { size, color, weight } = base({ color: colors.success, ...props });
  return (
    <Icon size={size}>
      <Path d="M12 19.5V5" {...strokeProps(color, weight)} />
      <Path d="M6 10.6L12 4.6l6 6" {...strokeProps(color, weight)} />
    </Icon>
  );
}
