import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/Card';
import { MicButton } from '@/components/MicButton';
import { NavBar } from '@/components/NavBar';
import { Screen, ScreenShell } from '@/components/Screen';
import { Waveform } from '@/components/Waveform';
import { SpeakerIcon } from '@/icons';
import { useVoiceRecorder } from '@/services/recorder';
import { speak } from '@/services/speech';
import {
  levelCheckQuestion,
  levelCheckSeconds,
  levelCheckTranscript,
} from '@/data/skills';
import { colors, radius, spacing } from '@/theme/tokens';
import { text, type } from '@/theme/typography';

/**
 * ON-3 1-minute AI level check.
 * The English caption is always visible here: the learner can't be diagnosed on
 * a question they didn't understand (handoff §6.2).
 */
export default function LevelCheck() {
  const [recording, setRecording] = useState(false);
  const voice = useVoiceRecorder();
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
  // The comp colours the sentence still being recognised in primary.
  const settled = lines.slice(0, -1).join('');
  const live = lines.length ? lines[lines.length - 1] : '';

  return (
    <ScreenShell background="surface" bottomEdge="content">
      <NavBar
        title="Level check"
        action="Finish"
        onAction={() => router.replace('/onboarding/results')}
      />

      <Screen contentStyle={styles.content}>
        <View style={styles.question}>
          <Pressable
            onPress={() => speak(levelCheckQuestion.korean)}
            accessibilityRole="button"
            accessibilityLabel={`Replay ${levelCheckQuestion.korean}`}
            style={styles.speaker}
          >
            <SpeakerIcon size={16} />
          </Pressable>
          <View style={styles.questionText}>
            <Text style={styles.korean}>{levelCheckQuestion.korean}</Text>
            <Text style={styles.english}>{levelCheckQuestion.english}</Text>
          </View>
        </View>

        <Card style={styles.transcript} radiusToken="card" elevation="card" padding={24}>
          <Text style={styles.transcriptLabel}>Live transcript</Text>
          <Text style={styles.transcriptBody}>
            {settled}
            <Text style={styles.transcriptLive}>
              {live}
              {running ? '|' : ''}
            </Text>
          </Text>
        </Card>

        <View style={styles.timerBlock}>
          <Text style={type.secondary}>Time left</Text>
          <Text style={type.timer}>
            {minutes}:{seconds}
          </Text>
        </View>
      </Screen>

      <View style={styles.micBlock}>
        <Waveform active={running} />
        <MicButton
          active={running}
          onPress={async () => {
            if (recording) {
              await voice.stop();
              setRecording(false);
              return;
            }
            // 권한을 거부당하면 녹음이 시작되지 않으므로 타이머도 돌리지 않는다.
            setRecording(await voice.start());
          }}
        />
        {voice.permission === 'denied' ? (
          <Text style={styles.micDenied}>
            Microphone access is off. Allow it in your browser or system settings, then tap again.
          </Text>
        ) : null}
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    gap: spacing.gutter,
    paddingTop: 20,
    paddingBottom: 20,
    alignItems: 'center',
  },
  question: {
    alignSelf: 'stretch',
    gap: 4,
    paddingBottom: 20,
  },
  speaker: {
    width: 24,
    height: 24,
    borderRadius: radius.pill,
    backgroundColor: colors.primary100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  questionText: {
    gap: 4,
  },
  korean: {
    ...type.korean,
    textAlign: 'center',
  },
  english: {
    ...type.caption,
    textAlign: 'center',
  },
  transcript: {
    flex: 1,
    alignSelf: 'stretch',
    gap: 12,
    borderWidth: 1,
    borderColor: colors.fill,
  },
  transcriptLabel: {
    ...type.badge,
    color: colors.textTertiary,
  },
  transcriptBody: text(18, 28, '500', colors.inkAlt),
  transcriptLive: {
    color: colors.primary,
  },
  timerBlock: {
    alignItems: 'center',
    gap: 6,
  },
  micBlock: {
    alignItems: 'center',
    gap: 20,
    paddingTop: 8,
    paddingHorizontal: spacing.gutter,
    paddingBottom: 12,
  },
  /** 권한이 막히면 아무 일도 안 일어난 것처럼 보여서, 이유를 적어준다. */
  micDenied: {
    ...text(12, 18, '500', colors.danger),
    textAlign: 'center',
  },
});
