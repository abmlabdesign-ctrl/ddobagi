import { useCallback } from 'react';

import type { Meanings } from '@/data/types';
import { translate } from '@/i18n';

import { useApp } from './AppStore';

/**
 * The meaning caption of a Korean line, in the learner's native language
 * (ON-2 / MY-1 / MY-1b all set the same `profile.nativeLanguage`). A meaning
 * written into the data (`meanings`) wins; otherwise the language's catalog
 * (`src/i18n/catalogs`); otherwise English.
 *
 * Only learning aids go through here and `useHelpText`. Buttons, labels and
 * titles are app UI and stay in English (§6).
 */
export function useMeaning() {
  const { profile } = useApp();
  const language = profile.nativeLanguage;

  return useCallback(
    (line: { english: string; meanings?: Meanings }) =>
      (language !== 'English' ? line.meanings?.[language] : undefined) ??
      translate(language, line.english),
    [language],
  );
}

/** Explanations and prompts that teach (why a line was wrong, what a drill asks), in the native language. */
export function useHelpText() {
  const { profile } = useApp();
  const language = profile.nativeLanguage;
  return useCallback((english: string) => translate(language, english), [language]);
}
