import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { freeLimits, planById, type PlanId } from '@/data/plans';
import { defaultProfile } from '@/data/profile';
import type { Mistake, SavedPhrase, SkillId } from '@/data/types';
import { renewalFrom, type Receipt } from '@/services/billing';
import { rememberDealt } from '@/services/questionPicker';
import { normalizeSpeech } from '@/services/recognition';
import { syncReminders } from '@/services/reminders';
import { dayKey, summarize, type Lesson, type PracticeSummary } from '@/services/practice';
import { setSpeechSpeed } from '@/services/speech';

export type Profile = typeof defaultProfile;

export type Settings = {
  aiSpeechSpeed: string;
  practiceReminder: boolean;
  reviewAlerts: boolean;
};

/** What the learner actually said in one finished roleplay — RV-6 shows it back. */
export type SessionResult = {
  completedOn: string;
  /** Epoch ms, for ordering — `completedOn` is display text. */
  completedAt: number;
  /** Recognised speech per user turn id. Empty when the device can't transcribe. */
  said: Record<string, string>;
  /** User turns the session flagged, by turn id. */
  flagged: string[];
  goalsMet: number;
  goalsTotal: number;
  /** `SessionRecord.id` of this run. Missing only on runs from older builds. */
  id?: string;
  /**
   * The log entries this run flagged, by turn id, as they read at the end of
   * the run — so an older transcript keeps its own "You said".
   */
  mistakes?: Record<string, Mistake>;
};

/** One finished roleplay in the transcript history. */
export type SessionRecord = SessionResult & { id: string; situationId: string };

/** Keeps the history bounded on the device. */
const HISTORY_CAP = 300;

/** A learner line the session judged, handed to `finishSession`. */
export type JudgedLine = {
  turnId: string;
  said: string;
  /** Present when the script expects a correction on this line. */
  mistake?: Omit<Mistake, 'id' | 'situationId' | 'date' | 'fixed'>;
};

/**
 * A roleplay left part-way with `Save and leave`. RP-1 and HM-1 show its
 * percent, and RP-3 picks the conversation back up from `turnIndex`.
 */
export type ConversationDraft = {
  turnIndex: number;
  lines: JudgedLine[];
  /** Share of the learner's turns already answered, 0–100. */
  percent: number;
  answered: number;
  total: number;
  savedAt: number;
};

export type Subscription = {
  planId: PlanId;
  trial: boolean;
  startedAt: number;
  /** Next renewal — or, once cancelled, when access ends. Epoch ms. */
  renewsAt: number;
  autoRenew: boolean;
};

/**
 * One measured result on one skill: a mission's first-try score, or whether
 * a roleplay turn the script flags got said right. MY-2 is built from these.
 */
export type ActivityEntry = { at: number; skill: SkillId; correct: number; total: number };

/** Keeps the log bounded; a year of daily practice fits comfortably. */
const ACTIVITY_CAP = 2000;

/** Today's free-tier use. Resets when `day` isn't today. */
type Usage = { day: string; roleplays: number; missions: number };

type AppState = {
  /** Finished onboarding once. Log out keeps it; only Delete account clears it. */
  onboarded: boolean;
  /** Signed in on this device. Log out flips only this, so logging back in skips onboarding. */
  signedIn: boolean;
  /** IN-1 ~ IN-4 have been shown once; they never come back, even after log out. */
  introSeen: boolean;
  profile: Profile;
  settings: Settings;
  mistakes: Mistake[];
  savedPhrases: SavedPhrase[];
  /** The latest finished run per situation — progress and the report read it. */
  sessions: Record<string, SessionResult>;
  /** Every finished run, newest first. Unfinished ones never land here. */
  history: SessionRecord[];
  /** Unfinished roleplays the learner chose to keep, by situation id. */
  drafts: Record<string, ConversationDraft>;
  /**
   * Every finished roleplay and micro mission. Streak, this week's count and
   * practice time are worked out from it (`services/practice.ts`).
   */
  lessons: Lesson[];
  subscription: Subscription | null;
  receipts: Receipt[];
  usage: Usage;
  activity: ActivityEntry[];
  /** Mission question ids dealt lately, newest first — the next run deals others first. */
  recentQuestions: string[];
};

