import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { OptionRow, SelectRow } from '@/components/Controls';
import { NavBar } from '@/components/NavBar';
import { Screen } from '@/components/Screen';
import { onboardingOptions } from '@/data/profile';
import { useApp } from '@/store/AppStore';
import { colors, radius, spacing } from '@/theme/tokens';
import { type } from '@/theme/typography';

/** ON-2 Setup (About you) — `Next` stays disabled until the required answers are in. */
export default function Setup() {
  const { profile, updateProfile } = useApp();
  const [studyDuration, setStudyDuration] = useState<string | null>(profile.studyDuration);
  const [purposes, setPurposes] = useState<string[]>(profile.purposes);
  const [painPoints, setPainPoints] = useState<string[]>(profile.painPoints);

  const toggle = (list: string[], value: string) =>
    list.includes(value) ? list.filter((item) => item !== value) : [...list, value];

  const canContinue = Boolean(studyDuration) && purposes.length > 0 && painPoints.length > 0;

  const next = () => {
    updateProfile({ studyDuration, purposes, painPoints });
    router.push('/onboarding/level-check');
  };

  return (
    <View style={styles.root}>
      <NavBar title="About you" />
      <View style={styles.progress}>
        <ProgressDots step={1} total={3} />
      </View>

      <Screen scroll contentStyle={styles.content}>
        <SelectRow label="App language" value={profile.appLanguage} />

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

      <View style={styles.footer}>
        <Button label="Next" onPress={next} disabled={!canContinue} />
      </View>
    </View>
  );
}

function ProgressDots({ step, total }: { step: number; total: number }) {
  return (
    <View style={styles.dots}>
      {Array.from({ length: total }).map((_, index) => (
        <View
          key={index}
          style={[styles.dot, index < step ? styles.dotActive : styles.dotIdle]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  progress: {
    paddingHorizontal: spacing.gutter,
    paddingBottom: spacing.md,
    alignItems: 'center',
  },
  content: {
    gap: spacing.xxl,
    paddingTop: spacing.sm,
    paddingBottom: spacing.huge,
  },
  group: {
    gap: spacing.md,
  },
  groupHeader: {
    gap: spacing.xs,
  },
  optionList: {
    gap: spacing.sm,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  footer: {
    paddingHorizontal: spacing.gutter,
    paddingBottom: spacing.xxl,
    paddingTop: spacing.md,
    backgroundColor: colors.surface,
  },
  dots: {
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 20,
    height: 4,
    borderRadius: radius.pill,
  },
  dotActive: { backgroundColor: colors.primary },
  dotIdle: { backgroundColor: colors.fill },
});
