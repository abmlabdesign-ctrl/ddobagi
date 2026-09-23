import type { Mission } from './types';

/** RV-1 `Today's focus` — driven by the two weakest skills. */
export const todayFocus = {
  skills: ['Politeness', 'Endings'],
  description: "Three minutes on today's weak spots",
  cta: 'Start 3-minute mission',
};

/**
 * Micro missions — one per skill axis, each drilled the way that axis is
 * actually used: the two listening/speaking axes are spoken, the three the
 * learner has to produce grammar for are written, and context is a choice.
 * `questionCount` is the designed length; `questions` holds the authored items,
 * which the runner cycles through when it runs out.
 */
export const missions: Mission[] = [
  {
    id: 'final-consonants',
    title: 'Repeat final consonant sounds',
    kind: 'pronunciation',
    mode: 'speak',
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
        english: 'How much is it?',
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
        english: 'Please pack it to go.',
        feedback: {
          correct: true,
          label: 'Correct',
          explanation: 'Focus on the ㅇ final sound in 포장',
        },
      },
    ],
  },
  {
    id: 'speak-without-pausing',
    title: 'Speak without pausing',
    kind: 'fluency',
    mode: 'speak',
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
        english: 'On weekends I meet a friend and we go to a café.',
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
    title: 'Fill in the particles',
    kind: 'particles',
    mode: 'write',
    questionCount: 7,
    minutes: 2,
    questions: [
      {
        id: 'pa-1',
        type: 'write',
        promptLabel: 'Fill in the gaps',
        prompt: 'I met a friend at school.',
        template: '학교___ 친구___ 만났어요.',
        blanks: [['에서'], ['를']],
        blankNotes: [
          '학교 is where the meeting happens, so it takes 에서, not 에.',
          '친구 has no final consonant, so it takes 를, not 을.',
        ],
        explanation: '에서 marks where the action happens, 를 marks what it happens to',
      },
      {
        id: 'pa-2',
        type: 'write',
        promptLabel: 'Fill in the gaps',
        prompt: 'On weekends I go to a café.',
        template: '주말___ 카페___ 가요.',
        blanks: [['에는', '에'], ['에']],
        blankNotes: [
          '주말 is when it happens, so it takes 에 — 에는 adds "as for weekends".',
          '카페 is where you are heading, so it takes 에, not 에서.',
        ],
        explanation: '에 marks the destination — 에서 would mean you act there, not go there',
      },
    ],
  },
  {
    id: 'sentence-from-meaning',
    title: 'Write it from the meaning',
    kind: 'endings',
    mode: 'write',
    questionCount: 6,
    minutes: 3,
    questions: [
      {
        id: 'sm-1',
        type: 'write',
        promptLabel: 'Finish it in Korean',
        prompt: 'I met my friend yesterday.',
        template: '어제 친구를 ___.',
        blanks: [['만났어요', '만났습니다']],
        explanation: 'Past tense takes -았/었어요, so 만나다 becomes 만났어요',
      },
      {
        id: 'sm-2',
        type: 'write',
        promptLabel: 'Finish it in Korean',
        prompt: 'I went to school yesterday.',
        template: '어제 학교에 ___.',
        blanks: [['갔어요', '갔습니다']],
        explanation: '가다 in the past is 갔어요 — the 아 and the 았 merge',
      },
    ],
  },
  {
    id: 'polite-rewrite',
    title: 'Rewrite it politely',
    kind: 'politeness',
    mode: 'write',
    questionCount: 8,
    minutes: 3,
    questions: [
      {
        id: 'pr-1',
        type: 'write',
        promptLabel: 'Say it politely',
        prompt: "You're telling the café staff you'll eat in.",
        source: '여기서 먹을 거야.',
        template: '여기서 ___.',
        blanks: [['먹을게요', '먹겠습니다', '먹을 거예요']],
        explanation: '-을게요 is the polite ending for something you have just decided',
      },
      {
        id: 'pr-2',
        type: 'write',
        promptLabel: 'Say it politely',
        prompt: "You're asking a shop owner where they're going.",
        source: '어디 가?',
        template: '어디 ___?',
        blanks: [['가요', '가세요']],
        explanation: '-아/어요 makes it polite; -세요 also shows respect for the listener',
      },
    ],
  },
  {
    id: 'answer-that-fits',
    title: 'Pick the answer that fits',
    kind: 'context',
    mode: 'choice',
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
