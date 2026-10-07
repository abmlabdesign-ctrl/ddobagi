import type { Turn } from '@/data/types';

/**
 * Shown where a learner turn had nothing heard — silence, or a Submit with no
 * words recognized. Never the script's example answer.
 */
export const NOTHING_HEARD = 'No answer heard';

/** A turn as it actually went; `unheard` marks a learner turn nothing was heard for. */
export type SaidTurn = Turn & { unheard?: boolean };

/**
 * A learner turn as the learner actually said it. The script's own `korean`
 * on a learner turn is only the example answer the hints and corrections are
 * written against — it never stands in for the learner. RP-3b and RV-6 both
 * build their transcripts with this, so they read the same words.
 */
export function asSaid(turn: Turn, said: string | undefined): SaidTurn {
  if (turn.speaker !== 'user') return turn;
  const heard = said?.trim() ?? '';
  if (!heard) {
    return {
      ...turn,
      korean: '',
      english: '',
      meanings: undefined,
      mistake: undefined,
      unheard: true,
    };
  }
  // Said word for word, the script's meaning still fits; otherwise it doesn't.
  if (heard === turn.korean) return turn;
  return { ...turn, korean: heard, english: '', meanings: undefined };
}
