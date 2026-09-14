import type { Stats } from './types';

export const avatars = [
  { id: 'blue', source: require('../../assets/avatars/avatar-1-blue.png') },
  { id: 'purple', source: require('../../assets/avatars/avatar-2-purple.png') },
  { id: 'yellow', source: require('../../assets/avatars/avatar-3-yellow.png') },
  { id: 'pink', source: require('../../assets/avatars/avatar-4-pink.png') },
  { id: 'green', source: require('../../assets/avatars/avatar-5-green.png') },
  { id: 'orange', source: require('../../assets/avatars/avatar-6-orange.png') },
];

export const defaultProfile = {
  nickname: 'Ddobak',
  avatarId: 'blue',
  appLanguage: 'English',
  nativeLanguage: 'Vietnamese',
  koreanLevel: 'Intermediate' as 'Beginner' | 'Intermediate' | 'Advanced',
  /** ON-2 answers. */
  studyDuration: null as string | null,
  purposes: [] as string[],
  painPoints: [] as string[],
  /** MY-1b — up to 5. */
  interests: ['School', 'Part-time', 'Clinic'],
  streakDays: 12,
  situationsDone: 18,
  totalPractice: '6h 20m',
  weeklyGoal: { label: 'Finish 10 lessons', completed: 7, total: 10 },
};

export const onboardingOptions = {
  studyDuration: ['Just starting out', '6–12 months, on my own', "I'm taking classes"],
  purposes: ['School life', 'Part-time job', 'Clinics & offices', 'Daily life & transit'],
  painPoints: ['Pronunciation', 'Politeness', 'Context', 'Particles & endings', 'Fluency'],
};

export const interestOptions = [
  'School',
  'Part-time',
  'Clinic',
  'Shopping',
  'Transit',
  'K-content',
];

export const koreanLevels = ['Beginner', 'Intermediate', 'Advanced'] as const;

export const stats: Record<Stats['period'], Stats> = {
  weekly: {
    period: 'weekly',
    heading: "This week's overall score",
    score: 75,
    delta: 5,
    rangeLabel: 'Aug, week 4',
    insights: ['Context improved the most this week', '5 of 6 skills went up'],
    skills: [
      { skill: 'pronunciation', score: 72 },
      { skill: 'fluency', score: 68 },
      { skill: 'particles', score: 64 },
      { skill: 'endings', score: 76 },
      { skill: 'politeness', score: 82 },
      { skill: 'context', score: 79 },
    ],
    biggestGain: {
      skill: 'context',
      delta: 10,
      note: "You're reading what people mean and answering in a way that fits.",
    },
    practiceNext: {
      skill: 'particles',
      score: 64,
      delta: -2,
      note: 'Keep practicing 은/는 and 이/가 when you build sentences.',
    },
  },
  monthly: {
    period: 'monthly',
    heading: "This month's overall score",
    score: 84,
    delta: 9,
    rangeLabel: 'August',
    insights: ['Politeness improved the most this month', 'All 6 skills rose from last month'],
    skills: [
      { skill: 'pronunciation', score: 78 },
      { skill: 'fluency', score: 74 },
      { skill: 'particles', score: 68 },
      { skill: 'endings', score: 80 },
      { skill: 'politeness', score: 86 },
      { skill: 'context', score: 81 },
    ],
    biggestGain: {
      skill: 'politeness',
      delta: 15,
      note: "You're much better at picking the right politeness level for whoever you're talking to.",
    },
    practiceNext: {
      skill: 'particles',
      score: 68,
      delta: 4,
      note: 'Keep practicing 은/는 and 이/가 when you build sentences.',
    },
  },
};

export const settings = {
  appVersion: 'Ddobak v1.0.2',
  speechSpeeds: ['0.7x', '0.8x', '0.9x', '1.0x', '1.2x'],
  connectedProvider: 'Connected to Google',
};
