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

/** MY-1b Native language list — `nativeLanguageOptions` in `profile.ts`. */
export type NativeLanguage =
  | 'English'
  | 'Vietnamese'
  | 'Chinese'
  | 'Japanese'
  | 'Mongolian'
  | 'Uzbek'
  | 'Nepali'
  | 'Indonesian'
  | 'Thai'
  | 'Spanish';

/**
 * The meaning of a Korean line in the learner's native language, next to its
 * `english`. Optional per language: a missing one falls back to English
 * (`useMeaning`), so content can be translated a language at a time.
 */
export type Meanings = Partial<Record<Exclude<NativeLanguage, 'English'>, string>>;

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
  /**
   * Shown on the home and browse cards when the learner has started it.
   * Derived from saved runs by `useSituations` — never set in the catalog.
   */
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
  meanings?: Meanings;
  /**
   * The correction data for a learner line: what a common slip sounds like,
   * the corrected sentence and why. A heard answer that doesn't match the
   * corrected sentence is logged as a mistake with this data.
   */
  mistake?: Omit<Mistake, 'id' | 'situationId' | 'date' | 'fixed'>;
  /**
   * Learner lines only — RP-3 `Hint`: 2–4 key words that help build the
   * answer, never the answer itself. Romanization is generated on the device.
   */
  hintWords?: { korean: string; english: string; meanings?: Meanings }[];
};

export type ConversationScript = {
  situationId: string;
  turns: Turn[];
};

export type SentenceFix = {
  said: { korean: string; english: string; meanings?: Meanings };
  suggested: { korean: string; english: string; meanings?: Meanings };
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
  /**
   * What the sentence means. RV-2a/RV-2b print it under the Korean — it answers
   * "what am I saying", which is a different job from the per-word tooltip.
   */
  english: string;
  meanings?: Meanings;
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
  /**
   * One line per gap about the axis being drilled, used when that gap is the
   * one the learner missed. Falls back to `explanation`.
   */
  blankNotes?: string[];
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
  promptMeanings?: Meanings;
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
  said: { korean: string; english: string; meanings?: Meanings; note: string };
  suggested: { korean: string; english: string; meanings?: Meanings };
  why: string;
  fixed: boolean;
  /**
   * The learner pressed `Done` on this mistake's detail in RV-7. The Mistake
   * log counts only mistakes not done yet; logging the same mistake again in
   * a later roleplay clears it.
   */
  done?: boolean;
  /**
   * Epoch ms the mistake left the log — `Done` pressed, or the correction said
   * right in a later roleplay. Older entries completed before it existed have none.
   */
  doneAt?: number;
};

export type SavedPhrase = {
  id: string;
  situationId: string;
  korean: string;
  english: string;
  /** Copied in with the phrase, so it reads in the learner's language later too. */
  meanings?: Meanings;
  /** When it went into the scrapbook, e.g. `Aug 22`. */
  savedOn: string;
  /** The learner's own note, written from the phrase's detail screen. */
  note?: string;
  /**
   * Kept with the phrase so it stands on its own once the conversation it
   * came from is gone. Older saves don't have it and fall back to the catalog.
   */
  situationTitle?: string;
  /** For a saved correction: what the learner actually said instead. */
  said?: string;
  /** The finished roleplay it came from (`SessionRecord.id`), if any. */
  runId?: string;
};

export type StatsPeriod = 'weekly' | 'monthly';

export type Stats = {
  period: StatsPeriod;
  /** `This week's overall score` / `This month's overall score` */
  heading: string;
  score: number;
  /** `Aug, week 4` */
  rangeLabel: string;
  /** `Last 6 weeks` / `Last 6 months` — what the trend chart covers. */
  trendLabel: string;
  /**
   * One entry per period, oldest first; the last is the period the header
   * shows, so the trend line ends on the headline number. The chart reads
   * `label` and `score`; the 6-skill stepper reads `rangeLabel` and `skills`,
   * which is how the same six periods serve both jobs.
   */
  trend: {
    /** Chart tick, e.g. `Aug 4`. */
    label: string;
    /** Stepper label, e.g. `Aug, week 4`. */
    rangeLabel: string;
    /** Null before anything was measured. */
    score: number | null;
    /** A skill never practised yet has no score (null), not a made-up one. */
    skills: { skill: SkillId; score: number | null }[];
  }[];
  /** The one change number the screen still spells out, in the insight row. */
  biggestGain: { skill: SkillId; delta: number; note: string };
  practiceNext: { skill: SkillId; note: string };
};
