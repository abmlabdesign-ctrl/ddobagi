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
    rangeLabel: 'Aug, week 4',
    trendLabel: 'Last 6 weeks',
    trend: [
      { label: 'Jul 3', score: 62 },
      { label: 'Jul 4', score: 66 },
      { label: 'Aug 1', score: 65 },
      { label: 'Aug 2', score: 70 },
      { label: 'Aug 3', score: 72 },
      { label: 'Aug 4', score: 75 },
    ],
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
      note: 'Particles are still the shakiest part of your sentences.',
    },
  },
  monthly: {
    period: 'monthly',
    heading: "This month's overall score",
    score: 84,
    rangeLabel: 'August',
    trendLabel: 'Last 6 months',
    trend: [
      { label: 'Mar', score: 62 },
      { label: 'Apr', score: 66 },
      { label: 'May', score: 71 },
      { label: 'Jun', score: 74 },
      { label: 'Jul', score: 79 },
      { label: 'Aug', score: 84 },
    ],
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
      note: 'Particles are still the shakiest part of your sentences.',
    },
  },
};

export const settings = {
  appVersion: 'Ddobak v1.0.2',
  speechSpeeds: ['0.7x', '0.8x', '0.9x', '1.0x', '1.2x'],
  connectedProvider: 'Connected to Google',
};
