import type { ColorValue } from 'react-native';
import Svg, { Circle, G, Path, Rect } from 'react-native-svg';

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

/*
 * Tab bar glyphs. The comp draws all four as outlined (evenodd) shapes on a
 * 24 grid, each nested a few px in, so the translates below are the comp's own
 * offsets rather than a redrawn path.
 */
export function HomeTabIcon({ color }: { color: ColorValue }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24">
      <G transform="translate(2 1.76)">
        <Path d="M 18 10.507 C 18 10.1 17.917 9.697 17.757 9.323 C 17.616 8.996 17.419 8.697 17.174 8.439 L 17.066 8.332 L 10.689 2.275 C 10.504 2.099 10.257 2 10.001 2 C 9.745 2 9.497 2.099 9.312 2.275 L 2.934 8.332 C 2.639 8.612 2.404 8.949 2.243 9.323 C 2.083 9.697 2 10.1 2 10.507 L 2 17.24 C 2 17.505 2.105 17.76 2.293 17.947 C 2.48 18.135 2.735 18.24 3 18.24 L 17 18.24 C 17.265 18.24 17.52 18.135 17.707 17.947 C 17.895 17.76 18 17.505 18 17.24 L 18 10.507 Z M 20 17.24 C 20 18.036 19.684 18.799 19.121 19.361 C 18.558 19.924 17.796 20.24 17 20.24 L 3 20.24 C 2.204 20.24 1.442 19.924 0.879 19.361 C 0.316 18.799 0 18.036 0 17.24 L 0 10.507 C 0 9.829 0.138 9.157 0.405 8.534 C 0.673 7.911 1.065 7.349 1.557 6.882 L 7.935 0.825 C 8.492 0.296 9.232 0 10.001 0 C 10.77 0 11.509 0.296 12.066 0.825 L 18.443 6.882 C 18.935 7.349 19.327 7.911 19.595 8.534 C 19.862 9.157 20 9.829 20 10.507 L 20 17.24 Z" fill={color} fillRule="evenodd" />
      </G>
      <G transform="translate(8 12)">
        <Path d="M 6 3 C 6 2.735 5.895 2.481 5.707 2.293 C 5.519 2.105 5.265 2 5 2 L 3 2 C 2.735 2 2.481 2.105 2.293 2.293 C 2.105 2.481 2 2.735 2 3 L 2 8 L 6 8 L 6 3 Z M 8 9 C 8 9.552 7.552 10 7 10 L 1 10 C 0.448 10 0 9.552 0 9 L 0 3 C 0 2.204 0.316 1.442 0.879 0.879 C 1.442 0.316 2.204 0 3 0 L 5 0 C 5.796 0 6.558 0.316 7.121 0.879 C 7.684 1.442 8 2.204 8 3 L 8 9 Z" fill={color} fillRule="evenodd" />
      </G>
    </Svg>
  );
}

export function RoleplayTabIcon({ color }: { color: ColorValue }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24">
      <G transform="translate(3 3)">
        <Path d="M 8 17 L 8 1 C 8 0.448 8.448 0 9 0 C 9.552 0 10 0.448 10 1 L 10 17 C 10 17.552 9.552 18 9 18 C 8.448 18 8 17.552 8 17 Z M 12 14 L 12 4 C 12 3.448 12.448 3 13 3 C 13.552 3 14 3.448 14 4 L 14 14 C 14 14.552 13.552 15 13 15 C 12.448 15 12 14.552 12 14 Z M 4 12 L 4 6 C 4 5.448 4.448 5 5 5 C 5.552 5 6 5.448 6 6 L 6 12 C 6 12.552 5.552 13 5 13 C 4.448 13 4 12.552 4 12 Z M 0 11 L 0 7 C 0 6.448 0.448 6 1 6 C 1.552 6 2 6.448 2 7 L 2 11 C 2 11.552 1.552 12 1 12 C 0.448 12 0 11.552 0 11 Z M 16 11 L 16 7 C 16 6.448 16.448 6 17 6 C 17.552 6 18 6.448 18 7 L 18 11 C 18 11.552 17.552 12 17 12 C 16.448 12 16 11.552 16 11 Z" fill={color} fillRule="evenodd" />
      </G>
    </Svg>
  );
}

