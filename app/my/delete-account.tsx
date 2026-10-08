import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { CheckRow } from '@/components/CheckRow';
import { CtaDock } from '@/components/CtaDock';
import { NavBar } from '@/components/NavBar';
import { Screen, ScreenShell } from '@/components/Screen';
import { useApp } from '@/store/AppStore';
import { colors, spacing } from '@/theme/tokens';
import { type } from '@/theme/typography';

/**
 * MY-3 › Delete account. The stores require deletion inside the app wherever
 * sign-up happens inside it. Today everything lives on the device, so this
 * clears it; with an account server, `remove` also calls its delete endpoint.
 */
export default function DeleteAccount() {
  const { profile, mistakes, savedPhrases, isPlus, subscription, practice, deleteAccount } =
    useApp();
  const [confirmed, setConfirmed] = useState(false);

  const lost = [
    `Your profile, ${profile.nickname}`,
    practice.streakDays > 0
      ? `${practice.situationsDone} finished situations and your ${practice.streakDays}-day streak`
      : `${practice.situationsDone} finished situations`,
    `${mistakes.length} mistakes in your Mistake log`,
    `${savedPhrases.length} saved phrases in your Scrapbook`,
  ];

  const remove = () => {
    deleteAccount();
    router.replace('/onboarding/sign-in');
  };

  return (
    <ScreenShell>
      <NavBar title="Delete account" />

      <Screen scroll background="surface-alt" contentStyle={styles.content}>
        <View style={styles.intro}>
          <Text style={type.screenTitle}>Delete your account?</Text>
          <Text style={type.secondary}>This can&apos;t be undone. You&apos;ll lose:</Text>
        </View>

        <Card radiusToken="group" elevation="card" paddingHorizontal={20} paddingVertical={16}>
          <View style={styles.list}>
            {lost.map((line) => (
              <View key={line} style={styles.item}>
                <View style={styles.bullet} />
                <Text style={[type.row, styles.itemLabel]}>{line}</Text>
              </View>
            ))}
          </View>
        </Card>

        {/* Deleting the account doesn't stop a store subscription — say so first. */}
        {isPlus && subscription?.autoRenew ? (
          <Text style={styles.warning}>
            Your Plus subscription keeps renewing until you cancel it. Cancel it in Subscription
            first.
          </Text>
        ) : null}

        <CheckRow
          label="I understand my progress will be gone"
          checked={confirmed}
          onToggle={() => setConfirmed((value) => !value)}
        />
      </Screen>

      <CtaDock>
        <Button
          label="Delete account"
          onPress={remove}
          disabled={!confirmed}
          style={styles.danger}
        />
      </CtaDock>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 20,
    paddingTop: 16,
    paddingBottom: spacing.huge,
  },
  intro: {
    gap: 8,
  },
  list: {
    gap: 12,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 9,
    backgroundColor: colors.danger,
  },
  itemLabel: {
    flex: 1,
  },
  danger: {
    backgroundColor: colors.danger,
  },
  warning: {
    ...type.description,
    color: colors.danger,
  },
});
