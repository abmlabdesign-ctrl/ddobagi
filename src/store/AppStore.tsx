import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { freeLimits, planById, type PlanId } from '@/data/plans';
import { defaultProfile } from '@/data/profile';
import type { Mistake, SavedPhrase, SkillId } from '@/data/types';
import { renewalFrom, type Receipt } from '@/services/billing';
import { normalizeSpeech } from '@/services/recognition';
import { syncReminders } from '@/services/reminders';
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
};

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
  onboarded: boolean;
  /** IN-1 ~ IN-5 have been shown once; they never come back, even after log out. */
  introSeen: boolean;
  profile: Profile;
  settings: Settings;
  mistakes: Mistake[];
  savedPhrases: SavedPhrase[];
  sessions: Record<string, SessionResult>;
  /** Unfinished roleplays the learner chose to keep, by situation id. */
  drafts: Record<string, ConversationDraft>;
  /** `2026-09-29` of the last practice, for the streak. */
  lastPracticeDay: string | null;
  /** Monday of the week `weeklyGoal.completed` counts, so it resets weekly. */
  goalWeek: string | null;
  subscription: Subscription | null;
  receipts: Receipt[];
  usage: Usage;
  activity: ActivityEntry[];
};

type AppActions = {
  completeOnboarding: () => void;
  finishIntro: () => void;
  resetOnboarding: () => void;
  updateProfile: (patch: Partial<Profile>) => void;
  updateSettings: (patch: Partial<Settings>) => void;
  markMistakeFixed: (id: string) => void;
  /** Marks a mistake as seen. Idempotent, so reopening it changes nothing. */
  markMistakeRead: (id: string) => void;
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
  introSeen: false,
  profile: defaultProfile,
  settings: initialSettings,
  // The log starts empty: only what a roleplay actually flags goes in.
  mistakes: [],
  // Starts empty: only lines the learner actually saves go in.
  savedPhrases: [],
  sessions: {},
  drafts: {},
  lastPracticeDay: null,
  goalWeek: null,
  subscription: null,
  receipts: [],
  activity: [],
  usage: { day: '', roleplays: 0, missions: 0 },
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** `Sep 29` — the date format every list in the comps uses. */
export const shortDate = (date = new Date()) => `${MONTHS[date.getMonth()]} ${date.getDate()}`;

export const dayKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

const mondayKey = (date: Date) => {
  const monday = new Date(date);
  monday.setDate(date.getDate() - ((date.getDay() + 6) % 7));
  return dayKey(monday);
};

/**
 * One finished lesson: streak, weekly goal and practice time move together,
 * whether it was a roleplay or a micro mission.
 */
function countLesson(state: AppState, minutes: number): AppState {
  const now = new Date();
  const today = dayKey(now);
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  let streakDays = state.profile.streakDays;
  if (state.lastPracticeDay !== today) {
    // A fresh install has no day on record; its seeded streak counts as live.
    streakDays =
      state.lastPracticeDay === null || state.lastPracticeDay === dayKey(yesterday)
        ? streakDays + 1
        : 1;
  }

  const week = mondayKey(now);
  const goal = state.profile.weeklyGoal;
  const completed = state.goalWeek === null || state.goalWeek === week ? goal.completed + 1 : 1;

  return {
    ...state,
    lastPracticeDay: today,
    goalWeek: week,
    profile: {
      ...state.profile,
      streakDays,
      practiceMinutes: state.profile.practiceMinutes + minutes,
      weeklyGoal: { ...goal, completed },
    },
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

/** Saved state is merged over the defaults so a field added later still has a value. */
function restore(raw: string | null): AppState {
  if (!raw) return initialState;
  try {
    const saved = JSON.parse(raw) as Partial<AppState>;
    return {
      ...initialState,
      ...saved,
      // Drop the design-time sample mistakes an older build seeded the log with.
      mistakes: (saved.mistakes ?? []).filter((entry) => !LEGACY_SAMPLE_MISTAKES.has(entry.id)),
      // …and the sample phrases it seeded the Scrapbook with.
      savedPhrases: (saved.savedPhrases ?? []).filter(
        (phrase) => !LEGACY_SAMPLE_PHRASES.has(phrase.id),
      ),
      profile: { ...defaultProfile, ...saved.profile },
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
  const openMistakes = state.mistakes.filter((mistake) => !mistake.fixed).length;
  const trialEndsAt =
    state.subscription?.trial && state.subscription.autoRenew ? state.subscription.renewsAt : null;
  const trialPlan = state.subscription?.planId ?? null;

  // Reminders live in the OS scheduler, so the settings are pushed into it.
  // Only once someone is signed in: the permission prompt must not greet ON-1.
  useEffect(() => {
    if (!hydrated || !state.onboarded) return;
    let cancelled = false;
    syncReminders({
      practice: state.settings.practiceReminder,
      review: state.settings.reviewAlerts,
      openMistakes,
      trialEndsAt,
      trialPrice: trialPlan ? planById[trialPlan].price : null,
    }).then((result) => {
      if (!cancelled) setReminderStatus(result);
    });
    return () => {
      cancelled = true;
    };
  }, [
    hydrated,
    state.onboarded,
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
    setState((current) => ({ ...current, onboarded: true }));
  }, []);

  const finishIntro = useCallback(() => {
    setState((current) => (current.introSeen ? current : { ...current, introSeen: true }));
  }, []);

  /**
   * Log out: this device forgets the learner entirely — except that it has
   * seen the feature intro, which is first-launch only.
   */
  const resetOnboarding = useCallback(() => {
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

  const markMistakeRead = useCallback((id: string) => {
    setState((current) =>
      current.mistakes.some((mistake) => mistake.id === id && !mistake.read)
        ? {
            ...current,
            mistakes: current.mistakes.map((mistake) =>
              mistake.id === id ? { ...mistake, read: true } : mistake,
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
                entry === existing ? { ...entry, fixed: true } : entry,
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
            // Made again in this run, so it's news to the log even if read before.
            read: false,
            said: { korean: `"${heard}"`, english: '', note: '' },
          };
          mistakes = existing
            ? mistakes.map((item) => (item === existing ? entry : item))
            : [entry, ...mistakes];
        }

        const firstTime = !current.sessions[situationId];
        const next = bumpUsage(countLesson(current, minutes), 'roleplays');
        // A finished run supersedes whatever was saved part-way.
        const { [situationId]: _finished, ...drafts } = current.drafts;
        return {
          ...next,
          drafts,
          mistakes,
          activity: [...current.activity, ...measured].slice(-ACTIVITY_CAP),
          sessions: {
            ...current.sessions,
            [situationId]: {
              completedOn: date,
              completedAt: Date.now(),
              said: Object.fromEntries(lines.map((line) => [line.turnId, line.said])),
              flagged,
              // Each goal maps to a learner turn in the scripted sessions; a
              // flagged turn is a goal not met cleanly.
              goalsMet: Math.max(0, goalsTotal - flagged.length),
              goalsTotal,
            },
          },
          profile: {
            ...next.profile,
            situationsDone: next.profile.situationsDone + (firstTime ? 1 : 0),
          },
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

  const value = useMemo(
    () => ({
      ...state,
      isPlus,
      reminderStatus,
      freeLeft: { roleplays: roleplaysLeft, missions: missionsLeft },
      completeOnboarding,
      finishIntro,
      resetOnboarding,
      updateProfile,
      updateSettings,
      markMistakeFixed,
      markMistakeRead,
      savePhrase,
      removePhrase,
      setPhraseNote,
      finishSession,
      saveDraft,
      clearDraft,
      finishMission,
      subscribe,
      cancelSubscription,
      resumeSubscription,
    }),
    [
      state,
      isPlus,
      reminderStatus,
      roleplaysLeft,
      missionsLeft,
      subscribe,
      cancelSubscription,
      resumeSubscription,
      completeOnboarding,
      finishIntro,
      resetOnboarding,
      updateProfile,
      updateSettings,
      markMistakeFixed,
      markMistakeRead,
      savePhrase,
      removePhrase,
      setPhraseNote,
      finishSession,
      saveDraft,
      clearDraft,
      finishMission,
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
