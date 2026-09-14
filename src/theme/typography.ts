import { Platform, type TextStyle } from 'react-native';

import { colors } from './tokens';

/**
 * Pretendard is the design typeface. It is not bundled here, so we fall back to
 * the platform UI font — the same fallback stack the handoff HTML declares.
 * Drop Pretendard-*.otf into assets/fonts and register it in app/_layout.tsx to
 * match the comps exactly.
 */
export const fontFamily = {
  sans: Platform.select({
    ios: 'System',
    android: 'sans-serif',
    default: "Pretendard, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  }),
  /** Numeric display (timer, scores) uses Inter in the comps. */
  numeric: Platform.select({
    ios: 'System',
    android: 'sans-serif',
    default: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
  }),
} as const;

const t = (
  fontSize: number,
  lineHeight: number,
  fontWeight: TextStyle['fontWeight'],
  color: string = colors.ink,
): TextStyle => ({ fontFamily: fontFamily.sans, fontSize, lineHeight, fontWeight, color });

/**
 * The type scale from the handoff, named by role.
 * Keys read `size/lineHeight/weight` in the spec table.
 */
export const type = {
  /** 40/48/700 — level-check timer, big scores. */
  timer: { ...t(40, 48, '700'), fontFamily: fontFamily.numeric },
  /** 28/40/700 — app name, section titles. */
  display: t(28, 40, '700'),
  /** 24/34/600 — home greeting. */
  greeting: t(24, 34, '600'),
  /** 22/32/600 — Korean learning sentences. */
  korean: t(22, 32, '600'),
  /** 18/26/600 — section headers. */
  section: t(18, 26, '600'),
  /** 17/23/600 — list titles. */
  listTitle: t(17, 23, '600'),
  /** 16/22/600 — nav titles, buttons. */
  title: t(16, 22, '600'),
  /** 15/24/500 — body. */
  body: t(15, 24, '500'),
  /** 15/24/400 — long-form body. */
  bodyRegular: t(15, 24, '400'),
  /** 14/22/400 — secondary text and English captions. */
  secondary: t(14, 22, '400', colors.textSecondary),
  /** 14/22/600 — nav action text. */
  action: t(14, 22, '600', colors.primary),
  /** 13/19/400 — descriptions. */
  description: t(13, 19, '400', colors.textSecondary),
  /** 12/16/400 — captions. */
  caption: t(12, 16, '400', colors.textSecondary),
  /** 12/16/600 — badges, tab labels. */
  badge: t(12, 16, '600'),
  /** 11/16/500 — meta. */
  meta: t(11, 16, '500', colors.textTertiary),
  /** 10/16/600 — micro badges. */
  micro: t(10, 16, '600'),
} as const;

export type TypeToken = keyof typeof type;
