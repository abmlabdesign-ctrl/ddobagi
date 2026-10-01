import { router } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/Card';
import { MicButton } from '@/components/MicButton';
import { KoreanVoiceNotice } from '@/components/KoreanVoiceNotice';
import { NavBar } from '@/components/NavBar';
import { Screen, ScreenShell } from '@/components/Screen';
import { Waveform } from '@/components/Waveform';
import { SpeakerIcon } from '@/icons';
import { recognitionMessage, useSpeechRecognition } from '@/services/recognition';
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
  const heard = useSpeechRecognition();
  const [secondsLeft, setSecondsLeft] = useState(levelCheckSeconds);
  const [lines, setLines] = useState<string[]>([]);
  /** What earlier takes settled on — pausing the mic must not wipe it. */
  const [kept, setKept] = useState('');
  /** A take has started — from then on there's something to try again. */
  const [taken, setTaken] = useState(false);
  // The countdown lives in a ref too, so the tick that reaches 0 can submit
  // right there instead of an effect noticing it afterwards.
  const remaining = useRef(levelCheckSeconds);
  const submitted = useRef(false);

  const running = recording && secondsLeft > 0;

  /**
   * Hands the answer in and moves to ON-4. Both `Finish` and the timer land
   * here; the mic is closed first so nothing keeps listening behind ON-4.
   */
  const submit = useCallback(() => {
    if (submitted.current) return;
    submitted.current = true;
    heard.stop();
    void voice.stop();
    setRecording(false);
    router.replace('/onboarding/results');
  }, [heard, voice]);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      remaining.current = Math.max(0, remaining.current - 1);
      setSecondsLeft(remaining.current);
      // Time's up: submit on the spot — no stop button, no screen left at 0:00.
      if (remaining.current === 0) submit();
    }, 1000);
    return () => clearInterval(id);
  }, [running, submit]);

  // Transcript streams in while the mic is on.
  // 인식이 되는 환경에서는 실제로 말한 것이 들어오므로 목 문장을 흘리지 않는다.
  useEffect(() => {
    if (heard.supported) return;
    if (!running || lines.length >= levelCheckTranscript.length) return;
    const id = setTimeout(() => {
      setLines(levelCheckTranscript.slice(0, lines.length + 1));
    }, 1400);
    return () => clearTimeout(id);
  }, [running, lines, heard.supported]);

  const toggleMic = async () => {
    if (recording) {
      const take = heard.supported ? heard.stop() : '';
      if (take) setKept((value) => `${value}${value ? ' ' : ''}${take}`);
      await voice.stop();
      setRecording(false);
      return;
    }
    // 권한을 거부당하면 녹음이 시작되지 않으므로 타이머도 돌리지 않는다.
    const on = await voice.start();
    if (on) heard.start();
    if (on) setTaken(true);
    setRecording(on);
  };

  /** Try again: drop this answer and the clock, back to a clean first take. */
  const retry = async () => {
    heard.reset();
    await voice.stop();
    setRecording(false);
    setLines([]);
    setKept('');
    setTaken(false);
    remaining.current = levelCheckSeconds;
    setSecondsLeft(levelCheckSeconds);
  };

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = `${secondsLeft % 60}`.padStart(2, '0');
  // The comp colours the sentence still being recognised in primary.
  // 인식이 되면 확정된 말이 회색, 아직 다듬어지는 말이 오렌지가 된다 —
  // 시안이 나눠둔 두 색이 그대로 STT의 final/interim에 대응한다.
  const settled = heard.supported
    ? [kept, heard.settled].filter(Boolean).join(' ')
    : lines.slice(0, -1).join('');
  const live = heard.supported ? heard.interim : lines.length ? lines[lines.length - 1] : '';
  // Anything to throw away? A take that started counts even before words land.
  const answered = taken || Boolean(settled || live);
  const canRetry = answered && !recording;

  return (
    <ScreenShell background="surface" bottomEdge="content">
      {/* No `Finish` up top: the dock's Submit is the one way to hand it in. */}
      <NavBar title="Level check" />

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
        <KoreanVoiceNotice />

        <Card
          style={recording ? { ...styles.transcript, ...styles.transcriptOn } : styles.transcript}
          radiusToken="card"
          elevation="card"
          padding={24}
        >
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
        {/* Off, the bars sit faded and still; on, they're full colour and moving. */}
        <View style={recording ? null : styles.waveOff}>
          <Waveform active={running} />
        </View>

        <View style={styles.micRow}>
          <View style={styles.side}>
            {canRetry ? (
              <Pressable
                onPress={retry}
                accessibilityRole="button"
                accessibilityLabel="Try again from the start"
                style={styles.sidePill}
              >
                <Text style={type.label}>Try again</Text>
              </Pressable>
            ) : null}
          </View>
          {/* The roleplay screen's button, so recording looks the same everywhere. */}
          <MicButton size={84} active={running} onPress={toggleMic} />
          <View style={styles.side}>
            {canRetry ? (
              <Pressable
                onPress={submit}
                accessibilityRole="button"
                style={[styles.sidePill, styles.sidePillPrimary]}
              >
                <Text style={styles.sidePillPrimaryLabel}>Submit</Text>
              </Pressable>
            ) : null}
          </View>
        </View>

        <MicStatus on={recording} answered={answered} />

        {voice.permission === 'denied' ? (
          <Text style={styles.micDenied}>
            Microphone access is off. Allow it in your browser or system settings, then tap again.
          </Text>
        ) : heard.error !== 'none' ? (
          <Text style={styles.micDenied}>{recognitionMessage[heard.error]}</Text>
        ) : null}
      </View>
    </ScreenShell>
  );
}

