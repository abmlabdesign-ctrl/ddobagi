import { Redirect } from 'expo-router';

import { useApp } from '@/store/AppStore';

/**
 * ON-1 → … → HM-1. Onboarding has no re-entry once it's done: a logged-out
 * learner sees ON-1 but goes home after signing in. Only Delete account
 * clears `onboarded`.
 */
export default function Index() {
  const { onboarded, signedIn } = useApp();
  return <Redirect href={onboarded && signedIn ? '/(tabs)' : '/onboarding/sign-in'} />;
}
