import { Redirect } from 'expo-router';

import { useApp } from '@/store/AppStore';

/** ON-1 → … → HM-1. Onboarding has no re-entry once it's done. */
export default function Index() {
  const { onboarded } = useApp();
  return <Redirect href={onboarded ? '/(tabs)' : '/onboarding/sign-in'} />;
}
