import { useEffect, useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import { koreanVoiceAvailable } from '@/services/speech';
import { colors } from '@/theme/tokens';
import { text } from '@/theme/typography';

/**
 * One line on screens that speak Korean aloud (ON-3, RP-3, RV-2a/2b) when the
 * device has no Korean voice — otherwise Replay just stays silent and the
 * learner can't tell why.
 */
export function KoreanVoiceNotice() {
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    let alive = true;
    koreanVoiceAvailable().then((available) => {
      if (alive) setMissing(!available);
    });
    return () => {
      alive = false;
    };
  }, []);

  if (!missing) return null;
  return (
    <Text style={styles.note} accessibilityRole="alert">
      No Korean voice on this device, so you won&apos;t hear Replay. Add one in your system&apos;s
      speech settings.
    </Text>
  );
}

const styles = StyleSheet.create({
  note: {
    ...text(12, 18, '500', colors.primary),
    textAlign: 'center',
  },
});
