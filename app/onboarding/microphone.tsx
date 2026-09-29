import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { requestRecordingPermissionsAsync } from 'expo-audio';

import { Button } from '@/components/Button';
import { CtaDock } from '@/components/CtaDock';
import { NavBar } from '@/components/NavBar';
import { Screen, ScreenShell } from '@/components/Screen';
import { MicIcon } from '@/icons';
import { micMessage, recordingSupported } from '@/services/recorder';
import { colors, radius, shadows, spacing } from '@/theme/tokens';
import { type } from '@/theme/typography';

/**
 * ON-2b Microphone — ON-2 → here → ON-3. Explains the mic before the system
 * prompt appears, so the learner knows why it's asked (and a "no" isn't a
 * reflex). The level check is timed, so asking here keeps the prompt from
 * eating into its 60 seconds. Either way the flow continues: the check falls
 * back to its no-mic path.
 */
export default function Microphone() {
  const [denied, setDenied] = useState(false);

  const allow = async () => {
    const granted = recordingSupported
      ? await requestRecordingPermissionsAsync()
          .then((response) => response.granted)
          .catch(() => false)
      : false;
    if (!granted) {
      setDenied(true);
      return;
    }
    router.push('/onboarding/level-check');
  };

  return (
    <ScreenShell background="surface">
      <NavBar title="Microphone" />

      <Screen contentStyle={styles.content}>
        <View style={styles.badge}>
          <MicIcon size={40} color={colors.surface} />
        </View>
        <View style={styles.text}>
          <Text style={[type.screenTitle, styles.center]}>Let Ddobak hear you</Text>
          <Text style={[type.secondary, styles.center]}>
            You&apos;ll speak Korean out loud in every roleplay. We use the mic only while it&apos;s
            on, and your recordings stay on this device.
          </Text>
        </View>
        {denied ? (
          <Text style={[type.caption, styles.center]}>{micMessage('denied')}</Text>
        ) : null}
      </Screen>

      <CtaDock gap={0}>
        <Button label={denied ? 'Try again' : 'Allow mic'} onPress={allow} />
        <Button
          label="Not now"
          variant="text"
          onPress={() => router.push('/onboarding/level-check')}
        />
      </CtaDock>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 28,
    paddingBottom: spacing.huge,
  },
  badge: {
    width: 96,
    height: 96,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.primaryGlow,
  },
  text: {
    gap: 10,
  },
  center: {
    textAlign: 'center',
  },
});
