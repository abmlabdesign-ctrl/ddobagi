import type { NativeLanguage } from '@/data/types';

import { catalogs } from './catalogs';
import { catalogKey } from './key';

/**
 * A learning-aid string in the learner's native language. Catalogs are keyed
 * by the English source (`src/i18n/sources.ts`); anything not translated yet —
 * and everything for an English speaker — comes back in English.
 */
export function translate(language: NativeLanguage, english: string): string {
  if (!english || language === 'English') return english;
  return catalogs[language]?.[catalogKey(english)] ?? english;
}
