import { type TextStyle } from 'react-native';

import { colors } from './tokens';

/**
 * Pretendard is the product face and Inter carries every numeral (timers,
 * scores, counters, tab labels) — both are bundled in assets/fonts and
 * registered in app/_layout.tsx. Weights map to a named family because React
 * Native picks the file by family name, not by numeric fontWeight.
 */
export const fontFamily = {
  sans: 'Pretendard-Regular',
  sansMedium: 'Pretendard-Medium',
  sansSemiBold: 'Pretendard-SemiBold',
  sansBold: 'Pretendard-Bold',
  numeric: 'Inter_400Regular',
  numericMedium: 'Inter_500Medium',
  numericSemiBold: 'Inter_600SemiBold',
  numericBold: 'Inter_700Bold',
} as const;

type Weight = '400' | '500' | '600' | '700';

const SANS: Record<Weight, string> = {
  '400': fontFamily.sans,
  '500': fontFamily.sansMedium,
  '600': fontFamily.sansSemiBold,
  '700': fontFamily.sansBold,
};

const NUMERIC: Record<Weight, string> = {
  '400': fontFamily.numeric,
  '500': fontFamily.numericMedium,
  '600': fontFamily.numericSemiBold,
  '700': fontFamily.numericBold,
};

/** Pretendard text at an exact size/line-height/weight from the comps. */
export const text = (
  fontSize: number,
  lineHeight: number,
  weight: Weight,
  color: string = colors.inkAlt,
): TextStyle => ({
  fontFamily: SANS[weight],
  fontSize,
  lineHeight,
  color,
});

/** Inter numerals. `tight` applies the -0.02em tracking the big numbers use. */
export const numeral = (
  fontSize: number,
  lineHeight: number,
  weight: Weight,
  color: string = colors.inkAlt,
  tight = false,
): TextStyle => ({
  fontFamily: NUMERIC[weight],
  fontSize,
  lineHeight,
  color,
  ...(tight ? { letterSpacing: fontSize * -0.02 } : null),
});

/**
 * The scale, named by the role it plays in the comps. Sizes that appear in only
 * one place stay inline on that screen rather than growing this table.
 */
export const type = {
  /** 40/48/700 Inter — level-check timer, stats overall score. */
  timer: numeral(40, 48, '700', colors.ink, true),
  /** 28/40/700 — ON-1 app name. */
  display: text(28, 40, '700', colors.ink),
  /** 24/34/700 — root screen titles, scenario and result headings. */
  screenTitle: text(24, 34, '700', colors.ink),
  /** 22/32/600 — Korean learning sentences. */
  korean: text(22, 32, '600', colors.inkAlt),
  /** 20/29/600 — today's focus headline. */
  lead: text(20, 29, '600', colors.inkAlt),
  /** 18/26/600 — section headers, card titles. */
  section: text(18, 26, '600', colors.inkAlt),
  /** 18/28/500 — result summary body. */
  summary: text(18, 28, '500', colors.inkAlt),
  /** 17/25/600 — list headline inside a card. */
  cardTitle: text(17, 25, '600', colors.inkAlt),
  /** 16/22/600 — nav titles, buttons, role names. */
  title: text(16, 22, '600', colors.ink),
  /** 17/22/600 — primary CTA label. */
  cta: text(17, 22, '600', colors.surface),
  /** 16/23/500 — scenario body copy. */
  bodyLead: text(16, 23, '500', colors.inkAlt),
  /** 16/22/500 — goal rows, menu-adjacent body. */
  body: text(16, 22, '500', colors.inkAlt),
  /** 16/22/400 — skill labels. */
  bodyRegular: text(16, 22, '400', colors.inkAlt),
  /** 15/22/600 — list row titles. */
  listTitle: text(15, 22, '600', colors.inkAlt),
  /** 15/21/600 — dense list row titles. */
  listTitleTight: text(15, 21, '600', colors.inkAlt),
  /** 15/24/500 — settings and menu rows. */
  row: text(15, 24, '500', colors.inkAlt),
  /** 14/22/600 — small section labels, nav action text. */
  label: text(14, 22, '600', colors.inkAlt),
  /** 14/22/500 — chips, option labels. */
  chip: text(14, 22, '500', colors.inkAlt),
  /** 14/22/400 — secondary text. */
  secondary: text(14, 22, '400', colors.textSecondary),
  /** 13/19/400 — descriptions. */
  description: text(13, 19, '400', colors.textSecondary),
  /** 13/19/500 — tab chips, feedback explanations. */
  descriptionMedium: text(13, 19, '500', colors.textSecondary),
  /** 12/16/400 — captions and English glosses. */
  caption: text(12, 16, '400', colors.textSecondary),
  /** 12/16/600 — badges, block labels. */
  badge: text(12, 16, '600', colors.inkAlt),
  /** 11/16/600 — compact badges. */
  badgeSmall: text(11, 16, '600', colors.inkAlt),
  /** 11/16/500 — sentence-fix sub labels. */
  microLabel: text(11, 16, '500', colors.textTertiary),
  /** 10/16/600 — micro badges (In progress, Hint). */
  micro: text(10, 16, '600', colors.inkAlt),
} as const;

/**
 * The comps set nested English glosses to `font-size: 0.62em` of the Korean
 * line above them, so the ratio travels with whatever size the parent uses.
 */
export const GLOSS_RATIO = 0.62;

export function gloss(parentSize: number, color: string = colors.textSecondary): TextStyle {
  const fontSize = Math.round(parentSize * GLOSS_RATIO * 10) / 10;
  return { fontFamily: SANS['400'], fontSize, lineHeight: Math.round(fontSize * 1.45), color };
}

export type TypeToken = keyof typeof type;
