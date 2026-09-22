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
  /** RV-2f's centred body copy — darker than the usual secondary grey. */
  textBody: '#5F6773',
  textSecondary: '#95989C',
  textTertiary: '#B0B8C1',

  surface: '#FFFFFF',
  surfaceAlt: '#F7F8FD',
  canvas: '#E6E8EE',

  fill: '#F2F3F5',
  fillAlt: '#F0F2F7',
  /** The warm-neutral panel behind RV-2f's Time / Politeness pair. */
  fillSoft: '#F6F6F6',
  border: '#D1D5D9',
  /** Progress/skill track and card-row dividers, straight from the comps. */
  track: '#E6E8EE',
  divider: '#F0F2F7',

  /** The red the mistake flag already uses — destructive actions take it too. */
  danger: '#F04452',
  dangerBg: '#FDECEF',

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
  /** 6 — skill band badge. */
  chipBadge: 6,
  /** 8 — difficulty/meta badges, thumbnails. */
  badge: 8,
  /** 12 — selects, inline blocks. */
  input: 12,
  /** 13 — RV-2f's stat panel. */
  stat: 13,
  /** 14 — search field, mission options, live-session pills. */
  search: 14,
  /** 16 — prompt cards, option rows, transcript card. */
  card: 16,
  /** 18 — buttons, the home resume card. */
  button: 18,
  /** 20 — skill cards, list cards, stat tiles, quick actions. */
  panel: 20,
  /** 24 — grouped cards (my page, settings, sentence fix, today's focus). */
  group: 24,
  /** 24 — bottom sheets. */
  sheet: 24,
  device: 40,
  pill: 999,
} as const;

export const layout = {
  frameWidth: 390,
  contentWidth: 342,
  /** Every comp draws the bar at 52. */
  navBarHeight: 52,
  /** Back-chevron screens gutter at 20, title-only roots at 24. */
  navBarPaddingWithBack: 20,
  navBarPaddingTitleOnly: 24,
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
  /** 0 0 32px rgba(255,106,61,0.5) — mic button and the home resume card. */
  micGlow: shadow('#FF6A3D', 0, 32, 0.5, 12),
  /** 0 0 24px rgba(255,106,61,0.4) — primary CTA glow (RP-4 Save). */
  primaryGlow: shadow('#FF6A3D', 0, 24, 0.4, 8),
  /** 0 -4px 12px #21212114 — bottom CTA dock. */
  dock: shadow('#212121', -4, 12, 0.08, 10),
  /** 0 0 8px #0000000A — segmented control shell. */
  soft: shadow('#000000', 0, 8, 0.04, 1),
  /** 0 0 10px #0000000A — stats insight card. */
  insight: shadow('#000000', 0, 10, 0.04, 2),
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
