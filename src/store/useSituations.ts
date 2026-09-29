import { useMemo } from 'react';

import { homeFeatured as seedFeatured, situations as seedSituations } from '@/data/situations';
import type { Situation } from '@/data/types';

import { useApp, type SessionResult } from './AppStore';

/**
 * The catalog with the learner's own progress on it. A situation they've
 * played shows how many goals the last run met; one they finished cleanly is
 * no longer "in progress". Unplayed situations keep the catalog's value.
 */
export function useSituations() {
  const { sessions } = useApp();

  return useMemo(() => {
    const withProgress = (situation: Situation): Situation => {
      const session = sessions[situation.id];
      if (!session) return situation;
      return { ...situation, progress: progressOf(session) };
    };

    const situations = seedSituations.map(withProgress);
    const homeFeatured = seedFeatured.map(withProgress);

    // HM-1's resume card: the most recent unfinished run, else the catalog's.
    const lastPlayed = Object.entries(sessions)
      .filter(([, session]) => session.goalsMet < session.goalsTotal)
      .sort(([, a], [, b]) => (b.completedAt ?? 0) - (a.completedAt ?? 0))[0];
    const inProgress = lastPlayed
      ? situations.find((situation) => situation.id === lastPlayed[0])
      : situations.find((situation) => situation.progress && !sessions[situation.id]);

    return { situations, homeFeatured, inProgress };
  }, [sessions]);
}

function progressOf(session: SessionResult): Situation['progress'] {
  if (session.goalsMet >= session.goalsTotal) return undefined;
  return {
    completed: session.goalsMet,
    total: session.goalsTotal,
    percent: Math.round((session.goalsMet / session.goalsTotal) * 100),
  };
}