/**
 * The mic state in words as well as colour: a red dot and `Recording` while
 * listening, a grey `Mic off` otherwise — readable at a glance on a phone.
 */
function MicStatus({ on, answered }: { on: boolean; answered: boolean }) {
  return (
    <View
      style={[styles.status, on ? styles.statusOn : styles.statusOff]}
      accessibilityLiveRegion="polite"
      accessibilityLabel={on ? 'Microphone on, recording' : 'Microphone off'}
    >
      <View style={[styles.statusDot, on ? styles.statusDotOn : styles.statusDotOff]} />
      <Text style={on ? styles.statusLabelOn : styles.statusLabelOff}>
        {on ? 'Recording · Tap to pause' : answered ? 'Mic off · Tap to keep going' : 'Mic off · Tap to speak'}
      </Text>
    </View>
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
  /** A primary rule round the card while it's listening. */
  transcriptOn: {
    borderColor: colors.primary200,
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
    gap: 16,
    paddingTop: 8,
    paddingHorizontal: spacing.gutter,
    paddingBottom: 12,
  },
  waveOff: {
    opacity: 0.35,
  },
  micRow: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  /** Equal side columns keep the mic dead centre whether the pills show or not. */
  side: {
    width: 104,
    alignItems: 'center',
  },
  sidePill: {
    height: 44,
    paddingHorizontal: 16,
    borderRadius: radius.search,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sidePillPrimary: {
    backgroundColor: colors.primary100,
  },
  sidePillPrimaryLabel: {
    ...type.label,
    color: colors.primary,
  },
  status: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 28,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
  },
  statusOn: {
    backgroundColor: colors.dangerBg,
  },
  statusOff: {
    backgroundColor: colors.fill,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: radius.pill,
  },
  statusDotOn: {
    backgroundColor: colors.danger,
  },
  statusDotOff: {
    backgroundColor: colors.textTertiary,
  },
  statusLabelOn: text(12, 16, '600', colors.danger),
  statusLabelOff: text(12, 16, '600', colors.textSecondary),
  /** 권한이 막히면 아무 일도 안 일어난 것처럼 보여서, 이유를 적어준다. */
  micDenied: {
    ...text(12, 18, '500', colors.danger),
    textAlign: 'center',
  },
});
