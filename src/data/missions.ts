import type { Mission } from './types';

/** RV-1 `Today's focus` — driven by the two weakest skills. */
export const todayFocus = {
  skills: ['Politeness', 'Endings'],
  description: "Three minutes on today's weak spots",
  cta: 'Start 3-minute mission',
};

/**
 * Micro missions. Each runs 2–3 minutes and targets one skill.
 * `questionCount` is the designed length; `questions` holds the authored items,
 * which the runner cycles through when it runs out.
 */
export const missions: Mission[] = [
  {
    id: 'polite-endings',
    title: 'Switch to polite endings',
    kind: 'endings',
    questionCount: 8,
    minutes: 3,
    questions: [
      {
        id: 'pe-1',
        type: 'speak',
        tokens: [
          { text: '여기서' },
          { text: '먹을게요', romanization: 'meogeulgeyo' },
          { text: '.' },
        ],
        feedback: {
          correct: true,
          label: 'Correct',
          explanation: 'The ending -을게요 sounds natural here',
        },
      },
      {
        id: 'pe-2',
        type: 'choice',
        promptLabel: 'The barista asks',
        promptTokens: [
          { text: '포장', romanization: 'pojang' },
          { text: '이세요,' },
          { text: '드시고', romanization: 'deusigo' },
          { text: '가세요', romanization: 'gaseyo' },
          { text: '?' },
        ],
        promptEnglish: 'To go, or eating here?',
        sentenceTokens: [{ text: '여기서' }, null],
        options: ['먹을게요', '먹어', '먹는다'],
        answerIndex: 0,
        explanation: 'Use -을게요 when you tell someone what you’ve decided to do',
      },
    ],
  },
  {
    id: 'answer-that-fits',
    title: 'Pick the answer that fits',
    kind: 'context',
    questionCount: 5,
    minutes: 3,
    questions: [
      {
        id: 'af-1',
        type: 'choice',
        promptLabel: 'The barista asks',
        promptTokens: [
          { text: '포장', romanization: 'pojang' },
          { text: '이세요,' },
          { text: '드시고', romanization: 'deusigo' },
          { text: '가세요', romanization: 'gaseyo' },
          { text: '?' },
        ],
        promptEnglish: 'To go, or eating here?',
        sentenceTokens: [],
        options: ['여기서 먹고 갈게요.', '얼마예요?'],
        answerIndex: 0,
        explanation: 'They asked where you’ll eat, so answer that first',
      },
    ],
  },
  {
    id: 'tense-endings',
    title: 'Hear the tense, pick the ending',
    kind: 'endings',
    questionCount: 6,
    minutes: 2,
    questions: [
      {
        id: 'te-1',
        type: 'choice',
        promptLabel: 'The barista asks',
        promptTokens: [{ text: '어제' }, { text: '뭐' }, { text: '했어요' }, { text: '?' }],
        promptEnglish: 'What did you do yesterday?',
        sentenceTokens: [{ text: '어제' }, { text: '친구를' }, null],
        options: ['만나요', '만났어요', '만날게요'],
        answerIndex: 1,
        explanation: 'Use -았/었어요 for things that already happened',
      },
    ],
  },
  {
    id: 'speak-without-pausing',
    title: 'Speak without pausing',
    kind: 'fluency',
    questionCount: 4,
    minutes: 3,
    questions: [
      {
        id: 'sp-1',
        type: 'speak',
        tokens: [
          { text: '주말에는' },
          { text: '친구를' },
          { text: '만나서', romanization: 'mannaseo' },
          { text: '카페에' },
          { text: '가요' },
          { text: '.' },
        ],
        feedback: {
          correct: false,
          label: 'Try again',
          explanation: 'You paused twice mid-sentence',
        },
      },
    ],
  },
  {
    id: 'particles',
    title: 'Build sentences with particles',
    kind: 'particles',
    questionCount: 7,
    minutes: 2,
    questions: [
      {
        id: 'pa-1',
        type: 'choice',
        promptLabel: 'The barista asks',
        promptTokens: [{ text: '어디서' }, { text: '만났어요' }, { text: '?' }],
        promptEnglish: 'Where did you meet?',
        sentenceTokens: [{ text: '학교' }, null, { text: '친구를' }, { text: '만났어요' }, { text: '.' }],
        blankAttachesLeft: true,
        options: ['에서', '에', '으로'],
        answerIndex: 0,
        explanation: 'Use 에서 for the place where an action happens',
      },
    ],
  },
  {
    id: 'final-consonants',
    title: 'Repeat final consonant sounds',
    kind: 'pronunciation',
    questionCount: 6,
    minutes: 2,
    questions: [
      {
        id: 'fc-1',
        type: 'speak',
        tokens: [
          { text: '값이', romanization: 'gapsi' },
          { text: '얼마예요' },
          { text: '?' },
        ],
        feedback: {
          correct: true,
          label: 'Correct',
          explanation: 'Your ㅄ final sound came out clearly',
        },
      },
      {
        id: 'fc-2',
        type: 'speak',
        tokens: [
          { text: '포장', romanization: 'pojang' },
          { text: '해' },
          { text: '주세요', romanization: 'juseyo' },
          { text: '.' },
        ],
        feedback: {
          correct: true,
          label: 'Correct',
          explanation: 'Focus on the ㅇ final sound in 포장',
        },
      },
    ],
  },
];

export const missionById = Object.fromEntries(
  missions.map((mission) => [mission.id, mission]),
) as Record<string, Mission>;

/** RV-2f summary, filled in when a run finishes. */
export const missionCompleteCopy = {
  title: 'Mission complete!',
  bodyFor: (mission: Mission) =>
    `You finished all ${mission.questionCount} questions of\nthe ${mission.title.toLowerCase()} mission.`,
};
