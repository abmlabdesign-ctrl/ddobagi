import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { OptionRow } from '@/components/Controls';
import { CtaDock } from '@/components/CtaDock';
import { NavBar } from '@/components/NavBar';
import { Screen, ScreenShell } from '@/components/Screen';
import { weeklyGoalLabel, weeklyGoalOptions } from '@/data/profile';
import { useApp } from '@/store/AppStore';
import { spacing } from '@/theme/tokens';
import { type } from '@/theme/typography';

/**
 * ON-2a Weekly goal — ON-2 → here → ON-2b. A new learner picks how many
 * lessons a week to aim for, so Home and My Page start from their own goal
 * rather than a preset one. Laid out like ON-2: white page, one question,
 * option rows, `Next` disabled until a pick. MY-1b changes it later.
 */
export default function WeeklyGoal() {
  const { updateProfile } = useApp();
  const [total, setTotal] = useState<number | null>(null);

  const next = () => {
    if (total === null) return;
    updateProfile({ weeklyGoal: { total, label: weeklyGoalLabel(total) } });
    router.push('/onboarding/microphone');
  };

  return (
    <ScreenShell background="surface">
      <NavBar title="Weekly goal" />

      <Screen scroll contentStyle={styles.content}>
        <View style={styles.intro}>
          <Text style={type.screenTitle}>How much practice a week?</Text>
          <Text style={type.secondary}>
            One lesson is one roleplay or one micro mission. You can change this later.
          </Text>
        </View>

        <View style={styles.optionList}>
          {weeklyGoalOptions.map((option) => (
            <OptionRow
              key={option}
              label={`${option} lessons a week`}
              selected={total === option}
              onPress={() => setTotal(option)}
            />
          ))}
        </View>
      </Screen>

      <CtaDock>
        <Button label="Next" onPress={next} disabled={total === null} />
      </CtaDock>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 28,
    paddingTop: 16,
    paddingBottom: spacing.huge,
  },
  intro: {
    gap: 8,
  },
  optionList: {
    gap: 8,
  },
});
