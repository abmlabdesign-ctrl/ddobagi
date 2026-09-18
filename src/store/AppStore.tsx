import { createContext, useCallback, useContext, useMemo, useState } from 'react';

import { mistakes as seedMistakes, savedPhrases as seedPhrases } from '@/data/review';
import { defaultProfile } from '@/data/profile';
import type { Mistake, SavedPhrase } from '@/data/types';

type Profile = typeof defaultProfile;

type Settings = {
  aiSpeechSpeed: string;
  practiceReminder: boolean;
  reviewAlerts: boolean;
};

type AppState = {
  onboarded: boolean;
  profile: Profile;
  settings: Settings;
  mistakes: Mistake[];
  savedPhrases: SavedPhrase[];
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
};

const AppContext = createContext<(AppState & AppActions) | null>(null);

const initialSettings: Settings = {
  aiSpeechSpeed: '0.9x',
  practiceReminder: true,
  reviewAlerts: false,
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [onboarded, setOnboarded] = useState(false);
  const [profile, setProfile] = useState<Profile>(defaultProfile);
  const [settings, setSettings] = useState<Settings>(initialSettings);
  const [mistakes, setMistakes] = useState<Mistake[]>(seedMistakes);
  const [savedPhrases, setSavedPhrases] = useState<SavedPhrase[]>(seedPhrases);

  const updateProfile = useCallback((patch: Partial<Profile>) => {
    setProfile((current) => ({ ...current, ...patch }));
  }, []);

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setSettings((current) => ({ ...current, ...patch }));
  }, []);

  const markMistakeFixed = useCallback((id: string) => {
    setMistakes((current) =>
      current.map((mistake) => (mistake.id === id ? { ...mistake, fixed: true } : mistake)),
    );
  }, []);

  const savePhrase = useCallback((phrase: SavedPhrase) => {
    setSavedPhrases((current) =>
      current.some((saved) => saved.id === phrase.id) ? current : [...current, phrase],
    );
  }, []);

  const removePhrase = useCallback((id: string) => {
    setSavedPhrases((current) => current.filter((phrase) => phrase.id !== id));
  }, []);

  const setPhraseNote = useCallback((id: string, note: string) => {
    const trimmed = note.trim();
    setSavedPhrases((current) =>
      current.map((phrase) =>
        phrase.id === id ? { ...phrase, note: trimmed === '' ? undefined : trimmed } : phrase,
      ),
    );
  }, []);

  const value = useMemo(
    () => ({
      onboarded,
      profile,
      settings,
      mistakes,
      savedPhrases,
      completeOnboarding: () => setOnboarded(true),
      resetOnboarding: () => {
        setOnboarded(false);
        setProfile(defaultProfile);
      },
      updateProfile,
      updateSettings,
      markMistakeFixed,
      savePhrase,
      removePhrase,
      setPhraseNote,
    }),
    [
      onboarded,
      profile,
      settings,
      mistakes,
      savedPhrases,
      updateProfile,
      updateSettings,
      markMistakeFixed,
      savePhrase,
      removePhrase,
      setPhraseNote,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used inside <AppProvider>');
  }
  return context;
}