export function ReviewTabIcon({ color }: { color: ColorValue }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24">
      <G transform="translate(7.789 7.788)">
        <Path d="M 8.045 4.165 L 4.165 8.045 L 3.104 6.984 L 6.984 3.104 L 8.045 4.165 Z M 4.94 1.061 L 1.061 4.94 L 0 3.88 L 3.88 0 L 4.94 1.061 Z" fill={color} fillRule="evenodd" />
      </G>
      <G transform="translate(1.25 9.25)">
        <Path d="M 4.003 0.016 C 4.184 -0.005 4.367 -0.005 4.548 0.016 C 5.019 0.071 5.4 0.292 5.749 0.569 C 6.086 0.836 6.46 1.212 6.9 1.652 L 11.849 6.601 C 12.288 7.04 12.665 7.414 12.932 7.751 C 13.209 8.1 13.43 8.482 13.485 8.952 C 13.506 9.133 13.506 9.316 13.485 9.497 C 13.43 9.968 13.209 10.349 12.932 10.698 C 12.665 11.035 12.288 11.409 11.849 11.849 C 11.409 12.288 11.035 12.665 10.698 12.932 C 10.349 13.209 9.968 13.43 9.497 13.485 C 9.316 13.506 9.133 13.506 8.952 13.485 C 8.482 13.43 8.1 13.209 7.751 12.932 C 7.414 12.665 7.04 12.288 6.601 11.849 L 1.652 6.9 C 1.212 6.46 0.836 6.086 0.569 5.749 C 0.292 5.4 0.071 5.019 0.016 4.548 C -0.005 4.367 -0.005 4.184 0.016 4.003 C 0.071 3.532 0.292 3.151 0.569 2.802 C 0.836 2.465 1.212 2.091 1.652 1.652 C 2.091 1.212 2.465 0.836 2.802 0.569 C 3.151 0.292 3.532 0.071 4.003 0.016 Z M 4.177 1.506 C 4.096 1.516 3.975 1.553 3.735 1.744 C 3.481 1.945 3.177 2.247 2.712 2.712 C 2.247 3.177 1.945 3.481 1.744 3.735 C 1.553 3.975 1.516 4.096 1.506 4.177 C 1.498 4.243 1.498 4.309 1.506 4.374 C 1.516 4.455 1.553 4.577 1.744 4.818 C 1.945 5.071 2.248 5.375 2.712 5.839 L 7.661 10.788 C 8.126 11.253 8.43 11.555 8.683 11.756 C 8.924 11.947 9.045 11.985 9.126 11.994 C 9.192 12.002 9.258 12.002 9.323 11.994 C 9.405 11.985 9.525 11.947 9.766 11.756 C 10.019 11.555 10.324 11.253 10.788 10.788 C 11.253 10.324 11.555 10.019 11.756 9.766 C 11.947 9.525 11.985 9.405 11.994 9.323 C 12.002 9.258 12.002 9.192 11.994 9.126 C 11.985 9.045 11.947 8.924 11.756 8.683 C 11.555 8.43 11.253 8.126 10.788 7.661 L 5.839 2.712 C 5.375 2.248 5.071 1.945 4.818 1.744 C 4.577 1.553 4.455 1.516 4.374 1.506 C 4.309 1.498 4.242 1.498 4.177 1.506 Z" fill={color} fillRule="evenodd" />
      </G>
      <G transform="translate(9.25 1.25)">
        <Path d="M 4.003 0.016 C 4.184 -0.005 4.367 -0.005 4.548 0.016 C 5.019 0.071 5.4 0.292 5.749 0.569 C 6.086 0.836 6.46 1.212 6.9 1.652 L 11.849 6.601 C 12.288 7.04 12.665 7.414 12.932 7.751 C 13.209 8.1 13.43 8.482 13.485 8.952 C 13.506 9.133 13.506 9.316 13.485 9.497 C 13.43 9.968 13.209 10.349 12.932 10.698 C 12.665 11.035 12.288 11.409 11.849 11.849 C 11.409 12.288 11.035 12.665 10.698 12.932 C 10.349 13.209 9.968 13.43 9.497 13.485 C 9.316 13.506 9.133 13.506 8.952 13.485 C 8.482 13.43 8.1 13.209 7.751 12.932 C 7.414 12.665 7.04 12.288 6.601 11.849 L 1.652 6.9 C 1.212 6.46 0.836 6.086 0.569 5.749 C 0.292 5.4 0.071 5.019 0.016 4.548 C -0.005 4.367 -0.005 4.184 0.016 4.003 C 0.071 3.532 0.292 3.151 0.569 2.802 C 0.836 2.465 1.212 2.091 1.652 1.652 C 2.091 1.212 2.465 0.836 2.802 0.569 C 3.151 0.292 3.532 0.071 4.003 0.016 Z M 4.177 1.506 C 4.096 1.516 3.975 1.553 3.735 1.744 C 3.481 1.945 3.177 2.247 2.712 2.712 C 2.247 3.177 1.945 3.481 1.744 3.735 C 1.553 3.975 1.516 4.096 1.506 4.177 C 1.498 4.243 1.498 4.309 1.506 4.374 C 1.516 4.455 1.553 4.577 1.744 4.818 C 1.945 5.071 2.248 5.375 2.712 5.839 L 7.661 10.788 C 8.126 11.253 8.43 11.555 8.683 11.756 C 8.924 11.947 9.045 11.985 9.126 11.994 C 9.192 12.002 9.258 12.002 9.323 11.994 C 9.405 11.985 9.525 11.947 9.766 11.756 C 10.019 11.555 10.324 11.253 10.788 10.788 C 11.253 10.324 11.555 10.019 11.756 9.766 C 11.947 9.525 11.985 9.405 11.994 9.323 C 12.002 9.258 12.002 9.192 11.994 9.126 C 11.985 9.045 11.947 8.924 11.756 8.683 C 11.555 8.43 11.253 8.126 10.788 7.661 L 5.839 2.712 C 5.375 2.248 5.071 1.945 4.818 1.744 C 4.577 1.553 4.455 1.516 4.374 1.506 C 4.309 1.498 4.242 1.498 4.177 1.506 Z" fill={color} fillRule="evenodd" />
      </G>
      <G transform="translate(17.269 1.748)">
        <Path d="M 0.22 0.22 C 0.513 -0.073 0.987 -0.073 1.28 0.22 L 4.385 3.323 C 4.678 3.616 4.678 4.092 4.385 4.385 C 4.092 4.678 3.616 4.678 3.323 4.385 L 0.22 1.28 C -0.073 0.987 -0.073 0.513 0.22 0.22 Z" fill={color} fillRule="evenodd" />
      </G>
      <G transform="translate(1.748 17.269)">
        <Path d="M 0.22 0.22 C 0.513 -0.073 0.987 -0.073 1.28 0.22 L 4.385 3.323 C 4.678 3.616 4.678 4.092 4.385 4.385 C 4.092 4.678 3.616 4.678 3.323 4.385 L 0.22 1.28 C -0.073 0.987 -0.073 0.513 0.22 0.22 Z" fill={color} fillRule="evenodd" />
      </G>
    </Svg>
  );
}

