import { useCallback } from 'react';

import type { Meanings } from '@/data/types';

import { useApp } from './AppStore';

/**
 * The meaning caption of a Korean line, in the learner's native language
 * (ON-2 / MY-1 / MY-1b). Content without that language yet — or a learner
 * whose native language is English — reads the English, so a translation can
 * land one language or one line at a time without touching a screen.
 *
 * Only meanings of Korean lines go through here. Buttons, labels and
 * explanations are app UI and stay in English (§6).
 */
export function useMeaning() {
  const { profile } = useApp();
  const language = profile.nativeLanguage;

  return useCallback(
    (line: { english: string; meanings?: Meanings }) =>
      (language !== 'English' ? line.meanings?.[language] : undefined) ?? line.english,
    [language],
  );
}
