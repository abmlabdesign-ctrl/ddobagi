import { router } from 'expo-router';
import { Image, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { CtaDock } from '@/components/CtaDock';
import { Screen, ScreenShell } from '@/components/Screen';
import { spacing } from '@/theme/tokens';
import { type } from '@/theme/typography';

/**
 * Any unknown path — mostly the web, where a stale or mistyped link lands.
 * Same centred logo block as ON-1, with one way out.
 */
export default function NotFound() {
  return (
    <ScreenShell background="surface">
      <Screen contentStyle={styles.content}>
        <Image
          source={require('../assets/graphics/logo.png')}
          style={styles.logo}
          resizeMode="contain"
          accessibilityIgnoresInvertColors
        />
        <View style={styles.text}>
          <Text style={[type.screenTitle, styles.center]}>We can&apos;t find that page</Text>
          <Text style={[type.secondary, styles.center]}>
            The link may be old or mistyped. Let&apos;s get you back.
          </Text>
        </View>
      </Screen>
      <CtaDock>
        <Button label="Go home" onPress={() => router.replace('/')} />
      </CtaDock>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    paddingBottom: spacing.huge,
  },
  logo: {
    width: 88,
    height: 88,
  },
  text: {
    gap: 8,
  },
  center: {
    textAlign: 'center',
  },
});
