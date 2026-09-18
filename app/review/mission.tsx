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
import type { ChoiceQuestion, Token, WriteQuestion } from '@/data/types';
import { DropdownChevronIcon, SpeakerIcon } from '@/icons';
import { colors, radius, shadows, spacing } from '@/theme/tokens';
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

  const nextLabel = position >= mission.questionCount ? 'Finish' : 'Next';

  /**
   * RV-2a / RV-2b are a fixed three-band screen in the comp, not a scroller:
   * the card fills whatever the scene leaves (`flex:1`), the verdict sits
   * between the card and the mic, and the waveform + mic own the bottom.
   */
  if (question.type === 'speak') {
    return (
      <ScreenShell>
        <NavBar title={mission.title} closeIcon onBack={() => router.replace('/(tabs)/review')} />

        <View style={styles.progress}>
          <StepProgress total={mission.questionCount} completed={position} />
        </View>

        <View style={styles.scene}>
          <Card elevation="card" radiusToken="card" padding={24} style={styles.speakCard}>
            <View style={styles.speaker}>
              <SpeakerIcon size={18} />
            </View>
            <KoreanText
              tokens={question.tokens}
              spokenCount={mission.kind === 'fluency' ? spokenCount : 0}
              english={question.english}
              meaning="always"
              captionStyle={styles.sentenceMeaning}
            />
          </Card>

          {verdict ? (
            <View style={styles.verdict}>
              <View style={styles.verdictRow}>
                <Text
                  style={[
                    styles.verdictBadge,
                    verdict.correct ? styles.verdictBadgeGood : styles.verdictBadgeBad,
                  ]}
                >
                  {verdict.correct ? 'Correct' : 'Try again'}
                </Text>
                <Text style={styles.verdictNote} numberOfLines={2}>
                  {verdict.note}
                </Text>
              </View>

              <View style={styles.verdictActions}>
                {verdict.correct ? null : (
                  <Button
                    label="Try again"
                    variant="elevated"
                    height={48}
                    style={styles.verdictButton}
                    onPress={reset}
                  />
                )}
                <Button
                  label={nextLabel}
                  height={48}
                  style={styles.verdictButton}
                  onPress={next}
                />
              </View>
            </View>
          ) : null}
        </View>

        <Waveband active={recording} />
        <MicDock
          recording={recording}
          onSpeak={() => {
            setSpokenCount(0);
            setRecording(true);
          }}
          disabled={verdict !== null || recording}
        />
      </ScreenShell>
    );
  }

  return (
    <ScreenShell>
      <NavBar title={mission.title} closeIcon onBack={() => router.replace('/(tabs)/review')} />

      <View style={styles.progress}>
        <StepProgress total={mission.questionCount} completed={position} />
      </View>

      <Screen scroll background="surface-alt" contentStyle={styles.content}>
        {question.type === 'write' ? (
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
          nextLabel={nextLabel}
          onNext={next}
          onRetry={verdict.correct ? undefined : reset}
        />
      ) : null}
    </ScreenShell>
  );
}

/**
 * The comp's ten-bar band above the mic: `0 -4px 24px` top shadow, 16px of
 * padding over a 40px bar box. Bar heights and tints are the declared values.
 */
const WAVE_BARS = [
  { height: 10, color: colors.primary200 },
  { height: 22, color: colors.primary300 },
  { height: 32, color: colors.primary },
  { height: 16, color: colors.primary300 },
  { height: 26, color: colors.primary },
  { height: 12, color: colors.primary200 },
  { height: 22, color: colors.primary300 },
  { height: 36, color: colors.primary },
  { height: 18, color: colors.primary300 },
  { height: 9, color: colors.primary200 },
];

function Waveband({ active }: { active: boolean }) {
  return (
    <View style={styles.waveband}>
      {WAVE_BARS.map((bar, index) => (
        <View
          key={index}
          style={[
            styles.waveBar,
            { height: bar.height, backgroundColor: bar.color },
            // Idle the band reads as a hint; while the mic is open it is live.
            active ? null : styles.waveBarIdle,
          ]}
        />
      ))}
    </View>
  );
}

/**
 * The mic band: `20px 24px 12px` over the home indicator, with the comp's two
 * empty 63×44 slots holding the 84px button dead centre.
 */
function MicDock({
  recording,
  disabled,
  onSpeak,
}: {
  recording: boolean;
  disabled: boolean;
  onSpeak: () => void;
}) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.micDock, { paddingBottom: 12 + insets.bottom }]}>
      <View style={styles.micSlot} />
      <MicButton size={84} active={recording} onPress={disabled ? undefined : onSpeak} />
      <View style={styles.micSlot} />
    </View>
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
  /**
   * RV-2a/RV-2b scene — `flex:1; padding:30px 24px 0; gap:24; margin-bottom:20`.
   * It is the whole band between the progress bar and the waveform, so the card
   * inside it fills rather than hugs.
   */
  scene: {
    flex: 1,
    paddingTop: 30,
    paddingHorizontal: spacing.gutter,
    marginBottom: 20,
    gap: 24,
  },
  speakCard: {
    flex: 1,
    gap: 8,
  },
  /** `12/18/400 #B0B8C1` — the meaning line, where the tap hint used to be. */
  sentenceMeaning: text(12, 18, '400', colors.textTertiary),
  verdict: {
    gap: 12,
  },
  /** `align-items:center; gap:8; padding:12; radius:12` on white. */
  verdictRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: radius.input,
    backgroundColor: colors.surface,
  },
  verdictBadge: {
    ...text(11, 16, '600', colors.success),
    borderRadius: radius.badge,
    paddingHorizontal: 8,
    paddingVertical: 3,
    overflow: 'hidden',
  },
  verdictBadgeGood: {
    backgroundColor: colors.successBg,
    color: colors.success,
  },
  verdictBadgeBad: {
    backgroundColor: colors.primary100,
    color: colors.primary,
  },
  verdictNote: {
    ...text(13, 18, '500', colors.textSecondary),
    flex: 1,
  },
  verdictActions: {
    flexDirection: 'row',
    gap: 8,
  },
  verdictButton: {
    flex: 1,
  },
  /** `height:40` of bars over `padding:16px 24px 0`, so the band is 56 tall. */
  waveband: {
    height: 56,
    paddingTop: 16,
    paddingHorizontal: spacing.gutter,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: colors.surface,
    ...shadows.bottomNav,
  },
  waveBar: {
    width: 4,
    borderRadius: radius.pill,
  },
  waveBarIdle: {
    opacity: 0.45,
  },
  /** `padding:20px 24px 12px`; the 12 sits on top of the home indicator. */
  micDock: {
    paddingTop: 20,
    paddingHorizontal: spacing.gutter,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
  },
  /** The comp's empty side slots — 27px wide inside 18px padding — centre the mic. */
  micSlot: {
    width: 63,
    height: 44,
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
