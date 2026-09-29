import { playableSituationIds } from '@/data/conversations';
import { missions } from '@/data/missions';
import { situationById } from '@/data/situations';
import { skillLabels } from '@/data/skills';
import type { CategoryId, Mistake, SkillId } from '@/data/types';
import type { SessionResult } from '@/store/AppStore';

/**
 * What to practice next, from what the learner told us (ON-2, MY-1b) and what
 * they got wrong. Open mistakes outrank self-reported pain points: they're
 * evidence, the survey is a guess.
 */

/** ON-2 `What's hard for you?` → the skills it names. */
const painPointSkills: Record<string, SkillId[]> = {
  Pronunciation: ['pronunciation'],
  Politeness: ['politeness'],
  Context: ['context'],
  'Particles & endings': ['particles', 'endings'],
  Fluency: ['fluency'],
};

/** MY-1b interests → the catalog category each one means. */
const interestCategories: Record<string, CategoryId> = {
  School: 'school',
  'Part-time': 'part-time-job',
  Clinic: 'clinic',
  Shopping: 'shopping',
  Transit: 'transit',
  'K-content': 'k-content',
};

/** Fallback when there's nothing to go on yet — the comp's default pair. */
const DEFAULT_FOCUS: SkillId[] = ['politeness', 'endings'];

/** The two skills RV-1's `Today's focus` names, weakest first. */
export function focusSkills(mistakes: Mistake[], painPoints: string[]): SkillId[] {
  const counts = new Map<SkillId, number>();
  for (const mistake of mistakes) {
    if (!mistake.fixed) counts.set(mistake.skill, (counts.get(mistake.skill) ?? 0) + 1);
  }
  const fromMistakes = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([skill]) => skill);
  const fromSurvey = painPoints.flatMap((point) => painPointSkills[point] ?? []);

  const picked: SkillId[] = [];
  for (const skill of [...fromMistakes, ...fromSurvey, ...DEFAULT_FOCUS]) {
    if (!picked.includes(skill)) picked.push(skill);
    if (picked.length === 2) break;
  }
  return picked;
}

export function todayFocus(mistakes: Mistake[], painPoints: string[]) {
  const skills = focusSkills(mistakes, painPoints);
  const mission = missions.find((entry) => entry.kind === skills[0]) ?? missions[0];
  return { skills: skills.map((skill) => skillLabels[skill]), mission };
}

/**
 * HM-1 `We'll pick a topic`: a playable situation the learner hasn't done,
 * in a category they care about if possible; otherwise the one practised
 * longest ago.
 */
export function pickTopic(interests: string[], sessions: Record<string, SessionResult>) {
  const liked = new Set(interests.map((interest) => interestCategories[interest]).filter(Boolean));
  const fresh = playableSituationIds.filter((id) => !sessions[id]);
  const likedFresh = fresh.find((id) => liked.has(situationById[id]?.categoryId));
  if (likedFresh) return likedFresh;
  if (fresh.length > 0) return fresh[0];
  return [...playableSituationIds].sort(
    (a, b) => (sessions[a].completedAt ?? 0) - (sessions[b].completedAt ?? 0),
  )[0];
}
