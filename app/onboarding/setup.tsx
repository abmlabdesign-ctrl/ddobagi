import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { OptionRow, SelectRow } from '@/components/Controls';
import { CtaDock } from '@/components/CtaDock';
import { NavBar } from '@/components/NavBar';
import { Screen, ScreenShell } from '@/components/Screen';
import { NativeLanguageSheet } from '@/components/NativeLanguageSheet';
import { onboardingOptions } from '@/data/profile';
import { useApp } from '@/store/AppStore';
import { spacing } from '@/theme/tokens';
import { type } from '@/theme/typography';

/** ON-2 Setup (About you) → ON-2a Weekly goal. `Next` stays disabled until the required answers are in. */
export default function Setup() {
  const { profile, updateProfile } = useApp();
  const [studyDuration, setStudyDuration] = useState<string | null>(profile.studyDuration);
  const [purposes, setPurposes] = useState<string[]>(profile.purposes);
  const [painPoints, setPainPoints] = useState<string[]>(profile.painPoints);
  const [languageOpen, setLanguageOpen] = useState(false);

  const toggle = (list: string[], value: string) =>
    list.includes(value) ? list.filter((item) => item !== value) : [...list, value];

  const canContinue = Boolean(studyDuration) && purposes.length > 0 && painPoints.length > 0;

  const next = () => {
    updateProfile({ studyDuration, purposes, painPoints });
    router.push('/onboarding/goal');
  };

  return (
    <ScreenShell background="surface">
      <NavBar title="About you" />

      <Screen scroll contentStyle={styles.content}>
        {/* The UI is English-only for now, so ON-2 asks for the learner's own
            language instead — the same list and sheet as MY-1b. */}
        <SelectRow
          label="Native language"
          value={profile.nativeLanguage}
          onPress={() => setLanguageOpen(true)}
        />

        <View style={styles.group}>
          <Text style={type.section}>How long have you studied Korean?</Text>
          <View style={styles.optionList}>
            {onboardingOptions.studyDuration.map((option) => (
              <OptionRow
                key={option}
                label={option}
                selected={studyDuration === option}
                onPress={() => setStudyDuration(option)}
              />
            ))}
          </View>
        </View>

        <View style={styles.group}>
          <Text style={type.section}>What do you need Korean for?</Text>
          <View style={styles.chips}>
            {onboardingOptions.purposes.map((option) => (
              <Chip
                key={option}
                label={option}
                selected={purposes.includes(option)}
                onPress={() => setPurposes(toggle(purposes, option))}
              />
            ))}
          </View>
        </View>

        <View style={styles.group}>
          <View style={styles.groupHeader}>
            <Text style={type.section}>What&apos;s hardest right now?</Text>
            <Text style={type.caption}>Select all that apply</Text>
          </View>
          <View style={styles.chips}>
            {onboardingOptions.painPoints.map((option) => (
              <Chip
                key={option}
                label={option}
                selected={painPoints.includes(option)}
                onPress={() => setPainPoints(toggle(painPoints, option))}
              />
            ))}
          </View>
        </View>
      </Screen>

      <CtaDock>
        <Button label="Next" onPress={next} disabled={!canContinue} />
      </CtaDock>

      <NativeLanguageSheet visible={languageOpen} onClose={() => setLanguageOpen(false)} />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 48,
    paddingTop: 20,
    paddingBottom: spacing.huge,
  },
  group: {
    gap: 12,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    flexWrap: 'wrap',
  },
  optionList: {
    gap: 8,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
});
