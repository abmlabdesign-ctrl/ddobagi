import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { mistakes as seedMistakes, savedPhrases as seedPhrases } from '@/data/review';
import { defaultProfile } from '@/data/profile';
import type { Mistake, SavedPhrase } from '@/data/types';
import { normalizeSpeech } from '@/services/recognition';
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

type AppState = {
  onboarded: boolean;
  profile: Profile;
  settings: Settings;
  mistakes: Mistake[];
  savedPhrases: SavedPhrase[];
  sessions: Record<string, SessionResult>;
  /** `2026-09-29` of the last practice, for the streak. */
  lastPracticeDay: string | null;
  /** Monday of the week `weeklyGoal.completed` counts, so it resets weekly. */
  goalWeek: string | null;
};

type AppActions = {
  completeOnboarding: () => void;
  resetOnboarding: () => void;
  updateProfile: (patch: Partial<Profile>) => void;
  updateSettings: (patch: Partial<Settings>) => void;
  markMistakeFixed: (id: string) => void;
  savePhrase: (phrase: SavedPhrase) => void;
  removePhrase: (id: string) => void;
  setPhraseNote: (id: string, note: string) => void;
  finishSession: (input: {
    situationId: string;
    lines: JudgedLine[];
    goalsTotal: number;
    minutes: number;
  }) => void;
  finishMission: (input: { minutes: number }) => void;
};

const AppContext = createContext<(AppState & AppActions) | null>(null);

const STORAGE_KEY = 'ddobak/state/v1';

const initialSettings: Settings = {
  aiSpeechSpeed: '0.9x',
  practiceReminder: true,
  reviewAlerts: false,
};

const initialState: AppState = {
  onboarded: false,
  profile: defaultProfile,
  settings: initialSettings,
  mistakes: seedMistakes,
  savedPhrases: seedPhrases,
  sessions: {},
  lastPracticeDay: null,
  goalWeek: null,
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

/** Saved state is merged over the defaults so a field added later still has a value. */
function restore(raw: string | null): AppState {
  if (!raw) return initialState;
  try {
    const saved = JSON.parse(raw) as Partial<AppState>;
    return {
      ...initialState,
      ...saved,
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

  // TTS lives outside React, so the setting is pushed into it.
  useEffect(() => {
    setSpeechSpeed(state.settings.aiSpeechSpeed);
  }, [state.settings.aiSpeechSpeed]);

  const completeOnboarding = useCallback(() => {
    setState((current) => ({ ...current, onboarded: true }));
  }, []);

  /** Log out: this device forgets the learner entirely. */
  const resetOnboarding = useCallback(() => {
    setState(initialState);
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
   * RP-3 → RP-4. A scripted mistake only lands in the log when the learner
   * didn't say the correction; saying it marks an earlier entry fixed. Without
   * a transcript (native, no STT) there is nothing to judge, so the scripted
   * line stands in, as it did before.
   */
  const finishSession = useCallback<AppActions['finishSession']>(
    ({ situationId, lines, goalsTotal, minutes }) => {
      setState((current) => {
        const date = shortDate();
        let mistakes = current.mistakes;
        const flagged: string[] = [];

        for (const line of lines) {
          if (!line.mistake) continue;
          const target = normalizeSpeech(line.mistake.suggested.korean);
          const existing = mistakes.find(
            (entry) =>
              entry.situationId === situationId &&
              normalizeSpeech(entry.suggested.korean) === target,
          );
          const heard = line.said.trim();

          if (heard && normalizeSpeech(heard) === target) {
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
            said: heard
              ? { korean: `"${heard}"`, english: '', note: line.mistake.said.note }
              : line.mistake.said,
          };
          mistakes = existing
            ? mistakes.map((item) => (item === existing ? entry : item))
            : [entry, ...mistakes];
        }

        const firstTime = !current.sessions[situationId];
        const next = countLesson(current, minutes);
        return {
          ...next,
          mistakes,
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

  const finishMission = useCallback(({ minutes }: { minutes: number }) => {
    setState((current) => countLesson(current, minutes));
  }, []);

  const value = useMemo(
    () => ({
      ...state,
      completeOnboarding,
      resetOnboarding,
      updateProfile,
      updateSettings,
      markMistakeFixed,
      savePhrase,
      removePhrase,
      setPhraseNote,
      finishSession,
      finishMission,
    }),
    [
      state,
      completeOnboarding,
      resetOnboarding,
      updateProfile,
      updateSettings,
      markMistakeFixed,
      savePhrase,
      removePhrase,
      setPhraseNote,
      finishSession,
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
