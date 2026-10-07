import type { NativeLanguage } from './types';

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
  nativeLanguage: 'Vietnamese' as NativeLanguage,
  koreanLevel: 'Intermediate' as 'Beginner' | 'Intermediate' | 'Advanced',
  /** ON-2 answers. */
  studyDuration: null as string | null,
  purposes: [] as string[],
  painPoints: [] as string[],
  /** MY-1b — up to 5. */
  interests: ['School', 'Part-time', 'Clinic'],
  /** ON-1 — how the learner signed in. Settings shows it as the connected account. */
  signInProvider: 'Google' as SignInProvider,
  /** Set only for the email route. */
  email: null as string | null,
  /** ON-1b answers, kept with the day they were given. Null until agreed. */
  consents: null as Consents | null,
  streakDays: 12,
  situationsDone: 18,
  /** Shown as `6h 20m` on MY-1. Minutes so a session can add to it. */
  practiceMinutes: 380,
  /** One lesson = one finished roleplay or micro mission. */
  weeklyGoal: { label: 'Finish 10 lessons', completed: 7, total: 10 },
};

export type SignInProvider = 'Google' | 'Apple' | 'Email';

export type Consents = {
  terms: boolean;
  privacy: boolean;
  voice: boolean;
  /** Optional — practice reminders and product news. */
  marketing: boolean;
  agreedOn: string;
};

/** MY-1b Weekly goal choices. */
export const weeklyGoalOptions = [5, 10, 15, 20];

export const weeklyGoalLabel = (total: number) => `Finish ${total} lessons`;

/** MY-1b Native language list. */
export const nativeLanguageOptions: NativeLanguage[] = [
  'English',
  'Vietnamese',
  'Chinese',
  'Japanese',
  'Mongolian',
  'Uzbek',
  'Nepali',
  'Indonesian',
  'Thai',
  'Spanish',
];

/** The UI ships in English only for now (§6); the picker says so rather than hiding the row. */
export const appLanguageOptions = ['English'];

/** `380` → `6h 20m`. */
export function formatPractice(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const rest = Math.round(minutes % 60);
  return hours > 0 ? `${hours}h ${rest}m` : `${rest}m`;
}

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


export const settings = {
  appVersion: 'Ddobak v1.0.2',
  speechSpeeds: ['0.7x', '0.8x', '0.9x', '1.0x', '1.2x'],
};
