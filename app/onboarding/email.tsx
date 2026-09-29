import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from 'react-native';

import { Button } from '@/components/Button';
import { CtaDock } from '@/components/CtaDock';
import { NavBar } from '@/components/NavBar';
import { Screen, ScreenShell } from '@/components/Screen';
import { useApp } from '@/store/AppStore';
import { colors, hairline, radius, selectedOutline } from '@/theme/tokens';
import { text, type } from '@/theme/typography';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * ON-1a Continue with email. The field borrows the ON-2 select: 48 tall,
 * r12, hairline at rest and the primary ring while focused.
 *
 * No auth server yet, so the address is kept and the flow moves on. When one
 * exists, `next` sends the one-time code and pushes a code-entry step here.
 */
export default function EmailSignIn() {
  const { profile, updateProfile } = useApp();
  const [email, setEmail] = useState(profile.email ?? '');
  const [focused, setFocused] = useState(false);
  const [touched, setTouched] = useState(false);

  const valid = EMAIL.test(email.trim());

  const next = () => {
    updateProfile({ signInProvider: 'Email', email: email.trim().toLowerCase() });
    router.push('/onboarding/consent');
  };

  return (
    <ScreenShell background="surface">
      <NavBar title="Continue with email" />

      <KeyboardAvoidingView
        style={styles.fill}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Screen contentStyle={styles.content}>
          <View style={styles.intro}>
            <Text style={type.screenTitle}>What&apos;s your email?</Text>
            <Text style={type.secondary}>We&apos;ll use it to sign you in and keep your progress.</Text>
          </View>

          <View style={styles.group}>
            <Text style={type.section}>Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              onFocus={() => setFocused(true)}
              onBlur={() => {
                setFocused(false);
                setTouched(true);
              }}
              onSubmitEditing={() => (valid ? next() : setTouched(true))}
              placeholder="you@example.com"
              placeholderTextColor={colors.textTertiary}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              returnKeyType="next"
              accessibilityLabel="Email"
              style={[styles.input, focused ? selectedOutline : hairline]}
            />
            {touched && email.trim() && !valid ? (
              <Text style={styles.error}>Check your email address.</Text>
            ) : null}
          </View>
        </Screen>

        <CtaDock>
          <Button label="Next" onPress={next} disabled={!valid} />
        </CtaDock>
      </KeyboardAvoidingView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  content: {
    gap: 28,
    paddingTop: 16,
  },
  intro: {
    gap: 8,
  },
  group: {
    gap: 12,
  },
  input: {
    height: 48,
    borderRadius: radius.input,
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    ...text(15, 22, '500', colors.inkAlt),
  },
  error: text(12, 16, '500', colors.danger),
});
