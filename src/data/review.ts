import type { Mistake, SavedPhrase } from './types';

/** RV-3 / RV-6 / RV-7. Grouped by situation on RV-3a. */
export const mistakes: Mistake[] = [
  {
    id: 'mk-1',
    situationId: 'pharmacy-symptoms',
    skill: 'endings',
    date: 'Aug 22',
    said: {
      korean: '"이틀 전에부터 아파요."',
      english: '“It hurts since two days ago.”',
      note: '(incorrect)',
    },
    suggested: {
      korean: '"이틀 전부터 아팠어요."',
      english: '“It has hurt since two days ago.”',
    },
    why: '전에부터 doubles up. Use 전부터, and for symptoms that already passed the past form 아팠어요 sounds natural.',
    fixed: false,
  },
  {
    id: 'mk-2',
    situationId: 'pharmacy-symptoms',
    skill: 'politeness',
    date: 'Aug 22',
    said: {
      korean: '"약 얼마야?"',
      english: '“How much is the medicine?”',
      note: '(too casual)',
    },
    suggested: {
      korean: '"이 약은 얼마예요?"',
      english: '“How much is this medicine?”',
    },
    why: '약사에게는 -아/어요 체를 씁니다. 반말 -야는 친구 사이에서만 자연스럽습니다.',
    fixed: false,
  },
  {
    id: 'mk-3',
    situationId: 'pharmacy-symptoms',
    skill: 'endings',
    date: 'Aug 20',
    said: {
      korean: '"포장해 주세요."',
      english: '“To go, please.”',
      note: '',
    },
    suggested: {
      korean: '"포장해 주세요."',
      english: '“To go, please.”',
    },
    why: 'You fixed this one — the -아/어 주세요 request form is right.',
    fixed: true,
  },
  {
    id: 'mk-4',
    situationId: 'cafe-order',
    skill: 'context',
    date: 'Aug 21',
    said: {
      korean: '"먹어요. 여기"',
      english: '“Eat. Here”',
      note: '(word order)',
    },
    suggested: {
      korean: '"여기서 먹을게요."',
      english: '“I’ll eat here.”',
    },
    why: '장소는 문장 앞에 오고 조사 에서를 붙입니다. Put the place first with 에서, then the verb.',
    fixed: false,
  },
];

/** RV-3a rows. Counts include mistakes the log does not spell out yet. */
export const mistakeGroups = [
  {
    situationId: 'pharmacy-symptoms',
    count: 3,
    skills: ['endings', 'politeness'],
    date: 'Aug 22',
  },
  {
    situationId: 'cafe-order',
    count: 4,
    skills: ['endings', 'context'],
    date: 'Aug 21',
  },
  {
    situationId: 'school-professor',
    count: 3,
    skills: ['politeness'],
    date: 'Aug 19',
  },
  {
    situationId: 'government-bank',
    count: 2,
    skills: ['particles'],
    date: 'Aug 17',
  },
] as const;

export const mistakesSummary = {
  total: 12,
  situations: 4,
  fixedCount: 7,
  fixedWindow: 'last 30 days',
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
