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

/* ── Aspect-correct chevrons ────────────────────────────────────────────────
 * The comps draw chevrons at fixed, non-square sizes: 10×18 back, 7×12 list,
 * 10×6 dropdown, 12×7 select. Rendering them from a 24×24 box changes both the
 * proportion and the apparent stroke weight, so each gets its own viewBox.
 */

export function BackChevronIcon({
  color = colors.ink,
  close = false,
}: {
  color?: ColorValue;
  close?: boolean;
}) {
  if (close) {
    return (
      <Svg width={14} height={14} viewBox="0 0 14 14">
        <Path d="M1 1l12 12M13 1L1 13" {...strokeProps(color, 1.8)} />
      </Svg>
    );
  }
  return (
    <Svg width={10} height={18} viewBox="0 0 10 18">
      <Path d="M9 1L1 9l8 8" {...strokeProps(color, 1.8)} />
    </Svg>
  );
}

export function ListChevronIcon({ color = colors.textTertiary }: { color?: ColorValue }) {
  return (
    <Svg width={7} height={12} viewBox="0 0 7 12">
      <Path d="M1 1l5 5-5 5" {...strokeProps(color, 1.6)} />
    </Svg>
  );
}

export function DropdownChevronIcon({ color = colors.inkAlt }: { color?: ColorValue }) {
  return (
    <Svg width={10} height={6} viewBox="0 0 10 6">
      <Path d="M1 1l4 4 4-4" {...strokeProps(color, 1.6)} />
    </Svg>
  );
}

export function SelectChevronIcon({ color = colors.textTertiary }: { color?: ColorValue }) {
  return (
    <Svg width={12} height={7} viewBox="0 0 12 7">
      <Path d="M1 1l5 5 5-5" {...strokeProps(color, 1.6)} />
    </Svg>
  );
}

/* ── Tab bar ────────────────────────────────────────────────────────────────
 * The comps draw the tab glyphs as solid shapes, not strokes.
 */

export function HomeTabIcon({ color }: { color: ColorValue }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24">
      <Path
        d="M11.35 2.76a1 1 0 0 1 1.3 0l8.02 6.86c.4.34.63.84.63 1.37V19.5a2 2 0 0 1-2 2h-4.2v-5.1a1 1 0 0 0-1-1h-4.2a1 1 0 0 0-1 1v5.1H4.7a2 2 0 0 1-2-2v-8.51c0-.53.23-1.03.63-1.37z"
        fill={color}
      />
    </Svg>
  );
}

export function RoleplayTabIcon({ color }: { color: ColorValue }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24">
      <Path
        d="M12 3.2c5 0 9 3.2 9 7.4 0 4.2-4 7.4-9 7.4-.85 0-1.68-.09-2.46-.26l-4.3 2.05a.6.6 0 0 1-.84-.68l.83-3.3C3.2 14.5 3 12.9 3 10.6 3 6.4 7 3.2 12 3.2z"
        fill={color}
      />
    </Svg>
  );
}

export function ReviewTabIcon({ color }: { color: ColorValue }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24">
      <Path
        d="M12 2.8a9.2 9.2 0 1 1-8.7 12.2 1.1 1.1 0 1 1 2.08-.7A7 7 0 1 0 12 5a6.97 6.97 0 0 0-5.07 2.2h2.2a1.1 1.1 0 1 1 0 2.2H4.4a1.1 1.1 0 0 1-1.1-1.1V3.57a1.1 1.1 0 1 1 2.2 0v1.8A9.17 9.17 0 0 1 12 2.8z"
        fill={color}
      />
      <Path
        d="M15.4 9.53a1.1 1.1 0 0 1 .1 1.55l-4.1 4.7a1.1 1.1 0 0 1-1.61.05l-2.1-2.1a1.1 1.1 0 1 1 1.56-1.56l1.27 1.28 3.33-3.82a1.1 1.1 0 0 1 1.55-.1z"
        fill={color}
      />
    </Svg>
  );
}

export function ProfileTabIcon({ color }: { color: ColorValue }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24">
      <Path
        d="M12 3.6a4.3 4.3 0 1 1 0 8.6 4.3 4.3 0 0 1 0-8.6zM12 13.6c4.3 0 7.8 2.4 7.8 6.05a1.1 1.1 0 0 1-1.1 1.1H5.3a1.1 1.1 0 0 1-1.1-1.1c0-3.65 3.5-6.05 7.8-6.05z"
        fill={color}
      />
    </Svg>
  );
}

/** Solid play triangle used on the home resume card. */
export function PlayIcon({ size = 8, color = colors.surface }: IconProps) {
  return (
    <Svg width={size * 0.875} height={size} viewBox="0 0 7 8">
      <Path d="M6.41 2.94a1.25 1.25 0 0 1 0 2.12L1.7 7.85A1.22 1.22 0 0 1 0 6.79V1.21A1.22 1.22 0 0 1 1.7.15z" fill={color} />
    </Svg>
  );
}
