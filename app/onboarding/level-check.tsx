import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/Card';
import { KoreanText } from '@/components/KoreanText';
import { MicButton } from '@/components/MicButton';
import { NavBar } from '@/components/NavBar';
import { Screen } from '@/components/Screen';
import {
  levelCheckQuestion,
  levelCheckSeconds,
  levelCheckTranscript,
} from '@/data/skills';
import { colors, radius, spacing } from '@/theme/tokens';
import { fontFamily, type } from '@/theme/typography';

/**
 * ON-3 1-minute AI level check.
 * The English caption is always visible here: the learner can't be diagnosed on
 * a question they didn't understand (handoff §6.2).
 */
export default function LevelCheck() {
  const [recording, setRecording] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(levelCheckSeconds);
  const [lines, setLines] = useState<string[]>([]);

  const running = recording && secondsLeft > 0;

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setSecondsLeft((value) => Math.max(0, value - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [running]);

  // Transcript streams in while the mic is on.
  useEffect(() => {
    if (!running || lines.length >= levelCheckTranscript.length) return;
    const id = setTimeout(() => {
      setLines(levelCheckTranscript.slice(0, lines.length + 1));
    }, 1400);
    return () => clearTimeout(id);
  }, [running, lines]);

  // 0 seconds ends the check and moves to the results.
  useEffect(() => {
    if (secondsLeft > 0) return;
    router.replace('/onboarding/results');
  }, [secondsLeft]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = `${secondsLeft % 60}`.padStart(2, '0');

  return (
    <View style={styles.root}>
      <NavBar
        title="Level check"
        action="Finish"
        onAction={() => router.replace('/onboarding/results')}
      />

      <Screen contentStyle={styles.content}>
        <Card style={styles.questionCard} padding={0} elevation="flat">
          <KoreanText
            tokens={[{ text: levelCheckQuestion.korean }]}
            english={levelCheckQuestion.english}
            meaning="always"
            onReplay={() => {}}
          />
        </Card>

        <Card style={styles.transcript}>
          <Text style={styles.transcriptLabel}>Live transcript</Text>
          <Text style={styles.transcriptBody}>
            {lines.join('')}
            {running ? '|' : ''}
          </Text>
        </Card>

        <View style={styles.timerBlock}>
          <Text style={type.secondary}>Time left</Text>
          <Text style={styles.timer}>
            {minutes}:{seconds}
          </Text>
        </View>

        <View style={styles.micBlock}>
          <MicButton active={running} onPress={() => setRecording((value) => !value)} />
        </View>
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  content: {
    flex: 1,
    gap: spacing.xl,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxl,
  },
  questionCard: {
    backgroundColor: 'transparent',
  },
  transcript: {
    flex: 1,
    gap: spacing.md,
    borderRadius: radius.card,
  },
  transcriptLabel: {
    ...type.badge,
    color: colors.textTertiary,
  },
  transcriptBody: {
    fontFamily: fontFamily.sans,
    fontSize: 18,
    lineHeight: 28,
    fontWeight: '500',
    color: colors.ink,
  },
  timerBlock: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  timer: {
    ...type.timer,
    fontVariant: ['tabular-nums'],
  },
  micBlock: {
    alignItems: 'center',
  },
});
