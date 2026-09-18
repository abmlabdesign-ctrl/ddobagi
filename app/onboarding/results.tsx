import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { PillLabel } from '@/components/Badge';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { CtaDock } from '@/components/CtaDock';
import { NavBar } from '@/components/NavBar';
import { Screen, ScreenShell } from '@/components/Screen';
import { SkillBar } from '@/components/SkillBar';
import { levelCheckSkills, levelCheckSummary } from '@/data/skills';
import { useApp } from '@/store/AppStore';
import { type } from '@/theme/typography';

/** ON-4 Your results → HM-1 */
export default function Results() {
  const { completeOnboarding } = useApp();

  const start = () => {
    completeOnboarding();
    router.replace('/(tabs)');
  };

  return (
    <ScreenShell>
      <NavBar title="Your results" showBack={false} />

      <Screen scroll background="surface-alt" contentStyle={styles.content}>
        {/* The comp labels this block with a pill, not a section heading. */}
        <View style={styles.summary}>
          <PillLabel label="Summary" />
          <Text style={type.summary}>
            {levelCheckSummary[0]}
            {'\n'}
            {levelCheckSummary[1]}
          </Text>
        </View>

        <Card paddingHorizontal={24} paddingVertical={20} style={styles.skills}>
          <View style={styles.skillsHeader}>
            <Text style={type.section}>Your skills</Text>
            <Text style={type.caption}>0–100</Text>
          </View>
          {levelCheckSkills.map((entry) => (
            <SkillBar
              key={entry.skill}
              skill={entry.skill}
              score={entry.score}
              band={entry.band}
            />
          ))}
        </Card>
      </Screen>

      <CtaDock row gap={8}>
        <Button
          label="Home"
          variant="tonal"
          height={52}
          onPress={() => router.replace('/(tabs)')}
        />
        <Button
          label="Start practicing"
          height={52}
          style={styles.primary}
          onPress={start}
        />
      </CtaDock>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 28,
    paddingTop: 20,
    paddingBottom: 20,
  },
  summary: {
    gap: 12,
  },
  skills: {
    gap: 16,
  },
  skillsHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  primary: {
    flex: 1,
  },
});
