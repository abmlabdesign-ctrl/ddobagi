import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, { SlideInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { CtaDock } from '@/components/CtaDock';
import { KoreanText } from '@/components/KoreanText';
import { MicButton } from '@/components/MicButton';
import { NavBar } from '@/components/NavBar';
import { Screen, ScreenShell } from '@/components/Screen';
import { StepProgress } from '@/components/StepProgress';
import { missionById, missions } from '@/data/missions';
import type { ChoiceQuestion, SpeakQuestion, Token, WriteQuestion } from '@/data/types';
import { DropdownChevronIcon, SpeakerIcon } from '@/icons';
import { colors, radius, spacing } from '@/theme/tokens';
import { text, type } from '@/theme/typography';

/** Spacing and punctuation are noise for every axis these drills grade. */
const normalize = (value: string) => value.replace(/[\s.,!?~]/g, '');

/** The finished sentence, used to lead a written miss with the answer. */
const answerLine = (question: WriteQuestion) =>
  question.template
    ? question.template
        .split('___')
        .reduce(
          (line, part, gap) =>
            line + part + (gap < question.blanks.length ? question.blanks[gap][0] : ''),
          '',
        )
    : question.blanks[0][0];

/**
 * RV-2a … RV-2f. One runner, three ways to drill: speaking missions use the mic,
 * writing missions grade what the learner typed, choice missions grade on tap.
 * The header, the progress bar and the feedback panel are the same in all three
 * — and `Next` lives only inside that panel, never as a standing dock.
 */
export default function MissionRunner() {
  const { missionId } = useLocalSearchParams<{ missionId: string }>();
  const mission = missionById[missionId] ?? missions[0];

  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState<number | null>(null);
  const [entries, setEntries] = useState<string[]>([]);
  const [recording, setRecording] = useState(false);
  const [spokenCount, setSpokenCount] = useState(0);
  const [verdict, setVerdict] = useState<{ correct: boolean; note: string } | null>(null);
  const [done, setDone] = useState(false);

  const question = mission.questions[index % mission.questions.length];
  const position = Math.min(index + 1, mission.questionCount);

  const reset = () => {
    setAnswer(null);
    setEntries([]);
    setRecording(false);
    setSpokenCount(0);
    setVerdict(null);
  };

  const next = () => {
    if (position >= mission.questionCount) {
      setDone(true);
      return;
    }
    setIndex((value) => value + 1);
    reset();
  };

  /**
   * RV-2b reads as a live caption: while the mic is open the sentence lights up
   * word by word, and the verdict lands once the last word is through.
   */
  useEffect(() => {
    if (!recording || question.type !== 'speak') return undefined;
    const total = question.tokens.length;
    let read = 0;
    const id = setInterval(() => {
      read += 1;
      setSpokenCount(read);
      if (read < total) return;
      clearInterval(id);
      setRecording(false);
      setVerdict({
        correct: question.feedback.correct,
        note: question.feedback.explanation,
      });
    }, 420);
    return () => clearInterval(id);
  }, [recording, question]);

  const submitWrite = () => {
    if (question.type !== 'write') return;
    const correct = question.blanks.every((accepted, gap) =>
      accepted.some((option) => normalize(option) === normalize(entries[gap] ?? '')),
    );
    setVerdict({
      correct,
      note: correct ? question.explanation : `${answerLine(question)} — ${question.explanation}`,
    });
  };

  const pick = (optionIndex: number) => {
    if (question.type !== 'choice' || verdict) return;
    setAnswer(optionIndex);
    setVerdict({
      correct: optionIndex === question.answerIndex,
      note: question.explanation,
    });
  };

  if (done) {
    return <MissionComplete title={mission.title} questionCount={mission.questionCount} />;
  }

  return (
    <ScreenShell>
      <NavBar title={mission.title} closeIcon onBack={() => router.replace('/(tabs)/review')} />

      <View style={styles.progress}>
        <StepProgress total={mission.questionCount} completed={position} />
      </View>

      <Screen scroll background="surface-alt" contentStyle={styles.content}>
        {question.type === 'speak' ? (
          <SpeakStep
            question={question}
            recording={recording}
            spokenCount={spokenCount}
            live={mission.kind === 'fluency'}
            judged={verdict !== null}
            onSpeak={() => {
              setSpokenCount(0);
              setRecording(true);
            }}
          />
        ) : question.type === 'write' ? (
          <WriteStep
            question={question}
            entries={entries}
            judged={verdict !== null}
            correct={verdict?.correct ?? false}
            onChange={(gap, value) =>
              setEntries((current) => {
                const draft = [...current];
                draft[gap] = value;
                return draft;
              })
            }
            onCheck={submitWrite}
          />
        ) : (
          <ChoiceStep question={question} answer={answer} />
        )}
      </Screen>

      {question.type === 'choice' ? (
        <View style={styles.options}>
          {question.options.map((option, optionIndex) => {
            const selected = answer === optionIndex;
            const isAnswer = optionIndex === question.answerIndex;
            const judged = verdict !== null;
            return (
              <Pressable
                key={option}
                onPress={() => pick(optionIndex)}
                accessibilityRole="radio"
                accessibilityState={{ selected, disabled: judged }}
                style={[
                  styles.option,
                  selected && !isAnswer ? styles.optionWrong : null,
                  judged && isAnswer ? styles.optionRight : null,
                ]}
              >
                <Text
                  style={
                    judged && isAnswer
                      ? styles.optionLabelRight
                      : selected
                        ? styles.optionLabelWrong
                        : styles.optionLabel
                  }
                >
                  {option}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}

      {verdict ? (
        <FeedbackPanel
          correct={verdict.correct}
          note={verdict.note}
          nextLabel={position >= mission.questionCount ? 'Finish' : 'Next'}
          onNext={next}
          onRetry={verdict.correct ? undefined : reset}
        />
      ) : null}
    </ScreenShell>
  );
}

/**
 * The verdict rises from the foot of the screen — green when it is right, red
 * when it is not — and carries the only `Next` on the screen.
 */
function FeedbackPanel({
  correct,
  note,
  nextLabel,
  onNext,
  onRetry,
}: {
  correct: boolean;
  note: string;
  nextLabel: string;
  onNext: () => void;
  onRetry?: () => void;
}) {
  const insets = useSafeAreaInsets();
  const tone = correct ? colors.success : colors.danger;

  return (
    <Animated.View
      entering={SlideInDown.duration(260)}
      style={[
        styles.panel,
        {
          backgroundColor: correct ? colors.successBg : colors.dangerBg,
          paddingBottom: insets.bottom + spacing.lg,
        },
      ]}
    >
      <Text style={[styles.panelTitle, { color: tone }]}>{correct ? 'Nice!' : 'Not quite'}</Text>
      <Text style={styles.panelNote}>{note}</Text>

      <View style={styles.panelActions}>
        {onRetry ? (
          <Button
            label="Try again"
            variant="elevated"
            height={52}
            style={styles.panelButton}
            onPress={onRetry}
          />
        ) : null}
        <Button
          label={nextLabel}
          height={52}
          style={[styles.panelButton, { backgroundColor: tone }]}
          onPress={onNext}
        />
      </View>
    </Animated.View>
  );
}

/**
 * RV-2a / RV-2b — read the sentence aloud. The mic sits under the card, and on
 * the fluency drill the sentence lights up word by word as it is read, so the
 * card doubles as a live caption.
 */
function SpeakStep({
  question,
  recording,
  spokenCount,
  live,
  judged,
  onSpeak,
}: {
  question: SpeakQuestion;
  recording: boolean;
  spokenCount: number;
  live: boolean;
  judged: boolean;
  onSpeak: () => void;
}) {
  return (
    <View style={styles.step}>
      <Card elevation="card" radiusToken="card" padding={24} style={styles.promptCard}>
        <View style={styles.speakHeader}>
          <View style={styles.speaker}>
            <SpeakerIcon size={18} />
          </View>
          <Text style={styles.promptLabel}>
            {live ? 'Read it straight through' : 'Listen, then repeat'}
          </Text>
        </View>
        <KoreanText
          tokens={question.tokens}
          spokenCount={live ? spokenCount : 0}
          tapHint="Tap a word to see how it sounds"
        />
      </Card>

      <View style={styles.micBlock}>
        <MicButton active={recording} onPress={judged || recording ? undefined : onSpeak} />
        <Text style={styles.micHint}>
          {recording ? 'Listening…' : judged ? '' : 'Tap to speak'}
        </Text>
      </View>
    </View>
  );
}

/**
 * RV-2c / RV-2d / RV-2e — the learner produces the Korean. A template splits
 * into a field per gap; without one they write the whole sentence. `Check` sits
 * with the exercise rather than in a dock, because it is part of answering.
 */
function WriteStep({
  question,
  entries,
  judged,
  correct,
  onChange,
  onCheck,
}: {
  question: WriteQuestion;
  entries: string[];
  judged: boolean;
  correct: boolean;
  onChange: (gap: number, value: string) => void;
  onCheck: () => void;
}) {
  const segments = question.template ? question.template.split('___') : null;
  const filled = question.blanks.every((_, gap) => (entries[gap] ?? '').trim() !== '');

  // A fixed gap clips a 4-syllable ending, so each one takes its answer's width.
  const gapWidth = (gap: number) =>
    Math.min(240, Math.max(64, Math.max(...question.blanks[gap].map((a) => a.length)) * 22 + 22));

  const field = (gap: number, inline: boolean) => (
    <TextInput
      key={`gap-${gap}`}
      value={entries[gap] ?? ''}
      onChangeText={(value) => onChange(gap, value)}
      editable={!judged}
      placeholder={inline ? '' : 'Write it in Korean'}
      placeholderTextColor={colors.textTertiary}
      accessibilityLabel={question.template ? `Blank ${gap + 1}` : 'Your sentence'}
      style={[
        inline ? [styles.gapField, { width: gapWidth(gap) }] : styles.writeField,
        judged ? (correct ? styles.fieldRight : styles.fieldWrong) : null,
      ]}
    />
  );

  return (
    <View style={styles.step}>
      <Card elevation="card" radiusToken="card" padding={24} style={styles.promptCard}>
        <Text style={styles.promptLabel}>{question.promptLabel}</Text>
        <Text style={styles.writePrompt}>{question.prompt}</Text>
        {question.source ? <Text style={styles.writeSource}>{question.source}</Text> : null}

        {segments ? (
          <View style={styles.gapLine}>
            {segments.map((part, gap) => (
              <View key={`seg-${gap}`} style={styles.gapSegment}>
                {part ? <Text style={styles.gapText}>{part}</Text> : null}
                {gap < question.blanks.length ? field(gap, true) : null}
              </View>
            ))}
          </View>
        ) : (
          field(0, false)
        )}
      </Card>

      {judged ? null : (
        <Button label="Check" height={52} disabled={!filled} onPress={onCheck} />
      )}
    </View>
  );
}

/** RV-2c / RV-2d / RV-2e — pick the option that fits. */
function ChoiceStep({ question, answer }: { question: ChoiceQuestion; answer: number | null }) {
  const [showMeaning, setShowMeaning] = useState(false);

  // The comp draws the answer sentence word by word, each on its own dotted rule.
  const sentenceTokens = useMemo<Token[]>(() => {
    // Until it is filled the gap stands on its own, as an orange rule; only the
    // answer fuses onto the word before it, and only for a particle.
    if (answer === null) {
      return question.sentenceTokens.map((token) =>
        token ? { text: token.text } : { text: '', blank: true },
      );
    }
    const parts = question.sentenceTokens.map((token) =>
      token ? token.text : question.options[answer],
    );
    if (!question.blankAttachesLeft) return parts.map((text) => ({ text }));
    const gap = question.sentenceTokens.findIndex((token) => token === null);
    return parts
      .reduce<string[]>((acc, part, index) => {
        if (index === gap && acc.length) acc[acc.length - 1] += part;
        else acc.push(part);
        return acc;
      }, [])
      .map((text) => ({ text }));
  }, [question, answer]);

  return (
    <View style={styles.step}>
      <Card elevation="card" radiusToken="card" padding={24} style={styles.promptCard}>
        <View style={styles.promptHeader}>
          <View style={styles.promptHeaderLeft}>
            <View style={styles.speaker}>
              <SpeakerIcon size={18} />
            </View>
            <Text style={styles.promptLabel}>{question.promptLabel}</Text>
          </View>
          <Pressable
            onPress={() => setShowMeaning((value) => !value)}
            accessibilityRole="button"
            accessibilityState={{ expanded: showMeaning }}
            style={styles.meaningPill}
          >
            <Text style={styles.meaningLabel}>Meaning</Text>
            <DropdownChevronIcon color={colors.textSecondary} />
          </Pressable>
        </View>

        <KoreanText tokens={question.promptTokens} />
        {showMeaning ? <Text style={type.caption}>{question.promptEnglish}</Text> : null}

        {sentenceTokens.length > 0 ? (
          <KoreanText
            tokens={sentenceTokens}
            underlineColor={colors.primary}
            style={styles.answerSentence}
          />
        ) : null}
      </Card>

    </View>
  );
}

/** RV-2f Mission complete */
function MissionComplete({
  title,
  questionCount,
}: {
  title: string;
  questionCount: number;
}) {
  return (
    <ScreenShell background="surface">
      <Screen contentStyle={styles.completeContent}>
        <View style={styles.completeText}>
          <Text style={type.screenTitle}>Mission complete!</Text>
          <Text style={type.secondary}>
            You finished all {questionCount} questions of{'\n'}the {title.toLowerCase()} mission.
          </Text>
        </View>

        <View style={styles.summaryRow}>
          <View style={styles.summaryCell}>
            <Text style={styles.summaryValue}>4:12</Text>
            <Text style={type.caption}>Time</Text>
          </View>
          <View style={styles.summaryCell}>
            <Text style={[styles.summaryValue, styles.summaryValueGood]}>↑6</Text>
            <Text style={type.caption}>Politeness</Text>
          </View>
        </View>
      </Screen>

      <CtaDock row gap={10}>
        <Button
          label="Retry"
          variant="elevated"
          style={styles.completeButton}
          onPress={() => router.replace('/(tabs)/review')}
        />
        <Button
          label="Done"
          style={styles.completeButton}
          onPress={() => router.replace('/(tabs)/review')}
        />
      </CtaDock>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  progress: {
    paddingHorizontal: spacing.gutter,
    paddingTop: 25,
  },
  content: {
    gap: 16,
    paddingTop: 30,
    paddingBottom: 20,
  },
  step: {
    gap: 16,
  },
  promptCard: {
    gap: 8,
  },
  promptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  speakHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  promptHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexShrink: 1,
  },
  speaker: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: colors.primary100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  promptLabel: {
    ...type.badge,
    color: colors.textTertiary,
    flexShrink: 1,
  },
  meaningPill: {
    height: 28,
    paddingHorizontal: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceAlt,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  meaningLabel: text(11, 16, '600', colors.textSecondary),
  answerSentence: {
    marginTop: 4,
  },
  writePrompt: {
    ...type.section,
    marginTop: 2,
  },
  writeSource: {
    ...text(16, 24, '500', colors.textSecondary),
    marginTop: -2,
  },
  writeField: {
    ...text(18, 26, '600', colors.inkAlt),
    marginTop: 8,
    minHeight: 52,
    borderRadius: radius.search,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  gapLine: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginTop: 6,
  },
  gapSegment: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gapText: text(22, 34, '600', colors.inkAlt),
  gapField: {
    ...text(22, 34, '600', colors.primary),
    // Never flexible, or the field grows to the row and breaks the sentence apart.
    flexGrow: 0,
    flexShrink: 0,
    height: 40,
    borderRadius: radius.badge,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 8,
    textAlign: 'center',
    marginHorizontal: 2,
  },
  fieldRight: {
    borderColor: colors.success,
    backgroundColor: colors.successBg,
  },
  fieldWrong: {
    borderColor: colors.primary,
    backgroundColor: colors.primary100,
  },
  options: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.gutter,
    paddingVertical: 24,
    gap: 8,
  },
  option: {
    height: 48,
    borderRadius: radius.search,
    backgroundColor: colors.fill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  optionRight: {
    backgroundColor: colors.successBg,
    borderWidth: 1,
    borderColor: colors.success,
  },
  optionWrong: {
    backgroundColor: colors.primary100,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  optionLabel: text(16, 22, '500', colors.inkAlt),
  optionLabelRight: text(16, 22, '600', colors.success),
  optionLabelWrong: text(16, 22, '600', colors.primary),
  micHint: {
    ...text(13, 18, '500', colors.textTertiary),
    marginTop: 12,
    minHeight: 18,
  },
  panel: {
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.xl,
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
    gap: 6,
  },
  panelTitle: text(18, 26, '700', colors.success),
  panelNote: {
    ...text(14, 21, '500', colors.inkAlt),
    paddingBottom: 10,
  },
  panelActions: {
    flexDirection: 'row',
    gap: 8,
  },
  panelButton: {
    flex: 1,
  },
  micBlock: {
    alignItems: 'center',
  },
  completeContent: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.huge,
  },
  completeText: {
    gap: spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: spacing.huge,
  },
  summaryCell: {
    gap: spacing.xs,
  },
  summaryValue: {
    ...type.timer,
    fontSize: 28,
    lineHeight: 36,
  },
  summaryValueGood: {
    color: colors.success,
  },
  completeButton: {
    flex: 1,
  },
});
