import { TODAYS_FOCUS_ID, missions, questionKind } from '@/data/missions';
import type { Mission, MissionQuestion } from '@/data/types';

import { freshFirst, shuffle } from './questionPicker';

/** RV-1 `Today's focus` length. */
export const MIXED_LENGTH = 10;

/**
 * Today's focus: ten questions across all six skills, in a fresh random order
 * each time. Every skill puts in at least one question; the rest are drawn from
 * what's authored, questions not seen lately first (`recent`, newest first), and
 * no two neighbours drill the same skill when the mix allows it. Built on the
 * device — there's no server to pick for us.
 */
export function buildMixedMission(recent: string[] = []): Mission {
  const perSkill = missions.map((mission) => freshFirst(mission.questions, recent));
  // One from each skill first, so no skill is left out…
  const picked: MissionQuestion[] = perSkill.map((questions) => questions[0]);
  // …then fill to ten from everything left, the least recently seen first.
  const rest = freshFirst(
    perSkill.flatMap((questions) => questions.slice(1)),
    recent,
  );
  while (picked.length < MIXED_LENGTH && rest.length) picked.push(rest.shift()!);
  // A very small bank still reaches ten by repeating, never one skill alone.
  for (let i = 0; picked.length < MIXED_LENGTH; i += 1) picked.push(picked[i]);

  return {
    id: TODAYS_FOCUS_ID,
    title: "Today's focus",
    // Only a fallback: the runner reads each question's own skill.
    kind: questionKind[picked[0].id],
    mode: picked[0].type,
    questionCount: MIXED_LENGTH,
    minutes: 3,
    questions: spreadOut(picked),
  };
}

/** Reorders so neighbours differ in skill where possible (a few shuffles, then the best seen). */
function spreadOut(questions: MissionQuestion[]) {
  const clashes = (list: MissionQuestion[]) =>
    list.reduce(
      (sum, question, i) =>
        sum + (i > 0 && questionKind[question.id] === questionKind[list[i - 1].id] ? 1 : 0),
      0,
    );
  let best = shuffle(questions);
  for (let attempt = 0; attempt < 50 && clashes(best) > 0; attempt += 1) {
    const next = shuffle(questions);
    if (clashes(next) < clashes(best)) best = next;
  }
  return best;
}
