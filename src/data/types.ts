import type { ImageSourcePropType } from 'react-native';

export type SkillId =
  | 'pronunciation'
  | 'fluency'
  | 'particles'
  | 'endings'
  | 'politeness'
  | 'context';

/** Band drives the badge colour: strong → success, medium → info, needs-work → primary. */
export type SkillBand = 'strong' | 'medium' | 'needs-work';

export type SkillScore = {
  skill: SkillId;
  score: number;
  band: SkillBand;
};

export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export type CategoryId =
  | 'shopping'
  | 'clinic'
  | 'school'
  | 'transit'
  | 'government'
  | 'part-time-job'
  | 'airport'
  | 'accommodation'
  | 'directions'
  | 'friends'
  | 'k-content';

export type Category = {
  id: CategoryId;
  /** Chip and breadcrumb label. */
  name: string;
  /** `clothes · refunds · exchanges` */
  blurb: string;
  illustration: ImageSourcePropType;
};

export type Situation = {
  id: string;
  categoryId: CategoryId;
  title: string;
  difficulty: Difficulty;
  minutes: number;
  /** Second half of the RP-2 breadcrumb, e.g. `Clinic · Pharmacy`. */
  place?: string;
  /** Shown on the home and browse cards when the learner has started it. */
  progress?: { completed: number; total: number; percent: number };
  /** Featured situations lead the unfiltered browse list and the home rail. */
  featured?: boolean;
  detail: ScenarioDetail;
};

export type ScenarioDetail = {
  /** `The situation` card. */
  situation: string;
  /** `AI plays` card. */
  aiRole: string;
  aiRoleDescription: string;
  /** `Your goals` checklist — always three. */
  goals: [string, string, string];
};

/** One line of a roleplay conversation. English is a caption, hidden by default. */
export type Turn = {
  id: string;
  speaker: 'ai' | 'user';
  korean: string;
  english: string;
  /** Marks a learner line the report flagged. */
  mistake?: Omit<Mistake, 'id' | 'situationId' | 'date' | 'fixed'>;
};

export type ConversationScript = {
  situationId: string;
  turns: Turn[];
  /** Suggested learner reply for the current AI turn (RP-3 `Hint`). */
  hint: { korean: string; english: string };
};

export type SentenceFix = {
  said: { korean: string; english: string };
  suggested: { korean: string; english: string };
};

export type Report = {
  situationId: string;
  goalsMet: number;
  goalsTotal: number;
  score: number;
  scoreDelta: number;
  skills: SkillScore[];
  fixes: SentenceFix[];
};

export type MissionKind =
  | 'pronunciation'
  | 'fluency'
  | 'particles'
  | 'endings'
  | 'context';

export type MissionSummary = {
  id: string;
  title: string;
  kind: MissionKind;
  questionCount: number;
  minutes: number;
};

/** A Korean token; `romanization` powers the tap-to-reveal tooltip. */
export type Token = {
  text: string;
  romanization?: string;
};

export type SpeakQuestion = {
  id: string;
  type: 'speak';
  /** Sentence the learner reads aloud, split into tappable tokens. */
  tokens: Token[];
  /** Shown after the learner speaks. */
  feedback: { correct: boolean; label: string; explanation: string };
};

export type ChoiceQuestion = {
  id: string;
  type: 'choice';
  /** `The barista asks` */
  promptLabel: string;
  promptTokens: Token[];
  /** English caption behind `Show meaning`. */
  promptEnglish: string;
  /** Sentence with a blank; `null` marks the gap. */
  sentenceTokens: (Token | null)[];
  /** Particles attach to the word before them, so the filled gap takes no space. */
  blankAttachesLeft?: boolean;
  options: string[];
  answerIndex: number;
  explanation: string;
};

export type MissionQuestion = SpeakQuestion | ChoiceQuestion;

export type Mission = MissionSummary & {
  questions: MissionQuestion[];
};

export type Mistake = {
  id: string;
  situationId: string;
  skill: Extract<SkillId, 'endings' | 'politeness' | 'particles' | 'context'>;
  date: string;
  said: { korean: string; english: string; note: string };
  suggested: { korean: string; english: string };
  why: string;
  fixed: boolean;
};

export type SavedPhrase = {
  id: string;
  situationId: string;
  korean: string;
  english: string;
};

export type StatsPeriod = 'weekly' | 'monthly';

export type Stats = {
  period: StatsPeriod;
  /** `This week's overall score` / `This month's overall score` */
  heading: string;
  score: number;
  delta: number;
  /** `Aug, week 4` */
  rangeLabel: string;
  insights: [string, string];
  skills: { skill: SkillId; score: number }[];
  biggestGain: { skill: SkillId; delta: number; note: string };
  practiceNext: { skill: SkillId; score: number; delta: number; note: string };
};