type AppActions = {
  completeOnboarding: () => void;
  finishIntro: () => void;
  /** ON-1 for a learner who already finished onboarding on this device. */
  logIn: () => void;
  logOut: () => void;
  /** Wipes the learner, so the next sign-up starts onboarding from ON-1. */
  deleteAccount: () => void;
  updateProfile: (patch: Partial<Profile>) => void;
  updateSettings: (patch: Partial<Settings>) => void;
  markMistakeFixed: (id: string) => void;
  /** RV-7 `Done`. Idempotent, so pressing it again changes nothing. */
  markMistakeDone: (id: string) => void;
  savePhrase: (phrase: SavedPhrase) => void;
  removePhrase: (id: string) => void;
  setPhraseNote: (id: string, note: string) => void;
  finishSession: (input: {
    situationId: string;
    lines: JudgedLine[];
    goalsTotal: number;
    minutes: number;
  }) => void;
  saveDraft: (situationId: string, draft: ConversationDraft) => void;
  clearDraft: (situationId: string) => void;
  /** One lesson; `results` holds a row per skill drilled (a mixed run has several). */
  /** A mission run was dealt these questions, in the order they're asked. */
  markQuestionsDealt: (ids: string[]) => void;
  finishMission: (input: {
    minutes: number;
    results: { skill: SkillId; correct: number; total: number }[];
  }) => void;
  subscribe: (receipt: Receipt) => void;
  /** Turn off auto-renew; access runs to the end of the paid period. */
  cancelSubscription: () => void;
  resumeSubscription: () => void;
};

type Derived = {
  /** Result of the last reminder sync — MY-3 explains `denied` / `unsupported`. */
  reminderStatus: 'ok' | 'denied' | 'unsupported';
  /** Plus is active right now. */
  isPlus: boolean;
  /** Free uses left today; Infinity on Plus. */
  freeLeft: { roleplays: number; missions: number };
  /** Streak, this week's lessons and practice time, from `lessons` and today's date. */
  practice: PracticeSummary & {
    /** Situations finished at least once. */
    situationsDone: number;
  };
};

const AppContext = createContext<(AppState & AppActions & Derived) | null>(null);

const STORAGE_KEY = 'ddobak/state/v1';

const initialSettings: Settings = {
  aiSpeechSpeed: '0.9x',
  practiceReminder: true,
  reviewAlerts: false,
};

