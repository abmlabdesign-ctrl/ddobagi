import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { CtaDock } from '@/components/CtaDock';
import { ScreenShell } from '@/components/Screen';
import { planById } from '@/data/plans';
import { CheckIcon } from '@/icons';
import { formatLongDate } from '@/services/billing';
import { useApp } from '@/store/AppStore';
import { colors, radius, spacing } from '@/theme/tokens';
import { text } from '@/theme/typography';

/**
 * After a purchase. Same shape as RV-2f Mission complete — ring, orange title,
 * centred caption, one dock — so finishing a checkout feels like finishing
 * anything else in the app.
 */
export default function PlusSuccess() {
  const { subscription } = useApp();
  const plan = subscription ? planById[subscription.planId] : null;

  const caption = !subscription || !plan
    ? 'Plus is on.'
    : subscription.trial
      ? `Your free trial runs until ${formatLongDate(subscription.renewsAt)}.`
      : `${plan.label} plan · renews ${formatLongDate(subscription.renewsAt)}.`;

  return (
    <ScreenShell background="surface" bottomEdge="dock">
      <View style={styles.body}>
        <View style={styles.ring}>
          <CheckIcon size={72} weight={2.3} color={colors.primary} />
        </View>
        <View style={styles.text}>
          <Text style={styles.title}>Welcome to Plus!</Text>
          <Text style={styles.caption}>
            Unlimited roleplays and missions are open.{'\n'}
            {caption}
          </Text>
        </View>
      </View>

      <CtaDock paddingTop={12} style={styles.dock}>
        <Button label="Start speaking" onPress={() => router.replace('/(tabs)/roleplay')} />
      </CtaDock>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    paddingHorizontal: 34,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xl,
  },
  ring: {
    width: 90,
    height: 90,
    borderRadius: radius.pill,
    borderWidth: 5,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    ...text(28, 38, '700', colors.primary),
    textAlign: 'center',
  },
  caption: {
    ...text(15, 23, '400', colors.textBody),
    textAlign: 'center',
  },
  dock: {
    shadowOpacity: 0,
    elevation: 0,
  },
});
