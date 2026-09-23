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
      {
        label: 'Jul 3',
        rangeLabel: 'Jul, week 3',
        score: 62,
        skills: [
          { skill: 'pronunciation', score: 61 },
          { skill: 'fluency', score: 57 },
          { skill: 'particles', score: 58 },
          { skill: 'endings', score: 63 },
          { skill: 'politeness', score: 68 },
          { skill: 'context', score: 60 },
        ],
      },
      {
        label: 'Jul 4',
        rangeLabel: 'Jul, week 4',
        score: 66,
        skills: [
          { skill: 'pronunciation', score: 64 },
          { skill: 'fluency', score: 60 },
          { skill: 'particles', score: 60 },
          { skill: 'endings', score: 67 },
          { skill: 'politeness', score: 72 },
          { skill: 'context', score: 64 },
        ],
      },
      {
        label: 'Aug 1',
        rangeLabel: 'Aug, week 1',
        score: 65,
        skills: [
          { skill: 'pronunciation', score: 64 },
          { skill: 'fluency', score: 59 },
          { skill: 'particles', score: 61 },
          { skill: 'endings', score: 66 },
          { skill: 'politeness', score: 72 },
          { skill: 'context', score: 62 },
        ],
      },
      {
        label: 'Aug 2',
        rangeLabel: 'Aug, week 2',
        score: 70,
        skills: [
          { skill: 'pronunciation', score: 68 },
          { skill: 'fluency', score: 63 },
          { skill: 'particles', score: 62 },
          { skill: 'endings', score: 71 },
          { skill: 'politeness', score: 77 },
          { skill: 'context', score: 67 },
        ],
      },
      {
        label: 'Aug 3',
        rangeLabel: 'Aug, week 3',
        score: 72,
        skills: [
          { skill: 'pronunciation', score: 70 },
          { skill: 'fluency', score: 66 },
          { skill: 'particles', score: 63 },
          { skill: 'endings', score: 74 },
          { skill: 'politeness', score: 80 },
          { skill: 'context', score: 69 },
        ],
      },
      {
        label: 'Aug 4',
        rangeLabel: 'Aug, week 4',
        score: 75,
        skills: [
          { skill: 'pronunciation', score: 72 },
          { skill: 'fluency', score: 68 },
          { skill: 'particles', score: 64 },
          { skill: 'endings', score: 76 },
          { skill: 'politeness', score: 82 },
          { skill: 'context', score: 79 },
        ],
      },
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
      {
        label: 'Mar',
        rangeLabel: 'March',
        score: 62,
        skills: [
          { skill: 'pronunciation', score: 58 },
          { skill: 'fluency', score: 54 },
          { skill: 'particles', score: 52 },
          { skill: 'endings', score: 60 },
          { skill: 'politeness', score: 58 },
          { skill: 'context', score: 61 },
        ],
      },
      {
        label: 'Apr',
        rangeLabel: 'April',
        score: 66,
        skills: [
          { skill: 'pronunciation', score: 62 },
          { skill: 'fluency', score: 58 },
          { skill: 'particles', score: 56 },
          { skill: 'endings', score: 64 },
          { skill: 'politeness', score: 62 },
          { skill: 'context', score: 65 },
        ],
      },
      {
        label: 'May',
        rangeLabel: 'May',
        score: 71,
        skills: [
          { skill: 'pronunciation', score: 67 },
          { skill: 'fluency', score: 63 },
          { skill: 'particles', score: 60 },
          { skill: 'endings', score: 69 },
          { skill: 'politeness', score: 66 },
          { skill: 'context', score: 70 },
        ],
      },
      {
        label: 'Jun',
        rangeLabel: 'June',
        score: 74,
        skills: [
          { skill: 'pronunciation', score: 70 },
          { skill: 'fluency', score: 66 },
          { skill: 'particles', score: 63 },
          { skill: 'endings', score: 72 },
          { skill: 'politeness', score: 69 },
          { skill: 'context', score: 73 },
        ],
      },
      {
        label: 'Jul',
        rangeLabel: 'July',
        score: 79,
        skills: [
          { skill: 'pronunciation', score: 74 },
          { skill: 'fluency', score: 70 },
          { skill: 'particles', score: 66 },
          { skill: 'endings', score: 76 },
          { skill: 'politeness', score: 71 },
          { skill: 'context', score: 77 },
        ],
      },
      {
        label: 'Aug',
        rangeLabel: 'August',
        score: 84,
        skills: [
          { skill: 'pronunciation', score: 78 },
          { skill: 'fluency', score: 74 },
          { skill: 'particles', score: 68 },
          { skill: 'endings', score: 80 },
          { skill: 'politeness', score: 86 },
          { skill: 'context', score: 81 },
        ],
      },
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