const initialState: AppState = {
  onboarded: false,
  signedIn: false,
  introSeen: false,
  profile: defaultProfile,
  settings: initialSettings,
  // The log starts empty: only what a roleplay actually flags goes in.
  mistakes: [],
  // Starts empty: only lines the learner actually saves go in.
  savedPhrases: [],
  sessions: {},
  history: [],
  drafts: {},
  lessons: [],
  subscription: null,
  receipts: [],
  activity: [],
  recentQuestions: [],
  usage: { day: '', roleplays: 0, missions: 0 },
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** `Sep 29` — the date format every list in the comps uses. */
/**
 * A mistake is completed once `Done` is pressed on it or its correction is
 * said right in a later roleplay. `Mistakes to review` counts the rest;
 * `Mistakes you fixed` counts these — one rule, so the two always add up.
 */
export const mistakeCompleted = (mistake: Mistake) => Boolean(mistake.done || mistake.fixed);

export const shortDate = (date = new Date()) => `${MONTHS[date.getMonth()]} ${date.getDate()}`;

/** When a roleplay finished, e.g. `Oct 2, 2026 · 4:18 PM` — the history list's row title. */
export const runTime = (at: number) => {
  const date = new Date(at);
  const hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const clock = `${hours % 12 || 12}:${minutes} ${hours < 12 ? 'AM' : 'PM'}`;
  return `${shortDate(date)}, ${date.getFullYear()} · ${clock}`;
};

export { dayKey };

/** Keeps the lesson log bounded; years of daily practice fit comfortably. */
const LESSON_CAP = 5000;

/** One finished lesson, whether a roleplay or a micro mission. */
function countLesson(state: AppState, minutes: number): AppState {
  return {
    ...state,
    lessons: [...state.lessons, { at: Date.now(), minutes }].slice(-LESSON_CAP),
  };
}

/** Count one free-tier use of `kind` for today. */
function bumpUsage(state: AppState, kind: 'roleplays' | 'missions'): AppState {
  const today = dayKey(new Date());
  const usage = state.usage.day === today ? state.usage : { day: today, roleplays: 0, missions: 0 };
  return { ...state, usage: { ...usage, [kind]: usage[kind] + 1 } };
}

/** Ids of the sample mistakes earlier builds put in every new log. */
const LEGACY_SAMPLE_MISTAKES = new Set(['mk-1', 'mk-2', 'mk-3', 'mk-4']);
/** Ids of the sample phrases earlier builds put in every new Scrapbook. */
const LEGACY_SAMPLE_PHRASES = new Set(['sp-1', 'sp-2', 'sp-3']);

function historyFromSessions(sessions: Record<string, SessionResult>): SessionRecord[] {
  return Object.entries(sessions)
    .map(([situationId, session]) => ({
      ...session,
      id: session.id ?? `${situationId}-${session.completedAt}`,
      situationId,
    }))
    .sort((a, b) => b.completedAt - a.completedAt);
}

/** The run a session result belongs to, for the latest-run lookups. */
export const runIdOf = (situationId: string, session: SessionResult) =>
  session.id ?? `${situationId}-${session.completedAt}`;

/** Profile fields older builds stored. */
type LegacyProfileFields = {
  appLanguage?: string;
  streakDays?: number;
  situationsDone?: number;
  practiceMinutes?: number;
};

/** The practice minutes every older install started with as sample data. */
const LEGACY_SEED_MINUTES = 380;

/**
 * Older builds kept running totals instead of a lesson log. The finished
 * roleplays (history) and missions (activity rows share their finish time)
 * are still on record, so their times become the log; the minutes practised
 * beyond the old sample seed ride on the first of them.
 */
function lessonsFromOlderBuild(saved: Partial<AppState>): Lesson[] {
  const times = new Set<number>();
  (saved.history ?? []).forEach((run) => times.add(run.completedAt));
  (saved.activity ?? []).forEach((entry) => times.add(entry.at));
  const lessons = [...times].sort((a, b) => a - b).map((at) => ({ at, minutes: 0 }));
  const stored = (saved.profile as LegacyProfileFields | undefined)?.practiceMinutes ?? 0;
  if (lessons.length > 0) lessons[0].minutes = Math.max(0, stored - LEGACY_SEED_MINUTES);
  return lessons;
}

/** Saved state is merged over the defaults so a field added later still has a value. */
function restore(raw: string | null): AppState {
  if (!raw) return initialState;
  try {
    const saved = JSON.parse(raw) as Partial<AppState>;
    // `appLanguage` was a second language setting; `nativeLanguage` is the only one now.
    // Streak, practice time and situations done used to be stored (and seeded
    // with sample numbers); they are worked out from the lesson log now.
    const {
      appLanguage: _language,
      streakDays: _streak,
      situationsDone: _done,
      practiceMinutes: _minutes,
      ...savedProfile
    } = (saved.profile ?? {}) as Partial<Profile> & LegacyProfileFields;
    // Older builds' running totals for the streak and the weekly goal.
    const {
      lastPracticeDay: _lastDay,
      goalWeek: _goalWeek,
      ...current
    } = saved as Partial<AppState> & { lastPracticeDay?: unknown; goalWeek?: unknown };
    return {
      ...initialState,
      ...current,
      // Builds before log out kept the learner had no `signedIn`: onboarded meant signed in.
      signedIn: saved.signedIn ?? saved.onboarded ?? false,
      // Drop the design-time sample mistakes an older build seeded the log with.
      mistakes: (saved.mistakes ?? []).filter((entry) => !LEGACY_SAMPLE_MISTAKES.has(entry.id)),
      // …and the sample phrases it seeded the Scrapbook with.
      savedPhrases: (saved.savedPhrases ?? []).filter(
        (phrase) => !LEGACY_SAMPLE_PHRASES.has(phrase.id),
      ),
      // Builds before the history kept only the latest run per situation;
      // those runs become its first entries.
      history: saved.history ?? historyFromSessions(saved.sessions ?? {}),
      profile: {
        ...defaultProfile,
        ...savedProfile,
        weeklyGoal: {
          total: savedProfile.weeklyGoal?.total ?? defaultProfile.weeklyGoal.total,
          label: savedProfile.weeklyGoal?.label ?? defaultProfile.weeklyGoal.label,
        },
      },
      lessons: saved.lessons ?? lessonsFromOlderBuild(saved),
      settings: { ...initialSettings, ...saved.settings },
    };
  } catch {
    return initialState;
  }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(initialState);
  /**
   * Nothing renders until the saved state is back. Otherwise the index route
   * sees `onboarded: false` for a frame and sends a returning learner to ON-1.
   */
  const [hydrated, setHydrated] = useState(false);
  /**
   * The clock entitlements and daily caps read. Ticking it once a minute
   * lets a cancelled plan lapse and the free caps reset at midnight while
   * the app stays open.
   */
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(STORAGE_KEY)
      .catch(() => null)
      .then((raw) => {
        if (cancelled) return;
        setState(restore(raw));
        setHydrated(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {});
  }, [hydrated, state]);

  const [reminderStatus, setReminderStatus] = useState<Derived['reminderStatus']>('ok');
  const openMistakes = state.mistakes.filter((mistake) => !mistakeCompleted(mistake)).length;
  const trialEndsAt =
    state.subscription?.trial && state.subscription.autoRenew ? state.subscription.renewsAt : null;
  const trialPlan = state.subscription?.planId ?? null;

  // Reminders live in the OS scheduler, so the settings are pushed into it.
  // Only while someone is signed in: the permission prompt must not greet ON-1,
  // and a logged-out phone must stop reminding. An empty plan clears the
  // schedule without asking for permission.
  const remindersOn = state.onboarded && state.signedIn;
  useEffect(() => {
    if (!hydrated) return;
    let cancelled = false;
    syncReminders({
      practice: remindersOn && state.settings.practiceReminder,
      review: remindersOn && state.settings.reviewAlerts,
      openMistakes,
      trialEndsAt: remindersOn ? trialEndsAt : null,
      trialPrice: trialPlan ? planById[trialPlan].price : null,
    }).then((result) => {
      if (!cancelled) setReminderStatus(result);
    });
    return () => {
      cancelled = true;
    };
  }, [
    hydrated,
    remindersOn,
    state.settings.practiceReminder,
    state.settings.reviewAlerts,
    openMistakes,
    trialEndsAt,
    trialPlan,
  ]);

  // TTS lives outside React, so the setting is pushed into it.
  useEffect(() => {
    setSpeechSpeed(state.settings.aiSpeechSpeed);
  }, [state.settings.aiSpeechSpeed]);

  const completeOnboarding = useCallback(() => {
    setState((current) => ({ ...current, onboarded: true, signedIn: true }));
  }, []);

  const finishIntro = useCallback(() => {
    setState((current) => (current.introSeen ? current : { ...current, introSeen: true }));
  }, []);

  const logIn = useCallback(() => {
    setState((current) => (current.signedIn ? current : { ...current, signedIn: true }));
  }, []);

  /**
   * Log out keeps the learner's progress and onboarding on the device, so
   * signing back in goes straight home. With an account server, the server's
   * copy decides this instead.
   */
  const logOut = useCallback(() => {
    setState((current) => ({ ...current, signedIn: false }));
  }, []);

  /**
   * Delete account: this device forgets the learner entirely, so a new
   * sign-up starts onboarding over — except that it has seen the feature
   * intro, which is first-launch only.
   */
  const deleteAccount = useCallback(() => {
    setState((current) => ({ ...initialState, introSeen: current.introSeen }));
  }, []);

  const updateProfile = useCallback((patch: Partial<Profile>) => {
    setState((current) => ({ ...current, profile: { ...current.profile, ...patch } }));
  }, []);

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setState((current) => ({ ...current, settings: { ...current.settings, ...patch } }));
  }, []);

  const markMistakeFixed = useCallback((id: string) => {
    setState((current) => ({
      ...current,
      mistakes: current.mistakes.map((mistake) =>
        mistake.id === id ? { ...mistake, fixed: true } : mistake,
      ),
    }));
  }, []);

  const markMistakeDone = useCallback((id: string) => {
    setState((current) =>
      current.mistakes.some((mistake) => mistake.id === id && !mistake.done)
        ? {
            ...current,
            mistakes: current.mistakes.map((mistake) =>
              mistake.id === id
                ? { ...mistake, done: true, doneAt: mistake.doneAt ?? Date.now() }
                : mistake,
            ),
          }
        : current,
    );
  }, []);

  const savePhrase = useCallback((phrase: SavedPhrase) => {
    setState((current) =>
      current.savedPhrases.some(
        (saved) => saved.id === phrase.id || saved.korean === phrase.korean,
      )
        ? current
        : { ...current, savedPhrases: [...current.savedPhrases, phrase] },
    );
  }, []);

  const removePhrase = useCallback((id: string) => {
    setState((current) => ({
      ...current,
      savedPhrases: current.savedPhrases.filter((phrase) => phrase.id !== id),
    }));
  }, []);

  const setPhraseNote = useCallback((id: string, note: string) => {
    const trimmed = note.trim();
    setState((current) => ({
      ...current,
      savedPhrases: current.savedPhrases.map((phrase) =>
        phrase.id === id ? { ...phrase, note: trimmed === '' ? undefined : trimmed } : phrase,
      ),
    }));
  }, []);

  /**
   * RP-3 → RP-4. Only what was actually heard is judged, and only against
   * the correction data the script carries: a heard answer that isn't the
   * corrected sentence lands in the log (with the words really said); saying
   * it marks an earlier entry fixed. A line nothing was heard for — no STT,
   * or silence — is never flagged: there's nothing to judge.
   */
  const finishSession = useCallback<AppActions['finishSession']>(
    ({ situationId, lines, goalsTotal, minutes }) => {
      setState((current) => {
        const date = shortDate();
        let mistakes = current.mistakes;
        const flagged: string[] = [];
        const flaggedEntries: Record<string, Mistake> = {};
        const measured: ActivityEntry[] = [];
        const at = Date.now();

        for (const line of lines) {
          if (!line.mistake) continue;
          const target = normalizeSpeech(line.mistake.suggested.korean);
          const existing = mistakes.find(
            (entry) =>
              entry.situationId === situationId &&
              normalizeSpeech(entry.suggested.korean) === target,
          );
          const heard = line.said.trim();
          if (!heard) continue;

          const right = normalizeSpeech(heard) === target;
          measured.push({ at, skill: line.mistake.skill, correct: right ? 1 : 0, total: 1 });

          if (right) {
            if (existing) {
              mistakes = mistakes.map((entry) =>
                entry === existing ? { ...entry, fixed: true, doneAt: entry.doneAt ?? at } : entry,
              );
            }
            continue;
          }

          flagged.push(line.turnId);
          const entry: Mistake = {
            ...line.mistake,
            id: existing?.id ?? `${situationId}-${line.turnId}`,
            situationId,
            date,
            fixed: false,
            // Made again in this run, so it's back on the list even if done before.
            done: false,
            doneAt: undefined,
            said: { korean: `"${heard}"`, english: '', note: '' },
          };
          flaggedEntries[line.turnId] = entry;
          mistakes = existing
            ? mistakes.map((item) => (item === existing ? entry : item))
            : [entry, ...mistakes];
        }

        const run: SessionRecord = {
          id: `${situationId}-${at}`,
          situationId,
          completedOn: date,
          completedAt: at,
          said: Object.fromEntries(lines.map((line) => [line.turnId, line.said])),
          flagged,
          // Each goal maps to a learner turn in the scripted sessions; a
          // flagged turn is a goal not met cleanly.
          goalsMet: Math.max(0, goalsTotal - flagged.length),
          goalsTotal,
          mistakes: flaggedEntries,
        };
        const next = bumpUsage(countLesson(current, minutes), 'roleplays');
        // A finished run supersedes whatever was saved part-way.
        const { [situationId]: _finished, ...drafts } = current.drafts;
        return {
          ...next,
          drafts,
          mistakes,
          activity: [...current.activity, ...measured].slice(-ACTIVITY_CAP),
          sessions: { ...current.sessions, [situationId]: run },
          history: [run, ...current.history].slice(0, HISTORY_CAP),
        };
      });
    },
    [],
  );

  const saveDraft = useCallback((situationId: string, draft: ConversationDraft) => {
    setState((current) => ({ ...current, drafts: { ...current.drafts, [situationId]: draft } }));
  }, []);

  const clearDraft = useCallback((situationId: string) => {
    setState((current) => {
      if (!current.drafts[situationId]) return current;
      const { [situationId]: _dropped, ...drafts } = current.drafts;
      return { ...current, drafts };
    });
  }, []);

  const markQuestionsDealt = useCallback((ids: string[]) => {
    setState((current) => ({
      ...current,
      recentQuestions: rememberDealt(current.recentQuestions, ids),
    }));
  }, []);

  const finishMission = useCallback<AppActions['finishMission']>(
    ({ minutes, results }) => {
      setState((current) => {
        const next = bumpUsage(countLesson(current, minutes), 'missions');
        const at = Date.now();
        return {
          ...next,
          activity: [...current.activity, ...results.map((row) => ({ at, ...row }))].slice(
            -ACTIVITY_CAP,
          ),
        };
      });
    },
    [],
  );

  const subscribe = useCallback((receipt: Receipt) => {
    setState((current) => ({
      ...current,
      receipts: [receipt, ...current.receipts],
      subscription: {
        planId: receipt.planId,
        trial: receipt.trial,
        startedAt: receipt.purchasedAt,
        renewsAt: renewalFrom(receipt.purchasedAt, receipt.planId, receipt.trial),
        autoRenew: true,
      },
    }));
  }, []);

  const cancelSubscription = useCallback(() => {
    setState((current) =>
      current.subscription
        ? { ...current, subscription: { ...current.subscription, autoRenew: false } }
        : current,
    );
  }, []);

  const resumeSubscription = useCallback(() => {
    setState((current) =>
      current.subscription
        ? { ...current, subscription: { ...current.subscription, autoRenew: true } }
        : current,
    );
  }, []);

  // A renewing plan stays active past `renewsAt` — the store charges and
  // extends it; a cancelled one ends there.
  const sub = state.subscription;
  const isPlus = Boolean(sub && (sub.autoRenew || now < sub.renewsAt));
  const today = dayKey(new Date(now));
  const used = state.usage.day === today ? state.usage : { roleplays: 0, missions: 0 };
  const roleplaysLeft = isPlus ? Infinity : Math.max(0, freeLimits.roleplaysPerDay - used.roleplays);
  const missionsLeft = isPlus ? Infinity : Math.max(0, freeLimits.missionsPerDay - used.missions);

  // `now` ticks every minute, so a new day or week shows without a reload.
  const practice = useMemo(
    () => ({
      ...summarize(state.lessons, new Date(now)),
      situationsDone: Object.keys(state.sessions).length,
    }),
    [state.lessons, state.sessions, now],
  );

  const value = useMemo(
    () => ({
      ...state,
      practice,
      isPlus,
      reminderStatus,
      freeLeft: { roleplays: roleplaysLeft, missions: missionsLeft },
      completeOnboarding,
      finishIntro,
      logIn,
      logOut,
      deleteAccount,
      updateProfile,
      updateSettings,
      markMistakeFixed,
      markMistakeDone,
      savePhrase,
      removePhrase,
      setPhraseNote,
      finishSession,
      saveDraft,
      clearDraft,
      finishMission,
      markQuestionsDealt,
      subscribe,
      cancelSubscription,
      resumeSubscription,
    }),
    [
      state,
      practice,
      isPlus,
      reminderStatus,
      roleplaysLeft,
      missionsLeft,
      subscribe,
      cancelSubscription,
      resumeSubscription,
      completeOnboarding,
      finishIntro,
      logIn,
      logOut,
      deleteAccount,
      updateProfile,
      updateSettings,
      markMistakeFixed,
      markMistakeDone,
      savePhrase,
      removePhrase,
      setPhraseNote,
      finishSession,
      saveDraft,
      clearDraft,
      finishMission,
      markQuestionsDealt,
    ],
  );

  if (!hydrated) return null;

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used inside <AppProvider>');
  }
  return context;
}
