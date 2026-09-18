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
  /** When the learner last finished this situation, e.g. `Sep 12`. */
  completedOn: string;
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
  | 'politeness'
  | 'context';

/**
 * How a mission is drilled. Each skill gets the form that actually exercises it:
 * `speak` for the two ears-and-mouth axes, `write` where the learner has to
 * produce the grammar, `choice` where the point is reading a situation.
 */
export type MissionMode = 'speak' | 'write' | 'choice';

export type MissionSummary = {
  id: string;
  title: string;
  kind: MissionKind;
  mode: MissionMode;
  questionCount: number;
  minutes: number;
};

/** A Korean token; `romanization` powers the tap-to-reveal tooltip. */
export type Token = {
  text: string;
  romanization?: string;
  /** The unfilled gap in a fill-in sentence (RV-2c … RV-2e): an orange rule, no text. */
  blank?: boolean;
};

export type SpeakQuestion = {
  id: string;
  type: 'speak';
  /** Sentence the learner reads aloud, split into tappable tokens. */
  tokens: Token[];
  /** Shown after the learner speaks. */
  feedback: { correct: boolean; label: string; explanation: string };
};

export type WriteQuestion = {
  id: string;
  type: 'write';
  /** What the learner is being asked to do, e.g. `Write it in Korean`. */
  promptLabel: string;
  /** The English meaning, or the situation the sentence has to fit. */
  prompt: string;
  /** The casual Korean a politeness drill rewrites. */
  source?: string;
  /**
   * A sentence with `___` marking each gap — one field per gap. Without it the
   * learner writes the whole sentence into a single field.
   */
  template?: string;
  /** Accepted answers per gap, in order; the first is the one shown on a miss. */
  blanks: string[][];
  /** Why, in terms of the axis being drilled rather than the whole sentence. */
  explanation: string;
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

export type MissionQuestion = SpeakQuestion | WriteQuestion | ChoiceQuestion;

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
  /** When it went into the scrapbook, e.g. `Aug 22`. */
  savedOn: string;
  /** The learner's own note, written from the phrase's detail screen. */
  note?: string;
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
