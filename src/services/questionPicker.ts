import type { Mission, MissionQuestion } from '@/data/types';

/** How many dealt question ids the device remembers — a few runs' worth. */
export const RECENT_CAP = 60;

export const shuffle = <T>(items: T[]) => {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
};

/**
 * The bank in dealing order: never-seen questions first, then the ones seen
 * longest ago. Ties keep a random order, so two runs never line up the same.
 * `recent` is newest first (`AppStore.recentQuestions`).
 */
export function freshFirst(questions: MissionQuestion[], recent: string[]) {
  const staleness = (id: string) => {
    const at = recent.indexOf(id);
    return at === -1 ? recent.length : at;
  };
  // Array sort is stable, so the shuffle survives inside each tie.
  return shuffle(questions).sort((a, b) => staleness(b.id) - staleness(a.id));
}

/**
 * Orders a run so it doesn't open on what the last run just showed: the
 * picked questions are shuffled, then any of the latest few go to the back.
 */
export function avoidRepeatAtStart(questions: MissionQuestion[], recent: string[]) {
  const justSeen = new Set(recent.slice(0, Math.ceil(questions.length / 2)));
  const mixed = shuffle(questions);
  return [
    ...mixed.filter((question) => !justSeen.has(question.id)),
    ...mixed.filter((question) => justSeen.has(question.id)),
  ];
}

/**
 * One skill's run: `questionCount` questions dealt from its bank, freshest
 * first. A bank smaller than the run is used whole, and the runner cycles it.
 */
export function dealMission(mission: Mission, recent: string[]): Mission {
  const picked = freshFirst(mission.questions, recent).slice(0, mission.questionCount);
  return { ...mission, questions: avoidRepeatAtStart(picked, recent) };
}

/** `recent` after a run dealt `ids` (in the order they're asked). */
export function rememberDealt(recent: string[], ids: string[]) {
  const dealt = [...new Set(ids)].reverse();
  return [...dealt, ...recent.filter((id) => !dealt.includes(id))].slice(0, RECENT_CAP);
}
