import { router } from 'expo-router';
import { Image, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { Button } from '@/components/Button';
import { Screen, ScreenShell } from '@/components/Screen';
import { useApp } from '@/store/AppStore';
import { colors, shadows, spacing } from '@/theme/tokens';
import { text, type } from '@/theme/typography';

/** ON-1 Sign up / Log in */
export default function SignIn() {
  const { updateProfile } = useApp();

  const signIn = (provider: 'google' | 'apple' | 'email') => {
    updateProfile({});
    router.push({ pathname: '/onboarding/setup', params: { provider } });
  };

  return (
    <ScreenShell background="surface" bottomEdge="content">
      <Screen style={styles.screen}>
        {/* The comp centres the logo block in whatever space the buttons leave. */}
        <View style={styles.logoBlock}>
          <View style={styles.logoFrame}>
            <Image
              source={require('../../assets/graphics/logo.png')}
              style={styles.logo}
              resizeMode="contain"
              accessibilityIgnoresInvertColors
            />
          </View>
          <View style={styles.titleBlock}>
            <Text style={type.display}>Ddobak</Text>
            <Text style={styles.blurb}>
              Practice real Korean conversations with AI.{'\n'}
              Built around how you actually speak.
            </Text>
          </View>
        </View>

        <View style={styles.actions}>
          <Button
            label="Continue with Google"
            variant="elevated"
            icon={<GoogleMark />}
            onPress={() => signIn('google')}
          />
          <Button
            label="Continue with Apple"
            variant="dark"
            icon={<AppleMark />}
            onPress={() => signIn('apple')}
          />
          <Button label="Continue with email" variant="text" onPress={() => signIn('email')} />
          <Text style={styles.terms}>
            By continuing, you agree to our Terms and Privacy Policy.
          </Text>
        </View>
      </Screen>
    </ScreenShell>
  );
}

function GoogleMark() {
  return (
    <Svg width={20} height={20} viewBox="0 0 18 18">
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

function AppleMark() {
  return (
    <Svg width={20} height={20} viewBox="0 0 20 20">
      <Path
        d="M13.6 10.5c0-1.9 1.55-2.82 1.62-2.86-.88-1.29-2.26-1.47-2.75-1.49-1.17-.12-2.28.69-2.87.69-.59 0-1.5-.67-2.47-.65-1.27.02-2.44.74-3.09 1.87-1.32 2.29-.34 5.68.95 7.54.63.91 1.38 1.93 2.36 1.9.95-.04 1.31-.61 2.45-.61 1.15 0 1.47.61 2.47.59 1.02-.02 1.67-.93 2.29-1.84.72-1.05 1.02-2.07 1.04-2.13-.02-.01-2-.77-2-3.01zM11.9 4.86c.52-.63.87-1.5.77-2.37-.75.03-1.65.5-2.19 1.12-.48.56-.9 1.45-.79 2.3.84.07 1.69-.42 2.21-1.05z"
        fill={colors.surface}
      />
    </Svg>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingBottom: spacing.huge,
  },
  logoBlock: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  logoFrame: {
    width: 96,
    height: 96,
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    ...shadows.card,
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  titleBlock: {
    alignItems: 'center',
    gap: 8,
  },
  blurb: {
    ...text(15, 24, '400', colors.textSecondary),
    textAlign: 'center',
  },
  actions: {
    gap: 12,
  },
  terms: {
    ...text(12, 18, '400', colors.textTertiary),
    textAlign: 'center',
  },
});
