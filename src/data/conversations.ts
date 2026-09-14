import type { ConversationScript, Report } from './types';

/**
 * Scripted roleplay sessions. A real build swaps these for AI turn generation;
 * the shape is what the UI consumes either way.
 */
export const conversations: ConversationScript[] = [
  {
    situationId: 'pharmacy-symptoms',
    hint: {
      korean: '"이틀 전부터요. 열은 없어요."',
      english: '“Since two days ago. No fever.”',
    },
    turns: [
      {
        id: 'ph-1',
        speaker: 'ai',
        korean: '어디가 불편해서 오셨어요?',
        english: 'What brings you in today?',
      },
      {
        id: 'ph-2',
        speaker: 'user',
        korean: '목이 아프고 기침이 나요.',
        english: 'My throat hurts and I have a cough.',
      },
      {
        id: 'ph-3',
        speaker: 'ai',
        korean: '언제부터 그러셨어요? 열도 있으세요?',
        english: 'When did it start? Any fever?',
      },
      {
        id: 'ph-4',
        speaker: 'user',
        korean: '이틀 전에부터 아파요.',
        english: 'It hurts since two days ago.',
        mistake: {
          skill: 'endings',
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
        },
      },
      {
        id: 'ph-5',
        speaker: 'ai',
        korean: '하루 세 번 식후에 드세요.',
        english: 'Take it three times a day after meals.',
      },
      {
        id: 'ph-6',
        speaker: 'user',
        korean: '네, 알겠어요.',
        english: 'Yes, understood.',
      },
    ],
  },
  {
    situationId: 'cafe-order',
    hint: {
      korean: '"여기서 먹을게요."',
      english: '“I’ll eat here.”',
    },
    turns: [
      {
        id: 'cf-1',
        speaker: 'ai',
        korean: '어서오세요. 주문하시겠어요?',
        english: 'Welcome. Are you ready to order?',
      },
      {
        id: 'cf-2',
        speaker: 'user',
        korean: '아이스 아메리카노 한 잔 주세요.',
        english: 'One iced americano, please.',
      },
      {
        id: 'cf-3',
        speaker: 'ai',
        korean: '포장이세요, 드시고 가세요?',
        english: 'To go, or eating here?',
      },
      {
        id: 'cf-4',
        speaker: 'user',
        korean: '먹어요. 여기',
        english: 'Eat. Here',
        mistake: {
          skill: 'context',
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
        },
      },
      {
        id: 'cf-5',
        speaker: 'ai',
        korean: '사이즈는 뭐로 하시겠어요?',
        english: 'Which size would you like?',
      },
      {
        id: 'cf-6',
        speaker: 'user',
        korean: '라지요',
        english: 'Large',
      },
    ],
  },
];

export const conversationBySituation = Object.fromEntries(
  conversations.map((script) => [script.situationId, script]),
) as Record<string, ConversationScript>;

/** RP-4 report, shown after a session ends. */
export const reports: Record<string, Report> = {
  'pharmacy-symptoms': {
    situationId: 'pharmacy-symptoms',
    goalsMet: 3,
    goalsTotal: 3,
    score: 82,
    scoreDelta: 6,
    skills: [
      { skill: 'pronunciation', score: 88, band: 'strong' },
      { skill: 'fluency', score: 79, band: 'strong' },
      { skill: 'particles', score: 84, band: 'strong' },
      { skill: 'endings', score: 76, band: 'medium' },
      { skill: 'politeness', score: 64, band: 'needs-work' },
      { skill: 'context', score: 71, band: 'needs-work' },
    ],
    fixes: [
      {
        said: {
          korean: '"이틀 전에부터 아파요."',
          english: '“It hurts since two days ago.” (incorrect)',
        },
        suggested: {
          korean: '"이틀 전부터 아팠어요."',
          english: '“It has hurt since two days ago.”',
        },
      },
    ],
  },
};

/** Any situation without its own script falls back to the pharmacy session. */
export const fallbackSituationId = 'pharmacy-symptoms';
