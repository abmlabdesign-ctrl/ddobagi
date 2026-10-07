/**
 * Catalogs are keyed by the English source text. Quotes and edge spaces are
 * dropped so `“It hurts.”` (a correction's display form) and `It hurts.` find
 * the same entry.
 */
export const catalogKey = (english: string) => english.replace(/["“”]/g, '').trim();
