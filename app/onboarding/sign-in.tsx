import { router } from 'expo-router';
import { Image, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { useApp } from '@/store/AppStore';
import { colors, spacing } from '@/theme/tokens';
import { type } from '@/theme/typography';

/** ON-1 Sign up / Log in */
export default function SignIn() {
  const { updateProfile } = useApp();

  const signIn = (provider: 'google' | 'apple' | 'email') => {
    updateProfile({});
    router.push({ pathname: '/onboarding/setup', params: { provider } });
  };

  return (
    <Screen style={styles.screen}>
      <View style={styles.logoBlock}>
        <Image
          source={require('../../assets/graphics/logo.png')}
          style={styles.logo}
          accessibilityIgnoresInvertColors
        />
        <Text style={type.display}>Ddobak</Text>
        <Text style={styles.blurb}>
          Practice real Korean conversations with AI.{'\n'}
          Built around how you actually speak.
        </Text>
      </View>

      <View style={styles.actions}>
        <Button
          label="Continue with Google"
          variant="secondary"
          icon={<GoogleMark />}
          onPress={() => signIn('google')}
        />
        <Button label="Continue with Apple" variant="dark" onPress={() => signIn('apple')} />
        <Button label="Continue with email" variant="text" onPress={() => signIn('email')} />
        <Text style={styles.terms}>
          By continuing, you agree to our Terms and Privacy Policy.
        </Text>
      </View>
    </Screen>
  );
}

function GoogleMark() {
  return (
    <Svg width={18} height={18} viewBox="0 0 18 18">
      <Path
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z"
        fill="#4285F4"
      />
      <Path
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18z"
        fill="#34A853"
      />
      <Path
        d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33z"
        fill="#FBBC05"
      />
      <Path
        d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.9 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z"
        fill="#EA4335"
      />
    </Svg>
  );
}

const styles = StyleSheet.create({
  screen: {
    justifyContent: 'space-between',
    paddingTop: 120,
    paddingBottom: spacing.huge,
  },
  logoBlock: {
    alignItems: 'center',
    gap: spacing.md,
  },
  logo: {
    width: 96,
    height: 96,
    borderRadius: 24,
  },
  blurb: {
    ...type.bodyRegular,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  actions: {
    gap: spacing.md,
  },
  terms: {
    ...type.caption,
    color: colors.textTertiary,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
});
