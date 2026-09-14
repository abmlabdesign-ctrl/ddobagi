/**
 * Design tokens — 또박(Ddobak) design system v1.1.
 * Values come straight from the design handoff; do not hand-tune them per screen.
 */

export const colors = {
  primary: '#FF6A3D',
  primaryPressed: '#FF5624',
  primary100: '#FFF0EC',
  primary200: '#FFD1C3',
  primary300: '#FFBAA6',

  ink: '#191F28',
  inkAlt: '#1A1A1C',
  textSecondary: '#95989C',
  textTertiary: '#B0B8C1',

  surface: '#FFFFFF',
  surfaceAlt: '#F7F8FD',
  canvas: '#E6E8EE',

  fill: '#F2F3F5',
  fillAlt: '#F0F2F7',
  border: '#D1D5D9',

  success: '#27A376',
  successBg: '#EAF8EE',
  info: '#0091FF',
  infoBg: '#EBF9FF',

  bubbleUser: '#E5EFFF',
  bubbleUserStrong: '#D8E7FF',
} as const;

/** 4 · 8 · 12 · 16 · 20 · 24 · 28 · 32 · 40 */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  /** Screen side gutter. 390 frame − 24×2 = 342 content width. */
  gutter: 24,
  xxl: 28,
  xxxl: 32,
  huge: 40,
} as const;

export const radius = {
  badge: 8,
  input: 12,
  search: 14,
  card: 16,
  button: 18,
  tile: 20,
  sheet: 24,
  device: 40,
  pill: 999,
} as const;

export const layout = {
  frameWidth: 390,
  contentWidth: 342,
  navBarHeight: 56,
  tabBarHeight: 56,
  /** Minimum touch target (chips get their 44 from surrounding padding). */
  minTouchTarget: 44,
} as const;

type Shadow = {
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number;
};

const shadow = (
  color: string,
  y: number,
  blur: number,
  opacity: number,
  elevation: number,
): Shadow => ({
  shadowColor: color,
  shadowOffset: { width: 0, height: y },
  shadowOpacity: opacity,
  shadowRadius: blur / 2,
  elevation,
});

export const shadows = {
  /** 0 0 20px rgba(50,68,88,0.08) */
  card: shadow('#324458', 0, 20, 0.08, 2),
  /** 0 12px 40px rgba(50,68,88,0.14) */
  float: shadow('#324458', 12, 40, 0.14, 8),
  /** 0 -4px 24px rgba(50,68,88,0.08) */
  bottomNav: shadow('#324458', -4, 24, 0.08, 12),
  /** 0 8px 24px rgba(25,31,40,0.18) */
  modal: shadow('#191F28', 8, 24, 0.18, 10),
  /** 0 0 32px rgba(255,106,61,0.5) */
  micGlow: shadow('#FF6A3D', 0, 32, 0.5, 12),
} as const;

/** `inset 0 0 0 1.5px #FF6A3D` has no RN equivalent; a 1.5px border reproduces it. */
export const selectedOutline = {
  borderWidth: 1.5,
  borderColor: colors.primary,
} as const;

export const hairline = {
  borderWidth: 1,
  borderColor: colors.border,
} as const;
