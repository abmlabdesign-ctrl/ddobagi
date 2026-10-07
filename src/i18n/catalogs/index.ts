import type { NativeLanguage } from '@/data/types';

import ja from './ja';
import vi from './vi';
import zh from './zh';

/** English source → translation. Keys come from `src/i18n/sources.ts`. */
export type Catalog = Record<string, string>;

/**
 * One file per native language. A language without a file, or a string its
 * file lacks, falls back to English — `node --experimental-strip-types
 * scripts/i18n-check.mjs` lists what each one is missing.
 */
export const catalogs: Partial<Record<NativeLanguage, Catalog>> = {
  Vietnamese: vi,
  Chinese: zh,
  Japanese: ja,
};
