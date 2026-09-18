import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { CountBadge } from '@/components/Badge';
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

/**
 * RV-2 … RV-2f. One runner, three ways to drill: speaking missions use the mic,
 * writing missions grade what the learner typed, choice missions grade on tap.
 * Whatever the mode, the header, the progress bar, the feedback block and the
 * dock are the same.
 */
export default function MissionRunner() {
  const { missionId } = useLocalSearchParams<{ missionId: string }>();
  const mission = missionById[missionId] ?? missions[0];

  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState<number | null>(null);
  const [spoken, setSpoken] = useState(false);
  const [entries, setEntries] = useState<string[]>([]);
  const [checked, setChecked] = useState(false);
  const [done, setDone] = useState(false);

  const question = mission.questions[index % mission.questions.length];
  const position = Math.min(index + 1, mission.questionCount);

  const next = () => {
    if (position >= mission.questionCount) {
      setDone(true);
      return;
    }
    setIndex((value) => value + 1);
    setAnswer(null);
    setSpoken(false);
    setEntries([]);
    setChecked(false);
  };

  // A written answer is right when every gap matches one of its accepted forms.
  const writeCorrect =
    question.type === 'write' &&
    question.blanks.every((accepted, gap) =>
      accepted.some((option) => normalize(option) === normalize(entries[gap] ?? '')),
    );

  const writeFilled =
    question.type === 'write' &&
    question.blanks.every((_, gap) => (entries[gap] ?? '').trim() !== '');

  const ctaLabel =
    question.type === 'write' && !checked
      ? 'Check'
      : position >= mission.questionCount
        ? 'Finish'
        : 'Next';

  const ctaDisabled =
    question.type === 'speak'
      ? !spoken
      : question.type === 'write'
        ? !writeFilled
        : answer === null;

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
          <SpeakStep question={question} answered={spoken} onSpeak={() => setSpoken(true)} />
        ) : question.type === 'write' ? (
          <WriteStep
            question={question}
            entries={entries}
            checked={checked}
            correct={writeCorrect}
            onChange={(gap, value) =>
              setEntries((current) => {
                const draft = [...current];
                draft[gap] = value;
                return draft;
              })
            }
          />
        ) : (
          <ChoiceStep question={question} answer={answer} onAnswer={setAnswer} />
        )}
      </Screen>

      {question.type === 'choice' ? (
        <View style={styles.options}>
          {question.options.map((option, optionIndex) => {
            const answered = answer !== null;
            const selected = answer === optionIndex;
            const isAnswer = optionIndex === question.answerIndex;
            return (
              <Pressable
                key={option}
                onPress={() => (answered ? undefined : setAnswer(optionIndex))}
                accessibilityRole="radio"
                accessibilityState={{ selected, disabled: answered }}
                style={[
                  styles.option,
                  selected && !isAnswer ? styles.optionWrong : null,
                  answered && isAnswer ? styles.optionRight : null,
                ]}
              >
                <Text
                  style={
                    answered && isAnswer
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

      <CtaDock>
        <Button
          label={ctaLabel}
          onPress={question.type === 'write' && !checked ? () => setChecked(true) : next}
          disabled={ctaDisabled}
        />
      </CtaDock>
    </ScreenShell>
  );
}

/** RV-2 / RV-2a / RV-2b — read the sentence aloud, tap a word for romanization. */
function SpeakStep({
  question,
  answered,
  onSpeak,
}: {
  question: SpeakQuestion;
  answered: boolean;
  onSpeak: () => void;
}) {
  return (
    <View style={styles.step}>
      <Card elevation="card" radiusToken="card" padding={24} style={styles.promptCard}>
        <View style={styles.promptHeader}>
          <View style={styles.speaker}>
            <SpeakerIcon size={18} />
          </View>
          <Text style={styles.promptLabel}>Listen, then repeat</Text>
        </View>
        <KoreanText
          tokens={question.tokens}
          onReplay={() => {}}
          tapHint="Tap a word to see how it sounds"
        />
      </Card>

      {answered ? (
        <Feedback
          correct={question.feedback.correct}
          label={question.feedback.label}
          explanation={question.feedback.explanation}
        />
      ) : null}

      <View style={styles.micBlock}>
        <MicButton active={!answered} onPress={onSpeak} />
      </View>
    </View>
  );
}

/**
 * RV-2c / RV-2d — the learner produces the Korean. A template splits into a
 * field per gap; without one they write the whole sentence. Feedback is about
 * the axis being drilled, not how complete the sentence is.
 */
function WriteStep({
  question,
  entries,
  checked,
  correct,
  onChange,
}: {
  question: WriteQuestion;
  entries: string[];
  checked: boolean;
  correct: boolean;
  onChange: (gap: number, value: string) => void;
}) {
  const segments = question.template ? question.template.split('___') : null;
  const answerLine = question.template
    ? question.template
        .split('___')
        .reduce(
          (line, part, gap) =>
            line + part + (gap < question.blanks.length ? question.blanks[gap][0] : ''),
          '',
        )
    : question.blanks[0][0];

  const field = (gap: number, inline: boolean) => (
    <TextInput
      key={`gap-${gap}`}
      value={entries[gap] ?? ''}
      onChangeText={(value) => onChange(gap, value)}
      editable={!checked}
      placeholder={inline ? '' : 'Write it in Korean'}
      placeholderTextColor={colors.textTertiary}
      accessibilityLabel={question.template ? `Blank ${gap + 1}` : 'Your sentence'}
      style={[
        inline ? styles.gapField : styles.writeField,
        checked ? (correct ? styles.fieldRight : styles.fieldWrong) : null,
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

      {checked ? (
        <Feedback
          correct={correct}
          label={correct ? 'Correct' : 'Try again'}
          explanation={
            correct ? question.explanation : `${answerLine} — ${question.explanation}`
          }
        />
      ) : null}
    </View>
  );
}

/** RV-2c / RV-2d / RV-2e — pick the option that fits. */
function ChoiceStep({
  question,
  answer,
  onAnswer: _onAnswer,
}: {
  question: ChoiceQuestion;
  answer: number | null;
  onAnswer: (index: number) => void;
}) {
  const answered = answer !== null;
  const correct = answer === question.answerIndex;
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

      {answered ? (
        <Feedback
          correct={correct}
          label={correct ? 'Correct' : 'Try again'}
          explanation={question.explanation}
        />
      ) : null}
    </View>
  );
}

function Feedback({
  correct,
  label,
  explanation,
}: {
  correct: boolean;
  label: string;
  explanation: string;
}) {
  return (
    <View style={styles.feedback}>
      <CountBadge
        label={label}
        color={correct ? colors.success : colors.primary}
        background={correct ? colors.successBg : colors.primary100}
      />
      <Text style={styles.feedbackText}>{explanation}</Text>
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
    // Fixed, or the field grows to the row and breaks the sentence apart.
    width: 64,
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
  feedback: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: radius.input,
    backgroundColor: colors.surface,
  },
  feedbackText: {
    ...type.descriptionMedium,
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
