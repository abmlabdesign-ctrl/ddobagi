import { useNetInfo } from '@react-native-community/netinfo';
import { useEffect, useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, radius, spacing } from '@/theme/tokens';
import { text } from '@/theme/typography';

/**
 * App-wide strip for lost connectivity. Most of Ddobak runs offline, so this
 * informs rather than blocks: only speech-to-text needs the network. Mounted
 * once in the root layout, floating under the status bar.
 */
export function OfflineBanner() {
  const offline = useOffline();
  const insets = useSafeAreaInsets();

  if (!offline) return null;

  return (
    <View pointerEvents="none" style={[styles.wrap, { top: insets.top + spacing.sm }]}>
      <Animated.View
        entering={FadeInUp.duration(200)}
        exiting={FadeOutUp.duration(200)}
        style={styles.banner}
        accessibilityRole="alert"
      >
        <Text style={styles.label}>You&apos;re offline. Speech-to-text needs a connection.</Text>
      </Animated.View>
    </View>
  );
}

/**
 * NetInfo on native. On the web NetInfo listens to `navigator.connection`
 * when the browser has it (Chrome does), which doesn't fire on going offline,
 * so the web reads the window's own online/offline events instead.
 */
function useOffline() {
  const { isConnected } = useNetInfo();
  const [webOffline, setWebOffline] = useState(
    () => Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.onLine === false,
  );

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return undefined;
    const up = () => setWebOffline(false);
    const down = () => setWebOffline(true);
    window.addEventListener('online', up);
    window.addEventListener('offline', down);
    return () => {
      window.removeEventListener('online', up);
      window.removeEventListener('offline', down);
    };
  }, []);

  // `null` means "not checked yet" — say nothing until we know.
  return Platform.OS === 'web' ? webOffline : isConnected === false;
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: spacing.gutter,
    right: spacing.gutter,
    alignItems: 'center',
  },
  banner: {
    borderRadius: radius.pill,
    backgroundColor: colors.ink,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  label: text(13, 19, '500', colors.surface),
});
