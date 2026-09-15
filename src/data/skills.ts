import { colors } from '@/theme/tokens';

import type { SkillBand, SkillId, SkillScore } from './types';

/** Fixed order — every 6-skill breakdown in the app reads top to bottom. */
export const skillOrder: SkillId[] = [
  'pronunciation',
  'fluency',
  'particles',
  'endings',
  'politeness',
  'context',
];

export const skillLabels: Record<SkillId, string> = {
  pronunciation: 'Pronunciation',
  fluency: 'Fluency',
  particles: 'Particles',
  endings: 'Endings',
  politeness: 'Politeness',
  context: 'Context',
};

export const bandLabels: Record<SkillBand, string> = {
  strong: 'Strong',
  medium: 'Medium',
  'needs-work': 'Needs work',
};

/**
 * Band colours are taken from the comps, where `Strong` is the blue chip and
 * `Medium` the green one. (The handoff README states the opposite; the .dc.html
 * screens are the source of truth and all three of them agree.)
 * `needs-work` renders as bare text, so its background is never drawn.
 */
export const bandColors: Record<SkillBand, { text: string; background: string }> = {
  strong: { text: colors.info, background: colors.infoBg },
  medium: { text: colors.success, background: colors.successBg },
  'needs-work': { text: colors.primary, background: colors.primary100 },
};

/** The level check and every report share this result set. */
export const levelCheckSkills: SkillScore[] = [
  { skill: 'pronunciation', score: 88, band: 'strong' },
  { skill: 'fluency', score: 79, band: 'strong' },
  { skill: 'particles', score: 84, band: 'strong' },
  { skill: 'endings', score: 76, band: 'medium' },
  { skill: 'politeness', score: 64, band: 'needs-work' },
  { skill: 'context', score: 71, band: 'needs-work' },
];

export const levelCheckSummary: [string, string] = [
  'Everyday conversation comes easily to you.',
  'Politeness and context could use more practice.',
];

/** The level-check prompt. Its English caption is always visible (see §6). */
export const levelCheckQuestion = {
  korean: '주말에 보통 뭐 하세요?',
  english: 'What do you usually do on weekends?',
};

/** Transcript that streams in while the learner speaks. */
export const levelCheckTranscript = [
  '저는 보통 친구를 만나고,',
  ' 카페에서 공부를 해요.',
  ' 그리고 주말에는',
];

export const levelCheckSeconds = 60;
