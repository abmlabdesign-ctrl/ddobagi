import { useMemo } from 'react';

import { homeFeatured as seedFeatured, situations as seedSituations } from '@/data/situations';
import type { Situation } from '@/data/types';

import { useApp, type ConversationDraft } from './AppStore';

/**
 * The catalog with the learner's own progress on it. The card's bar is how far
 * through the conversation they got: a run saved part-way shows its percent,
 * a finished one shows 100%. Unplayed situations keep the catalog's value.
 */
export function useSituations() {
  const { sessions, drafts } = useApp();

  return useMemo(() => {
    const withProgress = (situation: Situation): Situation => {
      const draft = drafts[situation.id];
      if (draft) return { ...situation, progress: progressOf(draft) };
      if (sessions[situation.id]) {
        return { ...situation, progress: { completed: 1, total: 1, percent: 100 } };
      }
      return situation;
    };

    const situations = seedSituations.map(withProgress);
    const homeFeatured = seedFeatured.map(withProgress);

    // HM-1's resume card: the most recently saved run, else the catalog's.
    const lastSaved = Object.entries(drafts).sort(([, a], [, b]) => b.savedAt - a.savedAt)[0];
    const inProgress = lastSaved
      ? situations.find((situation) => situation.id === lastSaved[0])
      : situations.find((situation) => isInProgress(situation) && !sessions[situation.id]);

    return { situations, homeFeatured, inProgress };
  }, [sessions, drafts]);
}

/** Started but not finished — RP-1's `Status` filter and HM-1's resume card. */
export const isInProgress = (situation: Situation) =>
  Boolean(situation.progress && situation.progress.percent < 100);

function progressOf(draft: ConversationDraft): Situation['progress'] {
  return { completed: draft.answered, total: draft.total, percent: draft.percent };
}