export function ProfileTabIcon({ color }: { color: ColorValue }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24">
      <G transform="translate(3 13)">
        <Path d="M 16 8 L 16 7 C 16 4.242 13.758 2 11 2 L 7 2 C 4.242 2 2 4.242 2 7 L 2 8 C 2 8.552 1.552 9 1 9 C 0.448 9 0 8.552 0 8 L 0 7 C 0 3.138 3.138 0 7 0 L 11 0 C 14.862 0 18 3.138 18 7 L 18 8 C 18 8.552 17.552 9 17 9 C 16.448 9 16 8.552 16 8 Z" fill={color} fillRule="evenodd" />
      </G>
      <G transform="translate(7 2)">
        <Path d="M 8 5 C 8 3.342 6.658 2 5 2 C 3.342 2 2 3.342 2 5 C 2 6.658 3.342 8 5 8 C 6.658 8 8 6.658 8 5 Z M 10 5 C 10 7.762 7.762 10 5 10 C 2.238 10 0 7.762 0 5 C 0 2.238 2.238 0 5 0 C 7.762 0 10 2.238 10 5 Z" fill={color} fillRule="evenodd" />
      </G>
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

/**
 * HM-1 `This week's goal`. The comp draws a filled 18×18 trophy inset 3px
 * inside a 24×24 box — not a member of the stroked 24-grid icon set.
 */
export function TrophyIcon({ size = 24, color = colors.primary }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <G transform="translate(3 3)">
        <Path d="M 4 7.8 L 4 4 L 2 4 L 2 5 C 2 5.633 2.183 6.204 2.55 6.713 C 2.917 7.222 3.4 7.584 4 7.8 Z M 14 7.8 C 14.6 7.583 15.083 7.221 15.45 6.712 C 15.817 6.203 16 5.633 16 5 L 16 4 L 14 4 L 14 7.8 Z M 8 16 L 8 12.9 C 7.183 12.717 6.454 12.371 5.813 11.863 C 5.172 11.355 4.701 10.717 4.4 9.95 C 3.15 9.8 2.104 9.254 1.263 8.313 C 0.422 7.372 0.001 6.267 0 5 L 0 4 C 0 3.45 0.196 2.979 0.588 2.588 C 0.98 2.197 1.451 2.001 2 2 L 4 2 C 4 1.45 4.196 0.979 4.588 0.588 C 4.98 0.197 5.451 0.001 6 0 L 12 0 C 12.55 0 13.021 0.196 13.413 0.588 C 13.805 0.98 14.001 1.451 14 2 L 16 2 C 16.55 2 17.021 2.196 17.413 2.588 C 17.805 2.98 18.001 3.451 18 4 L 18 5 C 18 6.267 17.579 7.371 16.737 8.313 C 15.895 9.255 14.849 9.801 13.6 9.95 C 13.3 10.717 12.829 11.354 12.188 11.863 C 11.547 12.372 10.817 12.717 10 12.9 L 10 16 L 13 16 C 13.283 16 13.521 16.096 13.713 16.288 C 13.905 16.48 14.001 16.717 14 17 C 13.999 17.283 13.903 17.52 13.712 17.713 C 13.521 17.906 13.283 18.001 13 18 L 5 18 C 4.717 18 4.479 17.904 4.288 17.712 C 4.097 17.52 4.001 17.283 4 17 C 3.999 16.717 4.095 16.48 4.288 16.288 C 4.481 16.096 4.718 16 5 16 L 8 16 Z" fill={color} fillRule="evenodd" />
      </G>
    </Svg>
  );
}
