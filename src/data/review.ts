import type { SavedPhrase } from './types';

/** RV-3a copy. Counts and rows come from the learner's log in the store. */
export const mistakesSummary = {
  fixedWindow: 'so far',
  sort: 'Most recent',
};

/** RV-5 Scrapbook. Oldest first — the store appends, so the tail is the newest. */
export const savedPhrases: SavedPhrase[] = [
  {
    id: 'sp-1',
    situationId: 'cafe-order',
    korean: '여기서 먹을게요.',
    english: "I'll eat here.",
    savedOn: 'Aug 20',
    note: '에서 marks where the action happens — 여기서, not 여기.',
  },
  {
    id: 'sp-2',
    situationId: 'cafe-order',
    korean: '사이즈는 라지로 주세요.',
    english: 'Large size, please.',
    savedOn: 'Aug 22',
  },
  {
    id: 'sp-3',
    situationId: 'pharmacy-symptoms',
    korean: '하루에 몇 번 먹으면 돼요?',
    english: 'How many times a day should I take it?',
    savedOn: 'Sep 12',
  },
];
